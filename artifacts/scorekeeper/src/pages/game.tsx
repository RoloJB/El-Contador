import { useState } from 'react';
import { GameState } from '@/hooks/use-game-state';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RankingBoard } from '@/components/ranking-board';
import { ChartView } from '@/components/chart-view';
import { HistoryTable } from '@/components/history-table';
import { StatsView } from '@/components/stats-view';
import { Volume2, VolumeX, Moon, Sun, ArrowLeft, Trophy } from 'lucide-react';
import { useSounds } from '@/hooks/use-sounds';

interface GameProps {
  state: GameState;
  saveRound: (scores: Record<string, number>) => void;
  startNewGame: () => void;
}

export function Game({ state, saveRound, startNewGame }: GameProps) {
  const [scores, setScores] = useState<Record<string, string>>({});
  const { enabled, toggleSounds } = useSounds();
  
  const isDark = document.documentElement.classList.contains('dark');
  const [darkToggle, setDarkToggle] = useState(isDark);

  const toggleTheme = () => {
    document.documentElement.classList.toggle('dark');
    setDarkToggle(!darkToggle);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedScores: Record<string, number> = {};
    let hasValues = false;
    
    state.players.forEach(p => {
      const val = parseInt(scores[p.id] || '0', 10);
      parsedScores[p.id] = isNaN(val) ? 0 : val;
      if (scores[p.id]) hasValues = true;
    });

    if (!hasValues) return;

    saveRound(parsedScores);
    setScores({});
    
    // Focus first input
    const firstInput = document.getElementById(`score-input-${state.players[0].id}`);
    if (firstInput) firstInput.focus();
  };

  return (
    <div className="min-h-screen bg-mesh pb-20">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={startNewGame} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4 mr-2" /> Salir
          </Button>
          
          <div className="flex items-center gap-2">
            <h2 className="font-display font-bold text-xl hidden sm:block">El Contador</h2>
            <div className="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-black tracking-widest uppercase ml-2 border border-primary/30">
              Meta: {state.targetScore}
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={toggleSounds} className="rounded-full">
              {enabled ? <Volume2 className="w-5 h-5 text-emerald-500" /> : <VolumeX className="w-5 h-5 text-muted-foreground" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full">
              {darkToggle ? <Moon className="w-5 h-5 text-blue-400" /> : <Sun className="w-5 h-5 text-yellow-500" />}
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <Tabs defaultValue="play" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 h-14 bg-card border border-border shadow-sm">
            <TabsTrigger value="play" className="text-sm sm:text-base">Jugar</TabsTrigger>
            <TabsTrigger value="history" className="text-sm sm:text-base">Historial</TabsTrigger>
            <TabsTrigger value="chart" className="text-sm sm:text-base">Gráfica</TabsTrigger>
            <TabsTrigger value="stats" className="text-sm sm:text-base">Estadísticas</TabsTrigger>
          </TabsList>

          <TabsContent value="play" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              
              {/* Score Entry Panel */}
              <div className="md:col-span-7 space-y-6">
                <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-xl">
                  <div className="flex justify-between items-end mb-6">
                    <div>
                      <h3 className="text-muted-foreground font-bold uppercase tracking-widest text-sm mb-1">Ingresar Puntajes</h3>
                      <h2 className="text-4xl font-display font-black text-foreground">Ronda {state.rounds.length + 1}</h2>
                    </div>
                  </div>

                  <form onSubmit={handleSave} className="space-y-4">
                    {state.players.map((player, idx) => (
                      <div key={player.id} className="flex items-center gap-4">
                        <div className="w-32 flex-shrink-0 font-bold text-right truncate flex items-center justify-end gap-2 text-lg">
                          {player.name}
                          <div className="w-4 h-4 rounded-full shadow-inner" style={{ backgroundColor: player.color }} />
                        </div>
                        <Input
                          id={`score-input-${player.id}`}
                          type="number"
                          inputMode="numeric"
                          pattern="[0-9\-]*"
                          placeholder="0"
                          className="h-16 text-2xl font-bold text-center border-2 focus-visible:ring-2 transition-shadow"
                          style={{ borderColor: scores[player.id] ? player.color : undefined, boxShadow: scores[player.id] ? `0 0 10px ${player.color}40` : undefined }}
                          value={scores[player.id] || ''}
                          onChange={(e) => setScores(s => ({ ...s, [player.id]: e.target.value }))}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const nextPlayer = state.players[idx + 1];
                              if (nextPlayer) {
                                document.getElementById(`score-input-${nextPlayer.id}`)?.focus();
                              } else {
                                handleSave(e as any);
                              }
                            }
                          }}
                        />
                      </div>
                    ))}

                    <Button type="submit" size="lg" className="w-full h-16 mt-6 text-xl rounded-2xl">
                      Guardar Ronda
                    </Button>
                  </form>
                </div>
              </div>

              {/* Ranking Board Panel */}
              <div className="md:col-span-5">
                <RankingBoard players={state.players} />
              </div>

            </div>
          </TabsContent>

          <TabsContent value="history" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <HistoryTable state={state} />
          </TabsContent>

          <TabsContent value="chart" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <ChartView state={state} />
          </TabsContent>

          <TabsContent value="stats" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <StatsView state={state} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
