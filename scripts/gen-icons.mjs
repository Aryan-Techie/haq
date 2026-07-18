/**
 * Generates PWA PNG icons with zero dependencies (pure zlib PNG encoder).
 * Draws the Haq mark: a balance scale, white on navy — maskable-safe (full bleed).
 *
 *   node scripts/gen-icons.mjs
 */
import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";

// ---------- tiny PNG encoder ----------
const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();
function crc32(buf) {
  let c = -1;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
function encodePNG(w, h, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  const raw = Buffer.alloc(h * (w * 4 + 1));
  for (let y = 0; y < h; y++) {
    raw[y * (w * 4 + 1)] = 0; // filter none
    rgba.copy(raw, y * (w * 4 + 1) + 1, y * w * 4, (y + 1) * w * 4);
  }
  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// ---------- drawing ----------
const NAVY = [15, 23, 42, 255];
const WHITE = [255, 255, 255, 255];

function makeIcon(size, { padding = 0 } = {}) {
  const buf = Buffer.alloc(size * size * 4);
  const px = (x, y, c) => {
    if (x < 0 || y < 0 || x >= size || y >= size) return;
    const i = (y * size + x) * 4;
    buf[i] = c[0]; buf[i + 1] = c[1]; buf[i + 2] = c[2]; buf[i + 3] = c[3];
  };
  // background
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) px(x, y, NAVY);

  const S = size;
  const inner = 1 - padding * 2;
  const u = (v) => Math.round((padding + v * inner) * S); // 0..1 → px in safe area
  const rect = (x0, y0, x1, y1) => {
    for (let y = u(y0); y < u(y1); y++) for (let x = u(x0); x < u(x1); x++) px(x, y, WHITE);
  };
  // triangle pointing down, spanning x0..x1 between y0..y1
  const pan = (x0, x1, y0, y1) => {
    const X0 = u(x0), X1 = u(x1), Y0 = u(y0), Y1 = u(y1);
    const h = Y1 - Y0;
    for (let y = Y0; y < Y1; y++) {
      const t = (y - Y0) / h;
      const shrink = Math.round(((X1 - X0) / 2) * t);
      for (let x = X0 + shrink; x < X1 - shrink; x++) px(x, y, WHITE);
    }
  };

  // beam
  rect(0.16, 0.30, 0.84, 0.355);
  // post
  rect(0.475, 0.30, 0.525, 0.74);
  // base
  rect(0.34, 0.74, 0.66, 0.80);
  // top knob
  rect(0.44, 0.22, 0.56, 0.27);
  // pans
  pan(0.14, 0.38, 0.40, 0.56);
  pan(0.62, 0.86, 0.40, 0.56);
  // hangers
  rect(0.255, 0.355, 0.275, 0.40);
  rect(0.725, 0.355, 0.745, 0.40);

  return encodePNG(size, size, buf);
}

mkdirSync(new URL("../public/", import.meta.url), { recursive: true });
const out = (name, data) => {
  writeFileSync(new URL(`../public/${name}`, import.meta.url), data);
  console.log("wrote public/" + name);
};

out("icon-192.png", makeIcon(192, { padding: 0.14 }));
out("icon-512.png", makeIcon(512, { padding: 0.14 }));
// maskable needs more breathing room (safe zone ~80%)
out("icon-maskable-512.png", makeIcon(512, { padding: 0.22 }));
out("apple-touch-icon.png", makeIcon(180, { padding: 0.14 }));
out("favicon-32.png", makeIcon(32, { padding: 0.1 }));
