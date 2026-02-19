
import React from 'react';
import Scoreboard from './Scoreboard';

const App: React.FC = () => {
  return (
    <main className="min-h-screen bg-slate-900 text-gray-200 flex flex-col items-center justify-center p-4">
      <Scoreboard />
    </main>
  );
};

export default App;