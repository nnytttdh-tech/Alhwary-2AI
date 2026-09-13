// ============================================================
// نظام الإنذارات — إنذار/تحذير + طرد تلقائي بعد 3 إنذارات
// محوّل لهيكل بوت 𓆩 𝑨𝑳𝑯𝑾𝑨𝑹𝒀 𓆪
// ============================================================

const IMAGE_URL = "https://j.top4top.io/p_3894432qz0.jpg";
const BRAND = '𓆩 𝑨𝑳𝑯𝑾𝑨𝑹𝒀 𓆪';
const NEWSLETTER_JID = '1556853817@newsletter';

function box(...lines) {
    return `*╭━━━ ⚠️ نظام الإنذارات ━━━°⃟⚡*\n${lines.map(l => `┃ ${l}`).join('\n')}\n*╰━━━━━━━━━━━━━━━━━━━°⃟⚡*`;
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

const Func = {
    needTarget: async (conn, m) => {
        await conn.sendMessage(m.chat, {
            text: box(`⚠️ يرجى منشن الشخص أو الرد على رسالته.`),
            contextInfo: context(m.sender)
        }, { quoted: m });
    },

    notInGroup: async (conn, m) => {
        await conn.sendMessage(m.chat, {
            text: box(`❌ المستخدم غير موجود في الجروب.`),
            contextInfo: context(m.sender)
        }, { quoted: m });
    },

    warned: async (conn, m, targetJid, count) => {
        await conn.sendMessage(m.chat, {
            text: box(
                `👤 *العضو:* @${targetJid.split('@')[0]}`,
                `📊 *عدد الإنذارات:* ${count}/3`
            ),
            mentions: [targetJid],
            contextInfo: context(m.sender, [targetJid])
        }, { quoted: m });
    },

    kicked: async (conn, m, userJid) => {
        await conn.sendMessage(m.chat, {
            text: box(`🚫 @${userJid.split('@')[0]} خالف القوانين، تم طرده تلقائيًا.`),
            mentions: [userJid],
            contextInfo: context(m.sender, [userJid])
        }, { quoted: m });
    }
};

const handler = async (m, { conn }) => {
    let targetLid = m.mentionedJid?.[0] || m.quoted?.sender;
    let targetJid = m.lid2jid(targetLid);

    if (!targetJid || !targetLid) {
        await Func.needTarget(conn, m);
        return;
    }

    const groupMetadata = await conn.groupMetadata(m.chat);
    const user = groupMetadata.participants.find(
        p => p.id === targetLid || p.phoneNumber === targetJid
    );

    if (!user) {
        await Func.notInGroup(conn, m);
        return;
    }

    global.db.groups[m.chat] ??= {};
    global.db.groups[m.chat].warnings ??= {};

    // ✅ مفتاح موحّد (JID) — كان في تضارب بين الحفظ والفحص في الكود الأصلي
    const warnKey = targetJid;

    const warnCount = global.db.groups[m.chat].warnings[warnKey] =
        (global.db.groups[m.chat].warnings[warnKey] || 0) + 1;

    await Func.warned(conn, m, targetJid, warnCount);
};

handler.before = async (m, { conn }) => {
    const g = global.db?.groups?.[m.chat];
    if (!g?.warnings) return false;

    const user = m.sender;
    if (!g.warnings[user]) return false;

    if (g.warnings[user] >= 3) {
        await Func.kicked(conn, m, user);
        await conn.groupParticipantsUpdate(m.chat, [user], "remove");
        delete g.warnings[user];
    }

    return false;
};

handler.command = ["انذار", "تحذير", "warn"];
handler.usage = ["انذار"];
handler.category = "admin";
handler.admin = true;
handler.botAdmin = true;

export default handler;