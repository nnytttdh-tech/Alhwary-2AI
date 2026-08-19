// نظام الردود التلقائية على التحيات والعبارات الشائعة
// بيتحقق من نص الرسالة (بعد تطبيع بسيط) ويرد برسالة عشوائية من قايمة الردود المناسبة

const TRIGGERS = [
    {
        keywords: ['السلام عليكم', 'سلام عليكم', 'السلام عليكم ورحمة الله', 'السلام عليكم ورحمة الله وبركاته'],
        replies: ['*وعليكم السلام منور يغالي 🤎*', '*وعليكم السلام ورحمة الله وبركاته ❤️*', '*وعليكم السلام، أهلاً بيك 🌸*']
    },
    {
        keywords: ['هلا', 'هللا', 'هلا بيك', 'هلا والله'],
        replies: ['*هلا وغلا*', '*هلا بيك*', '*يا هلا*', '*هلا والله، نورت*']
    },
    {
        keywords: ['اهلا', 'أهلا', 'اهلين', 'أهلين', 'اهلا وسهلا'],
        replies: ['*أهلاً بيك 🌟*', '*أهلاً وسهلاً*', '*أهلاً، نورت الجروب*']
    },
    {
        keywords: ['باي', 'باى', 'مع السلامة', 'وداعا', 'وداعًا'],
        replies: ['*مع السلامة*', '*باي باي*', '*الله معاك*', '*في أمان الله*']
    },
    {
        keywords: ['صباح الخير', 'صباح النور', 'صباح الفل', 'صباح الورد'],
        replies: ['*صباح النور*', '*صباح الورد*', '*صباح الفل*', '*صباح الخير عليك*']
    },
    {
        keywords: ['مساء الخير', 'مساء النور', 'مساء الفل', 'مساء الورد', 'مساء الجوري'],
        replies: ['*مساء النور*', '*مساء الورد*', '*مساء الفل*', '*الله نورك*', '*مساء الجوري عليك*']
    },
    {
        keywords: ['تصبح على خير', 'تصبحوا على خير'],
        replies: ['*وانت من أهله*', '*وانت بخير يارب*', '*تصبح على ألف خير*']
    },
    {
        keywords: ['ازيك', 'إزيك', 'ازيك يعم', 'عامل ايه', 'عامل إيه', 'اخبارك', 'أخبارك'],
        replies: ['*الحمدلله تمام، وانت عامل إيه؟*', '*بخير الحمدلله 🙏*', '*تمام يا رب، عساك طيب*']
    },
    {
        keywords: ['شكرا', 'شكرًا', 'مشكور', 'تسلم', 'يعطيك العافية'],
        replies: ['*العفو 🤍*', '*ولا يهمك*', '*تسلم إنت*', '*ربنا يخليك*']
    }
]

// تطبيع النص: إزالة التشكيل والمسافات الزيادة وتوحيد بعض الحروف
function normalize(text) {
    return text
        .replace(/[\u064B-\u065F\u0670]/g, '') // إزالة التشكيل
        .replace(/[إأآا]/g, 'ا')
        .replace(/ى/g, 'ي')
        .replace(/ة/g, 'ه')
        .replace(/[؟!.,،]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase()
}

// آخر رد اتبعت لكل شات، عشان نتجنب تكرار نفس الرد مرتين على التوالي
const lastReplyByChat = new Map()

// آخر وقت رد فيه البوت لكل شات، عشان نتجنب السبام لو حد كرر نفس الكلمة كتير
const lastReplyTimeByChat = new Map()
const COOLDOWN_MS = 3000

export default async function before(m, { conn, bot }) {
    // نتجاهل رسايل البوت نفسه عشان مايحصلش لوب لا نهائي
    if (m.fromMe || m.key?.fromMe) return false
    if (!m.text) return false

    const normalizedText = normalize(m.text)

    const matched = TRIGGERS.find(t =>
        t.keywords.some(k => normalize(k) === normalizedText)
    )

    if (!matched) return false

    // منع السبام: لو حد كرر نفس الكلمة بسرعة، نتجاهل الرد لفترة قصيرة
    const now = Date.now()
    const lastTime = lastReplyTimeByChat.get(m.chat) || 0
    if (now - lastTime < COOLDOWN_MS) return false

    // منع تكرار نفس الرد مرتين ورا بعض في نفس الشات
    let availableReplies = matched.replies
    const lastReply = lastReplyByChat.get(m.chat)
    if (availableReplies.length > 1 && lastReply) {
        availableReplies = availableReplies.filter(r => r !== lastReply)
    }

    const reply = availableReplies[Math.floor(Math.random() * availableReplies.length)]

    lastReplyByChat.set(m.chat, reply)
    lastReplyTimeByChat.set(m.chat, now)

    await m.reply(reply)

    return true
}
