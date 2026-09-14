// ============================================================
// هدايا يومي / اسبوعي / شهري
// محوّل لهيكل بوت 𓆩 𝑨𝑳𝑯𝑾𝑨𝑹𝒀 𓆪
// ============================================================

const IMAGE_URL = "https://j.top4top.io/p_3894432qz0.jpg";
const BRAND = '𓆩 𝑨𝑳𝑯𝑾𝑨𝑹𝒀 𓆪';
const NEWSLETTER_JID = '1556853817@newsletter';
const DEFAULT_PIC = 'https://i.pinimg.com/originals/11/26/97/11269786cdb625c60213212aa66273a9.png';

const rewards = {
    daily: { xp: 100, cookies: 5, cooldown: 86400000, name: '☀️ يومي', icon: '🌅', border: '☀️' },
    weekly: { xp: 500, cookies: 25, cooldown: 604800000, name: '📆 اسبوعي', icon: '🗓️', border: '📅' },
    monthly: { xp: 2000, cookies: 100, cooldown: 2592000000, name: '🌙 شهري', icon: '🌟', border: '🌙' }
};

function box(...lines) {
    return `*╭━━━ 🎁 الهدايا ━━━°⃟⚡*\n${lines.map(l => `┃ ${l}`).join('\n')}\n*╰━━━━━━━━━━━━━━━━━━━°⃟⚡*`;
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

const getTimeRemaining = (lastClaim, cooldown) => {
    const diff = lastClaim + cooldown - Date.now();
    if (diff <= 0) return null;
    return {
        hours: Math.floor(diff / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000)
    };
};

const formatTime = (time) => {
    if (!time) return '';
    const parts = [];
    if (time.hours > 0) parts.push(`${time.hours} ساعة`);
    if (time.minutes > 0) parts.push(`${time.minutes} دقيقة`);
    if (time.seconds > 0) parts.push(`${time.seconds} ثانية`);
    return parts.join(' و ');
};

const Func = {
    onCooldown: async (conn, m, rewardName, timeLeft) => {
        await conn.sendMessage(m.chat, {
            text: box(`❌ انتظر *${timeLeft}* لاستلام هدية ${rewardName}`),
            contextInfo: context(m.sender)
        }, { quoted: m });
    },

    claimed: async (conn, m, reward, profilePic) => {
        await conn.sendMessage(m.chat, {
            image: { url: profilePic },
            caption: box(
                `🎁 *هدية ${reward.name}*`,
                `⊱⋅ ──────────── ⋅⊰`,
                `👤 @${m.sender.split('@')[0]}`,
                `🎉 +${reward.xp} نقطة خبرة`,
                `🍪 +${reward.cookies} كوكيز`,
                `⊱⋅ ──────────── ⋅⊰`,
                `🚀 تستقبل الهدية القادمة بعد المدة المحددة`
            ),
            mentions: [m.sender],
            contextInfo: context(m.sender)
        }, { quoted: m });
    }
};

const handler = async (m, { conn, command }) => {
    const type = command === 'يومي' ? 'daily' : command === 'اسبوعي' ? 'weekly' : 'monthly';
    const reward = rewards[type];

    global.db.users[m.sender] ??= {};
    const user = global.db.users[m.sender];
    user.time ??= {};

    const lastClaim = user.time[type];
    const now = Date.now();

    if (lastClaim && (now - lastClaim) < reward.cooldown) {
        const remaining = getTimeRemaining(lastClaim, reward.cooldown);
        await Func.onCooldown(conn, m, reward.name, formatTime(remaining));
        return;
    }

    user.time[type] = now;
    user.xp = (user.xp || 0) + reward.xp;
    user.cookies = (user.cookies || 0) + reward.cookies;

    const profilePic = await conn.profilePictureUrl(m.sender, 'image').catch(() => DEFAULT_PIC);

    await Func.claimed(conn, m, reward, profilePic);
};

handler.usage = ["يومي", "اسبوعي", "شهري"];
handler.category = "bank";
handler.command = ["يومي", "اسبوعي", "شهري"];

export default handler;