// ============================================================
// حذف رسالة (رد على الرسالة اللي عايز تحذفها)
// محوّل لهيكل بوت 𓆩 𝑨𝑳𝑯𝑾𝑨𝑹𝒀 𓆪
// ============================================================

const IMAGE_URL = "https://j.top4top.io/p_3894432qz0.jpg";
const BRAND = '𓆩 𝑨𝑳𝑯𝑾𝑨𝑹𝒀 𓆪';
const NEWSLETTER_JID = '1556853817@newsletter';

function box(...lines) {
    return `*╭━━━ 🗑️ حذف رسالة ━━━°⃟⚡*\n${lines.map(l => `┃ ${l}`).join('\n')}\n*╰━━━━━━━━━━━━━━━━━━━°⃟⚡*`;
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
    noQuote: async (conn, m) => {
        await conn.sendMessage(m.chat, {
            text: box(`🌹 رد على الرسالة اللي عايز تحذفها.`),
            contextInfo: context(m.sender)
        }, { quoted: m });
    },

    error: async (conn, m, err) => {
        await conn.sendMessage(m.chat, {
            text: box(`❌ تعذر حذف الرسالة: ${err.message}`),
            contextInfo: context(m.sender)
        }, { quoted: m });
    }
};

const handler = async (m, { conn }) => {
    if (!m.quoted) {
        await Func.noQuote(conn, m);
        return;
    }

    try {
        await m.quoted.delete();
    } catch (error) {
        await Func.error(conn, m, error);
    }
};

handler.command = ["حذف"];
handler.usage = ["حذف"];
handler.category = "admin";
handler.admin = true;
handler.botAdmin = true;

export default handler;