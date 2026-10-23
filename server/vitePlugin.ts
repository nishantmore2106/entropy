import type { Plugin, ViteDevServer } from 'vite';
import express, { type Request, type Response, type NextFunction } from 'express';
import { apiRouter } from './api';
import { startEmailWorker, stopEmailWorker } from './email/queue';

/**
 * Security Firewall Middleware for the Vite Development Server.
 * Strictly blocks external web access to server source code, SQLite database files,
 * administrative scripts, backups, test fixtures, and environment secrets,
 * while allowing Vite's internal module bundling and dependency serving.
 */
function devSecurityFirewall(req: Request, res: Response, next: NextFunction) {
  const rawUrl = req.url || '';
  const decodedPath = decodeURIComponent(rawUrl.split('?')[0]);
  const lowerPath = decodedPath.toLowerCase();

  // 1. Immediately allow Vite internal assets and dependencies
  if (
    lowerPath.startsWith('/@') ||
    lowerPath.startsWith('/node_modules/') ||
    lowerPath.startsWith('/src/')
  ) {
    return next();
  }

  // 2. Block path traversal attempts
  if (decodedPath.includes('..') || decodedPath.includes('\0')) {
    res.statusCode = 403;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Access forbidden: Invalid path traversal detected.' }));
    return;
  }

  // 3. Block sensitive backend directory paths
  const blockedPrefixes = [
    '/data',
    '/server',
    '/scripts',
    '/tests',
    '/backups',
  ];

  for (const prefix of blockedPrefixes) {
    if (lowerPath === prefix || lowerPath.startsWith(prefix + '/')) {
      res.statusCode = 403;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: `Access forbidden: ${prefix.substring(1)} is a protected server resource.` }));
      return;
    }
  }

  // 4. Block sensitive file extensions and environment dotfiles
  const blockedExtensions = [
    '.sqlite',
    '.sqlite-wal',
    '.sqlite-shm',
    '.db',
    '.log',
    '.env',
    '.cjs',
  ];

  if (
    lowerPath.startsWith('/.env') ||
    lowerPath.startsWith('/.git') ||
    blockedExtensions.some((ext) => lowerPath.endsWith(ext) || lowerPath.includes(ext + '?'))
  ) {
    res.statusCode = 403;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Access forbidden: Protected system resource.' }));
    return;
  }

  next();
}

/**
 * Vite Dev Plugin that attaches our server-side API router to the Vite development server.
 * Enables /api endpoints seamlessly on port 3000 during local development, installs the security firewall,
 * and starts the background email queue worker.
 */
export function entropyApiPlugin(): Plugin {
  return {
    name: 'entropy-api-server',
    configureServer(server: ViteDevServer) {
      const app = express();

      // Install Security Firewall BEFORE any static or internal handlers
      app.use(devSecurityFirewall);

      // Mount /api endpoints
      app.use('/api', apiRouter);

      // Connect express app to Vite dev server connect middlewares at the very front
      server.middlewares.use(app);
      console.log('⚡ [ENTROPY API] Security firewall & API server mounted at /api on Vite dev server.');

      // Start email queue worker in background
      startEmailWorker(10000);

      server.httpServer?.on('close', () => {
        stopEmailWorker();
      });
    },
  };
}

export default entropyApiPlugin;
