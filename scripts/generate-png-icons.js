const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// 純 Node.js 產生標準 PNG 格式圖片，無需任何 npm 模組
function createPng(width, height, drawPixelFn) {
  const bytesPerPixel = 4; // RGBA
  const rowSize = 1 + width * bytesPerPixel;
  const rawData = Buffer.alloc(rowSize * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter type: None
    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * bytesPerPixel;
      const [r, g, b, a] = drawPixelFn(x, y, width, height);
      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const compressedData = zlib.deflateSync(rawData);

  // PNG Header
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR Chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // 8-bit depth
  ihdr[9] = 6; // Color type: RGBA
  ihdr[10] = 0; // Compression
  ihdr[11] = 0; // Filter
  ihdr[12] = 0; // Interlace
  const ihdrChunk = makeChunk('IHDR', ihdr);

  // IDAT Chunk
  const idatChunk = makeChunk('IDAT', compressedData);

  // IEND Chunk
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function makeChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(4 + 4 + len + 4);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4, 4, 'ascii');
  data.copy(buf, 8);
  const crc = crc32(buf.subarray(4, 8 + len));
  buf.writeUInt32BE(crc, 8 + len);
  return buf;
}

// 簡單快速 CRC32
function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

// 繪製金融風格幾何漸層美型圖示 (深藍黑 + 亮金 + 台灣紅)
function drawStockIcon(x, y, w, h) {
  const nx = x / w; // 0 ~ 1
  const ny = y / h; // 0 ~ 1

  // 背景深藍黑漸層
  let r = 11 + Math.floor(nx * 10);
  let g = 19 + Math.floor(ny * 15);
  let b = 35 + Math.floor((nx + ny) * 20);
  let a = 255;

  // 繪製金融走勢線 (折線函數)
  // 模擬曲線: 从左下至右上上升
  const lineY = 0.75 - Math.pow(nx, 1.4) * 0.52 - Math.sin(nx * Math.PI * 2.2) * 0.08;
  const dist = Math.abs(ny - lineY);

  // 折線厚度
  const lineWidth = 0.035;
  if (dist < lineWidth) {
    const intensity = 1 - (dist / lineWidth);
    // 漸層從科技青藍 -> 橙金 -> 股市紅
    if (nx < 0.4) {
      r = Math.floor(59 * intensity + r * (1 - intensity));
      g = Math.floor(130 * intensity + g * (1 - intensity));
      b = Math.floor(246 * intensity + b * (1 - intensity));
    } else if (nx < 0.75) {
      r = Math.floor(245 * intensity + r * (1 - intensity));
      g = Math.floor(158 * intensity + g * (1 - intensity));
      b = Math.floor(11 * intensity + b * (1 - intensity));
    } else {
      r = Math.floor(239 * intensity + r * (1 - intensity));
      g = Math.floor(68 * intensity + g * (1 - intensity));
      b = Math.floor(68 * intensity + b * (1 - intensity));
    }
  } else if (ny > lineY && ny < lineY + 0.35) {
    // 走勢線下方發光填充
    const fillAlpha = (1 - (ny - lineY) / 0.35) * 0.25;
    r = Math.floor(239 * fillAlpha + r * (1 - fillAlpha));
    g = Math.floor(68 * fillAlpha + g * (1 - fillAlpha));
    b = Math.floor(68 * fillAlpha + b * (1 - fillAlpha));
  }

  // 右上角光芒點 (衝刺端點)
  const tipX = 0.88;
  const tipY = 0.75 - Math.pow(tipX, 1.4) * 0.52 - Math.sin(tipX * Math.PI * 2.2) * 0.08;
  const tipDist = Math.hypot(nx - tipX, ny - tipY);
  if (tipDist < 0.045) {
    const tipGlow = 1 - (tipDist / 0.045);
    r = Math.floor(255 * tipGlow + r * (1 - tipGlow));
    g = Math.floor(230 * tipGlow + g * (1 - tipGlow));
    b = Math.floor(230 * tipGlow + b * (1 - tipGlow));
  }

  return [r, g, b, a];
}

const outDir = path.join(__dirname, '../frontend/public/icons');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

console.log('Generating PNG icons...');
const icon192 = createPng(192, 192, drawStockIcon);
fs.writeFileSync(path.join(outDir, 'icon-192.png'), icon192);

const icon512 = createPng(512, 512, drawStockIcon);
fs.writeFileSync(path.join(outDir, 'icon-512.png'), icon512);

const appleTouchIcon = createPng(180, 180, drawStockIcon);
fs.writeFileSync(path.join(outDir, 'apple-touch-icon.png'), appleTouchIcon);

// 同步產生 favicon.png
fs.writeFileSync(path.join(outDir, 'favicon.png'), createPng(64, 64, drawStockIcon));

console.log('PNG icons created successfully!');
