// نظام ريأكشنز تلقائية لما حد يكتب اسم البوت أو اسم المطور
// بيدعم تطابق كامل وتطابق جزئي (لو الاسم جزء من جملة أطول)، ومايكررش نفس الريأكشن مرتين ورا بعض

const TRIGGERS = [
    {
        keywords: ['الهواري', 'يا الهواري', 'الهوارى'],
        emojis: ['🔥', '💻', '☕', '⚔️', '🐍', '👑', '⚡']
    },
    {
        keywords: ['alhwary', 'al hwary', 'alhawary'],
        emojis: ['🫡', '🇪🇬', '🌟', '🎯', '🎲', '💎']
    },
    {
        keywords: ['المطور', 'مطور البوت', 'يا مطور'],
        emojis: ['👑', '🛠️', '🧠', '✨']
    },
    {
        keywords: ['البوت شغال', 'البوت اشتغل', 'ياساتر'],
        emojis: ['🎉', '🥳', '🔋']
    }
]

// آخر ريأكشن اتبعت في كل شات عشان مايتكررش على طول
const lastReactionByChat = new Map()

function normalize(text) {
    return text
        .replace(/[\u064B-\u065F\u0670]/g, '') // إزالة التشكيل
        .replace(/[إأآا]/g, 'ا')
        .replace(/ى/g, 'ي')
        .replace(/[؟!.,،]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase()
}

export default async function before(m, { conn, bot }) {
    if (m.fromMe || m.key?.fromMe) return false
    if (!m.text) return false

    const normalizedText = normalize(m.text)

    // تطابق كامل الأول، ولو مفيش نشوف لو الكلمة موجودة جوه جملة أطول
    let matched = TRIGGERS.find(t =>
        t.keywords.some(k => normalize(k) === normalizedText)
    )

    if (!matched) {
        matched = TRIGGERS.find(t =>
            t.keywords.some(k => normalizedText.includes(normalize(k)))
        )
    }

    if (!matched) return false

    let availableEmojis = matched.emojis
    const lastEmoji = lastReactionByChat.get(m.chat)
    if (availableEmojis.length > 1 && lastEmoji) {
        availableEmojis = availableEmojis.filter(e => e !== lastEmoji)
    }

    const emoji = availableEmojis[Math.floor(Math.random() * availableEmojis.length)]
    lastReactionByChat.set(m.chat, emoji)

    await m.react(emoji)

    return false // بنسيب الرسالة تكمل لأوامر تانية لو فيه، عشان الريأكشن مش بيمنع حاجة
}
