// ============================================================
// بحث يوتيوب سريع — نسخة برو
// محوّل لهيكل بوت 𓆩 𝑨𝑳𝑯𝑾𝑨𝑹𝒀 𓆪
// ============================================================

const IMAGE_URL = "https://j.top4top.io/p_3894432qz0.jpg";

function context(jid) {
    return {
        mentionedJid: [jid],
        isForwarded: true,
        forwardingScore: 1,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '1556853817@newsletter',
            newsletterName: '𓆩 𝑨𝑳𝑯𝑾𝑨𝑹𝒀 𓆪',
            serverMessageId: 0
        },
        externalAdReply: {
            title: "𓆩⚡ 𝑨𝑳𝑯𝑾𝑨𝑹𝒀 𝑪𝑶𝑹𝑬 ⚡𓆪",
            body: "°⃟⚡ SYSTEM: ONLINE",
            thumbnailUrl: IMAGE_URL,
            sourceUrl: '',
            mediaType: 1,
            renderLargerThumbnail: true
        }
    };
}

function formatViews(v) {
    if (!v) return '';
    const n = Number(v);
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return String(n);
}

async function handler(m, { conn, args, command }) {
    const query = args.join(' ').trim();

    if (!query) {
        await conn.sendMessage(m.chat, {
            text: `*╭━━━ 🎬 بحث يوتيوب ━━━°⃟⚡*\n┃ اكتب اسم الفيديو أو الأغنية\n┃ مثال: .${command} chase atlantic\n*╰━━━━━━━━━━━━━━━━━━━°⃟⚡*`,
            contextInfo: context(m.sender)
        }, { quoted: m });
        return;
    }

    await m.react('🔍');

    let data;
    try {
        const res = await fetch(`https://emam-api.web.id/home/sections/Search/api/YouTube/search?q=${encodeURIComponent(query)}`, {
            signal: AbortSignal.timeout(15000)
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        data = json?.data;
    } catch (e) {
        console.error('[YT SEARCH]', e?.message || e);
        await m.react('❌');
        await conn.sendMessage(m.chat, {
            text: `*╭━━━ ❌ خطأ ━━━°⃟⚡*\n┃ فشل البحث، حاول تاني بعد شوية.\n*╰━━━━━━━━━━━━━━━━━━━°⃟⚡*`,
            contextInfo: context(m.sender)
        }, { quoted: m });
        return;
    }

    if (!data || !data.length) {
        await m.react('❌');
        await conn.sendMessage(m.chat, {
            text: `*╭━━━ 🔎 لا نتائج ━━━°⃟⚡*\n┃ مفيش نتائج لـ "${query}"\n*╰━━━━━━━━━━━━━━━━━━━°⃟⚡*`,
            contextInfo: context(m.sender)
        }, { quoted: m });
        return;
    }

    const video = data[0];
    const { title, image, timestamp: time, url, views, author } = video;

    if (!url) {
        await m.react('❌');
        await conn.sendMessage(m.chat, {
            text: `*╭━━━ ⚠️ تنبيه ━━━°⃟⚡*\n┃ الفيديو مش متاح للتحميل حاليًا.\n*╰━━━━━━━━━━━━━━━━━━━°⃟⚡*`,
            contextInfo: context(m.sender)
        }, { quoted: m });
        return;
    }

    const viewsText = formatViews(views);

    try {
        await conn.sendButtonNormal(m.chat, {
            media: { url: image || IMAGE_URL },
            mediaType: 'image',
            caption: `
*╭━━━ 🎬 نتيجة البحث ━━━°⃟⚡*
┃ *العنوان:* ${title}
┃ *المدة:* ⏱️ ${time || '-'}
${author ? `┃ *القناة:* 📺 ${author}\n` : ''}${viewsText ? `┃ *المشاهدات:* 👁️ ${viewsText}\n` : ''}┃
┃ اختر طريقة التحميل:
*╰━━━━━━━━━━━━━━━━━━━°⃟⚡*
            `.trim(),
            buttons: [
                { name: "quick_reply", params: { display_text: "🎼 تحميل صوت", id: `.يوت_اغنيه ${url}` } },
                { name: "quick_reply", params: { display_text: "🎬 تحميل فيديو", id: `.يوتيوب ${url}` } }
            ],
            mentions: [m.sender],
            newsletter: {
                name: '𓆩 𝑨𝑳𝑯𝑾𝑨𝑹𝒀 𓆪',
                jid: '1556853817@newsletter'
            }
        }, m);
        await m.react('✅');
    } catch (e) {
        console.error('[YT SEARCH SEND]', e?.message || e);
        // احتياطي نصي لو فشل إرسال الكارت التفاعلي
        await conn.sendMessage(m.chat, {
            text: `*╭━━━ 🎬 ${title} ━━━°⃟⚡*\n┃ ⏱️ ${time || '-'}\n┃\n┃ 🎼 صوت: .يوت_اغنيه ${url}\n┃ 🎬 فيديو: .يوتيوب ${url}\n*╰━━━━━━━━━━━━━━━━━━━°⃟⚡*`
        }, { quoted: m });
    }
}

handler.help = ["اغنيه <اسم>", "فيديو <اسم>"];
handler.category = "downloads";
handler.command = ["اغنيه", "فيديو", "اغنية", "play", "video"];

export default handler;
