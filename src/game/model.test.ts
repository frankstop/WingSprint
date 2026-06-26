import { describe, expect, it } from "vitest";
import { GAME_CONFIG } from "./config";
import { GameModel } from "./model";

describe("GameModel", () => {
  it("starts from ready with a flap impulse", () => {
    const model = new GameModel(0, () => 0.5);

    model.flap();

    expect(model.snapshot.phase).toBe("playing");
    expect(model.snapshot.birdVelocity).toBe(GAME_CONFIG.flapImpulse);
  });

  it("keeps generated obstacle gaps inside the configured corridor", () => {
    const model = new GameModel(0, () => 1);

    for (const obstacle of model.snapshot.obstacles) {
      expect(obstacle.gapCenter).toBe(GAME_CONFIG.maxGapCenter);
    }
  });

  it("scores each obstacle once after the bird passes it", () => {
    const model = new GameModel(
      0,
      () => 0.5,
      {
        ...GAME_CONFIG,
        height: 900,
        groundY: 850,
        birdX: 100,
        gravity: 0,
        flapImpulse: 0,
        obstacleGap: 700,
        firstObstacleX: 105,
        obstacleWidth: 20,
        worldSpeed: 100,
        obstacleSpacing: 500,
        minGapCenter: 400,
        maxGapCenter: 400
      }
    );
    model.start();

    for (let index = 0; index < 120; index += 1) model.update(1 / 120);
    const scoreAfterPass = model.snapshot.score;
    for (let index = 0; index < 60; index += 1) model.update(1 / 120);

    expect(scoreAfterPass).toBe(1);
    expect(model.snapshot.score).toBe(1);
  });

  it("pauses and resumes without advancing gameplay", () => {
    const model = new GameModel(0, () => 0.5);
    model.start();
    model.pause();
    const before = model.snapshot;

    model.update(1);

    expect(model.snapshot).toEqual(before);
    model.resume();
    expect(model.snapshot.phase).toBe("playing");
  });
});
