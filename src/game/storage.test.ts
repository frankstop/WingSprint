import { describe, expect, it } from "vitest";
import { readBestScore, readMuted, writeBestScore, writeMuted } from "./storage";

function memoryStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => data.set(key, value)
  };
}

describe("storage", () => {
  it("rejects invalid best scores", () => {
    const storage = memoryStorage({ "wingsprint.bestScore.v1": "broken" });
    expect(readBestScore(storage)).toBe(0);
  });

  it("persists normalized scores and mute state", () => {
    const storage = memoryStorage();

    writeBestScore(12.8, storage);
    writeMuted(true, storage);

    expect(readBestScore(storage)).toBe(12);
    expect(readMuted(storage)).toBe(true);
  });
});
