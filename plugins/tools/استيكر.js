// أمر تحويل صورة/فيديو/ستيكر لستيكر مع اسم باكدج ومؤلف مخصص
// .ستيكر (بالرد على صورة/فيديو/ستيكر)
// .ستيكر اسم_الباكدج|اسم_المؤلف (لتخصيص الاسم)
// محتاج: npm install sharp

import sharp from 'sharp'

function writeExif(webpBuffer, metadata) {
    const json = {
        "sticker-pack-id": metadata.stickerPackId || "",
        "sticker-pack-name": metadata.packname || "",
        "sticker-pack-publisher": metadata.author || "",
        "emojis": metadata.categories || [""],
        "premium": metadata.premium ?? 1
    };

    const exifAttr = Buffer.from([
        0x49, 0x49, 0x2A, 0x00,
        0x08, 0x00, 0x00, 0x00,
        0x01, 0x00,
        0x41, 0x57,
        0x07, 0x00,
        0x00, 0x00, 0x00, 0x00,
        0x16, 0x00, 0x00, 0x00
    ]);

    const jsonBuff = Buffer.from(JSON.stringify(json));
    const exifRaw = Buffer.concat([exifAttr, jsonBuff]);
    exifRaw.writeUInt32LE(jsonBuff.length, 14);

    const exifHeader = Buffer.alloc(8);
    exifHeader.write("EXIF", 0);
    exifHeader.writeUInt32LE(exifRaw.length, 4);

    const exifChunk = Buffer.concat([
        exifHeader,
        exifRaw,
        (exifRaw.length % 2 ? Buffer.from([0]) : Buffer.alloc(0))
    ]);

    let offset = 12;
    let chunks = [];

    while (offset < webpBuffer.length - 8) {
        const chunkFourCC = webpBuffer.toString("ascii", offset, offset + 4);
        const chunkSize = webpBuffer.readUInt32LE(offset + 4);
        const totalSize = 8 + chunkSize + (chunkSize % 2);

        chunks.push({
            fourCC: chunkFourCC,
            data: webpBuffer.subarray(offset, offset + totalSize)
        });

        offset += totalSize;
    }

    let vp8x = chunks.find(c => c.fourCC === "VP8X");

    if (vp8x) {
        vp8x.data = Buffer.from(vp8x.data);
        vp8x.data[8] |= 0b00001000; // Enable EXIF bit
    } else {
        let width = 0, height = 0, hasAlpha = false, hasAnim = false;

        for (const c of chunks) {
            if (c.fourCC === "VP8 ") {
                const data = c.data.subarray(8);
                width = ((data[7] << 8) | data[6]) & 0x3FFF;
                height = ((data[9] << 8) | data[8]) & 0x3FFF;
            } else if (c.fourCC === "VP8L") {
                const data = c.data.subarray(8);
                width = (((data[2] & 0x3F) << 8) | data[1]) + 1;
                height = ((((data[4] << 16) | (data[3] << 8) | data[2]) >> 6) & 0x3FFF) + 1;
                hasAlpha = !!(data[4] & 0x10);
            } else if (c.fourCC === "ALPH") {
                hasAlpha = true;
            } else if (c.fourCC === "ANIM") {
                hasAnim = true;
            }
        }

        const vp8xBuf = Buffer.alloc(18);
        vp8xBuf.write("VP8X", 0);
        vp8xBuf.writeUInt32LE(10, 4);

        let flags = 0b00001000; // EXIF
        if (hasAlpha) flags |= 0x10;
        if (hasAnim) flags |= 0x02;

        vp8xBuf[8] = flags;

        vp8xBuf.writeUIntLE((width || 512) - 1, 12, 3);
        vp8xBuf.writeUIntLE((height || 512) - 1, 15, 3);

        vp8x = { fourCC: "VP8X", data: vp8xBuf };
    }

    const otherChunks = chunks.filter(c =>
        c.fourCC !== "VP8X" && c.fourCC !== "EXIF"
    );

    const out = Buffer.concat([
        webpBuffer.subarray(0, 12),
        vp8x.data,
        exifChunk,
        ...otherChunks.map(c => c.data)
    ]);

    out.writeUInt32LE(out.length - 8, 4);

    return out;
}

const DEFAULT_PACKNAME = 'الـهـواري'
const DEFAULT_AUTHOR = 'ALHWARY BOT'

const handler = async (m, { conn, text }) => {
    if (!m.quoted) {
        return m.reply(`╭─❖ ⚠️ تنبيه ❖─╮
│ رد على صورة أو فيديو
│ أو ستيكر واكتب .ستيكر
│
│ تخصيص الاسم:
│ .ستيكر اسم_الباكدج|اسم_المؤلف
╰────────────────────╯`)
    }

    const mime = (m.quoted.msg || m.quoted).mimetype || ''
    if (!/image|video|webp/.test(mime)) {
        return m.reply('❌ رد على صورة أو فيديو أو ستيكر بس')
    }

    let [packname, author] = text?.includes('|')
        ? text.split('|').map(s => s.trim())
        : [DEFAULT_PACKNAME, DEFAULT_AUTHOR]

    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

    try {
        const media = await m.quoted.download()

        // لو الميديا مش webp أصلاً (صورة عادية)، نحولها الأول
        let webpBuffer
        if (/webp/.test(mime)) {
            webpBuffer = media
        } else if (/image/.test(mime)) {
            webpBuffer = await sharp(media)
                .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
                .webp()
                .toBuffer()
        } else {
            return m.reply('❌ الفيديوهات محتاجة تحويل بـ ffmpeg، غير مدعوم في النسخة دي حاليًا')
        }

        const stickerBuffer = writeExif(webpBuffer, {
            packname,
            author,
            categories: ['🔥']
        })

        await conn.sendMessage(m.chat, { sticker: stickerBuffer }, { quoted: m })
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

    } catch (err) {
        console.error(err)
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
        await m.reply('❌ فشل إنشاء الستيكر')
    }
}

handler.command = ['ستيكر', 'sticker', 's']
handler.help = ['ستيكر (رد على صورة/فيديو/ستيكر)']
handler.tags = ['sticker']
handler.category = 'sticker'

export default handler
