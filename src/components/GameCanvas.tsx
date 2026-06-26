import { useEffect, useRef } from "react";
import { loadGameAssets, type GameAssets } from "../game/assets";
import { GAME_CONFIG } from "../game/config";
import { renderGame } from "../game/renderer";
import type { GameSnapshot } from "../game/types";

interface GameCanvasProps {
  snapshot: GameSnapshot;
  reduceMotion: boolean;
}

export function GameCanvas({ snapshot, reduceMotion }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const assetsRef = useRef<GameAssets | undefined>(undefined);

  useEffect(() => {
    let active = true;
    loadGameAssets().then((assets) => {
      if (!active) return;
      assetsRef.current = assets;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const context = canvas.getContext("2d");
      if (context) renderGame(context, assets, snapshot, reduceMotion);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const assets = assetsRef.current;
    if (!canvas || !assets) return;
    const context = canvas.getContext("2d");
    if (context) renderGame(context, assets, snapshot, reduceMotion);
  }, [snapshot, reduceMotion]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    canvas.width = GAME_CONFIG.width * dpr;
    canvas.height = GAME_CONFIG.height * dpr;
    const context = canvas.getContext("2d");
    context?.setTransform(dpr, 0, 0, dpr, 0, 0);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="game-canvas"
      aria-label="WINGSPRINT playfield"
      width={GAME_CONFIG.width}
      height={GAME_CONFIG.height}
    />
  );
}
