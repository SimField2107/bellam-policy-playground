const BG_PRIMARY = { l: 0.06, c: 0.005, h: 250 };
const TEAL = { l: 0.65, c: 0.12, h: 175 };
const ORANGE = { l: 0.6, c: 0.15, h: 45 };

function oklchToRgb(l: number, c: number, h: number): [number, number, number] {
  const hRad = (h * Math.PI) / 180;
  const a = c * Math.cos(hRad);
  const b = c * Math.sin(hRad);

  const L = l;
  const A = a;
  const B = b;

  const l_ = L + 0.3963377774 * A + 0.2158037573 * B;
  const m_ = L - 0.1055613458 * A - 0.0638541728 * B;
  const s_ = L - 0.0894841775 * A - 1.291485548 * B;

  const lCubed = l_ * l_ * l_;
  const mCubed = m_ * m_ * m_;
  const sCubed = s_ * s_ * s_;

  const r = +4.0767416621 * lCubed - 3.3077115913 * mCubed + 0.2309699292 * sCubed;
  const g = -1.2684380046 * lCubed + 2.6097574011 * mCubed - 0.3413193965 * sCubed;
  const bVal = -0.0041960863 * lCubed - 0.7034186147 * mCubed + 1.707614701 * sCubed;

  const gammaCorrect = (x: number) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    return x <= 0.0031308
      ? 12.92 * x
      : 1.055 * Math.pow(x, 1 / 2.4) - 0.055;
  };

  return [
    Math.round(gammaCorrect(r) * 255),
    Math.round(gammaCorrect(g) * 255),
    Math.round(gammaCorrect(bVal) * 255),
  ];
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerpAngle(a: number, b: number, t: number): number {
  let diff = b - a;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  return a + diff * t;
}

export function valueToColor(value: number, min: number, max: number): string {
  if (max === min) {
    const [r, g, b] = oklchToRgb(BG_PRIMARY.l, BG_PRIMARY.c, BG_PRIMARY.h);
    return `rgb(${r},${g},${b})`;
  }

  const normalized = (value - min) / (max - min);
  const t = normalized * 2 - 1;

  let l: number, c: number, h: number;

  if (t < 0) {
    const absT = -t;
    l = lerp(BG_PRIMARY.l, ORANGE.l, absT);
    c = lerp(BG_PRIMARY.c, ORANGE.c, absT);
    h = lerpAngle(BG_PRIMARY.h, ORANGE.h, absT);
  } else {
    l = lerp(BG_PRIMARY.l, TEAL.l, t);
    c = lerp(BG_PRIMARY.c, TEAL.c, t);
    h = lerpAngle(BG_PRIMARY.h, TEAL.h, t);
  }

  const [r, g, bVal] = oklchToRgb(l, c, h);
  return `rgb(${r},${g},${bVal})`;
}

export function valueToColorRgb(
  value: number,
  min: number,
  max: number
): [number, number, number] {
  if (max === min) {
    return oklchToRgb(BG_PRIMARY.l, BG_PRIMARY.c, BG_PRIMARY.h);
  }

  const normalized = (value - min) / (max - min);
  const t = normalized * 2 - 1;

  let l: number, c: number, h: number;

  if (t < 0) {
    const absT = -t;
    l = lerp(BG_PRIMARY.l, ORANGE.l, absT);
    c = lerp(BG_PRIMARY.c, ORANGE.c, absT);
    h = lerpAngle(BG_PRIMARY.h, ORANGE.h, absT);
  } else {
    l = lerp(BG_PRIMARY.l, TEAL.l, t);
    c = lerp(BG_PRIMARY.c, TEAL.c, t);
    h = lerpAngle(BG_PRIMARY.h, TEAL.h, t);
  }

  return oklchToRgb(l, c, h);
}

export const COLORS = {
  bgPrimary: "#0b0c0e",
  bgSecondary: "#111214",
  bgPanel: "#16181c",
  wall: "#16181c",
  border: "#2a2d33",
  agent: "#d87b3c",
  agentTrail: "rgba(216, 123, 60, 0.3)",
  goal: "#4fb3a9",
  start: "#6b7280",
  text: "#e8e9eb",
  textMuted: "#6b7280",
};
