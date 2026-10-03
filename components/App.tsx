
import React from 'react';
import Scoreboard from './Scoreboard';
import StatsPage from './stats/StatsPage';

const App: React.FC = () => {
  const params = new URLSearchParams(window.location.search);
  const watchId = params.get('watch');
  if (watchId && params.get('view') === 'stats') {
    return <StatsPage watchId={watchId} />;
  }

  return (
    <main className="min-h-screen bg-slate-900 text-gray-200 flex flex-col items-center justify-center p-2 sm:p-4">
      <Scoreboard />
    </main>
  );
};

export default App;
