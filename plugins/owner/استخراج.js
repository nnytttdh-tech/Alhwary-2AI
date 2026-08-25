import fs from 'fs';

const context = (jid) => ({
    mentionedJid: [jid],
    isForwarded: true,
    forwardingScore: 999,
    forwardedNewsletterMessageInfo: {
        newsletterJid: '1556853817@newsletter',
        newsletterName: '𝑨𝑳𝑯𝑾𝑨𝑹𝒀 | 𝑫𝑨𝑻𝑨 𝑬𝑿𝑻𝑹𝑨𝑪𝑻𝑶𝑹',
        serverMessageId: 100
    },
    externalAdReply: {
        title: "⚡ 𝑨𝑳𝑯𝑾𝑨𝑹𝒀 𝑬𝑿𝑻𝑹𝑨𝑪𝑻𝑶𝑹 𝑷𝑑𝑶 ⚡",
        body: "SYSTEM: ADVANCED EXTRACTION ENGINE",
        thumbnailUrl: "https://g.top4top.io/p_3883b3a260.jpg",
        sourceUrl: '',
        mediaType: 1,
        renderLargerThumbnail: true
    }
});

async function handler(m, { conn, args }) {
    await conn.sendMessage(m.chat, { react: { text: "⚙️", key: m.key } });

    if (!m.quoted) {
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        return await conn.sendMessage(m.chat, {
            text: `╭───〔 ⚠️ *تنبيه* 〕───╮\n│ يرجى الرد على الرسالة المراد سحب بياناتها!\n╰──────────────────╯`,
            contextInfo: context(m.sender)
        }, { quoted: m });
    }

    try {
        let quotedData = m.quoted;
        const filterKey = args[0]?.toLowerCase(); // خيار التصفية إذا كتب المستخدم مثلا: .q media

        // 1. تصفية البيانات إذا طلب المستخدم مساراً معيناً
        let targetData = quotedData;
        if (filterKey && quotedData[filterKey] !== undefined) {
            targetData = { [filterKey]: quotedData[filterKey] };
        }

        // 2. تنظيف البيانات من العناصر غير المهمة لتقليل الحجم
        const formattedJson = JSON.stringify(targetData, (key, value) => {
            if (['conn', 'socket', '_client', 'client'].includes(key)) return undefined;
            return value;
        }, 2);

        const jsonSizeKb = (Buffer.byteLength(formattedJson, 'utf8') / 1024).toFixed(2);
        const messageType = quotedData.mtype || 'مجهول';
        const senderJid = quotedData.sender ? quotedData.sender.split('@')[0] : 'غير معروف';

        const captionText = `
✨                                               ✨

╭───〔 *تفاصيل العملية* 〕───
├─ 👤 *المستخرِج:* @${m.sender.split("@")[0]}
├─ ✉️ *صاحب الرسالة:* @${senderJid}
├─ ⚙️ *النوع:* \`${messageType}\`
├─ 📦 *حجم البيانات:* \`${jsonSizeKb} KB\`
${filterKey ? `├─ 🔍 *الفلتر المطبق:* \`${filterKey}\`\n` : ''}╰──────────────────────────

*✦ صلي على النبي ✦*`.trim();

        // 3. التمييز الذكي: إذا كان حجم النص كبيراً جداً يتم إرساله كملف .json لحماية الشات
        if (formattedJson.length > 3500) {
            const filePath = `./tmp/extracted_${Date.now()}.json`;
            fs.writeFileSync(filePath, formattedJson);

            await conn.sendMessage(m.chat, {
                document: fs.readFileSync(filePath),
                mimetype: 'application/json',
                fileName: `Extracted_Data_${quotedData.id || 'msg'}.json`,
                caption: captionText,
                contextInfo: context(m.sender)
            }, { quoted: m });

            fs.unlinkSync(filePath); // حذف الملف المؤقت بعد الإرسال
        } else {
            // الإرسال كـ Code Block إذا كان الحجم مناسباً
            await conn.sendAiMessage(m.chat, [
                {
                    type: 2,
                    text: captionText,
                    contextInfo: context(m.sender)
                },
                {
                    type: 5,
                    codeMetadata: {
                        language: "json",
                        code: formattedJson
                    },
                    contextInfo: context(m.sender)
                }
            ]);
        }

        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

    } catch (error) {
        console.error(error);
        await conn.sendMessage(m.chat, { react: { text: "⚠️", key: m.key } });
        await conn.sendMessage(m.chat, {
            text: `❌ حدث خطأ أثناء معالجة البيانات: ${error.message}`,
            contextInfo: context(m.sender)
        }, { quoted: m });
    }
}

handler.command = ['c', 'quoted', 'استخراج', 'سحب', 'json'];
handler.category = 'tools';
export default handler;