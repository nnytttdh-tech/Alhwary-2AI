// ============================================================
// ترقية المستوى (السيرك الرقمي) — before hook
// محوّل لهيكل بوت 𓆩 𝑨𝑳𝑯𝑾𝑨𝑹𝒀 𓆪
// ============================================================

const IMAGE_URL = "https://i.pinimg.com/originals/81/89/fd/8189fd909bbae4ba4e8f1d940f500a60.jpg";
const BRAND = 'هہ‏‏وآريـﮯ';
const NEWSLETTER_JID = '120363225356834044@newsletter';

const levels = [
    { min: 0, max: 99, name: '🎪 مشاهد' },
    { min: 100, max: 249, name: '🎭 متدرب سيرك' },
    { min: 250, max: 499, name: '🤡 مهرج صغير' },
    { min: 500, max: 799, name: '🎪 لاعب أكروبات' },
    { min: 800, max: 1199, name: '🎭 ساحر مبتدئ' },
    { min: 1200, max: 1699, name: '🤹 لاعب نار' },
    { min: 1700, max: 2299, name: '🎪 مروض أسود' },
    { min: 2300, max: 2999, name: '🎭 ساحر الظل' },
    { min: 3000, max: 3799, name: '🤡 مهرج الأكاذيب' },
    { min: 3800, max: 4699, name: '🎪 نجم السيرك' },
    { min: 4700, max: 5699, name: '🎭 وهمي' },
    { min: 5700, max: 6799, name: '🤹 سيد الألعاب' },
    { min: 6800, max: 7999, name: '🎪 مدير الحلبة' },
    { min: 8000, max: 9299, name: '🎭 أسطورة السيرك' },
    { min: 9300, max: 10699, name: '🤡 كابوس المهرج' },
    { min: 10700, max: 12199, name: '🎪 ساحر الأوهام' },
    { min: 12200, max: 13799, name: '🎭 مخرج العجائب' },
    { min: 13800, max: 15499, name: '🤹 سيد الخواتم' },
    { min: 15500, max: 17499, name: '🎪 إمبراطور السيرك' },
    { min: 17500, max: 19999, name: '🎭 حارس البوابة' },
    { min: 20000, max: Infinity, name: '🌀 الرقمي الأوحد' }
];

function box(...lines) {
    return `*╭━━━ 🎪 السيرك الرقمي ━━━°⃟⚡*\n${lines.map(l => `┃ ${l}`).join('\n')}\n*╰━━━━━━━━━━━━━━━━━━━°⃟⚡*`;
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
            title: "السيرك الرقمي",
            body: "ترقية في السيرك",
            thumbnailUrl: IMAGE_URL,
            sourceUrl: '',
            mediaType: 1,
            renderLargerThumbnail: true
        }
    };
}

const Func = {
    levelUp: async (conn, m, oldLevel, newLevel, newNameLevel) => {
        await conn.sendMessage(m.chat, {
            text: box(
                `🎭 *ترقية في السيرك*`,
                `⊱⋅ ──────────── ⋅⊰`,
                `👤 @${m.sender.split('@')[0]}`,
                `المستوى السابق: *${oldLevel}*`,
                `المستوى الجديد: *${newLevel}*`,
                `⊱⋅ ──────────── ⋅⊰`,
                `🏷️ *لقبك الجديد:* ✦ ${newNameLevel} ✦`,
                `⊱⋅ ──────────── ⋅⊰`,
                `🎪 العرض لسه مخلصش يا بطل`
            ),
            mentions: [m.sender],
            contextInfo: context(m.sender)
        }, { quoted: m });
    }
};

export default async function before(m, { conn }) {
    if (!global.db?.users[m.sender]) return false;

    const user = global.db.users[m.sender];
    const xp = user.xp || 0;
    const level = user.level || 0;

    const lvl = levels.find(l => xp >= l.min && xp <= l.max);
    if (!lvl) return false;

    const currentLevelNum = levels.findIndex(l => l.min === lvl.min);
    if (currentLevelNum === level) return false;

    const oldLevel = level;
    user.level = currentLevelNum;
    user.nameLevel = lvl.name;

    await Func.levelUp(conn, m, oldLevel, currentLevelNum, lvl.name);

    return false;
}