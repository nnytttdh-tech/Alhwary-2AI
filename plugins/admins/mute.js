// ============================================================
// كتم / فك كتم عضو في الجروب
// محوّل لهيكل بوت 𓆩 𝑨𝑳𝑯𝑾𝑨𝑹𝒀 𓆪
// ============================================================

const IMAGE_URL = "https://j.top4top.io/p_3894432qz0.jpg";
const BRAND = '𓆩 𝑨𝑳𝑯𝑾𝑨𝑹𝒀 𓆪';
const NEWSLETTER_JID = '1556853817@newsletter';

function box(...lines) {
    return `*╭━━━ 🔇 كتم الأعضاء ━━━°⃟⚡*\n${lines.map(l => `┃ ${l}`).join('\n')}\n*╰━━━━━━━━━━━━━━━━━━━°⃟⚡*`;
}

function context(jid, mentions = []) {
    return {
        mentionedJid: mentions.length ? mentions : [jid],
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

const isOwner = (userId, bot) => bot.config?.owners?.some(o => o.jid === userId || o.lid === userId);

const Func = {
    usage: async (conn, m) => {
        await conn.sendMessage(m.chat, {
            text: box(`🔇 *كتم/فك_كتم @user*`, `أو رد على رسالته`),
            contextInfo: context(m.sender)
        }, { quoted: m });
    },

    badTarget: async (conn, m) => {
        await conn.sendMessage(m.chat, {
            text: box(`❌ حدث خطأ في تحديد المستخدم.`),
            contextInfo: context(m.sender)
        }, { quoted: m });
    },

    cantMuteOwner: async (conn, m) => {
        await conn.sendMessage(m.chat, {
            text: box(`❌ لا يمكن كتم المطور.`),
            contextInfo: context(m.sender)
        }, { quoted: m });
    },

    alreadyMuted: async (conn, m, target) => {
        await conn.sendMessage(m.chat, {
            text: box(`❌ @${target.split('@')[0]} مكتوم بالفعل.`),
            mentions: [target],
            contextInfo: context(m.sender, [target])
        }, { quoted: m });
    },

    muted: async (conn, m, target) => {
        await conn.sendMessage(m.chat, {
            text: box(`✅ *تم كتم* @${target.split('@')[0]}`, `🔒 لن يتمكن من الكلام في الجروب.`),
            mentions: [target],
            contextInfo: context(m.sender, [target])
        }, { quoted: m });
    },

    notMuted: async (conn, m, target) => {
        await conn.sendMessage(m.chat, {
            text: box(`❌ @${target.split('@')[0]} ليس مكتومًا.`),
            mentions: [target],
            contextInfo: context(m.sender, [target])
        }, { quoted: m });
    },

    unmuted: async (conn, m, target) => {
        await conn.sendMessage(m.chat, {
            text: box(`✅ *تم فك كتم* @${target.split('@')[0]}`, `🔓 يمكنه الكلام الآن.`),
            mentions: [target],
            contextInfo: context(m.sender, [target])
        }, { quoted: m });
    }
};

const handler = async (m, { conn, command, bot }) => {
    let target = m.mentionedJid?.[0];

    if (target && typeof m.lid2jid === 'function') {
        target = await m.lid2jid(target);
    }

    if (!target && m.quoted) {
        target = typeof m.lid2jid === 'function' ? await m.lid2jid(m.quoted.sender) : m.quoted.sender;
    }

    if (!target) return Func.usage(conn, m);
    if (typeof target !== 'string') return Func.badTarget(conn, m);
    if (isOwner(target, bot)) return Func.cantMuteOwner(conn, m);

    const group = global.db.groups[m.chat] ||= {};
    const muteList = group.mute ||= [];

    let isMuted = false;
    for (let i = 0; i < muteList.length; i++) {
        if (muteList[i] === target) {
            isMuted = true;
            break;
        }
    }

    if (command === "كتم") {
        if (isMuted) return Func.alreadyMuted(conn, m, target);
        muteList.push(target);
        await Func.muted(conn, m, target);
    } else if (command === "فك_كتم") {
        if (!isMuted) return Func.notMuted(conn, m, target);
        let newList = [];
        for (let i = 0; i < muteList.length; i++) {
            if (muteList[i] !== target) newList.push(muteList[i]);
        }
        group.mute = newList;
        await Func.unmuted(conn, m, target);
    }
};

handler.before = async (m, { conn, bot }) => {
    if (!m.isGroup) return;
    if (m.isOwner || m.isAdmin || isOwner(m.sender, bot)) return;

    const muteList = global.db?.groups[m.chat]?.mute;
    if (!muteList || muteList.length === 0) return;

    let isMuted = false;
    for (let i = 0; i < muteList.length; i++) {
        if (muteList[i] === m.sender) {
            isMuted = true;
            break;
        }
    }

    if (isMuted) {
        await conn.sendMessage(m.chat, { delete: m.key });
        return true;
    }
};

handler.command = ["كتم", "فك_كتم"];
handler.admin = true;

export default handler;