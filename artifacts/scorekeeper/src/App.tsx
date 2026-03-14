import { useEffect, useState } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useGameState } from "@/hooks/use-game-state";

import { Setup } from "@/pages/setup";
import { Game } from "@/pages/game";
import { Victory } from "@/pages/victory";

const queryClient = new QueryClient();

function MainRouter() {
  const { 
    state, 
    hasRestored,
    addPlayer, 
    removePlayer, 
    beginPlaying, 
    resumeGame,
    saveRound, 
    startNewGame, 
    playAgainSamePlayers 
  } = useGameState();

  if (!hasRestored) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-primary font-display text-2xl animate-pulse">Loading...</div>;
  }

  const showSetup = state.status === 'setup' || state.status === 'idle';
  const showGame = state.status === 'playing' || state.status === 'victory';

  return (
    <>
      {showSetup && (
        <Setup 
          state={state} 
          addPlayer={addPlayer} 
          removePlayer={removePlayer} 
          beginPlaying={beginPlaying} 
          resumeGame={resumeGame}
        />
      )}

      {showGame && (
        <Game 
          state={state} 
          saveRound={saveRound} 
          startNewGame={startNewGame} 
        />
      )}

      {state.status === 'victory' && (
        <Victory 
          state={state} 
          playAgainSame={playAgainSamePlayers} 
          startNewGame={startNewGame} 
        />
      )}
    </>
  );
}

function App() {
  const [pwaPrompt, setPwaPrompt] = useState<any>(null);

  // Setup PWA and Meta tags
  useEffect(() => {
    // Add meta tags dynamically
    const metaTags = [
      { name: 'apple-mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
      { name: 'apple-mobile-web-app-title', content: 'ScoreKeeper' },
      { name: 'theme-color', content: '#09090b' },
    ];

    metaTags.forEach(({ name, content }) => {
      let meta = document.querySelector(`meta[name="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    });

    let manifest = document.querySelector('link[rel="manifest"]');
    if (!manifest) {
      manifest = document.createElement('link');
      manifest.setAttribute('rel', 'manifest');
      manifest.setAttribute('href', '/manifest.json');
      document.head.appendChild(manifest);
    }

    // Register Service Worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(err => console.log('SW ref failed', err));
      });
    }

    // Default to dark mode if not set
    if (!localStorage.getItem('theme')) {
      document.documentElement.classList.add('dark');
    }

    // Listen for PWA install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setPwaPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (pwaPrompt) {
      pwaPrompt.prompt();
      const { outcome } = await pwaPrompt.userChoice;
      if (outcome === 'accepted') {
        setPwaPrompt(null);
      }
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <MainRouter />
        </WouterRouter>
        <Toaster />
        
        {/* Floating Install App / Share Button for PWA */}
        {(pwaPrompt || navigator.share) && (
          <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
            {pwaPrompt && (
              <button 
                onClick={handleInstall}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-full font-bold shadow-lg hover:scale-105 transition-transform"
              >
                Install App
              </button>
            )}
            {navigator.share && (
              <button 
                onClick={() => navigator.share({ title: 'ScoreKeeper', url: window.location.href })}
                className="bg-secondary text-secondary-foreground border border-border px-4 py-2 rounded-full font-bold shadow-lg hover:scale-105 transition-transform"
              >
                Share
              </button>
            )}
          </div>
        )}

      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
