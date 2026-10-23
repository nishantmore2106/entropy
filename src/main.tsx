import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/common/ErrorBoundary.tsx';
import './index.css';

console.log('%c[ENTROPY STUDIO]%c Application initialized successfully', 'color:#BFD7F2;font-weight:bold;', 'color:white;');

window.addEventListener('error', (e) => {
  console.error('[ENTROPY Uncaught Error]:', e.error || e.message);
});

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <ErrorBoundary name="ENTROPY Application">
      <App />
    </ErrorBoundary>
  );
} else {
  console.error('[ENTROPY Fatal]: #root element not found in DOM');
}
