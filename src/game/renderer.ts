import { GAME_CONFIG } from "./config";
import type { GameAssets } from "./assets";
import type { GameSnapshot } from "./types";

function repeatLayer(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  offset: number,
  y: number,
  height: number
): void {
  const width = (image.width / image.height) * height;
  let x = -((offset % width) + width) % width;
  while (x < GAME_CONFIG.width) {
    context.drawImage(image, x, y, width, height);
    x += width;
  }
}

export function renderGame(
  context: CanvasRenderingContext2D,
  assets: GameAssets,
  snapshot: GameSnapshot,
  reduceMotion: boolean
): void {
  const { width, height, groundY, obstacleWidth, obstacleGap } = GAME_CONFIG;
  context.clearRect(0, 0, width, height);
  context.imageSmoothingEnabled = false;

  context.fillStyle = "#8bd8df";
  context.fillRect(0, 0, width, height);
  const backgroundWidth = (assets.background.width / assets.background.height) * height;
  const backgroundX = -((snapshot.elapsed * 4) % Math.max(1, backgroundWidth - width));
  context.drawImage(assets.background, backgroundX, 0, backgroundWidth, height);

  repeatLayer(context, assets.clouds, snapshot.elapsed * 4, 118, 62);
  repeatLayer(context, assets.hills, snapshot.elapsed * 9, 530, 78);
  repeatLayer(context, assets.marsh, snapshot.elapsed * 18, 620, 90);

  const shake =
    snapshot.phase === "impact" && !reduceMotion
      ? Math.sin(snapshot.impactElapsed * 120) * Math.max(0, 5 - snapshot.impactElapsed * 15)
      : 0;

  context.save();
  context.translate(shake, 0);
  for (const obstacle of snapshot.obstacles) {
    const gapTop = obstacle.gapCenter - obstacleGap / 2;
    const gapBottom = obstacle.gapCenter + obstacleGap / 2;

    context.save();
    context.translate(obstacle.x, gapTop);
    context.scale(1, -1);
    context.drawImage(assets.tower, 0, 0, obstacleWidth, Math.max(110, gapTop + 18));
    context.restore();

    context.drawImage(
      assets.tower,
      obstacle.x,
      gapBottom,
      obstacleWidth,
      Math.max(110, groundY - gapBottom + 18)
    );
  }

  const terrainHeight = height - groundY + 10;
  repeatLayer(context, assets.terrain, snapshot.elapsed * GAME_CONFIG.worldSpeed, groundY, terrainHeight);

  const birdFrame =
    snapshot.phase === "impact" || snapshot.phase === "results"
      ? assets.impact
      : assets.swift[Math.floor(snapshot.elapsed * 10) % assets.swift.length];
  const angle =
    snapshot.phase === "ready"
      ? 0
      : Math.max(-0.42, Math.min(1.18, snapshot.birdVelocity / 520));
  context.save();
  context.translate(GAME_CONFIG.birdX, snapshot.birdY);
  context.rotate(angle);
  context.drawImage(
    birdFrame,
    -GAME_CONFIG.birdWidth / 2,
    -GAME_CONFIG.birdHeight / 2,
    GAME_CONFIG.birdWidth,
    GAME_CONFIG.birdHeight
  );
  context.restore();

  if (snapshot.phase === "impact") {
    const spread = Math.min(1, snapshot.impactElapsed * 5);
    assets.particles.forEach((particle, index) => {
      context.drawImage(
        particle,
        GAME_CONFIG.birdX + 12 + index * 9 * spread,
        snapshot.birdY - 15 + (index % 2) * 22 * spread,
        11,
        11
      );
    });
  }
  context.restore();
}
