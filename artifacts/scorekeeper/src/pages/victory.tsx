import { useEffect, useRef } from 'react';
import { GameState } from '@/hooks/use-game-state';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Trophy, RefreshCcw, Users, Medal, Crown } from 'lucide-react';
import Chart from 'chart.js/auto';

interface VictoryProps {
  state: GameState;
  playAgainSame: () => void;
  startNewGame: () => void;
}

function FinalChart({ state }: { state: GameState }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();

    const labels = ['Inicio', ...state.rounds.map(r => `R${r.roundNumber}`)];
    const datasets = state.players.map(player => {
      let cumulative = 0;
      const data = [0];
      state.rounds.forEach(r => {
        cumulative += (r.scores[player.id] || 0);
        data.push(cumulative);
      });
      return {
        label: player.name,
        data,
        borderColor: player.color,
        backgroundColor: player.color + '30',
        tension: 0.3,
        borderWidth: 3,
        pointRadius: 4,
        pointHoverRadius: 7,
      };
    });

    const isDark = document.documentElement.classList.contains('dark');
    const gridColor = isDark ? '#ffffff15' : '#00000015';
    const textColor = isDark ? '#ffffff90' : '#00000090';

    chartRef.current = new Chart(canvasRef.current, {
      type: 'line',
      data: { labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: { color: textColor, font: { family: 'Inter', weight: 'bold' }, padding: 16 },
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: isDark ? '#18181b' : '#ffffff',
            titleColor: isDark ? '#fff' : '#000',
            bodyColor: isDark ? '#ccc' : '#333',
            borderColor: gridColor,
            borderWidth: 1,
            padding: 12,
          },
        },
        scales: {
          x: { grid: { color: gridColor }, ticks: { color: textColor } },
          y: { grid: { color: gridColor }, ticks: { color: textColor }, beginAtZero: true },
        },
        interaction: { mode: 'nearest', axis: 'x', intersect: false },
      },
    });

    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, [state]);

  return (
    <div className="w-full h-72 sm:h-96 relative">
      <canvas ref={canvasRef} />
    </div>
  );
}

export function Victory({ state, playAgainSame, startNewGame }: VictoryProps) {
  const sortedPlayers = [...state.players].sort((a, b) => b.totalScore - a.totalScore);
  const winner = sortedPlayers[0];

  const medalColor = (pos: number) => {
    if (pos === 0) return 'text-yellow-400';
    if (pos === 1) return 'text-slate-400';
    if (pos === 2) return 'text-amber-600';
    return 'text-muted-foreground';
  };

  return (
    <div className="min-h-screen bg-mesh overflow-y-auto pb-12">

      {/* ── 1. BANNER GANADOR ── */}
      <div
        className="relative overflow-hidden py-10 px-4 text-center"
        style={{ background: `linear-gradient(135deg, ${winner.color}22, transparent 60%)` }}
      >
        <div
          className="absolute inset-0 opacity-10 blur-3xl pointer-events-none"
          style={{ background: `radial-gradient(circle at 50% 60%, ${winner.color}, transparent 70%)` }}
        />

        <motion.div
          animate={{ y: [0, -12, 0] }}
          transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
          className="w-28 h-28 mx-auto mb-4 rounded-full bg-gradient-to-tr from-yellow-600 to-yellow-300 flex items-center justify-center shadow-[0_0_50px_rgba(234,179,8,0.5)]"
        >
          <Trophy className="w-14 h-14 text-yellow-950 fill-yellow-400" />
        </motion.div>

        <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-1">¡Partida terminada!</p>
        <h1 className="text-3xl sm:text-5xl font-display font-black mb-2" style={{ color: winner.color, textShadow: `0 0 24px ${winner.color}80` }}>
          🏆 Ganador: {winner.name}
        </h1>
        <p className="text-lg sm:text-2xl font-semibold text-foreground/80">
          con <span className="font-black" style={{ color: winner.color }}>{winner.totalScore}</span> puntos
        </p>
      </div>

      <div className="max-w-3xl mx-auto px-4 space-y-8">

        {/* ── 2. TABLA FINAL DE POSICIONES ── */}
        <section>
          <h2 className="flex items-center gap-2 text-xl font-display font-bold mb-4">
            <Crown className="w-5 h-5 text-yellow-500 fill-yellow-500" />
            Tabla Final de Posiciones
          </h2>
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-lg">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-left font-bold uppercase text-xs tracking-wider">Posición</th>
                  <th className="px-4 py-3 text-left font-bold uppercase text-xs tracking-wider">Jugador</th>
                  <th className="px-4 py-3 text-right font-bold uppercase text-xs tracking-wider">Puntaje Total</th>
                </tr>
              </thead>
              <tbody>
                {sortedPlayers.map((player, idx) => (
                  <motion.tr
                    key={player.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.08 }}
                    className="border-b border-border/50 last:border-0"
                    style={{ background: idx === 0 ? `${winner.color}12` : undefined }}
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        {idx === 0 ? (
                          <Medal className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                        ) : idx === 1 ? (
                          <Medal className="w-6 h-6 text-slate-400 fill-slate-400" />
                        ) : idx === 2 ? (
                          <Medal className="w-6 h-6 text-amber-600 fill-amber-600" />
                        ) : (
                          <span className="w-6 text-center font-bold text-muted-foreground">{idx + 1}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full flex-shrink-0"
                          style={{ backgroundColor: player.color, boxShadow: `0 0 6px ${player.color}80` }}
                        />
                        <span className={`font-bold text-base ${idx === 0 ? 'text-foreground' : 'text-foreground/80'}`}>
                          {player.name}
                          {idx === 0 && <span className="ml-2 text-yellow-500">👑</span>}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span
                        className="text-2xl font-display font-black"
                        style={{ color: player.color }}
                      >
                        {player.totalScore}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── 3. TABLA DE HISTORIAL DE RONDAS ── */}
        <section>
          <h2 className="flex items-center gap-2 text-xl font-display font-bold mb-4">
            <span className="text-primary">📋</span>
            Historial de Rondas
          </h2>

          {state.rounds.length === 0 ? (
            <div className="bg-card border border-border rounded-2xl p-8 text-center text-muted-foreground">
              No se jugaron rondas.
            </div>
          ) : (
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 border-b border-border">
                    <tr>
                      <th className="px-4 py-3 text-left font-bold uppercase text-xs tracking-wider sticky left-0 bg-muted/50 backdrop-blur-sm z-10">
                        Jugador
                      </th>
                      {state.rounds.map(r => (
                        <th key={r.id} className="px-3 py-3 text-center font-bold uppercase text-xs tracking-wider whitespace-nowrap">
                          Ronda {r.roundNumber}
                        </th>
                      ))}
                      <th className="px-4 py-3 text-right font-bold uppercase text-xs tracking-wider">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedPlayers.map((player, rowIdx) => (
                      <tr
                        key={player.id}
                        className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors"
                      >
                        <td className="px-4 py-3 sticky left-0 bg-card z-10">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full flex-shrink-0"
                              style={{ backgroundColor: player.color }}
                            />
                            <span className="font-bold whitespace-nowrap">{player.name}</span>
                          </div>
                        </td>
                        {state.rounds.map(r => (
                          <td key={r.id} className="px-3 py-3 text-center font-medium text-muted-foreground">
                            {r.scores[player.id] !== undefined ? r.scores[player.id] : '-'}
                          </td>
                        ))}
                        <td className="px-4 py-3 text-right">
                          <span
                            className="text-xl font-display font-black"
                            style={{ color: player.color }}
                          >
                            {player.totalScore}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

        {/* ── 4. GRÁFICA FINAL ── */}
        <section>
          <h2 className="flex items-center gap-2 text-xl font-display font-bold mb-4">
            <span className="text-primary">📈</span>
            Evolución de Puntajes
          </h2>
          <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 shadow-lg">
            {state.rounds.length === 0 ? (
              <div className="h-40 flex items-center justify-center text-muted-foreground">
                Sin datos de rondas.
              </div>
            ) : (
              <FinalChart state={state} />
            )}
          </div>
        </section>

        {/* ── 5. BOTONES ── */}
        <section className="space-y-4 pt-2 pb-6">
          <Button
            size="lg"
            className="w-full h-16 text-lg rounded-2xl"
            onClick={playAgainSame}
          >
            <RefreshCcw className="w-5 h-5 mr-2" />
            Jugar otra partida (mismos jugadores)
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="w-full h-14 rounded-2xl"
            onClick={startNewGame}
          >
            <Users className="w-5 h-5 mr-2" />
            Cambiar jugadores
          </Button>
        </section>

      </div>
    </div>
  );
}
