import React from 'react';
import BrowserShell from './components/BrowserShell';

function App() {
  return (
    <div className="antialiased text-slate-100 bg-slate-950 min-h-screen selection:bg-indigo-500/30 selection:text-indigo-200">
      <BrowserShell />
    </div>
  );
}

export default App;