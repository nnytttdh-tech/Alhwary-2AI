// ============================================================
// سرقة نقاط (السيرك الرقمي)
// محوّل لهيكل بوت 𓆩 𝑨𝑳𝑯𝑾𝑨𝑹𝒀 𓆪
// ============================================================

const IMAGE_URL = "https://j.top4top.io/p_3894432qz0.jpg";
const BRAND = '𓆩 𝑨𝑳𝑯𝑾𝑨𝑹𝒀 𓆪';
const NEWSLETTER_JID = '1556853817@newsletter';
const DEFAULT_PIC = 'https://i.pinimg.com/originals/11/26/97/11269786cdb625c60213212aa66273a9.png';
const COOLDOWN_MS = 3600000;

const cooldown = new Map();

function box(...lines) {
    return `*╭━━━ 🎪 سرقة النقاط ━━━°⃟⚡*\n${lines.map(l => `┃ ${l}`).join('\n')}\n*╰━━━━━━━━━━━━━━━━━━━°⃟⚡*`;
}

function context(mentions) {
    return {
        mentionedJid: mentions,
        isForwarded: true,
        forwardingScore: 1,
        forwardedNewsletterMessageInfo: {
            newsletterJid: NEWSLETTER_JID,
            newsletterName: BRAND,
            serverMessageId: 0
        },
        externalAdReply: {
            title: "السيرك الرقمي",
            body: "🎪 عالم النقاط والمقامرة",
            thumbnailUrl: IMAGE_URL,
            sourceUrl: '',
            mediaType: 1,
            renderLargerThumbnail: true
        }
    };
}

const Func = {
    needTarget: async (conn, m) => {
        await conn.sendMessage(m.chat, {
            text: box(`🕊️ رد على رسالة العضو أو منشن العضو.`, `مثال: .سرقة @user`),
            contextInfo: context([m.sender])
        }, { quoted: m });
    },

    selfSteal: async (conn, m) => {
        await conn.sendMessage(m.chat, {
            text: box(`❌ لا يمكنك سرقة نفسك.`),
            contextInfo: context([m.sender])
        }, { quoted: m });
    },

    noXp: async (conn, m) => {
        await conn.sendMessage(m.chat, {
            text: box(`❌ هذا العضو ليس لديه نقاط.`),
            contextInfo: context([m.sender])
        }, { quoted: m });
    },

    tooPoor: async (conn, m, xp) => {
        await conn.sendMessage(m.chat, {
            text: box(`🤲 حرام ده فقير! عنده بس ${xp} نقطة.`, `خليه يجمع شوية الأول.`),
            contextInfo: context([m.sender])
        }, { quoted: m });
    },

    onCooldown: async (conn, m, minutes) => {
        await conn.sendMessage(m.chat, {
            text: box(`⏳ انتظر ${minutes} دقيقة قبل السرقة مرة أخرى.`),
            contextInfo: context([m.sender])
        }, { quoted: m });
    },

    failed: async (conn, m, penalty, pic) => {
        await conn.sendMessage(m.chat, {
            image: { url: pic },
            caption: box(
                `🚨 *فشلت السرقة*`,
                `⊱⋅ ──────────── ⋅⊰`,
                `👤 @${m.sender.split('@')[0]}`,
                `😭 تم اكتشافك!`,
                `💸 خسرت ${penalty} نقطة`,
                `⊱⋅ ──────────── ⋅⊰`,
                `⏳ حاول بعد ساعة`
            ),
            contextInfo: context([m.sender])
        }, { quoted: m });
    },

    success: async (conn, m, target, amount, pic, wipedOut) => {
        await conn.sendMessage(m.chat, {
            image: { url: pic },
            caption: box(
                `💰 *نجحت السرقة*`,
                `⊱⋅ ──────────── ⋅⊰`,
                `👤 @${m.sender.split('@')[0]}`,
                `سرقت من @${target.split('@')[0]}`,
                `💰 +${amount} نقطة`,
                wipedOut ? `⚠️ سلبته كل اللي عنده!` : null,
                `⊱⋅ ──────────── ⋅⊰`,
                `🔥 استمر ولا تتوقف`
            ).replace(/┃ null\n/, ''),
            contextInfo: context([m.sender, target])
        }, { quoted: m });
    }
};

const handler = async (m, { conn }) => {
    const target = await m.lid2jid(m.quoted?.sender) || m.mentionedJid?.[0];

    if (!target) return Func.needTarget(conn, m);
    if (target === m.sender) return Func.selfSteal(conn, m);

    const userTarget = global.db?.users[target];
    if (!userTarget?.xp) return Func.noXp(conn, m);
    if (userTarget.xp < 50) return Func.tooPoor(conn, m, userTarget.xp);

    const now = Date.now();
    const lastSteal = cooldown.get(m.sender) || 0;
    if (now - lastSteal < COOLDOWN_MS) {
        const remaining = Math.ceil((COOLDOWN_MS - (now - lastSteal)) / 60000);
        return Func.onCooldown(conn, m, remaining);
    }

    const userSender = global.db.users[m.sender] ||= {};
    const stealAmount = Math.floor(Math.random() * 201) + 100;
    const success = Math.random() < 0.7;

    cooldown.set(m.sender, now);
    const pic = await conn.profilePictureUrl(m.sender, 'image').catch(() => DEFAULT_PIC);

    if (!success) {
        const penalty = Math.floor(stealAmount / 2);
        userSender.xp = Math.max(0, (userSender.xp || 0) - penalty);
        await Func.failed(conn, m, penalty, pic);
        return;
    }

    if (userTarget.xp < stealAmount) {
        const available = userTarget.xp;
        userSender.xp = (userSender.xp || 0) + available;
        userTarget.xp = 0;
        await Func.success(conn, m, target, available, pic, true);
        return;
    }

    userTarget.xp -= stealAmount;
    userSender.xp = (userSender.xp || 0) + stealAmount;
    await Func.success(conn, m, target, stealAmount, pic, false);
};

handler.usage = ["سرقة"];
handler.category = "games";
handler.command = ["سرقة", "steal"];

export default handler;