/**
 * Dependency-free zip reader shared by the load-*.mjs scripts: a small central-directory parser over node:zlib.
 */

import {inflateRawSync} from 'node:zlib';

/** Read a zip buffer's entries as {name, buffer}. Handles stored + deflated members. Throws on a bad zip. */
export function readZip(buf) {
    // End of central directory: scan back from the tail for its signature. The
    // trailing comment is almost always empty, but 64KB is its maximum.
    const tail = Math.max(0, buf.length - 65_557);
    let eocd = -1;
    for (let i = buf.length - 22; i >= tail; i--) {
        if (buf.readUInt32LE(i) === 0x06054b50) {
            eocd = i;
            break;
        }
    }
    if (eocd < 0) throw new Error('not a zip file (no end-of-central-directory record)');

    const count = buf.readUInt16LE(eocd + 10);
    let p = buf.readUInt32LE(eocd + 16);
    const entries = [];

    for (let i = 0; i < count; i++) {
        if (buf.readUInt32LE(p) !== 0x02014b50) throw new Error('corrupt central directory');
        const method = buf.readUInt16LE(p + 10);
        const compressedSize = buf.readUInt32LE(p + 20);
        const nameLen = buf.readUInt16LE(p + 28);
        const extraLen = buf.readUInt16LE(p + 30);
        const commentLen = buf.readUInt16LE(p + 32);
        const localOffset = buf.readUInt32LE(p + 42);
        const name = buf.toString('utf8', p + 46, p + 46 + nameLen).replace(/\\/g, '/');
        p += 46 + nameLen + extraLen + commentLen;

        if (name.endsWith('/')) continue; // directory entry

        // The local header repeats the name and carries its own extra field,
        // whose length can differ from the central one -- read it, don't assume.
        const lhNameLen = buf.readUInt16LE(localOffset + 26);
        const lhExtraLen = buf.readUInt16LE(localOffset + 28);
        const start = localOffset + 30 + lhNameLen + lhExtraLen;
        const raw = buf.subarray(start, start + compressedSize);

        if (method === 0) entries.push({name, buffer: raw});
        else if (method === 8) entries.push({name, buffer: inflateRawSync(raw)});
        else throw new Error(`unsupported compression method ${method} for ${name}`);
    }
    return entries;
}
