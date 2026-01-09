import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

/**
 * PlantHound - AI Botanical Intelligence
 * Main entry point mounting the root application component.
 */

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}