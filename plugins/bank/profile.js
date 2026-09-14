// ============================================================
// بروفايل المستخدم (السيرك الرقمي)
// محوّل لهيكل بوت 𓆩 𝑨𝑳𝑯𝑾𝑨𝑹𝒀 𓆪
// ============================================================

const DEFAULT_PIC = 'https://i.pinimg.com/originals/11/26/97/11269786cdb625c60213212aa66273a9.png';
const LEVEL_XP = [100, 250, 500, 800, 1200, 1700, 2300, 3000, 3800, 4700, 5700, 6800, 8000, 9300, 10700, 12200, 13800, 15500, 17500, 20000];

function box(...lines) {
    return `*╭━━━ 🎪 بروفايل ━━━°⃟⚡*\n${lines.map(l => `┃ ${l}`).join('\n')}\n*╰━━━━━━━━━━━━━━━━━━━°⃟⚡*`;
}

function context(jid, cfg) {
    return {
        mentionedJid: [jid],
        isForwarded: true,
        forwardingScore: 1,
        forwardedNewsletterMessageInfo: {
            newsletterJid: cfg.idChannel,
            newsletterName: cfg.nameChannel,
            serverMessageId: 0
        }
    };
}

const Func = {
    profile: async (conn, m, cfg, data) => {
        await conn.sendMessage(m.chat, {
            image: { url: data.profilePic },
            caption: box(
                `🎭 *بروفايل ${data.pushName}*`,
                `⊱⋅ ──────────── ⋅⊰`,
                `📱 *الرقم:* ${data.phoneNumber}`,
                `🏷️ *الاسم:* ${data.pushName}`,
                `📝 *الاسم المسجل:* ${data.name}`,
                `📅 *العمر:* ${data.age}`,
                `🎭 *اللقب:* ${data.nameLevel}`,
                `📊 *المستوى:* ${data.level}`,
                `⭐ *النقاط:* ${data.xp} / ${data.nextLevelXp}`,
                `📈 *التقدم:* [${'⬜'.repeat(Math.floor(data.xpProgress / 10))}${'⬛'.repeat(10 - Math.floor(data.xpProgress / 10))}] ${data.xpProgress}%`,
                `🍪 *الكوكيز:* ${data.cookies}`,
                `⚠️ *التحذيرات:* ${data.warnings}`,
                `🏷️ *الحالة:* ${data.status}`,
                `⊱⋅ ──────────── ⋅⊰`,
                `🚀 استمر في التفاعل لترفع مستواك`
            ),
            mentions: [m.sender],
            contextInfo: context(m.sender, cfg)
        }, { quoted: m }); // ✅ كان quoted: reply_status — متغير غير معرّف، كان هيكسر الأمر
    }
};

async function handler(m, { conn, bot }) {
    const user = global.db?.users[m.sender] || {};
    const xp = user.xp || 0;
    const level = user.level || 0;
    const nameLevel = user.nameLevel || '🎪 مـشـاهـد';
    const cookies = user.cookies || 0;
    const warnings = user.warnings || 0;
    const banned = user.banned || false;
    const premium = user.premium || false;
    const name = user.name || 'غير مسجل';
    const age = user.age || 'غير مسجل';

    const pushName = m.pushName || m.sender.split('@')[0];
    const phoneNumber = m.sender.split('@')[0];

    const nextLevelXp = LEVEL_XP[level] || LEVEL_XP[LEVEL_XP.length - 1];
    const xpProgress = Math.min(100, Math.floor((xp / nextLevelXp) * 100));
    const status = banned ? '🚫 محظور' : (premium ? '👑 بريميوم' : '🟢 عادي');

    const profilePic = await conn.profilePictureUrl(m.sender, 'image').catch(() => DEFAULT_PIC);

    await Func.profile(conn, m, bot.config.info, {
        pushName, phoneNumber, name, age, nameLevel, level,
        xp, nextLevelXp, xpProgress, cookies, warnings, status, profilePic
    });
}

handler.usage = ["بروفايل"];
handler.category = "bank";
handler.command = ["بروفايل", "profile", "my"];

export default handler;