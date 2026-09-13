// ============================================================
// إعدادات الجروب — اسم / وصف / صورة
// محوّل لهيكل بوت 𓆩 𝑨𝑳𝑯𝑾𝑨𝑹𝒀 𓆪
// ============================================================

const IMAGE_URL = "https://j.top4top.io/p_3894432qz0.jpg";
const BRAND = '𓆩 𝑨𝑳𝑯𝑾𝑨𝑹𝒀 𓆪';
const NEWSLETTER_JID = '1556853817@newsletter';

function box(...lines) {
    return `*╭━━━ ⚙️ إعدادات الجروب ━━━°⃟⚡*\n${lines.map(l => `┃ ${l}`).join('\n')}\n*╰━━━━━━━━━━━━━━━━━━━°⃟⚡*`;
}

function context(jid) {
    return {
        mentionedJid: [jid],
        isForwarded: true,
        forwardingScore: 1,
        forwardedNewsletterMessageInfo: {
            newsletterJid: NEWSLETTER_JID,
            newsletterName: BRAND,
            serverMessageId: 0
        },
        externalAdReply: {
            title: `𓆩⚡ ${BRAND.replace(/𓆩|𓪪/g, '').trim()} 𝑪𝑶𝑹𝑬 ⚡𓆪`,
            body: "°⃟⚡ SYSTEM: ONLINE",
            thumbnailUrl: IMAGE_URL,
            sourceUrl: '',
            mediaType: 1,
            renderLargerThumbnail: true
        }
    };
}

const Func = {
    reply: async (conn, m, text) => {
        await conn.sendMessage(m.chat, {
            text: box(text),
            contextInfo: context(m.sender)
        }, { quoted: m });
    },

    notGroup: (conn, m) => Func.reply(conn, m, `❌ الأمر ده للجروبات بس.`),
    needName: (conn, m) => Func.reply(conn, m, `✏️ اكتب الاسم الجديد.`),
    needDesc: (conn, m) => Func.reply(conn, m, `📝 اكتب الوصف الجديد.`),
    needImage: (conn, m) => Func.reply(conn, m, `🖼️ رد على صورة عشان تتظبط كصورة الجروب.`),

    nameDone: (conn, m) => Func.reply(conn, m, `✅ *تم تغيير اسم الجروب*`),
    descDone: (conn, m) => Func.reply(conn, m, `✅ *تم تغيير وصف الجروب*`),
    imageDone: (conn, m) => Func.reply(conn, m, `✅ *تم تغيير صورة الجروب*`),

    error: (conn, m, err) => Func.reply(conn, m, `❌ حصل خطأ: ${err.message}`)
};

const handler = async (m, { conn, text, command }) => {
    if (!m.isGroup) {
        await Func.notGroup(conn, m);
        return;
    }

    const actions = {
        'جروب_اسم': async () => {
            if (!text) return Func.needName(conn, m);
            await conn.groupUpdateSubject(m.chat, text);
            await Func.nameDone(conn, m);
        },

        'جروب_وصف': async () => {
            if (!text) return Func.needDesc(conn, m);
            await conn.groupUpdateDescription(m.chat, text);
            await Func.descDone(conn, m);
        },

        'جروب_صوره': async () => {
            const q = m.quoted || m;
            const mime = q.mimetype || '';

            if (!/image/.test(mime)) {
                return Func.needImage(conn, m);
            }

            const media = await q.download();
            await conn.updateProfilePicture(m.chat, media);
            await Func.imageDone(conn, m);
        }
    };

    const action = actions[command];
    if (!action) return;

    try {
        await action();
    } catch (error) {
        console.error(error);
        await Func.error(conn, m, error);
    }
};

handler.command = ['جروب_اسم', 'جروب_وصف', 'جروب_صوره'];
handler.usage = ['جروب_اسم', 'جروب_وصف', 'جروب_صوره'];
handler.category = "admin";
handler.group = true;
handler.admin = true;
handler.botAdmin = true;

export default handler;