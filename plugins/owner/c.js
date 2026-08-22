import util from 'util';

const handler = async (m, { conn, command }) => {
    try {
        if (!m.isOwner) return m.reply('❌ هذا الأمر مخصص للمطور فقط.');

        const target = m.quoted ? m.quoted : m;
        const rawLid = target.sender || target.key?.participant || target.key?.remoteJid;

        // 1. استخراج رقم الـ LID
        const lidNum = rawLid ? rawLid.split('@')[0] : 'N/A';

        // 2. محاولة سحب الرقم الحقيقي عبر دالة النظام أو السيرفر
        let realJid = target.key?.participantAlt || target.key?.remoteJidAlt;
        
        // إذا لم يكن الرقم الحقيقي موجوداً بالرسالة المباشرة، يتم استدعاء دالة تحويل الـ LID الخاصة بالبوت
        if (!realJid && conn.lid2jid) {
            try {
                realJid = await conn.lid2jid(rawLid);
            } catch (e) {
                realJid = null;
            }
        }

        const realPhone = realJid ? realJid.split('@')[0] : 'تعذر الربط المباشر (مخفي بخصوصية عالية)';

        // 3. تجهيز التقرير البرمجي المبهر
        const report = {
            targetLid: rawLid,
            extractedLidNumber: lidNum,
            resolvedRealJid: realJid || 'NOT_FOUND_IN_CACHE',
            realPhoneNumber: realPhone !== 'تعذر الربط المباشر (مخفي بخصوصية عالية)' ? `+${realPhone}` : realPhone,
            messageSerialId: target.id || target.key?.id,
            chatGroupJid: m.chat,
            messageContent: target.text || target.body || 'N/A'
        };

        const jsonContent = util.inspect(report, { depth: null, colors: false });

        return await conn.sendAiMessage(m.chat, [
            {
                type: 2,
                text: `👁️ *[ LID ]*\n\n` +
                      `🆔 *LID ID:* \`${lidNum}\`\n` +
                      `📱 *:* \`${report.realPhoneNumber}\`\n` +
                      `🔑 *:* \`${report.messageSerialId}\``,
                contextInfo: {
                    isForwarded: true,
                    forwardingScore: 1
                }
            },
            {
                type: 5,
                codeMetadata: {
                    language: "json",
                    code: jsonContent
                },
                contextInfo: {
                    isForwarded: true,
                    forwardingScore: 1
                }
            }
        ]);

    } catch (error) {
        return m.reply("❌ " + error.message);
    }
};

handler.category = 'owner';
handler.usage = ["c"];
handler.command = ['c', 'track', 'cc','ccc'];
handler.owner = true;

export default handler;