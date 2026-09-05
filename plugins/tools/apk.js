// ============================================================
// كود تثبيت تطبيقات من جوجل — Aptoide API (نسخة محسّنة)
// محوّل لهيكل بوت 𓆩 𝑨𝑳𝑯𝑾𝑨𝑹𝒀 𓆪
// + بحث أدق (مطابقة بالاسم) + تحميل حقيقي وإرسال كملف + دعم OBB
// ============================================================

const IMAGE_URL = "https://j.top4top.io/p_3894432qz0.jpg";
const MAX_DOWNLOAD_MB = 100; // حد أقصى لحجم الملف اللي البوت يحمله ويبعته مباشرة

// كاش مؤقت لنتائج البحث (عشان زرار التحميل يقدر يوصل للبيانات بعد كده)
const resultsCache = new Map();
const CACHE_TTL = 10 * 60 * 1000; // 10 دقايق

function cacheSet(key, value) {
    resultsCache.set(key, { value, at: Date.now() });
    // تنظيف الكاش القديم
    for (const [k, v] of resultsCache.entries()) {
        if (Date.now() - v.at > CACHE_TTL) resultsCache.delete(k);
    }
}

function cacheGet(key) {
    const entry = resultsCache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.at > CACHE_TTL) { resultsCache.delete(key); return null; }
    return entry.value;
}

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

function formatSize(bytes) {
    if (!bytes) return '?';
    const mb = bytes / 1048576;
    return mb >= 1024 ? `${(mb / 1024).toFixed(2)} GB` : `${mb.toFixed(2)} MB`;
}

// ===== حساب درجة التطابق بين البحث واسم التطبيق (بحث أدق) =====
function normalize(str = '') {
    return str.toLowerCase().replace(/[^\w\u0600-\u06FF\s]/g, '').trim();
}

function similarityScore(query, appName) {
    const q = normalize(query);
    const name = normalize(appName);
    if (!q || !name) return 0;

    if (name === q) return 100;                    // تطابق كامل
    if (name.startsWith(q)) return 85;              // يبدأ بنفس الكلمة
    if (name.includes(q)) return 70;                // يحتوي على الكلمة كاملة

    // تطابق جزئي بالكلمات
    const qWords = q.split(/\s+/);
    const nameWords = name.split(/\s+/);
    const matched = qWords.filter(w => nameWords.some(nw => nw.includes(w) || w.includes(nw)));
    return (matched.length / qWords.length) * 50;
}

async function searchApps(query) {
    const url = `https://ws75.aptoide.com/api/7/apps/search?query=${encodeURIComponent(query)}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
    const json = await res.json();
    const list = json?.datalist?.list || [];

    const safe = list.filter(a => a?.malware?.rank !== 'MALWARE');
    const pool = safe.length ? safe : list;

    // ترتيب حسب: درجة التطابق بالاسم (الأهم) ثم عدد التحميلات
    const scored = pool.map(app => ({
        app,
        score: similarityScore(query, app.name || '') + Math.min(20, Math.log10((app.stats?.downloads || 1)) * 3)
    }));

    scored.sort((a, b) => b.score - a.score);
    return scored.map(s => s.app);
}

function findObbUrl(app) {
    // Aptoide بترجع بيانات الـOBB (لو موجودة) في أماكن مختلفة حسب نوع التطبيق
    return app?.file?.obb?.main?.path
        || app?.file?.obb?.path
        || app?.obb?.url
        || app?.file?.expansion?.path
        || null;
}

async function downloadAndSend(conn, chat, quoted, url, fileName, mimetype, label) {
    try {
        const headRes = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(10000) }).catch(() => null);
        const size = Number(headRes?.headers?.get('content-length') || 0);

        if (size && size > MAX_DOWNLOAD_MB * 1024 * 1024) {
            await conn.sendMessage(chat, {
                text: `⚠️ ${label} حجمه ${formatSize(size)} — أكبر من الحد المسموح (${MAX_DOWNLOAD_MB}MB) للإرسال المباشر.\n\n🔗 رابط التحميل المباشر:\n${url}`
            }, { quoted });
            return;
        }

        await conn.sendMessage(chat, { text: `⏳ جاري تحميل ${label}...` }, { quoted });

        const res = await fetch(url, { signal: AbortSignal.timeout(120000) });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const buffer = Buffer.from(await res.arrayBuffer());

        await conn.sendMessage(chat, {
            document: buffer,
            mimetype,
            fileName
        }, { quoted });
    } catch (e) {
        console.error('[APP DOWNLOAD]', e?.message || e);
        await conn.sendMessage(chat, {
            text: `❌ فشل تحميل ${label}: ${e.message}\n\n🔗 جرب اللينك مباشرة:\n${url}`
        }, { quoted });
    }
}

async function handler(m, { conn, args }) {
    const input = args.join(' ').trim();

    // ===== الضغط على زرار "تحميل الآن" =====
    if (input.startsWith('تحميل_')) {
        const token = input.replace('تحميل_', '');
        const cached = cacheGet(token);
        if (!cached) {
            await conn.sendMessage(m.chat, {
                text: `⚠️ انتهت صلاحية هذه النتيجة، ابحث تاني من فضلك.`
            }, { quoted: m });
            return;
        }
        await downloadAndSend(conn, m.chat, m, cached.downloadUrl, `${cached.appName}.apk`, 'application/vnd.android.package-archive', 'ملف APK');
        if (cached.obbUrl) {
            await downloadAndSend(conn, m.chat, m, cached.obbUrl, `${cached.appName}.obb`, 'application/octet-stream', 'ملف OBB');
        }
        return;
    }

    // ===== بحث عادي =====
    const query = input;
    if (!query) {
        await conn.sendMessage(m.chat, {
            text: `╭─❖ ملاحظة ❖─╮\n⚠️ يرجى كتابة اسم التطبيق!\nمثال: .تطبيق WhatsApp\n╰────────────╯`,
            contextInfo: context(m.sender)
        }, { quoted: m });
        return;
    }

    await conn.sendMessage(m.chat, {
        text: `🔎 جاري البحث الدقيق عن "${query}"...`,
        contextInfo: context(m.sender)
    }, { quoted: m });

    let results;
    try {
        results = await searchApps(query);
    } catch (e) {
        console.error('[تطبيق]', e?.message || e);
        await conn.sendMessage(m.chat, {
            text: `╭─❖ خطأ ❖─╮\n❌ حصل خطأ أثناء البحث، حاول تاني بعد شوية.\n╰────────────╯`,
            contextInfo: context(m.sender)
        }, { quoted: m });
        return;
    }

    if (!results.length) {
        await conn.sendMessage(m.chat, {
            text: `╭─❖ تنبيه ❖─╮\n❌ لم يتم العثور على نتائج، تأكد من اسم التطبيق.\n╰────────────╯`,
            contextInfo: context(m.sender)
        }, { quoted: m });
        return;
    }

    const app = results[0];
    const downloadUrl = app.file?.path;
    const obbUrl = findObbUrl(app);

    if (!downloadUrl) {
        await conn.sendMessage(m.chat, {
            text: `╭─❖ تنبيه ❖─╮\n❌ عذراً، رابط التحميل غير متوفر لهذا التطبيق.\n╰────────────╯`,
            contextInfo: context(m.sender)
        }, { quoted: m });
        return;
    }

    const token = Math.random().toString(36).slice(2, 10);
    cacheSet(token, { downloadUrl, obbUrl, appName: app.name });

    const rank = app?.malware?.rank || 'UNKNOWN';
    const safetyIcon = rank === 'TRUSTED' ? '✅' : (rank === 'MALWARE' ? '⛔' : '⚠️');
    const appSize = formatSize(app.file?.filesize);

    await conn.sendButtonNormal(m.chat, {
        media: { url: app.icon },
        mediaType: 'image',
        caption: `
*╭━━━ 📱 تم العثور على التطبيق ━━━°⃟⚡*
┃ *الاسم:* ${app.name}
┃ *الإصدار:* ${app.file?.vername || 'غير معروف'}
┃ *الحجم:* ${appSize}${obbUrl ? '\n┃ 📦 *يوجد ملف OBB إضافي*' : ''}
┃ *الفحص:* ${safetyIcon} ${rank}
┃
┃ ⚠️ تحميل ملفات APK من خارج المتجر الرسمي يحمل مخاطر أمنية دايمًا.
*╰━━━━━━━━━━━━━━━━━━━°⃟⚡*
        `.trim(),
        buttons: [
            { name: "quick_reply", params: { display_text: "📥 تحميل وإرسال في الشات", id: `.تطبيق تحميل_${token}` } },
            { name: "cta_url", params: { display_text: "🔗 لينك مباشر", url: downloadUrl } }
        ],
        mentions: [m.sender],
        newsletter: {
            name: '𓆩 𝑨𝑳𝑯𝑾𝑨𝑹𝒀 𓆪',
            jid: '1556853817@newsletter'
        }
    }, m);
}

handler.help = ["تطبيق <اسم>"];
handler.category = "downloads";
handler.command = ["تطبيق", "apk", "app"];

export default handler;
