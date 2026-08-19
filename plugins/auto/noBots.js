// تشغيل/إيقاف منع البوتات الفرعية من الشغل في الجروب ده
// .منع_الفرعي تشغيل | ايقاف

const handler = async (m, { conn, args }) => {
    const chatId = m.chat
    const sub = args[0]

    if (!m.isOwner && !m.isAdmin) {
        return m.reply(`╭─❖ ❌ ❖─╮
│ هذا الأمر للمشرفين فقط
╰────────────╯`)
    }

    if (!global.db.groups[chatId]) global.db.groups[chatId] = {}

    if (sub === 'تشغيل') {
        global.db.groups[chatId].blockSubBots = true
        return m.reply(`╭─❖ ✅ تم التفعيل ❖─╮
│ البوتات الفرعية هتتوقف
│ عن الشغل في الجروب ده
╰────────────────────╯
⟡ ⵌ 𝐴𝐿𝐻𝑊𝐴𝑅𝑌 SYSTEM ⵌ ⟡`)
    }

    if (sub === 'ايقاف') {
        global.db.groups[chatId].blockSubBots = false
        return m.reply(`╭─❖ ✅ تم الإيقاف ❖─╮
│ البوتات الفرعية رجعت
│ تشتغل عادي في الجروب ده
╰────────────────────╯
⟡ ⵌ 𝐴𝐿𝐻𝑊𝐴𝑅𝑌 SYSTEM ⵌ ⟡`)
    }

    const status = global.db.groups[chatId].blockSubBots ? 'مفعّل ✅' : 'متوقف ❌'
    await m.reply(`╭─❖ 🤖 منع البوتات الفرعية ❖─╮
│ الحالة الحالية: ${status}
│
│ .منع_الفرعي تشغيل
│ .منع_الفرعي ايقاف
╰────────────────────╯
⟡ ⵌ 𝐴𝐿𝐻𝑊𝐴𝑅𝑌 SYSTEM ⵌ ⟡`)
}

handler.command = ['منع_الفرعي']
handler.help = ['منع_الفرعي <تشغيل|ايقاف>']
handler.tags = ['admin']
handler.category = 'admin'

export default handler
