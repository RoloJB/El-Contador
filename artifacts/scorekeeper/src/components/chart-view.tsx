import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { GameState } from '@/hooks/use-game-state';

export function ChartView({ state }: { state: GameState }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const labels = state.rounds.map(r => `Round ${r.roundNumber}`);
    labels.unshift('Start'); // Initial 0 point

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
        backgroundColor: player.color + '40', // 25% opacity
        tension: 0.3,
        borderWidth: 3,
        pointRadius: 4,
        pointHoverRadius: 6,
      };
    });

    const isDark = document.documentElement.classList.contains('dark');
    const gridColor = isDark ? '#ffffff15' : '#00000015';
    const textColor = isDark ? '#ffffff80' : '#00000080';

    chartRef.current = new Chart(canvasRef.current, {
      type: 'line',
      data: { labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: { color: textColor, font: { family: 'Inter', weight: 'bold' } }
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: isDark ? '#18181b' : '#ffffff',
            titleColor: isDark ? '#fff' : '#000',
            bodyColor: isDark ? '#fff' : '#000',
            borderColor: gridColor,
            borderWidth: 1,
            padding: 10,
          }
        },
        scales: {
          x: {
            grid: { color: gridColor },
            ticks: { color: textColor }
          },
          y: {
            grid: { color: gridColor },
            ticks: { color: textColor },
            beginAtZero: true
          }
        },
        interaction: { mode: 'nearest', axis: 'x', intersect: false }
      }
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [state]);

  return (
    <div className="bg-card p-4 sm:p-6 rounded-2xl border border-border shadow-lg h-[400px] sm:h-[500px] relative w-full">
      {state.rounds.length === 0 ? (
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground font-medium">
          Juega una ronda para ver la gráfica
        </div>
      ) : null}
      <canvas ref={canvasRef} />
    </div>
  );
}
