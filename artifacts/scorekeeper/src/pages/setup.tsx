import { useState } from 'react';
import { GameState } from '@/hooks/use-game-state';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Play, Gamepad2, Settings2 } from 'lucide-react';

interface SetupProps {
  state: GameState;
  addPlayer: (name: string) => void;
  removePlayer: (id: string) => void;
  beginPlaying: () => void;
  resumeGame?: () => void;
}

export function Setup({ state, addPlayer, removePlayer, beginPlaying, resumeGame }: SetupProps) {
  const [name, setName] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    if (state.players.some(p => p.name.toLowerCase() === trimmed.toLowerCase())) {
      // Could show toast here
      return;
    }
    addPlayer(trimmed);
    setName('');
  };

  const isResumeAvailable = state.status === 'playing' && state.rounds.length > 0;

  return (
    <div className="min-h-screen bg-mesh flex flex-col items-center p-4 py-12 sm:p-8">
      <div className="w-full max-w-lg space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-primary/20 text-primary mb-4 shadow-[0_0_30px_rgba(153,51,255,0.3)]">
            <Gamepad2 className="w-10 h-10" />
          </div>
          <h1 className="text-5xl font-display font-black bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
            ScoreKeeper
          </h1>
          <p className="text-muted-foreground text-lg">Track your epic game nights.</p>
        </div>

        {isResumeAvailable && (
          <div className="bg-card border border-border p-6 rounded-2xl shadow-xl flex flex-col items-center text-center gap-4">
            <h3 className="text-xl font-bold">Game in Progress Found!</h3>
            <p className="text-muted-foreground">You have a game with {state.players.length} players at Round {state.rounds.length}.</p>
            <Button size="lg" className="w-full shadow-[0_0_20px_rgba(0,255,153,0.3)] bg-emerald-600 hover:bg-emerald-500 text-white" onClick={resumeGame}>
              Continue Game
            </Button>
            <span className="text-sm text-muted-foreground uppercase font-bold tracking-widest">or start new</span>
          </div>
        )}

        <div className="bg-card border border-border/50 shadow-2xl rounded-3xl p-6 sm:p-8 space-y-6 relative overflow-hidden">
          <div className="flex items-center gap-3 border-b border-border/50 pb-4">
            <Settings2 className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-display font-bold">Player Setup</h2>
          </div>

          <form onSubmit={handleAdd} className="flex gap-3 relative z-10">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter player name..."
              className="flex-1"
              maxLength={15}
              disabled={state.players.length >= 7}
            />
            <Button 
              type="submit" 
              size="icon" 
              disabled={!name.trim() || state.players.length >= 7}
              className="rounded-xl shadow-lg"
            >
              <Plus className="w-6 h-6" />
            </Button>
          </form>

          <div className="space-y-3 relative z-10 min-h-[200px]">
            <AnimatePresence>
              {state.players.length === 0 && (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center text-muted-foreground text-center"
                >
                  Add 3 to 7 players to begin.
                </motion.div>
              )}
              {state.players.map((player) => (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex items-center justify-between bg-background border border-border p-3 rounded-xl shadow-sm"
                  style={{ borderLeft: `6px solid ${player.color}` }}
                >
                  <span className="font-bold text-lg px-2">{player.name}</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 w-8 rounded-lg"
                    onClick={() => removePlayer(player.id)}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <Button 
            size="lg" 
            className="w-full h-16 text-xl rounded-2xl relative z-10 group"
            disabled={state.players.length < 3}
            onClick={beginPlaying}
          >
            <span className="flex items-center gap-2 group-hover:scale-105 transition-transform">
              Start Game <Play className="w-6 h-6 fill-current" />
            </span>
          </Button>
        </div>
        
      </div>
    </div>
  );
}
