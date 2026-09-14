// ============================================================
// تسجيل / حذف تسجيل (السيرك الرقمي)
// محوّل لهيكل بوت 𓆩 𝑨𝑳𝑯𝑾𝑨𝑹𝒀 𓆪
// ============================================================

const BRAND = 'هہ‏‏وآريـﮯ';
const NEWSLETTER_JID = '120363225356834044@newsletter';
const DEFAULT_PIC = 'https://i.pinimg.com/originals/11/26/97/11269786cdb625c60213212aa66273a9.png';

function box(...lines) {
    return `*╭━━━ 📝 التسجيل ━━━°⃟⚡*\n${lines.map(l => `┃ ${l}`).join('\n')}\n*╰━━━━━━━━━━━━━━━━━━━°⃟⚡*`;
}

function context(jid, title, body, img) {
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
            title,
            body,
            thumbnailUrl: img,
            sourceUrl: '',
            mediaType: 1,
            renderLargerThumbnail: true
        }
    };
}

const Func = {
    usage: async (conn, m) => {
        await conn.sendMessage(m.chat, {
            text: box(`📝 *طريقة التسجيل:*`, `تسجيل الاسم|العمر`, `مثال: تسجيل هواري|20`)
        }, { quoted: m });
    },

    missingFields: async (conn, m) => {
        await conn.sendMessage(m.chat, {
            text: box(`❌ يجب كتابة الاسم والعمر مفصولين بـ |`, `مثال: تسجيل هواري|20`)
        }, { quoted: m });
    },

    badAge: async (conn, m) => {
        await conn.sendMessage(m.chat, {
            text: box(`❌ العمر يجب أن يكون رقمًا بين 1 و 30.`)
        }, { quoted: m });
    },

    registered: async (conn, m, name, age, pic) => {
        await conn.sendMessage(m.chat, {
            image: { url: pic },
            caption: box(
                `✅ *تم التسجيل بنجاح*`,
                `⊱⋅ ──────────── ⋅⊰`,
                `👤 @${m.sender.split('@')[0]}`,
                `🏷️ *الاسم:* ${name}`,
                `📅 *العمر:* ${age} سنة`,
                `⊱⋅ ──────────── ⋅⊰`,
                `🎭 أهلاً وسهلاً في السيرك`
            ),
            mentions: [m.sender],
            contextInfo: context(m.sender, "هہ‏‏وآريـﮯ بيقول لك سجل دخولك", "تسجيل جديد في السيرك", pic)
        }, { quoted: m });
    },

    noRegistration: async (conn, m) => {
        await conn.sendMessage(m.chat, {
            text: box(`❌ ليس لديك تسجيل لحذفه.`, `اكتب .تسجيل اسم|عمر للتسجيل`)
        }, { quoted: m });
    },

    deleted: async (conn, m, pic) => {
        await conn.sendMessage(m.chat, {
            image: { url: pic },
            caption: box(
                `✅ *تم حذف التسجيل*`,
                `⊱⋅ ──────────── ⋅⊰`,
                `👤 @${m.sender.split('@')[0]}`,
                `🏷️ تم حذف بياناتك بنجاح`,
                `⊱⋅ ──────────── ⋅⊰`,
                `📝 يمكنك التسجيل مرة أخرى`
            ),
            mentions: [m.sender],
            contextInfo: context(m.sender, "السيرك الرقمي", "تم حذف التسجيل", pic)
        }, { quoted: m });
    }
};

const handler = async (m, { conn, command, text }) => {
    global.db.users[m.sender] ??= {};
    const user = global.db.users[m.sender];

    if (command === "تسجيل") {
        if (!text) return Func.usage(conn, m);

        const [name, age] = text.split('|').map(s => s.trim());

        if (!name || !age) return Func.missingFields(conn, m);
        if (isNaN(age) || age < 1 || age > 30) return Func.badAge(conn, m);

        user.name = name;
        user.age = parseInt(age);

        const profilePic = await conn.profilePictureUrl(m.sender, 'image').catch(() => DEFAULT_PIC);
        await Func.registered(conn, m, name, age, profilePic);
    }

    else if (command === "حذف_تسجيلي") {
        if (!user.name && !user.age) return Func.noRegistration(conn, m);

        delete user.name;
        delete user.age;

        const profilePic = await conn.profilePictureUrl(m.sender, 'image').catch(() => DEFAULT_PIC);
        await Func.deleted(conn, m, profilePic);
    }
};

handler.usage = ["تسجيل", "حذف_تسجيلي"];
handler.category = "bank";
handler.command = ["تسجيل", "حذف_تسجيلي"];

export default handler;