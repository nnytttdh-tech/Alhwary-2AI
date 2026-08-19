// فلتر منع البوتات الفرعية من الشغل في جروب معين
// المفتاح: global.db.groups[chatId].blockSubBots
// بيتفعل عن طريق أمر .منع_الفرعي

export default async function before(m, { conn, bot }) {
    const g = global.db?.groups[m.chat]

    if (bot.isSubBot && g?.blockSubBots) {
        return true
    }

    return false
}
