// أمر يعرض حالة منع البوتات الفرعية في الجروب الحالي
// .حالة_منع_الفرعي

const handler = async (m, { conn }) => {
    const chatId = m.chat
    const g = global.db?.groups[chatId]

    const status = g?.blockSubBots ? 'مفعّل ✅' : 'متوقف ❌'

    const text = `
◇— 〔 🤖 منع البوتات الفرعية 〕 —◇

├ الحالة الحالية: ${status}
│
├ للتفعيل:
│ .منع_الفرعي تشغيل
│
└ للإيقاف:
  .منع_الفرعي ايقاف

⟡ ⵌ 𝐴𝐿𝐻𝑊𝐴𝑅𝑌 SYSTEM ⵌ ⟡`.trim()

    await m.reply(text)
}

handler.command = ['حالة_منع_الفرعي']
handler.help = ['حالة_منع_الفرعي']
handler.tags = ['admin']
handler.category = 'admin'

export default handler
