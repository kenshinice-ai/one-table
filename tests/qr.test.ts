import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { encodeQr, qrPath, type QrMatrix } from '../src/vendor/qr';

/**
 * Reads a matrix back without using anything from the encoder.
 *
 * The encoder's own tables cannot be its own witness, so this walks the matrix
 * the way a scanner does: find the mask in the format bits, undo it, follow the
 * zigzag, and parse the mode, length and payload out of the data codewords. A
 * misplaced alignment pattern or a wrong block split shows up here as garbage.
 */
function decode(matrix: QrMatrix) {
  const { size, modules } = matrix;
  const version = (size - 17) / 4;
  // Format bits, first copy: column 8 top-down, then row 8 right-to-left.
  let format = 0;
  for (let i = 0; i < 15; i += 1) {
    let bit: boolean;
    if (i < 6) bit = modules[i][8];
    else if (i < 8) bit = modules[i + 1][8];
    else if (i === 8) bit = modules[8][7];
    else bit = modules[8][14 - i];
    if (bit) format |= 1 << i;
  }
  format ^= 0x5412;
  // The five data bits sit at the top of the fifteen: level, then mask.
  const mask = (format >>> 10) & 0b111;
  const ecLevel = (format >>> 13) & 0b11;

  // Rebuild the map of modules that carry no data.
  const functional = Array.from({ length: size }, () => new Array<boolean>(size).fill(false));
  const block = (top: number, left: number, extent: number) => {
    for (let r = top; r < top + extent; r += 1)
      for (let c = left; c < left + extent; c += 1)
        if (r >= 0 && r < size && c >= 0 && c < size) functional[r][c] = true;
  };
  block(0, 0, 9);
  block(0, size - 8, 9);
  block(size - 8, 0, 9);
  for (let i = 0; i < size; i += 1) {
    functional[6][i] = true;
    functional[i][6] = true;
  }
  const centres =
    version === 1
      ? []
      : (() => {
          const count = Math.floor(version / 7) + 2;
          const last = size - 7;
          if (count === 2) return [6, last];
          const step = Math.ceil((last - 6) / (count - 1) / 2) * 2;
          const list = [6];
          for (let i = count - 1; i >= 1; i -= 1) list.push(last - (i - 1) * step);
          return list;
        })();
  for (const row of centres)
    for (const column of centres) {
      const nearFinder =
        (row === 6 && column === 6) ||
        (row === 6 && column === size - 7) ||
        (row === size - 7 && column === 6);
      if (nearFinder) continue;
      block(row - 2, column - 2, 5);
    }
  if (version >= 7) {
    block(0, size - 11, 0);
    for (let i = 0; i < 6; i += 1)
      for (let j = 0; j < 3; j += 1) {
        functional[i][size - 11 + j] = true;
        functional[size - 11 + j][i] = true;
      }
  }

  const unmask = (row: number, column: number) => {
    const value = modules[row][column];
    const flip = [
      (row + column) % 2 === 0,
      row % 2 === 0,
      column % 3 === 0,
      (row + column) % 3 === 0,
      (Math.floor(row / 2) + Math.floor(column / 3)) % 2 === 0,
      ((row * column) % 2) + ((row * column) % 3) === 0,
      (((row * column) % 2) + ((row * column) % 3)) % 2 === 0,
      (((row + column) % 2) + ((row * column) % 3)) % 2 === 0,
    ][mask];
    return flip ? !value : value;
  };

  const bits: number[] = [];
  let upward = true;
  for (let right = size - 1; right >= 1; right -= 2) {
    const column = right <= 6 ? right - 1 : right;
    for (let step = 0; step < size; step += 1) {
      const row = upward ? size - 1 - step : step;
      for (const x of [column, column - 1])
        if (!functional[row][x]) bits.push(unmask(row, x) ? 1 : 0);
    }
    upward = !upward;
  }
  const codewords: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    let byte = 0;
    for (let j = 0; j < 8; j += 1) byte = (byte << 1) | bits[i + j];
    codewords.push(byte);
  }
  return { version, mask, ecLevel, codewords };
}

const TABLE: Array<[number, number, number, number, number]> = [
  [10, 1, 16, 0, 0],
  [16, 1, 28, 0, 0],
  [26, 1, 44, 0, 0],
  [18, 2, 32, 0, 0],
  [24, 2, 43, 0, 0],
  [16, 4, 27, 0, 0],
  [18, 4, 31, 0, 0],
  [22, 2, 38, 2, 39],
  [22, 3, 36, 2, 37],
  [26, 4, 43, 1, 44],
  [30, 1, 50, 4, 51],
  [22, 6, 36, 2, 37],
  [22, 8, 37, 1, 38],
  [24, 4, 40, 5, 41],
  [24, 5, 41, 5, 42],
  [28, 7, 45, 3, 46],
  [28, 10, 46, 1, 47],
  [26, 9, 43, 4, 44],
  [26, 3, 44, 11, 45],
  [26, 3, 41, 13, 42],
];

function blockLengths(version: number) {
  const [, g1, g1Data, g2, g2Data] = TABLE[version - 1];
  return [...Array.from({ length: g1 }, () => g1Data), ...Array.from({ length: g2 }, () => g2Data)];
}

/** Undoes the block interleave, given the level-M split for this version. */
function deinterleave(codewords: number[], version: number) {
  const lengths = blockLengths(version);
  const blocks: number[][] = lengths.map(() => []);
  let index = 0;
  for (let i = 0; i < Math.max(...lengths); i += 1)
    for (let b = 0; b < lengths.length; b += 1)
      if (i < lengths[b]) blocks[b].push(codewords[index++]);
  return blocks.flat();
}

/** Each block as it was protected: its data codewords followed by its own EC. */
function blocksWithEc(codewords: number[], version: number) {
  const lengths = blockLengths(version);
  const ecPerBlock = TABLE[version - 1][0];
  const data: number[][] = lengths.map(() => []);
  let index = 0;
  for (let i = 0; i < Math.max(...lengths); i += 1)
    for (let b = 0; b < lengths.length; b += 1)
      if (i < lengths[b]) data[b].push(codewords[index++]);
  const ec: number[][] = lengths.map(() => []);
  for (let i = 0; i < ecPerBlock; i += 1)
    for (let b = 0; b < lengths.length; b += 1) ec[b].push(codewords[index++]);
  return lengths.map((_, b) => [...data[b], ...ec[b]]);
}

/**
 * Reed–Solomon syndromes, computed from the field up rather than from the
 * encoder's own generator polynomial. A codeword the standard would accept
 * evaluates to zero at α^0…α^(n−1); anything else means a phone will refuse the
 * code even though it looks like a QR and reads back through the encoder's own
 * assumptions. This is what caught a reversed generator polynomial.
 */
function syndromes(codewords: number[], count: number) {
  const exp = new Uint8Array(512);
  const log = new Uint8Array(256);
  let x = 1;
  for (let i = 0; i < 255; i += 1) {
    exp[i] = x;
    log[x] = i;
    x <<= 1;
    if (x & 0x100) x ^= 0x11d;
  }
  for (let i = 255; i < 512; i += 1) exp[i] = exp[i - 255];
  const mul = (a: number, b: number) => (a === 0 || b === 0 ? 0 : exp[log[a] + log[b]]);
  return Array.from({ length: count }, (_, i) =>
    codewords.reduce((acc, word) => mul(acc, exp[i]) ^ word, 0),
  );
}

function readPayload(matrix: QrMatrix) {
  const { codewords, version } = decode(matrix);
  const data = deinterleave(codewords, version);
  let cursor = 0;
  const take = (count: number) => {
    let value = 0;
    for (let i = 0; i < count; i += 1) {
      const bit = (data[Math.floor(cursor / 8)] >> (7 - (cursor % 8))) & 1;
      value = (value << 1) | bit;
      cursor += 1;
    }
    return value;
  };
  const mode = take(4);
  const length = take(version >= 10 ? 16 : 8);
  const bytes = new Uint8Array(length);
  for (let i = 0; i < length; i += 1) bytes[i] = take(8);
  return { mode, text: new TextDecoder().decode(bytes) };
}

/**
 * A payload that exactly fills `version`, which is also the case most likely to
 * expose an off-by-one in the block split.
 */
const CAPACITY = [
  14, 26, 42, 62, 84, 106, 122, 152, 180, 213, 251, 287, 331, 362, 412, 450, 504, 560, 624, 666,
];

function payloadForVersion(version: number) {
  const prefix = 'https://onetable.pwestudio.site/?q=';
  return (prefix + 'abcdefghij'.repeat(70)).slice(0, CAPACITY[version - 1]);
}

describe('qr encoder', () => {
  it('matches the published BCH constants', () => {
    // Version 7's information block is 0x07C94 in the standard; the same BCH
    // loop produces the format bits, so this fixes both.
    const matrix = encodeQr('x'.repeat(120));
    assert.equal(matrix.version, 7);
    let versionField = 0;
    for (let i = 0; i < 18; i += 1) {
      const row = Math.floor(i / 3);
      const column = matrix.size - 11 + (i % 3);
      if (matrix.modules[row][column]) versionField |= 1 << i;
    }
    assert.equal(versionField, 0x07c94);
  });

  it('draws the fixed patterns a scanner looks for first', () => {
    const matrix = encodeQr('https://onetable.pwestudio.site/?v=1');
    const { size, modules } = matrix;
    for (const [top, left] of [
      [0, 0],
      [0, size - 7],
      [size - 7, 0],
    ]) {
      for (let r = 0; r < 7; r += 1)
        for (let c = 0; c < 7; c += 1) {
          const edge = r === 0 || r === 6 || c === 0 || c === 6;
          const core = r >= 2 && r <= 4 && c >= 2 && c <= 4;
          assert.equal(modules[top + r][left + c], edge || core, `finder at ${top},${left}`);
        }
    }
    // The separator: a finder is recognised by its isolation, and a single
    // stray module in this ring is enough to make a phone give up.
    for (let i = 0; i < 8; i += 1) {
      assert.equal(modules[7][i], false, `top-left separator row at ${i}`);
      assert.equal(modules[i][7], false, `top-left separator column at ${i}`);
      assert.equal(modules[7][size - 1 - i], false, `top-right separator row at ${i}`);
      assert.equal(modules[i][size - 8], false, `top-right separator column at ${i}`);
      assert.equal(modules[size - 8][i], false, `bottom-left separator row at ${i}`);
      if (i !== 0) assert.equal(modules[size - 1 - i][7], false, `bottom-left column at ${i}`);
    }
    for (let i = 8; i < size - 8; i += 1) {
      assert.equal(modules[6][i], i % 2 === 0, `horizontal timing at ${i}`);
      assert.equal(modules[i][6], i % 2 === 0, `vertical timing at ${i}`);
    }
    assert.equal(modules[size - 8][8], true, 'the always-dark module');
  });

  it('round-trips every supported version', () => {
    for (let version = 1; version <= 20; version += 1) {
      const text = payloadForVersion(version);
      const matrix = encodeQr(text);
      assert.equal(matrix.version, version, `payload sized for v${version}`);
      assert.equal(matrix.size, version * 4 + 17);
      const read = readPayload(matrix);
      assert.equal(read.mode, 0b0100, `v${version} mode`);
      assert.equal(read.text, text, `v${version} payload`);
      assert.equal(decode(matrix).ecLevel, 0b00, `v${version} error-correction level M`);
    }
  });

  it('protects every block with error correction a scanner would accept', () => {
    for (let version = 1; version <= 20; version += 1) {
      const { codewords } = decode(encodeQr(payloadForVersion(version)));
      for (const [index, block] of blocksWithEc(codewords, version).entries())
        assert.deepEqual(
          syndromes(block, TABLE[version - 1][0]).filter(Boolean),
          [],
          `v${version} block ${index} fails its own error correction`,
        );
    }
  });

  it('pads from 0xEC whatever length the payload ended on', () => {
    for (const length of [3, 4, 5, 6]) {
      const text = 'x'.repeat(length);
      const data = deinterleave(decode(encodeQr(text)).codewords, 1);
      // Mode nibble, one length byte, the payload, a four-bit terminator: the
      // pad bytes start at the next whole codeword after that.
      const padStart = 2 + length;
      assert.equal(data[padStart], 0xec, `padding after ${length} characters`);
      assert.equal(data[padStart + 1], 0x11);
    }
  });

  it('carries a real share link, Chinese title and all', () => {
    const text =
      'https://demo.pwestudio.site/?v=1&d=6&roles=snack:1,starter:1,soup:1,main:2,dessert:1&occasion=cny&lang=zh-CN&src=qr';
    assert.equal(readPayload(encodeQr(text)).text, text);
    const chinese = '一桌 · 春节家宴 · 六道菜';
    assert.equal(readPayload(encodeQr(chinese)).text, chinese);
  });

  it('refuses a payload no version 20 code could hold', () => {
    assert.throws(() => encodeQr('x'.repeat(700)), /too long/i);
  });

  it('draws one path per run of dark modules', () => {
    const path = qrPath(encodeQr('https://onetable.pwestudio.site/'));
    assert.match(path, /^M\d+ \d+h\d+v1h-\d+z/);
    assert.equal(path.includes('NaN'), false);
  });
});
