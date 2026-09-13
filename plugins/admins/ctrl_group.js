// ============================================================
// نقطة الجروب — قفل / فتح بأزرار
// محوّل لهيكل بوت 𓆩 𝑨𝑳𝑯𝑾𝑨𝑹𝒀 𓆪
// ============================================================

const IMAGE_URL = "https://j.top4top.io/p_3894432qz0.jpg";
const BRAND = '𓆩 𝑨𝑳𝑯𝑾𝑨𝑹𝒀 𓆪';
const NEWSLETTER_JID = '1556853817@newsletter';

function box(...lines) {
    return `*╭━━━ 🔒الجروب ━━━°⃟⚡*\n${lines.map(l => `┃ ${l}`).join('\n')}\n*╰━━━━━━━━━━━━━━━━━━━°⃟⚡*`;
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
    menu: async (conn, m) => {
        await conn.sendButtonNormal(m.chat, {
            media: { url: IMAGE_URL },
            mediaType: 'image',
            caption: box(
                `✨ *تحكم في حالة الجروب*`,
                `⊱⋅ ──────────── ⋅⊰`,
                `اختار من الأزرار تحت:`
            ),
            buttons: [
                { name: "quick_reply", params: { display_text: "🔒 قفل", id: ".قفل" } },
                { name: "quick_reply", params: { display_text: "🔓 فتح", id: ".فتح" } }
            ],
            mentions: [m.sender],
            newsletter: {
                name: BRAND,
                jid: NEWSLETTER_JID
            }
        }, m);
    },

    locked: async (conn, m) => {
        await conn.sendMessage(m.chat, {
            text: box(`🔒 *تم قفل الشات*`, `الأعضاء العاديين مايقدروش يبعتوا رسايل دلوقتي.`),
            contextInfo: context(m.sender)
        }, { quoted: m });
    },

    unlocked: async (conn, m) => {
        await conn.sendMessage(m.chat, {
            text: box(`🔓 *تم فتح الشات*`, `كل الأعضاء يقدروا يبعتوا رسايل دلوقتي.`),
            contextInfo: context(m.sender)
        }, { quoted: m });
    },

    error: async (conn, m, err) => {
        await conn.sendMessage(m.chat, {
            text: box(`❌ حصل خطأ: ${err.message}`),
            contextInfo: context(m.sender)
        }, { quoted: m });
    }
};

const handler = async (m, { conn, command }) => {
    try {
        if (command === "نقطة") {
            await Func.menu(conn, m);
            return;
        }

        if (command === "قفل") {
            await conn.groupSettingUpdate(m.chat, 'announcement');
            await Func.locked(conn, m);
            return;
        }

        if (command === "فتح") {
            await conn.groupSettingUpdate(m.chat, 'not_announcement');
            await Func.unlocked(conn, m);
            return;
        }
    } catch (error) {
        await Func.error(conn, m, error);
    }
};

handler.usage = ["جروب", "قفل", "فتح"];
handler.category = "admin";
handler.command = ["جروب", "قفل", "فتح"];
handler.admin = true;
handler.botAdmin = true;

export default handler;