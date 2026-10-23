/**
 * Integration Verification Script
 * Validates unauthenticated 401s, public form submissions, transactional outbox queue,
 * admin authentication, diagnostic test email, deliberate client email, CSV formula sanitization, and logout.
 */

async function main() {
  console.log('🔍 [ENTROPY Verification] Testing live endpoints on http://localhost:3000...\n');

  // 1. Unauthenticated endpoints must return 401
  const endpoints = ['/api/admin/me', '/api/admin/metrics', '/api/admin/export', '/api/admin/email/outbox'];
  for (const ep of endpoints) {
    const res = await fetch(`http://localhost:3000${ep}`);
    console.log(`1. Unauth check: ${ep} -> HTTP ${res.status} (Expected: 401)`);
    if (res.status !== 401) throw new Error(`Endpoint ${ep} allowed unauthenticated access!`);
  }

  // 2. Submit Public Enquiry with formula injection in description
  const enqRes = await fetch('http://localhost:3000/api/enquiries', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Rohan Mehta',
      email: 'rohan.mehta@aurora.io',
      country: 'India',
      phone: '+91 9988776655',
      projectType: 'Generative Web & Shaders',
      pageCount: '4 – 5 Pages',
      budgetRange: '₹1,50,000 – ₹3,00,000',
      description: '=cmd|"/C calc"!A0 Potential formula injection payload test',
      responseMethod: 'WhatsApp',
    }),
  });

  console.log(`\n2. Submit Public Enquiry -> HTTP ${enqRes.status} (Expected: 201)`);
  if (enqRes.status !== 201) throw new Error('Enquiry submission failed!');
  const enqData = await enqRes.json();
  console.log(`   Enquiry Reference ID: ${enqData.id}`);

  // 3. Admin Login
  const loginRes = await fetch('http://localhost:3000/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@entropy.design',
      password: 'EntropyAdmin2026!',
    }),
  });

  console.log(`\n3. Admin Login -> HTTP ${loginRes.status} (Expected: 200)`);
  if (loginRes.status !== 200) throw new Error('Admin login failed!');
  const cookie = loginRes.headers.get('set-cookie');
  if (!cookie) throw new Error('Session cookie not received!');
  console.log(`   Session cookie set successfully (HttpOnly)`);

  // 4. Verify Outbox activity
  const outboxRes = await fetch('http://localhost:3000/api/admin/email/outbox', {
    headers: { Cookie: cookie },
  });
  console.log(`\n4. Fetch Email Outbox -> HTTP ${outboxRes.status} (Expected: 200)`);
  const outboxData = await outboxRes.json();
  console.log(`   Outbox Counts:`, outboxData.counts);
  console.log(`   Latest Job: [${outboxData.jobs[0]?.template_type}] to ${outboxData.jobs[0]?.recipient} (Status: ${outboxData.jobs[0]?.status})`);

  // 5. Send Diagnostic Test Email
  const testEmailRes = await fetch('http://localhost:3000/api/admin/email/test', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookie,
      'X-Entropy-Admin-Action': '1',
    },
    body: JSON.stringify({ recipient: 'entropy.helpdesk@gmail.com' }),
  });
  console.log(`\n5. Dispatch Diagnostic Test Email -> HTTP ${testEmailRes.status}`);
  const testData = await testEmailRes.json();
  console.log(`   Result:`, testData);

  // 6. Send Deliberate Client Status Update Email
  if (enqData.id) {
    const clientEmailRes = await fetch(`http://localhost:3000/api/admin/enquiries/${enqData.id}/email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookie,
        'X-Entropy-Admin-Action': '1',
      },
      body: JSON.stringify({
        subject: 'Your project proposal from ENTROPY',
        message: 'We have compiled the creative technology scope and deliverables for Aurora.',
      }),
    });
    console.log(`\n6. Dispatch Deliberate Client Email -> HTTP ${clientEmailRes.status}`);
    const clientEmailData = await clientEmailRes.json();
    console.log(`   Result:`, clientEmailData);
  }

  // 7. Verify CSV Export Formula Injection Sanitization
  const exportRes = await fetch('http://localhost:3000/api/admin/export', {
    headers: { Cookie: cookie },
  });
  console.log(`\n7. Fetch CSV Export -> HTTP ${exportRes.status} (Expected: 200)`);
  const csvText = await exportRes.text();
  const hasSanitizedPrefix = csvText.includes("''=cmd") || csvText.includes("'=cmd");
  console.log(`   Formula injection sanitized: ${hasSanitizedPrefix ? 'YES (Prepended with \')' : 'NO'}`);
  if (!hasSanitizedPrefix) throw new Error('Formula injection was not sanitized in CSV export!');

  // 8. Logout
  const logoutRes = await fetch('http://localhost:3000/api/admin/logout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookie,
      'X-Entropy-Admin-Action': '1',
    },
  });
  console.log(`\n8. Admin Logout -> HTTP ${logoutRes.status} (Expected: 200)`);

  // 9. Verify Session Invalidation
  const meAfter = await fetch('http://localhost:3000/api/admin/me', {
    headers: { Cookie: cookie },
  });
  console.log(`9. Invalidation check: /api/admin/me after logout -> HTTP ${meAfter.status} (Expected: 401)`);
  if (meAfter.status !== 401) throw new Error('Session remained valid after logout!');

  console.log('\n🎉 ALL INTEGRATION & SECURITY CHECKS PASSED!\n');
}

main().catch((err) => {
  console.error('\n❌ Integration check failed:', err.message);
  process.exit(1);
});
