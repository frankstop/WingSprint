import { GAME_CONFIG } from "./config";
import type { GameConfig, GameSnapshot, Obstacle } from "./types";

export type RandomSource = () => number;

export class GameModel {
  private phase: GameSnapshot["phase"] = "ready";
  private score = 0;
  private birdY = 350;
  private birdVelocity = 0;
  private elapsed = 0;
  private impactElapsed = 0;
  private nextObstacleId = 1;
  private obstacles: Obstacle[] = [];

  constructor(
    private bestScore = 0,
    private readonly random: RandomSource = Math.random,
    readonly config: GameConfig = GAME_CONFIG
  ) {
    this.resetObstacles();
  }

  get snapshot(): GameSnapshot {
    return {
      phase: this.phase,
      score: this.score,
      bestScore: this.bestScore,
      birdY: this.birdY,
      birdVelocity: this.birdVelocity,
      elapsed: this.elapsed,
      impactElapsed: this.impactElapsed,
      obstacles: this.obstacles.map((obstacle) => ({ ...obstacle }))
    };
  }

  start(): void {
    if (this.phase === "results") this.reset();
    if (this.phase !== "ready") return;
    this.phase = "playing";
    this.flap();
  }

  flap(): void {
    if (this.phase === "ready") {
      this.start();
      return;
    }
    if (this.phase === "playing") this.birdVelocity = this.config.flapImpulse;
  }

  pause(): void {
    if (this.phase === "playing") this.phase = "paused";
  }

  resume(): void {
    if (this.phase === "paused") this.phase = "playing";
  }

  reset(): void {
    this.phase = "ready";
    this.score = 0;
    this.birdY = 350;
    this.birdVelocity = 0;
    this.elapsed = 0;
    this.impactElapsed = 0;
    this.nextObstacleId = 1;
    this.resetObstacles();
  }

  update(dt: number): boolean {
    const step = Math.min(dt, 1 / 30);
    if (this.phase === "ready") {
      this.elapsed += step;
      this.birdY = 350 + Math.sin(this.elapsed * 4) * 7;
      return false;
    }
    if (this.phase === "paused" || this.phase === "results") return false;

    this.elapsed += step;
    this.birdVelocity += this.config.gravity * step;
    this.birdY += this.birdVelocity * step;

    if (this.phase === "impact") {
      this.impactElapsed += step;
      if (this.birdY + this.config.birdHeight / 2 >= this.config.groundY) {
        this.birdY = this.config.groundY - this.config.birdHeight / 2;
        this.birdVelocity = 0;
      }
      if (this.impactElapsed >= 0.55) this.phase = "results";
      return this.phase === "results";
    }

    for (const obstacle of this.obstacles) {
      obstacle.x -= this.config.worldSpeed * step;
      if (!obstacle.scored && obstacle.x + this.config.obstacleWidth < this.config.birdX) {
        obstacle.scored = true;
        this.score += 1;
      }
    }

    this.obstacles = this.obstacles.filter(
      (obstacle) => obstacle.x + this.config.obstacleWidth > -8
    );
    const last = this.obstacles.at(-1);
    if (!last || last.x <= this.config.width - this.config.obstacleSpacing) {
      this.obstacles.push(this.createObstacle((last?.x ?? this.config.width) + this.config.obstacleSpacing));
    }

    if (this.hasCollision()) {
      this.phase = "impact";
      this.impactElapsed = 0;
      this.bestScore = Math.max(this.bestScore, this.score);
    }
    return false;
  }

  private resetObstacles(): void {
    this.obstacles = [
      this.createObstacle(this.config.firstObstacleX),
      this.createObstacle(this.config.firstObstacleX + this.config.obstacleSpacing)
    ];
  }

  private createObstacle(x: number): Obstacle {
    const range = this.config.maxGapCenter - this.config.minGapCenter;
    return {
      id: this.nextObstacleId++,
      x,
      gapCenter: this.config.minGapCenter + this.random() * range,
      scored: false
    };
  }

  private hasCollision(): boolean {
    const insetX = 5;
    const insetY = 4;
    const left = this.config.birdX - this.config.birdWidth / 2 + insetX;
    const right = this.config.birdX + this.config.birdWidth / 2 - insetX;
    const top = this.birdY - this.config.birdHeight / 2 + insetY;
    const bottom = this.birdY + this.config.birdHeight / 2 - insetY;

    if (top <= 0 || bottom >= this.config.groundY) return true;

    return this.obstacles.some((obstacle) => {
      const horizontal = right >= obstacle.x && left <= obstacle.x + this.config.obstacleWidth;
      if (!horizontal) return false;
      const gapTop = obstacle.gapCenter - this.config.obstacleGap / 2;
      const gapBottom = obstacle.gapCenter + this.config.obstacleGap / 2;
      return top <= gapTop || bottom >= gapBottom;
    });
  }
}
