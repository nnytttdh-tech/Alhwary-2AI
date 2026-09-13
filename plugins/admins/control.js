// ============================================================
// إدارة الجروب — إضافة / طرد / رفع / خفض
// محوّل لهيكل بوت 𓆩 𝑨𝑳𝑯𝑾𝑨𝑹𝒀 𓆪
// ============================================================

const IMAGE_URL = "https://j.top4top.io/p_3894432qz0.jpg";
const BRAND = '𓆩 𝑨𝑳𝑯𝑾𝑨𝑹𝒀 𓆪';
const NEWSLETTER_JID = '1556853817@newsletter';

function box(...lines) {
    return `*╭━━━ 👑 إدارة الجروب ━━━°⃟⚡*\n${lines.map(l => `┃ ${l}`).join('\n')}\n*╰━━━━━━━━━━━━━━━━━━━°⃟⚡*`;
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
    }
};

const isBotOwner = (bot, userId) => {
    if (!bot?.config?.owners) return false;
    return bot.config.owners.some(owner => owner.jid === userId || owner.lid === userId);
};

const getUser = (m, text) => {
    if (m.quoted) return m.quoted.sender;
    if (m.mentionedJid?.length > 0) return m.mentionedJid[0];
    if (text) {
        const num = text.replace(/[+\s-]/g, '');
        if (/^\d+$/.test(num)) return num + "@s.whatsapp.net";
    }
    return null;
};

const control = async (m, { command, text, conn, bot }) => {
    try {
        if (command === "ضيف") {
            if (!text) return Func.reply(conn, m, `❌ فين الرقم؟`);

            let target = null;
            if (m.quoted) target = m.quoted.sender;
            else if (m.mentionedJid?.length > 0) target = m.mentionedJid[0];
            else {
                const num = text.replace(/[+\s-]/g, '');
                if (!/^\d+$/.test(num)) return Func.reply(conn, m, `⚠️ رقم الهاتف غير صالح.`);
                target = num + "@s.whatsapp.net";
            }

            await conn.groupParticipantsUpdate(m.chat, [target], 'add');
            return Func.reply(conn, m, `✅ *تمت الإضافة*`);
        }

        if (command === "طرد") {
            const user = getUser(m, text);
            if (!user) return Func.reply(conn, m, `❌ منشن أو رد على العضو`);

            if (isBotOwner(bot, user) || user === conn.user.id) {
                await Func.reply(conn, m, `😏 بتهزر؟`);
                await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove');
                return;
            }

            await conn.groupParticipantsUpdate(m.chat, [user], 'remove');
            return Func.reply(conn, m, `✅ تم الطرد`);
        }

        if (command === "رفع") {
            const user = getUser(m, text);
            if (!user) return Func.reply(conn, m, `❌ منشن أو رد على العضو`);
            await conn.groupParticipantsUpdate(m.chat, [user], 'promote');
            return Func.reply(conn, m, `✅ تم الرفع`);
        }

        if (command === "خفض") {
            const user = getUser(m, text);
            if (!user) return Func.reply(conn, m, `❌ منشن أو رد على العضو`);
            await conn.groupParticipantsUpdate(m.chat, [user], 'demote');
            return Func.reply(conn, m, `✅ تم الخفض`);
        }

    } catch (error) {
        await Func.reply(conn, m, `❌ حصل خطأ: ${error.message}`);
    }
};

control.usage = ['ضيف', 'طرد', 'رفع', 'خفض'];
control.command = ['ضيف', 'طرد', 'رفع', 'خفض'];
control.admin = true;
control.botAdmin = true;
control.category = "admin";

export default control;