const BEST_SCORE_KEY = "wingsprint.bestScore.v1";
const MUTED_KEY = "wingsprint.muted.v1";

export function readBestScore(storage: Pick<Storage, "getItem"> = localStorage): number {
  const parsed = Number.parseInt(storage.getItem(BEST_SCORE_KEY) ?? "0", 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

export function writeBestScore(score: number, storage: Pick<Storage, "setItem"> = localStorage): void {
  storage.setItem(BEST_SCORE_KEY, String(Math.max(0, Math.floor(score))));
}

export function readMuted(storage: Pick<Storage, "getItem"> = localStorage): boolean {
  return storage.getItem(MUTED_KEY) === "true";
}

export function writeMuted(muted: boolean, storage: Pick<Storage, "setItem"> = localStorage): void {
  storage.setItem(MUTED_KEY, String(muted));
}
