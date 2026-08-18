/**
 * A QR encoder, byte mode, error-correction level M, versions 1–20.
 *
 * Written here rather than installed: the kiosk draws this code on a shop
 * window, it has to work with the network down, and a build-time dependency
 * that renders a link to a stranger's phone is not a supply chain worth having
 * for four hundred lines of finite-field arithmetic. Level M keeps roughly 15%
 * of the code recoverable, which is what lets a phone read it off a screen at
 * an angle.
 *
 * The tables below are the ones in ISO/IEC 18004; every version this file
 * claims to support is round-tripped through an independent decoder in
 * tests/qr.test.ts, so a mistyped row fails the build rather than a customer.
 */

/** Data codewords, per block, for level M. [ecPerBlock, g1Blocks, g1Data, g2Blocks, g2Data] */
const BLOCKS_M: Array<[number, number, number, number, number]> = [
  [10, 1, 16, 0, 0], // 1
  [16, 1, 28, 0, 0], // 2
  [26, 1, 44, 0, 0], // 3
  [18, 2, 32, 0, 0], // 4
  [24, 2, 43, 0, 0], // 5
  [16, 4, 27, 0, 0], // 6
  [18, 4, 31, 0, 0], // 7
  [22, 2, 38, 2, 39], // 8
  [22, 3, 36, 2, 37], // 9
  [26, 4, 43, 1, 44], // 10
  [30, 1, 50, 4, 51], // 11
  [22, 6, 36, 2, 37], // 12
  [22, 8, 37, 1, 38], // 13
  [24, 4, 40, 5, 41], // 14
  [24, 5, 41, 5, 42], // 15
  [28, 7, 45, 3, 46], // 16
  [28, 10, 46, 1, 47], // 17
  [26, 9, 43, 4, 44], // 18
  [26, 3, 44, 11, 45], // 19
  [26, 3, 41, 13, 42], // 20
];

/** Centres of the alignment patterns, per version. */
const ALIGNMENT: number[][] = [
  [], // 1
  [6, 18],
  [6, 22],
  [6, 26],
  [6, 30],
  [6, 34],
  [6, 22, 38],
  [6, 24, 42],
  [6, 26, 46],
  [6, 28, 50],
  [6, 30, 54],
  [6, 32, 58],
  [6, 34, 62],
  [6, 26, 46, 66],
  [6, 26, 48, 70],
  [6, 26, 50, 74],
  [6, 30, 54, 78],
  [6, 30, 56, 82],
  [6, 30, 58, 86],
  [6, 34, 62, 90], // 20
];

/** Unused bits after the last codeword, per version. */
function remainderBits(version: number) {
  if (version === 1) return 0;
  if (version <= 6) return 7;
  if (version <= 13) return 0;
  return 3; // versions 14–20
}

// --- GF(256) arithmetic, primitive polynomial 0x11D ---
const EXP = new Uint8Array(512);
const LOG = new Uint8Array(256);
{
  let x = 1;
  for (let i = 0; i < 255; i += 1) {
    EXP[i] = x;
    LOG[x] = i;
    x <<= 1;
    if (x & 0x100) x ^= 0x11d;
  }
  for (let i = 255; i < 512; i += 1) EXP[i] = EXP[i - 255];
}

function gfMul(a: number, b: number) {
  return a === 0 || b === 0 ? 0 : EXP[LOG[a] + LOG[b]];
}

/**
 * The generator polynomial for `degree` error-correction codewords: the product
 * of (x − α^0)…(x − α^degree-1). Coefficients run highest power first, so
 * index 0 is the leading 1 and the rest are what the division below subtracts.
 */
function generatorPoly(degree: number) {
  let poly = [1];
  for (let i = 0; i < degree; i += 1) {
    const next = new Array<number>(poly.length + 1).fill(0);
    for (let j = 0; j < poly.length; j += 1) {
      next[j] ^= poly[j];
      next[j + 1] ^= gfMul(poly[j], EXP[i]);
    }
    poly = next;
  }
  return poly;
}

function errorCorrection(data: number[], degree: number) {
  const generator = generatorPoly(degree);
  const remainder = new Array<number>(degree).fill(0);
  for (const byte of data) {
    const factor = byte ^ remainder[0];
    remainder.shift();
    remainder.push(0);
    for (let i = 0; i < degree; i += 1) remainder[i] ^= gfMul(generator[i + 1], factor);
  }
  return remainder;
}

// --- Bit stream ---
class BitBuffer {
  bits: number[] = [];
  put(value: number, length: number) {
    for (let i = length - 1; i >= 0; i -= 1) this.bits.push((value >>> i) & 1);
  }
}

function capacityBytes(version: number) {
  const [ecPerBlock, g1, g1Data, g2, g2Data] = BLOCKS_M[version - 1];
  void ecPerBlock;
  const dataCodewords = g1 * g1Data + g2 * g2Data;
  // Mode indicator (4 bits) and the character count field come out of the same
  // budget as the payload.
  return dataCodewords - 2 - (version >= 10 ? 1 : 0);
}

export type QrMatrix = {
  version: number;
  size: number;
  /** The mask pattern chosen by the penalty rules, 0–7. */
  mask: number;
  /** Row-major; true is a dark module. */
  modules: boolean[][];
};

function encodeData(bytes: Uint8Array, version: number) {
  const [ecPerBlock, g1, g1Data, g2, g2Data] = BLOCKS_M[version - 1];
  const dataCodewords = g1 * g1Data + g2 * g2Data;
  const buffer = new BitBuffer();
  buffer.put(0b0100, 4); // byte mode
  buffer.put(bytes.length, version >= 10 ? 16 : 8);
  for (const byte of bytes) buffer.put(byte, 8);
  const capacity = dataCodewords * 8;
  buffer.put(0, Math.min(4, capacity - buffer.bits.length)); // terminator
  while (buffer.bits.length % 8) buffer.bits.push(0);
  const codewords: number[] = [];
  for (let i = 0; i < buffer.bits.length; i += 8) {
    let byte = 0;
    for (let j = 0; j < 8; j += 1) byte = (byte << 1) | buffer.bits[i + j];
    codewords.push(byte);
  }
  // The pad sequence always starts at 0xEC, wherever the payload happened to end.
  const padding = [0xec, 0x11];
  for (let i = 0; codewords.length < dataCodewords; i += 1) codewords.push(padding[i % 2]);

  const blocks: number[][] = [];
  const ecBlocks: number[][] = [];
  let offset = 0;
  for (let i = 0; i < g1 + g2; i += 1) {
    const length = i < g1 ? g1Data : g2Data;
    const block = codewords.slice(offset, offset + length);
    offset += length;
    blocks.push(block);
    ecBlocks.push(errorCorrection(block, ecPerBlock));
  }
  // Interleave: one codeword from each block in turn, data first, then EC.
  const interleaved: number[] = [];
  for (let i = 0; i < Math.max(g1Data, g2Data); i += 1)
    for (const block of blocks) if (i < block.length) interleaved.push(block[i]);
  for (let i = 0; i < ecPerBlock; i += 1) for (const block of ecBlocks) interleaved.push(block[i]);
  return interleaved;
}

function blankMatrix(size: number) {
  return Array.from({ length: size }, () => new Array<boolean>(size).fill(false));
}

function placeFunctionPatterns(modules: boolean[][], reserved: boolean[][], version: number) {
  const size = modules.length;
  const finder = (row: number, column: number) => {
    for (let r = -1; r <= 7; r += 1)
      for (let c = -1; c <= 7; c += 1) {
        const y = row + r;
        const x = column + c;
        if (y < 0 || y >= size || x < 0 || x >= size) continue;
        // The ring at -1 and 7 is the separator and stays light; a scanner
        // finds the pattern by its isolation as much as by its shape.
        const inside = r >= 0 && r <= 6 && c >= 0 && c <= 6;
        const edge = r === 0 || r === 6 || c === 0 || c === 6;
        const core = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        modules[y][x] = inside && (edge || core);
        reserved[y][x] = true;
      }
  };
  finder(0, 0);
  finder(0, size - 7);
  finder(size - 7, 0);

  for (const centre of ALIGNMENT[version - 1]) {
    for (const other of ALIGNMENT[version - 1]) {
      // The three finder corners already own their squares.
      if (
        (centre === 6 && other === 6) ||
        (centre === 6 && other === size - 7) ||
        (centre === size - 7 && other === 6)
      )
        continue;
      for (let r = -2; r <= 2; r += 1)
        for (let c = -2; c <= 2; c += 1) {
          modules[centre + r][other + c] = Math.max(Math.abs(r), Math.abs(c)) !== 1;
          reserved[centre + r][other + c] = true;
        }
    }
  }

  for (let i = 8; i < size - 8; i += 1) {
    modules[6][i] = i % 2 === 0;
    modules[i][6] = i % 2 === 0;
    reserved[6][i] = true;
    reserved[i][6] = true;
  }

  // Format information areas, plus the module that is always dark.
  for (let i = 0; i < 9; i += 1) {
    if (!reserved[8][i]) reserved[8][i] = true;
    if (!reserved[i][8]) reserved[i][8] = true;
  }
  for (let i = 0; i < 8; i += 1) {
    reserved[8][size - 1 - i] = true;
    reserved[size - 1 - i][8] = true;
  }
  modules[size - 8][8] = true;
  reserved[size - 8][8] = true;

  if (version >= 7) {
    const bits = versionBits(version);
    for (let i = 0; i < 18; i += 1) {
      const bit = ((bits >> i) & 1) === 1;
      const row = Math.floor(i / 3);
      const column = size - 11 + (i % 3);
      modules[row][column] = bit;
      reserved[row][column] = true;
      modules[column][row] = bit;
      reserved[column][row] = true;
    }
  }
}

/** BCH(18,6) version information. */
function versionBits(version: number) {
  let remainder = version;
  for (let i = 0; i < 12; i += 1) remainder = (remainder << 1) ^ ((remainder >>> 11) * 0x1f25);
  return (version << 12) | remainder;
}

/** BCH(15,5) format information for level M and the given mask. */
function formatBits(mask: number) {
  const data = (0b00 << 3) | mask;
  let remainder = data;
  for (let i = 0; i < 10; i += 1) remainder = (remainder << 1) ^ ((remainder >>> 9) * 0x537);
  return ((data << 10) | remainder) ^ 0x5412;
}

function placeFormat(modules: boolean[][], mask: number) {
  const size = modules.length;
  const bits = formatBits(mask);
  for (let i = 0; i < 15; i += 1) {
    const bit = ((bits >> i) & 1) === 1;
    // Copy one: down the left column and across the top row.
    if (i < 6) modules[i][8] = bit;
    else if (i < 8) modules[i + 1][8] = bit;
    else if (i === 8) modules[8][7] = bit;
    else modules[8][14 - i] = bit;
    // Copy two: the far corners, so a damaged corner is survivable.
    if (i < 8) modules[8][size - 1 - i] = bit;
    else modules[size - 15 + i][8] = bit;
  }
}

function maskAt(mask: number, row: number, column: number) {
  switch (mask) {
    case 0:
      return (row + column) % 2 === 0;
    case 1:
      return row % 2 === 0;
    case 2:
      return column % 3 === 0;
    case 3:
      return (row + column) % 3 === 0;
    case 4:
      return (Math.floor(row / 2) + Math.floor(column / 3)) % 2 === 0;
    case 5:
      return ((row * column) % 2) + ((row * column) % 3) === 0;
    case 6:
      return (((row * column) % 2) + ((row * column) % 3)) % 2 === 0;
    default:
      return (((row + column) % 2) + ((row * column) % 3)) % 2 === 0;
  }
}

/** The four penalty rules; the mask with the lowest score is the one used. */
function penalty(modules: boolean[][]) {
  const size = modules.length;
  let score = 0;
  const runPenalty = (run: number) => (run >= 5 ? 3 + (run - 5) : 0);
  for (let i = 0; i < size; i += 1) {
    let rowRun = 1;
    let columnRun = 1;
    for (let j = 1; j < size; j += 1) {
      rowRun =
        modules[i][j] === modules[i][j - 1] ? rowRun + 1 : ((score += runPenalty(rowRun)), 1);
      columnRun =
        modules[j][i] === modules[j - 1][i] ? columnRun + 1 : ((score += runPenalty(columnRun)), 1);
    }
    score += runPenalty(rowRun) + runPenalty(columnRun);
  }
  for (let i = 0; i < size - 1; i += 1)
    for (let j = 0; j < size - 1; j += 1) {
      const first = modules[i][j];
      if (
        first === modules[i][j + 1] &&
        first === modules[i + 1][j] &&
        first === modules[i + 1][j + 1]
      )
        score += 3;
    }
  const pattern = [true, false, true, true, true, false, true, false, false, false, false];
  const reversed = [...pattern].reverse();
  const matches = (get: (index: number) => boolean, start: number, shape: boolean[]) =>
    shape.every((value, index) => get(start + index) === value);
  for (let i = 0; i < size; i += 1)
    for (let j = 0; j <= size - 11; j += 1) {
      if (matches((k) => modules[i][k], j, pattern)) score += 40;
      if (matches((k) => modules[i][k], j, reversed)) score += 40;
      if (matches((k) => modules[k][i], j, pattern)) score += 40;
      if (matches((k) => modules[k][i], j, reversed)) score += 40;
    }
  const dark = modules.flat().filter(Boolean).length;
  score += Math.floor(Math.abs((dark * 100) / (size * size) - 50) / 5) * 10;
  return score;
}

/**
 * Encodes text as a QR matrix. Throws only if the text cannot fit version 20,
 * which is 666 bytes — an order of magnitude past any link this product makes.
 */
export function encodeQr(text: string): QrMatrix {
  const bytes = new TextEncoder().encode(text);
  const version = BLOCKS_M.findIndex((_, index) => bytes.length <= capacityBytes(index + 1)) + 1;
  if (version === 0)
    throw new Error(`Text too long for a version 20 QR code: ${bytes.length} bytes`);

  const size = version * 4 + 17;
  const modules = blankMatrix(size);
  const reserved = blankMatrix(size);
  placeFunctionPatterns(modules, reserved, version);

  const codewords = encodeData(bytes, version);
  const bits: number[] = [];
  for (const codeword of codewords) for (let i = 7; i >= 0; i -= 1) bits.push((codeword >> i) & 1);
  for (let i = 0; i < remainderBits(version); i += 1) bits.push(0);

  // Two modules wide, bottom to top then top to bottom, skipping the vertical
  // timing column entirely.
  let index = 0;
  let upward = true;
  for (let right = size - 1; right >= 1; right -= 2) {
    const column = right <= 6 ? right - 1 : right;
    for (let step = 0; step < size; step += 1) {
      const row = upward ? size - 1 - step : step;
      for (const x of [column, column - 1]) {
        if (reserved[row][x]) continue;
        modules[row][x] = index < bits.length && bits[index] === 1;
        index += 1;
      }
    }
    upward = !upward;
  }

  let best: { mask: number; modules: boolean[][] } | null = null;
  let bestScore = Infinity;
  for (let mask = 0; mask < 8; mask += 1) {
    const candidate = modules.map((row) => [...row]);
    for (let row = 0; row < size; row += 1)
      for (let column = 0; column < size; column += 1)
        if (!reserved[row][column] && maskAt(mask, row, column))
          candidate[row][column] = !candidate[row][column];
    placeFormat(candidate, mask);
    const score = penalty(candidate);
    if (score < bestScore) {
      bestScore = score;
      best = { mask, modules: candidate };
    }
  }
  return { version, size, mask: best!.mask, modules: best!.modules };
}

/**
 * One SVG path covering every dark module, runs merged along each row. A path
 * beats thousands of `<rect>` elements both to parse and to print.
 */
export function qrPath(matrix: QrMatrix) {
  const parts: string[] = [];
  for (let row = 0; row < matrix.size; row += 1) {
    let start = -1;
    for (let column = 0; column <= matrix.size; column += 1) {
      const dark = column < matrix.size && matrix.modules[row][column];
      if (dark && start === -1) start = column;
      if (!dark && start !== -1) {
        parts.push(`M${start} ${row}h${column - start}v1h-${column - start}z`);
        start = -1;
      }
    }
  }
  return parts.join('');
}
