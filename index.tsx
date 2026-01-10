import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';

const rootEl = document.getElementById('root');

if (!rootEl) {
  throw new Error("FATAL: <div id='root'></div> is missing from index.html");
}

try {
  ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
  console.log("✅ React mounted successfully.");
} catch (e) {
  console.error("FAILED to mount React root:", e);
  rootEl.innerHTML = `<div style="color:red; padding:20px;"><h1>React Mount Failed</h1><pre>${e}</pre></div>`;
}