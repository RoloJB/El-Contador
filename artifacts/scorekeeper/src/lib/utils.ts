import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const NEON_COLORS = [
  "#FF0055", // Neon Pink
  "#00FF99", // Neon Green
  "#00CCFF", // Neon Blue
  "#B000FF", // Neon Purple
  "#FFD700", // Neon Yellow
  "#FF6600", // Neon Orange
  "#00FF00", // Lime
];

export function getAssignColor(index: number) {
  return NEON_COLORS[index % NEON_COLORS.length];
}
