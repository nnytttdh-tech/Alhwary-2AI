// ============================================================
// مخفي — إرسال/فورورد رسالة مع منشن مخفي لكل الأعضاء
// محوّل لهيكل بوت 𓆩 𝑨𝑳𝑯𝑾𝑨𝑹𝒀 𓆪
// ============================================================

const IMAGE_URL = "https://j.top4top.io/p_3894432qz0.jpg";
const BRAND = '𓆩 𝑨𝑳𝑯𝑾𝑨𝑹𝒀 𓆪';
const NEWSLETTER_JID = '1556853817@newsletter';

function box(...lines) {
    return `*╭━━━ ❌ خطأ ━━━°⃟⚡*\n${lines.map(l => `┃ ${l}`).join('\n')}\n*╰━━━━━━━━━━━━━━━━━━━°⃟⚡*`;
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
    error: async (conn, m, err) => {
        await conn.sendMessage(m.chat, {
            text: box(`${err.message}`),
            contextInfo: context(m.sender)
        }, { quoted: m });
    }
};

const handler = async (m, { text, bot, conn }) => {
    try {
        const { images } = bot.config.info;
        const adReply = {
            title: bot.config.info.nameBot || BRAND,
            body: null,
            thumbnailUrl: images.random(),
            mediaType: 1,
            renderLargerThumbnail: false
        };

        const customText = text || "ﷺ";

        if (!m.quoted) {
            await conn.sendMessage(m.chat, {
                text: customText,
                contextInfo: { externalAdReply: adReply }
            });
            return;
        }

        const groupMetadata = await conn.groupMetadata(m.chat);
        const participants = groupMetadata.participants.map(v => v.id);

        await conn.sendMessage(m.chat, {
            forward: m.quoted.fakeObj(),
            mentions: participants,
            contextInfo: {
                isForwarded: true,
                forwardingScore: 999,
                externalAdReply: adReply
            }
        });

    } catch (err) {
        await Func.error(conn, m, err);
    }
};

handler.usage = ["مخفي"];
handler.category = "admin";
handler.command = ["مخفي"];
handler.group = true;
handler.admin = true;
handler.usePrefix = false;

export default handler;