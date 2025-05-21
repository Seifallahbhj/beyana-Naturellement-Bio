import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ReactQueryProvider } from './lib/react-query'
import React from 'react'

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ReactQueryProvider>
      <App />
    </ReactQueryProvider>
  </React.StrictMode>
);
