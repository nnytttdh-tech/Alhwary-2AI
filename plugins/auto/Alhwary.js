import fs from 'fs'
import path from 'path'
import { downloadContentFromMessage } from '@whiskeysockets/baileys'

// مسار حفظ الفيديو الثابت داخل السورس
const videoPath = path.join(process.cwd(), 'plugins/test_video.mp4')

let handler = async (m, { conn, command }) => {
  const fakeContact = {
    key: {
      participants: '0@s.whatsapp.net',
      remoteJid: m.chat,
      fromMe: false,
      id: 'ShadowBot'
    },
    message: {
      contactMessage: {
        displayName: '🔱𝑨𝑳𝑯𝑾𝑨𝑹𝒀🔱',
        vcard: `BEGIN:VCARD\nVERSION:3.0\nN: ALHWARY;;;\nFN: ALHWARY\nTEL;type=CELL;type=VOICE;waid=201556853817:+201556853817\nEND:VCARD`
      }
    },
    participant: '0@s.whatsapp.net'
  }

  try {
    // === 1- أمر تثبيت وحفظ الفيديو الجديد كأصل دائم ===
    if (command === 'حفظ_تست' || command === 'تثبيت') {
      let q = m.quoted ? m.quoted : m
      let mime = (q.msg || q).mimetype || ''
      if (!/video/.test(mime)) {
        return m.reply(`╭─❖ ⚠️ تنبيه ❖─╮
│ اعمل ريبلاي على الفيديو
│ اللي عايز تثبته واكتب
│ .تثبيت أو .حفظ_تست
╰────────────────╯`)
      }

      await m.reply(`╭─❖ ⏳ جاري التثبيت ❖─╮
│ جاري تحميل وتثبيت
│ الفيديو الجديد بشكل دائم...
╰────────────────╯`)

      let media = await q.download()
      fs.writeFileSync(videoPath, media)

      return m.reply(`╭─❖ ✅ تم بنجاح ❖─╮
│ تم تثبيت الفيديو كفيديو
│ أساسي بنجاح!
│
│ جرب اكتب .تست في أي وقت
╰────────────────╯
⟡ ⵌ 𝐴𝐿𝐻𝑊𝐴𝑅𝑌 SYSTEM ⵌ ⟡`)
    }

    // === 2- أمر تست لعرض الفيديو المثبت دائمًا ===
    if (command === 'تست') {
      if (!fs.existsSync(videoPath)) {
        return m.reply(`╭─❖ ⚠️ تنبيه ❖─╮
│ أنت لسه ما ثبتش أي
│ فيديو أساسي!
│
│ اعمل ريبلاي على فيديو
│ واكتب .تثبيت الأول
╰────────────────╯`)
      }

      let videoSource = fs.readFileSync(videoPath)

      await conn.sendMessage(
        m.chat,
        {
          video: videoSource,
          mimetype: 'video/mp4',
          caption: `╭─❖ 🎬 𝑨𝑳𝑯𝑾𝑨𝑹𝒀 𝑽𝑰𝑫𝑬𝑶 ❖─╮
│ 👑 المطور: 𝑨𝑳𝑯𝑾𝑨𝑹𝒀
╰────────────────╯`,
          gifPlayback: false,
          ptv: true
        },
        { quoted: fakeContact }
      )
      return
    }

    // === 3- أمر التحويل الفوري العادي (دائري / ptv) ===
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''

    if (!/video/.test(mime)) {
      return m.reply(`╭─❖ ⚠️ تنبيه ❖─╮
│ اعمل ريبلاي على أي فيديو
│ عشان أحوله لدائري فوراً!
╰────────────────╯`)
    }

    await m.reply(`╭─❖ ⏳ جاري التحويل ❖─╮
│ جاري السيطرة على الفيديو
│ وتحويله لهيئة دائري فخم...
╰────────────────╯`)

    let media = await q.download()

    await conn.sendMessage(
      m.chat,
      {
        video: media,
        mimetype: 'video/mp4',
        caption: `╭─❖ 🎬 𝑨𝑳𝑯𝑾𝑨𝑹𝒀 𝑷𝑻𝑽 ❖─╮
│ 👑 المطور: 𝑨𝑳𝑯𝑾𝑨𝑹𝒀
╰────────────────╯`,
        gifPlayback: false,
        ptv: true
      },
      { quoted: fakeContact }
    )

  } catch (e) {
    console.error(e)
    await m.reply(`╭─❖ ❌ خطأ ❖─╮
│ حدث خطأ أثناء تنفيذ الأمر
╰────────────────╯`)
  }
}

handler.command = ['دائري', 'ptv', 'تست', 'حفظ_تست', 'تثبيت']
handler.help = ['دائري']
handler.tags = ['tools']

export default handler
