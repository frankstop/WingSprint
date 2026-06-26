export type GamePhase = "ready" | "playing" | "impact" | "results" | "paused";

export interface Obstacle {
  id: number;
  x: number;
  gapCenter: number;
  scored: boolean;
}

export interface GameSnapshot {
  phase: GamePhase;
  score: number;
  bestScore: number;
  birdY: number;
  birdVelocity: number;
  elapsed: number;
  impactElapsed: number;
  obstacles: Obstacle[];
}

export interface GameConfig {
  width: number;
  height: number;
  groundY: number;
  birdX: number;
  birdWidth: number;
  birdHeight: number;
  gravity: number;
  flapImpulse: number;
  worldSpeed: number;
  obstacleWidth: number;
  obstacleGap: number;
  obstacleSpacing: number;
  firstObstacleX: number;
  minGapCenter: number;
  maxGapCenter: number;
}
