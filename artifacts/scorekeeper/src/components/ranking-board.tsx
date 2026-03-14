import { Player } from '@/hooks/use-game-state';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown } from 'lucide-react';

export function RankingBoard({ players }: { players: Player[] }) {
  const sortedPlayers = [...players].sort((a, b) => b.totalScore - a.totalScore);
  const highestScore = sortedPlayers[0]?.totalScore || 0;

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-display font-bold text-foreground">Current Rankings</h3>
      <div className="space-y-3">
        <AnimatePresence>
          {sortedPlayers.map((player, index) => {
            const isLeader = player.totalScore === highestScore && highestScore > 0;
            return (
              <motion.div
                layout
                key={player.id}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                className="relative bg-card p-4 rounded-2xl border border-border/50 shadow-lg flex items-center justify-between"
                style={{
                  boxShadow: isLeader ? `0 0 20px ${player.color}33` : undefined,
                  borderColor: isLeader ? player.color : undefined,
                }}
              >
                <div className="flex items-center gap-4">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg"
                    style={{ backgroundColor: player.color, boxShadow: `0 0 10px ${player.color}80` }}
                  >
                    {index + 1}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-lg text-card-foreground flex items-center gap-2">
                      {player.name}
                      {isLeader && (
                        <motion.div
                          animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
                          transition={{ duration: 1, repeat: Infinity, repeatDelay: 3 }}
                        >
                          <Crown className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                        </motion.div>
                      )}
                    </span>
                  </div>
                </div>
                <div className="text-3xl font-display font-black" style={{ color: player.color }}>
                  {player.totalScore}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
