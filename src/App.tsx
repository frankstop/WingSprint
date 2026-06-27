import { useEffect, useMemo, useRef, useState } from "react";
import { trackEvent } from "./analytics";
import { GameCanvas } from "./components/GameCanvas";
import { IosInstallPrompt } from "./components/IosInstallPrompt";
import { AudioManager } from "./game/audio";
import { GameModel } from "./game/model";
import { readBestScore, readMuted, writeBestScore, writeMuted } from "./game/storage";
import type { GameSnapshot } from "./game/types";

function rankAsset(score: number): string {
  if (score >= 40) return "rank-crown.png";
  if (score >= 30) return "rank-gold.png";
  if (score >= 20) return "rank-silver.png";
  return "rank-coral.png";
}

export function App() {
  const model = useMemo(() => new GameModel(readBestScore()), []);
  const [snapshot, setSnapshot] = useState<GameSnapshot>(model.snapshot);
  const [muted, setMuted] = useState(readMuted);
  const [needsResume, setNeedsResume] = useState(false);
  const audio = useRef(new AudioManager(muted));
  const lastScore = useRef(0);
  const lastPhase = useRef(snapshot.phase);
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    let frame = 0;
    let previous = performance.now();
    let accumulator = 0;
    const fixedStep = 1 / 120;

    const loop = (now: number) => {
      accumulator += Math.min((now - previous) / 1000, 0.1);
      previous = now;
      while (accumulator >= fixedStep) {
        model.update(fixedStep);
        accumulator -= fixedStep;
      }
      const next = model.snapshot;
      if (next.score > lastScore.current) {
        audio.current.play("score");
        trackEvent("score", { score: next.score });
      }
      if (lastPhase.current === "playing" && next.phase === "impact") audio.current.play("impact");
      if (lastPhase.current === "impact" && next.phase === "results") {
        audio.current.play("result");
        writeBestScore(next.bestScore);
        trackEvent("end_game", {
          score: next.score,
          best_score: next.bestScore
        });
      }
      lastScore.current = next.score;
      lastPhase.current = next.phase;
      setSnapshot(next);
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [model]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) {
        model.pause();
        setNeedsResume(true);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [model]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code !== "Space" && event.code !== "Enter") return;
      event.preventDefault();
      handlePrimaryAction();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  function handlePrimaryAction(): void {
    void audio.current.unlock();
    if (needsResume) {
      model.resume();
      setNeedsResume(false);
      trackEvent("game_resume");
      return;
    }
    if (model.snapshot.phase === "results") {
      model.reset();
      trackEvent("try_again");
      trackEvent("start_game");
    } else if (model.snapshot.phase === "ready") {
      trackEvent("start_game");
    }
    model.flap();
    audio.current.play("flap");
  }

  function toggleMuted(event: React.PointerEvent<HTMLButtonElement>): void {
    event.stopPropagation();
    const next = !muted;
    setMuted(next);
    audio.current.setMuted(next);
    writeMuted(next);
    trackEvent("mute_toggle", { muted: next });
  }

  return (
    <main className="app-shell">
      <section
        className="game-stage"
        aria-label="WINGSPRINT"
        onPointerDown={(event) => {
          if ((event.target as HTMLElement).closest("button")) return;
          event.preventDefault();
          handlePrimaryAction();
        }}
      >
        <GameCanvas snapshot={snapshot} reduceMotion={reduceMotion} />
        <IosInstallPrompt />

        <button
          className="sound-button"
          type="button"
          aria-label={muted ? "Turn sound on" : "Turn sound off"}
          aria-pressed={muted}
          onPointerDown={toggleMuted}
        >
          {muted ? "×" : "♪"}
        </button>

        {snapshot.phase === "ready" && (
          <div className="ready-overlay" aria-live="polite">
            <img src={`${import.meta.env.BASE_URL}assets/rank-coral.png`} alt="" />
            <h1>WINGSPRINT</h1>
            <p>TAP TO FLY</p>
            <span className="tap-cue" aria-hidden="true">▲</span>
          </div>
        )}

        {(snapshot.phase === "playing" || snapshot.phase === "impact") && (
          <output className="score" aria-label={`Score ${snapshot.score}`}>
            {snapshot.score}
          </output>
        )}

        {snapshot.phase === "paused" && needsResume && (
          <div className="pause-overlay">
            <p>PAUSED</p>
            <button type="button" onPointerDown={handlePrimaryAction}>
              TAP TO RESUME
            </button>
          </div>
        )}

        {snapshot.phase === "results" && (
          <div className="results-overlay" aria-live="assertive">
            <h2>FLIGHT OVER</h2>
            <div className="result-panel">
              <img
                src={`${import.meta.env.BASE_URL}assets/${rankAsset(snapshot.score)}`}
                alt=""
              />
              <dl>
                <div>
                  <dt>SCORE</dt>
                  <dd>{snapshot.score}</dd>
                </div>
                <div>
                  <dt>BEST</dt>
                  <dd>{snapshot.bestScore}</dd>
                </div>
              </dl>
            </div>
            <button
              className="retry-button"
              type="button"
              onPointerDown={(event) => {
                event.stopPropagation();
                handlePrimaryAction();
              }}
            >
              TRY AGAIN
            </button>
          </div>
        )}

        <div className="landscape-message" role="status">
          ROTATE TO PORTRAIT
        </div>
      </section>
    </main>
  );
}
