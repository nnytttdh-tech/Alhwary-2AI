import crypto from 'crypto';

// ============================================================
// 🖇️ فاصل زخرفي يستخدم بكل الردود عشان الشكل يكون موحّد
// ============================================================
const LINE = '『━━━━━━━━━━━━━━━━━━』';
const FOOTER = `\n\n${LINE}\n✨ *Meliodas Tools System*`;

// ============================================================
// 📄 مولّد PDF بسيط وصالح فعلاً (بدون أي مكتبة خارجية)
// يدعم نص متعدد الأسطر، ويهرب الأقواس والباك سلاش زي ما
// يفرضه سبك PDF عشان الملف ما ينكسر لما يفتح.
// ============================================================
function makeSimplePdf(text) {
    const escape = (s) => s.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
    const lines = text.split('\n').flatMap(l => {
        // تقسيم الأسطر الطويلة عشان ما تطلع خارج حدود الصفحة
        const chunks = [];
        for (let i = 0; i < l.length; i += 90) chunks.push(l.slice(i, i + 90));
        return chunks.length ? chunks : [''];
    });

    const pageHeight = 792;
    const marginTop = 760;
    const lineHeight = 14;
    const maxLinesPerPage = Math.floor((marginTop - 40) / lineHeight);

    const pagesContent = [];
    for (let i = 0; i < lines.length; i += maxLinesPerPage) {
        pagesContent.push(lines.slice(i, i + maxLinesPerPage));
    }
    if (pagesContent.length === 0) pagesContent.push(['']);

    const objects = [];
    const pageObjIds = [];
    let objId = 4; // 1=Catalog, 2=Pages, 3=Font

    for (const pageLines of pagesContent) {
        let stream = 'BT /F1 11 Tf 40 ' + marginTop + ' Td\n';
        for (const l of pageLines) {
            stream += `(${escape(l)}) Tj 0 -${lineHeight} Td\n`;
        }
        stream += 'ET';

        const contentId = objId++;
        const pageId = objId++;
        objects.push(`${contentId} 0 obj\n<< /Length ${stream.length} >>\nstream\n${stream}\nendstream\nendobj\n`);
        objects.push(`${pageId} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 ${pageHeight}] /Resources << /Font << /F1 3 0 R >> >> /Contents ${contentId} 0 R >>\nendobj\n`);
        pageObjIds.push(pageId);
    }

    let pdf = '%PDF-1.4\n';
    const offsets = [];
    const push = (str) => { offsets.push(pdf.length); pdf += str; };

    push(`1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`);
    push(`2 0 obj\n<< /Type /Pages /Kids [${pageObjIds.map(id => `${id} 0 R`).join(' ')}] /Count ${pageObjIds.length} >>\nendobj\n`);
    push(`3 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n`);
    for (const obj of objects) push(obj);

    const xrefStart = pdf.length;
    let xref = `xref\n0 ${offsets.length + 1}\n0000000000 65535 f \n`;
    for (const off of offsets) xref += `${String(off).padStart(10, '0')} 00000 n \n`;
    pdf += xref;
    pdf += `trailer\n<< /Size ${offsets.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

    return Buffer.from(pdf, 'binary');
}

const handler = async (m, { conn, command, text }) => {

    // 1️⃣ أمر: إحسب-الحروف
    if (/إحسب-الحروف|احسب_الحروف|احسب-الحروف/.test(command)) {
        if (!text && !m.quoted) return m.reply("⚠️ *اكتب النص أو اعمل ريبلاي على رسالة عشان أحسب حروفها!*");
        let txt = text || m.quoted.text || '';
        let charCount = txt.length;
        let wordCount = txt.trim().split(/\s+/).filter(w => w.length > 0).length;
        return m.reply(`📝 *تحليل النص:*\n\n🔢 *عدد الحروف:* ${charCount}\n🔠 *عدد الكلمات:* ${wordCount}${FOOTER}`);
    }

    // 2️⃣ أمر: إختصار (اختصار روابط)
    if (/إختصار|اختصار/.test(command)) {
        if (!text) return m.reply("⚠️ *حطي الرابط الطويل اللي تبي تختصرينه!*\n> مثال: .إختصار https://google.com");
        await m.reply("⏳ *جاري اختصار الرابط...*");
        try {
            let res = await global.fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(text.trim())}`);
            let shortUrl = (await res.text()).trim();
            if (shortUrl.startsWith('http')) {
                return m.reply(`🔗 *تم اختصار رابطك بنجاح:*\n\n${shortUrl}${FOOTER}`);
            }
            throw new Error('bad response');
        } catch {
            return m.reply("❌ *تعذر اختصار الرابط، جرب مرة ثانية بعد شوي.*");
        }
    }

    // 3️⃣ أمر: أي-بي (فحص الـ IP)
    if (/أي-بي|اي_بي|اي-بي|ايبى/.test(command)) {
        let ip = text ? text.trim() : '8.8.8.8';
        await m.reply(`🔍 *جاري فحص [ ${ip} ]...*`);
        try {
            let res = await global.fetch(`http://ip-api.com/json/${ip}`);
            let json = await res.json();
            if (json.status !== 'success') return m.reply("❌ *الـ IP غير صحيح أو غير مسجل!*");

            let ipInfo = `🌐 *بيانات الـ IP:*\n\n`;
            ipInfo += `📍 *الدولة:* ${json.country}\n`;
            ipInfo += `🏙️ *المدينة:* ${json.city}\n`;
            ipInfo += `📶 *الشركة المزودة:* ${json.isp}\n`;
            ipInfo += `🖥️ *الـ IP المفحوص:* ${json.query}`;
            return m.reply(ipInfo + FOOTER);
        } catch {
            return m.reply("❌ *فشل اتصال السيستم بموقع الفحص الحين.*");
        }
    }

    // 4️⃣ أمر: بنج (زمن استجابة البوت)
    if (/بنج|ping/.test(command)) {
        const start = performance.now();
        await m.reply('⚡ ...');
        const end = performance.now();
        return m.reply(`📶 *زمن الاستجابة:* \`${(end - start).toFixed(0)} مللي ثانية\`${FOOTER}`);
    }

    // 5️⃣ أمر: بي-دي-اف (ملف PDF حقيقي، مو نص مموّه بامتداد PDF)
    if (/بي-دي-اف|بي_دي_اف|بيديأف/.test(command)) {
        if (!text && !m.quoted) return m.reply("⚠️ *اكتب النص أو اعمل ريبلاي على رسالة تبي تحويلها لملف PDF!*");
        let txt = text || m.quoted.text || '';
        await m.reply("⏳ *جاري إنشاء مستند الـ PDF...*");
        try {
            const pdfBuffer = makeSimplePdf(txt);
            return await conn.sendMessage(m.chat, {
                document: pdfBuffer,
                mimetype: 'application/pdf',
                fileName: `Meliodas_Doc_${Date.now()}.pdf`
            }, { quoted: m });
        } catch {
            return m.reply("❌ *صار خطأ أثناء إنشاء ملف الـ PDF.*");
        }
    }

    // 6️⃣ أمر: تشويش (ترميز base64 — تنويه: مو تشفير حقيقي، أي حد يقدر يفكه)
    if (/تشويش|تشفير/.test(command)) {
        if (!text && !m.quoted) return m.reply("⚠️ *اكتب النص أو الكود اللي تبي ترمزه!*");
        let txt = text || m.quoted.text || '';
        let obfuscated = Buffer.from(txt).toString('base64');
        return m.reply(`✨ *تم ترميز النص (Base64):*\n_ملاحظة: هذا ترميز مو تشفير، أي حد يقدر يرجّعه._\n\n\`\`\`${obfuscated}\`\`\`${FOOTER}`);
    }

    // 7️⃣ أمر: دي-أن-أس
    if (/دي-أن-أس|دي-ان-اس|دي_ان_اس/.test(command)) {
        if (!text) return m.reply("⚠️ *اكتب رابط الموقع أو الدومين بدون https!*\n> مثال: .دي-أن-أس google.com");
        await m.reply(`🧪 *جاري فحص النطاق...*`);
        try {
            let res = await global.fetch(`https://dns.google/resolve?name=${encodeURIComponent(text.trim())}`);
            let json = await res.json();
            if (!json.Answer) return m.reply("❌ *لم يتم العثور على سجلات DNS لهذا النطاق!*");
            let ips = json.Answer.filter(a => a.type === 1).map(a => `📍 ${a.data}`).join('\n');
            return m.reply(`🧪 *سجلات الـ IPs المربوطة بالدومين:*\n\n${ips || 'لا يوجد سجلات A علنية'}${FOOTER}`);
        } catch {
            return m.reply("❌ *تعذر فحص سجلات الـ DNS الحين.*");
        }
    }

    // 8️⃣ أمر: فحص-الموقع
    if (/فحص-الموقع|فحص_الموقع/.test(command)) {
        if (!text) return m.reply("⚠️ *حطي رابط الموقع المراد فحص حالته!*");
        let url = text.trim().startsWith('http') ? text.trim() : `https://${text.trim()}`;
        await m.reply("🔍 *جاري فحص الموقع...*");
        try {
            let res = await global.fetch(url, { method: 'HEAD' });
            return m.reply(`✅ *تقرير فحص الموقع:*\n\n🌐 *الموقع:* ${url}\n🚦 *الحالة:* ${res.status} ${res.statusText}${FOOTER}`);
        } catch {
            return m.reply(`❌ *الموقع لا يستجيب الحين، قد يكون مغلقاً أو محظوراً!*`);
        }
    }

    // 9️⃣ أمر: هيدر
    if (/هيدر|الهيدر/.test(command)) {
        if (!text) return m.reply("⚠️ *اكتب رابط الموقع لجلب الهيدر الخاص فيه!*");
        let url = text.trim().startsWith('http') ? text.trim() : `https://${text.trim()}`;
        await m.reply("🧾 *جاري قراءة الـ Headers...*");
        try {
            let res = await global.fetch(url);
            let headersText = `🧾 *رؤوس الاستجابة لـ ${url}:*\n\n\`\`\`\n`;
            res.headers.forEach((value, key) => {
                headersText += `${key}: ${value}\n`;
            });
            headersText += `\`\`\``;
            return m.reply(headersText + FOOTER);
        } catch {
            return m.reply("❌ *فشل جلب هيدر الموقع!*");
        }
    }
};

handler.help = ['tools'];
handler.tags = ['tools'];

handler.command = [
    'إحسب-الحروف', 'احسب_الحروف', 'احسب-الحروف',
    'إختصار', 'اختصار',
    'أي-بي', 'اي_بي', 'اي-بي', 'ايبى',
    'بنج', 'ping',
    'بي-دي-اف', 'بيديأف', 'بي_دي_اف',
    'تشويش', 'تشفير',
    'دي-أن-أس', 'دي_ان_اس', 'دي-ان-اس',
    'فحص-الموقع', 'فحص_الموقع',
    'هيدر', 'الهيدر'
];

export default handler;
