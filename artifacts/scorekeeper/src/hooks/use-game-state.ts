import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { getAssignColor } from '@/lib/utils';
import { useSounds } from './use-sounds';
import confetti from 'canvas-confetti';

export type Player = {
  id: string;
  name: string;
  color: string;
  totalScore: number;
};

export type Round = {
  id: string;
  roundNumber: number;
  scores: Record<string, number>; // playerId -> score
};

export type GameState = {
  status: 'idle' | 'setup' | 'playing' | 'victory';
  players: Player[];
  rounds: Round[];
  targetScore: number;
};

const DEFAULT_TARGET = 200;
const STORAGE_KEY = 'scorekeeper_game';

const INITIAL_STATE: GameState = {
  status: 'idle',
  players: [],
  rounds: [],
  targetScore: DEFAULT_TARGET,
};

export function useGameState() {
  const [state, setState] = useState<GameState>(INITIAL_STATE);
  const [hasRestored, setHasRestored] = useState(false);
  const { playSaveRound, playRankChange, playVictory } = useSounds();

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          // If a game was mid-way, keep it but let UI decide whether to show a resume prompt
          setState(parsed);
        }
      } catch (e) {
        console.error("Failed to parse saved game");
      }
    } else {
      setState(prev => ({ ...prev, status: 'setup' }));
    }
    setHasRestored(true);
  }, []);

  // Save to local storage on every change
  useEffect(() => {
    if (hasRestored) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state, hasRestored]);

  const startNewGame = useCallback(() => {
    setState({
      status: 'setup',
      players: [],
      rounds: [],
      targetScore: DEFAULT_TARGET,
    });
  }, []);

  const resumeGame = useCallback(() => {
    setState(prev => ({ ...prev, status: 'playing' }));
  }, []);

  const addPlayer = useCallback((name: string) => {
    setState(prev => {
      if (prev.players.length >= 7) return prev;
      if (prev.players.some(p => p.name.toLowerCase() === name.toLowerCase())) return prev;
      
      const newPlayer: Player = {
        id: uuidv4(),
        name,
        color: getAssignColor(prev.players.length),
        totalScore: 0,
      };
      return { ...prev, players: [...prev.players, newPlayer] };
    });
  }, []);

  const removePlayer = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      players: prev.players.filter(p => p.id !== id).map((p, idx) => ({ ...p, color: getAssignColor(idx) }))
    }));
  }, []);

  const beginPlaying = useCallback(() => {
    setState(prev => ({ ...prev, status: 'playing' }));
  }, []);

  const saveRound = useCallback((roundScores: Record<string, number>) => {
    setState(prev => {
      // Calculate new totals
      const newPlayers = prev.players.map(p => ({
        ...p,
        totalScore: p.totalScore + (roundScores[p.id] || 0)
      }));

      // Sort to check if rankings changed
      const oldRankings = [...prev.players].sort((a, b) => b.totalScore - a.totalScore).map(p => p.id);
      const newRankings = [...newPlayers].sort((a, b) => b.totalScore - a.totalScore).map(p => p.id);
      
      const rankChanged = oldRankings.join(',') !== newRankings.join(',');
      
      if (rankChanged) {
        playRankChange();
      } else {
        playSaveRound();
      }

      const isVictory = newPlayers.some(p => p.totalScore >= prev.targetScore);

      if (isVictory) {
        playVictory();
        if (navigator.vibrate) {
          navigator.vibrate([200, 100, 200]);
        }
        
        const duration = 3 * 1000;
        const end = Date.now() + duration;

        const frame = () => {
          confetti({
            particleCount: 5,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: newPlayers.map(p => p.color)
          });
          confetti({
            particleCount: 5,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: newPlayers.map(p => p.color)
          });

          if (Date.now() < end) {
            requestAnimationFrame(frame);
          }
        };
        frame();
      }

      return {
        ...prev,
        status: isVictory ? 'victory' : 'playing',
        players: newPlayers,
        rounds: [
          ...prev.rounds,
          {
            id: uuidv4(),
            roundNumber: prev.rounds.length + 1,
            scores: roundScores,
          }
        ]
      };
    });
  }, [playSaveRound, playRankChange, playVictory]);

  const playAgainSamePlayers = useCallback(() => {
    setState(prev => ({
      ...prev,
      status: 'playing',
      rounds: [],
      players: prev.players.map(p => ({ ...p, totalScore: 0 }))
    }));
  }, []);

  return {
    state,
    hasRestored,
    startNewGame,
    resumeGame,
    addPlayer,
    removePlayer,
    beginPlaying,
    saveRound,
    playAgainSamePlayers,
  };
}
