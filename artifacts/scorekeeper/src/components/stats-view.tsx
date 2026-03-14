import { GameState } from '@/hooks/use-game-state';
import { Trophy, TrendingUp, Hash, Activity } from 'lucide-react';

export function StatsView({ state }: { state: GameState }) {
  const sortedPlayers = [...state.players].sort((a, b) => b.totalScore - a.totalScore);
  const leader = sortedPlayers[0];

  let bestRoundScore = 0;
  let bestRoundPlayer = '';
  let bestRoundNum = 0;

  state.rounds.forEach(r => {
    Object.entries(r.scores).forEach(([playerId, score]) => {
      if (score > bestRoundScore) {
        bestRoundScore = score;
        bestRoundPlayer = state.players.find(p => p.id === playerId)?.name || '';
        bestRoundNum = r.roundNumber;
      }
    });
  });

  let totalPointsScored = 0;
  state.players.forEach(p => totalPointsScored += p.totalScore);
  const avgPointsPerRound = state.rounds.length > 0 
    ? (totalPointsScored / state.rounds.length / state.players.length).toFixed(1)
    : '0';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="bg-card p-6 rounded-2xl border border-border shadow-lg flex items-center gap-4 hover:-translate-y-1 transition-transform">
        <div className="w-14 h-14 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-500">
          <Trophy className="w-8 h-8" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground font-semibold">Current Leader</p>
          <p className="text-2xl font-bold" style={{ color: leader?.color }}>
            {leader?.name || '-'} ({leader?.totalScore || 0})
          </p>
        </div>
      </div>

      <div className="bg-card p-6 rounded-2xl border border-border shadow-lg flex items-center gap-4 hover:-translate-y-1 transition-transform">
        <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          <TrendingUp className="w-8 h-8" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground font-semibold">Best Single Round</p>
          <p className="text-2xl font-bold text-foreground">
            {bestRoundScore > 0 ? `${bestRoundScore} pts` : '-'}
          </p>
          {bestRoundScore > 0 && (
            <p className="text-xs text-muted-foreground">by {bestRoundPlayer} in Round {bestRoundNum}</p>
          )}
        </div>
      </div>

      <div className="bg-card p-6 rounded-2xl border border-border shadow-lg flex items-center gap-4 hover:-translate-y-1 transition-transform">
        <div className="w-14 h-14 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
          <Hash className="w-8 h-8" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground font-semibold">Total Rounds</p>
          <p className="text-3xl font-display font-black text-foreground">{state.rounds.length}</p>
        </div>
      </div>

      <div className="bg-card p-6 rounded-2xl border border-border shadow-lg flex items-center gap-4 hover:-translate-y-1 transition-transform">
        <div className="w-14 h-14 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
          <Activity className="w-8 h-8" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground font-semibold">Avg Points / Round / Player</p>
          <p className="text-3xl font-display font-black text-foreground">{avgPointsPerRound}</p>
        </div>
      </div>
    </div>
  );
}
