import { inspect } from 'util';

async function handler(m, { conn, text, usedPrefix, command }) {
    let code = '';

    // 1. التحقق إذا كان الرد على ملف (Document)
    if (m.quoted && m.quoted.mtype === 'documentMessage') {
        try {
            const buffer = await m.quoted.download();
            code = buffer.toString('utf-8');
        } catch (e) {
            return m.reply(`❌ *فشل في قراءة الملف المرفق:* ${e.message}`);
        }
    } 
    // 2. التحقق إذا كان الرد على رسالة نصية
    else if (m.quoted && (m.quoted.text || m.quoted.caption)) {
        code = m.quoted.text || m.quoted.caption;
    } 
    // 3. قراءة النص المكتوب بعد الأمر مباشرة
    else if (text) {
        code = text;
    }

    // تنظيف كود الـ Eval من بادئات التنفيذ الشائعة إذا وجدت
    code = code.trim().replace(/^(=>|>)/, '');

    if (!code) {
        return m.reply(`⚠️ *يرجى كتابة الكود أو الرد على (رسالة نصية / ملف .js) لتنفيذه!*`);
    }

    await conn.sendMessage(m.chat, { react: { text: "⚡", key: m.key } });

    let output;
    try {
        // تنفيذ الكود داخل دالة asynchronous مع إتاحة سياق النطاق (m, conn, etc.)
        let evaled = await eval(`(async () => {
            ${code}
        })()`);

        if (typeof evaled !== 'string') {
            evaled = inspect(evaled, { depth: 2 });
        }
        output = evaled;
        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

    } catch (err) {
        output = err.stack || err.message || err;
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    }

    // إرسال النتيجة
    if (String(output).length > 4000) {
        await conn.sendMessage(m.chat, {
            document: Buffer.from(String(output)),
            mimetype: 'text/plain',
            fileName: 'result.txt',
            caption: '📊 *نتيجة التنفيذ متجاوزة الحد المسموح للأحرف (تم إرسالها كملف):*'
        }, { quoted: m });
    } else {
        await conn.sendMessage(m.chat, { text: String(output) }, { quoted: m });
    }
}

handler.command = ['run', 'exec', 'e', 'شغل'];
handler.rowner = true; // مخصص للمطور فقط للأمان

export default handler;