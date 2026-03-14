import { GameState } from '@/hooks/use-game-state';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Trophy, RefreshCcw, Users } from 'lucide-react';

interface VictoryProps {
  state: GameState;
  playAgainSame: () => void;
  startNewGame: () => void;
}

export function Victory({ state, playAgainSame, startNewGame }: VictoryProps) {
  const sortedPlayers = [...state.players].sort((a, b) => b.totalScore - a.totalScore);
  const winner = sortedPlayers[0];

  return (
    <div className="fixed inset-0 z-[100] bg-background/90 backdrop-blur-xl flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 100 }}
        className="bg-card border border-border shadow-2xl rounded-3xl p-8 sm:p-12 max-w-lg w-full text-center relative overflow-hidden"
      >
        {/* Glow effect behind */}
        <div 
          className="absolute inset-0 opacity-20 blur-3xl" 
          style={{ background: `radial-gradient(circle at 50% 50%, ${winner.color}, transparent 70%)` }}
        />

        <div className="relative z-10 space-y-8">
          <motion.div 
            animate={{ y: [0, -15, 0] }} 
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="w-32 h-32 mx-auto bg-gradient-to-tr from-yellow-600 to-yellow-300 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(234,179,8,0.5)]"
          >
            <Trophy className="w-16 h-16 text-yellow-950 fill-yellow-500" />
          </motion.div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-muted-foreground uppercase tracking-widest">Victory!</h2>
            <h1 className="text-6xl font-display font-black" style={{ color: winner.color, textShadow: `0 0 20px ${winner.color}80` }}>
              {winner.name}
            </h1>
            <p className="text-xl font-medium mt-4">Wins with <span className="font-bold">{winner.totalScore}</span> points</p>
          </div>

          <div className="pt-8 space-y-4">
            <Button size="lg" className="w-full h-16 text-lg rounded-2xl" onClick={playAgainSame}>
              <RefreshCcw className="w-5 h-5 mr-2" /> Play Again (Same Players)
            </Button>
            <Button variant="outline" size="lg" className="w-full h-14 rounded-2xl" onClick={startNewGame}>
              <Users className="w-5 h-5 mr-2" /> Start New Game
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
