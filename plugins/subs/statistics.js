// ============================================================
// إحصائيات البوتات الفرعية
// محوّل لهيكل بوت 𓆩 𝑨𝑳𝑯𝑾𝑨𝑹𝒀 𓆪
// ============================================================

const IMAGE_URL = "https://j.top4top.io/p_3894432qz0.jpg";
const BRAND = '𓆩 𝑨𝑳𝑯𝑾𝑨𝑹𝒀 𓆪';
const NEWSLETTER_JID = '1556853817@newsletter';

function box(...lines) {
    return `*╭━━━ 📊 إحصائيات البوتات ━━━°⃟⚡*\n${lines.map(l => `┃ ${l}`).join('\n')}\n*╰━━━━━━━━━━━━━━━━━━━°⃟⚡*`;
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
    unavailable: async (conn, m) => {
        await conn.sendMessage(m.chat, {
            text: box(`❌ نظام البوتات الفرعية غير متاح.`),
            contextInfo: context(m.sender)
        }, { quoted: m });
    },

    stats: async (conn, m, bot, stats) => {
        const uptime = process.uptime();
        const days = Math.floor(uptime / 86400);
        const hours = Math.floor((uptime % 86400) / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);

        await conn.sendMessage(m.chat, {
            text: box(
                `📈 *المجموع:* ${stats.total}`,
                `🟢 *متصل:* ${stats.connected}`,
                `🔴 *غير متصل:* ${stats.disconnected}`,
                `💬 *الرسائل:* ${stats.totalMessages}`,
                `⊱⋅ ──────────── ⋅⊰`,
                `⏱️ *مدة التشغيل:* ${days} يوم ${hours} ساعة ${minutes} دقيقة`,
                `⊱⋅ ──────────── ⋅⊰`,
                `🆔 *البوت الرئيسي:* ${bot.sock.user.id.split('@')[0]}`
            ),
            contextInfo: context(m.sender)
        }, { quoted: m });
    }
};

const run = async (m, { conn, bot }) => {
    const sub = global.subBots;
    if (!sub) {
        await Func.unavailable(conn, m);
        return;
    }

    const stats = sub.stats();
    await Func.stats(conn, m, bot, stats);
};

run.command = ["احصائيات_البوتات"];
run.noSub = true;
run.usage = ["احصائيات"];
run.category = "sub";

export default run;