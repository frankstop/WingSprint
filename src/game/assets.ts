export interface GameAssets {
  background: HTMLImageElement;
  clouds: HTMLImageElement;
  hills: HTMLImageElement;
  marsh: HTMLImageElement;
  tower: HTMLImageElement;
  terrain: HTMLImageElement;
  swift: HTMLImageElement[];
  impact: HTMLImageElement;
  particles: HTMLImageElement[];
}

function loadImage(path: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = `${import.meta.env.BASE_URL}${path}`;
  });
}

export async function loadGameAssets(): Promise<GameAssets> {
  const [
    background,
    clouds,
    hills,
    marsh,
    tower,
    terrain,
    swiftUp,
    swiftLevel,
    swiftDown,
    impact,
    ...particles
  ] = await Promise.all([
    loadImage("assets/coast-background.png"),
    loadImage("assets/cloud-layer.png"),
    loadImage("assets/hill-layer.png"),
    loadImage("assets/marsh-layer.png"),
    loadImage("assets/wind-tower.png"),
    loadImage("assets/terrain-strip.png"),
    loadImage("assets/swift-up.png"),
    loadImage("assets/swift-level.png"),
    loadImage("assets/swift-down.png"),
    loadImage("assets/swift-impact.png"),
    loadImage("assets/particle-coral.png"),
    loadImage("assets/particle-feather.png"),
    loadImage("assets/particle-spark.png"),
    loadImage("assets/particle-ceramic.png")
  ]);
  return {
    background,
    clouds,
    hills,
    marsh,
    tower,
    terrain,
    swift: [swiftUp, swiftLevel, swiftDown],
    impact,
    particles
  };
}
