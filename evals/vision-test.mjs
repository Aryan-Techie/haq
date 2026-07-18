/**
 * Verifies multimodal input end-to-end: builds a PNG containing a number
 * (7-segment style), posts it to the live /api/chat, and prints the reply.
 *
 *   npm run dev            # server running
 *   node evals/vision-test.mjs
 */
import { deflateSync } from "node:zlib";
import { writeFileSync } from "node:fs";

const BASE = process.env.HAQ_URL || "http://localhost:3000";
const NUMBER = process.argv[2] || "12000";

// ---------- minimal PNG encoder ----------
const CRC = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();
const crc32 = (b) => {
  let c = -1;
  for (let i = 0; i < b.length; i++) c = CRC[(c ^ b[i]) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
};
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
function encodePNG(w, h, rgba) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const raw = Buffer.alloc(h * (w * 4 + 1));
  for (let y = 0; y < h; y++)
    rgba.copy(raw, y * (w * 4 + 1) + 1, y * w * 4, (y + 1) * w * 4);
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// ---------- 7-segment digits ----------
const SEG = {
  0: "abcdef", 1: "bc", 2: "abged", 3: "abgcd", 4: "fgbc",
  5: "afgcd", 6: "afgedc", 7: "abc", 8: "abcdefg", 9: "abcdfg",
};

function render(text) {
  const dw = 90, dh = 160, gap = 26, pad = 60, th = 16;
  const W = pad * 2 + text.length * dw + (text.length - 1) * gap;
  const H = pad * 2 + dh;
  const buf = Buffer.alloc(W * H * 4);
  // white bg
  for (let i = 0; i < W * H; i++) {
    buf[i * 4] = 255; buf[i * 4 + 1] = 255; buf[i * 4 + 2] = 255; buf[i * 4 + 3] = 255;
  }
  const rect = (x0, y0, x1, y1) => {
    for (let y = Math.round(y0); y < Math.round(y1); y++)
      for (let x = Math.round(x0); x < Math.round(x1); x++) {
        if (x < 0 || y < 0 || x >= W || y >= H) continue;
        const i = (y * W + x) * 4;
        buf[i] = 15; buf[i + 1] = 23; buf[i + 2] = 42;
      }
  };
  text.split("").forEach((ch, idx) => {
    const x = pad + idx * (dw + gap);
    const y = pad;
    const segs = SEG[ch] || "";
    const mid = y + dh / 2;
    if (segs.includes("a")) rect(x, y, x + dw, y + th);
    if (segs.includes("b")) rect(x + dw - th, y, x + dw, mid);
    if (segs.includes("c")) rect(x + dw - th, mid, x + dw, y + dh);
    if (segs.includes("d")) rect(x, y + dh - th, x + dw, y + dh);
    if (segs.includes("e")) rect(x, mid, x + th, y + dh);
    if (segs.includes("f")) rect(x, y, x + th, mid);
    if (segs.includes("g")) rect(x, mid - th / 2, x + dw, mid + th / 2);
  });
  return encodePNG(W, H, buf);
}

const png = render(NUMBER);
writeFileSync(new URL("./vision-test.png", import.meta.url), png);
console.log(`Generated evals/vision-test.png containing "${NUMBER}" (${png.length} bytes)`);

// ---------- send through the real app ----------
const body = {
  lang: "en",
  messages: [
    {
      role: "user",
      text: "What number is shown in this image? Reply with just the digits you can read.",
      images: [{ mime: "image/png", data: png.toString("base64") }],
    },
  ],
};

const res = await fetch(`${BASE}/api/chat`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});
console.log("HTTP", res.status);
if (!res.ok) {
  console.log(await res.text());
  process.exit(1);
}

const dec = new TextDecoder();
let buf = "", text = "";
for await (const c of res.body) {
  buf += dec.decode(c, { stream: true });
  let nl;
  while ((nl = buf.indexOf("\n")) >= 0) {
    const raw = buf.slice(0, nl).trim();
    buf = buf.slice(nl + 1);
    if (!raw) continue;
    try {
      const o = JSON.parse(raw);
      if (o.t === "text") text += o.v;
      if (o.t === "error") console.log("STREAM ERROR", o.v);
    } catch {}
  }
}
console.log("\n--- model reply ---\n" + text.trim());
console.log(
  "\nRESULT:",
  text.includes(NUMBER) ? `PASS — read "${NUMBER}" correctly` : `CHECK — expected "${NUMBER}"`
);
