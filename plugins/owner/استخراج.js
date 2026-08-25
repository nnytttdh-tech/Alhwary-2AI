const context = (jid) => ({
    mentionedJid: [jid],
    isForwarded: true,
    forwardingScore: 1,
    forwardedNewsletterMessageInfo: {
        newsletterJid: '1556853817@newsletter',
        newsletterName: '𝑨𝑳𝑯𝑾𝑨𝑹𝒀',
        serverMessageId: 0
    },
    externalAdReply: {
        title: "• 𝑨𝑳𝑯𝑾𝑨𝑹𝒀  •",
        body: "SYSTEM: DATA ",
        thumbnailUrl: "https://g.top4top.io/p_3883b3a260.jpg",
        sourceUrl: '',
        mediaType: 1,
        renderLargerThumbnail: false
    }
});

async function handler(m, { conn }) {
    // 1. التحقق من وجود رسالة مقتبسة
    if (!m.quoted) {
        await conn.sendMessage(m.chat, {
            text: `╭─❖ تنبيه ❖─╮\n⚠️ يرجى الرد (Reply) على الرسالة !\n╰────────────╯`,
            contextInfo: context(m.sender)
        }, { quoted: m });
        return;
    }

    try {
        // 2. سحب بيانات الرسالة وتحويلها لـ JSON منظم
        const quotedData = m.quoted;
        const formattedJson = JSON.stringify(quotedData, null, 2);

        const captionText = `
┏━━━⟪ *𝑨𝑳𝑯𝑾𝑨𝑹𝒀* ⟫━━━┓
┃
┣─ 👤 *المستخرج* ： @${m.sender.split("@")[0]}
┣─ ⚙️ *النوع* ： ${quotedData.mtype || 'مجهول'}
┃
┗━━━━━━━━━━━━━━━━━━━━━━━┛
`.trim();

        // 3. إرسال البيانات مباشرة كـ Code Block بدل ملف
        return await conn.sendAiMessage(m.chat, [
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

    } catch (error) {
        console.error(error);
        await conn.sendMessage(m.chat, {
            text: `╭─❖ خطأ ❖─╮\n❌ حدث خطأ أثناء استخراج بيانات الرسالة.\n╰──────────╯`,
            contextInfo: context(m.sender)
        }, { quoted: m });
    }
}

handler.command = ['q', 'quoted', 'استخراج', 'سحب'];
handler.category = 'tools';
export default handler;