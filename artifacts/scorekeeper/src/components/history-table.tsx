import { GameState } from '@/hooks/use-game-state';

export function HistoryTable({ state }: { state: GameState }) {
  if (state.rounds.length === 0) {
    return (
      <div className="text-center p-10 bg-card rounded-2xl border border-border/50 text-muted-foreground">
        Todavía no se han jugado rondas.
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl border border-border/50 shadow-lg overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs uppercase bg-muted/50 border-b border-border">
            <tr>
              <th className="px-4 py-4 font-bold sticky left-0 bg-muted/50 backdrop-blur-md z-10">Jugador</th>
              {state.rounds.map(r => (
                <th key={r.id} className="px-4 py-4 font-bold text-center whitespace-nowrap">
                  Ronda {r.roundNumber}
                </th>
              ))}
              <th className="px-4 py-4 font-bold text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {state.players.map((player) => (
              <tr key={player.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                <td className="px-4 py-3 font-bold sticky left-0 bg-card z-10 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: player.color }} />
                  {player.name}
                </td>
                {state.rounds.map(r => (
                  <td key={r.id} className="px-4 py-3 text-center font-medium text-muted-foreground">
                    {r.scores[player.id] !== undefined ? r.scores[player.id] : '-'}
                  </td>
                ))}
                <td className="px-4 py-3 font-black text-right text-lg" style={{ color: player.color }}>
                  {player.totalScore}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
