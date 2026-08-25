const IMAGE_URL = "https://g.top4top.io/p_3883b3a260.jpg";

const context = (jid) => ({
    mentionedJid: [jid],
    isForwarded: true,
    forwardingScore: 999,
    forwardedNewsletterMessageInfo: {
        newsletterJid: '1556853817@newsletter',
        newsletterName: '𝑨𝑳𝑯𝑾𝑨𝑹𝒀',
        serverMessageId: 0
    },
    externalAdReply: {
        title: "• 𝑨𝑳𝑯𝑾𝑨𝑹𝒀 𝑪𝑶𝑹𝑬 •",
        body: "SYSTEM: ONLINE",
        thumbnailUrl: IMAGE_URL,
        sourceUrl: '',
        mediaType: 1,
        renderLargerThumbnail: true
    }
});

async function handler(m, { conn }) {
    try {
        const { prepareWAMessageMedia } = await import('@whiskeysockets/baileys')
        let media = await prepareWAMessageMedia({ image: { url: IMAGE_URL } }, { upload: conn.waUploadToServer })

        let txt = `

ﷺ صلي على النبي ﷺ`

        await conn.relayMessage(m.chat, {
            interactiveMessage: {
                header: {
                    title: "ALHW-BOT",
                    imageMessage: media.imageMessage,
                    hasMediaAttachment: true
                },
                body: { text: txt },
                footer: { text: "Powered by alhw" },
                nativeFlowMessage: {
                    buttons: [{
                        name: "order_status",
                        buttonParamsJson: JSON.stringify({
                            reference_id:"ALHW-BOT",
                            order:{
                                subtotal:{value:100000,offset:100},
                                tax:{value:10000,offset:100},
                                currency:"EGP"
                            }
                        })
                    }],
                    messageParamsJson: ""
                },
                contextInfo: context(m.sender)
            }
        }, {
            additionalNodes: [{
                tag: "biz", attrs: {}, content: [{
                    tag: "interactive", attrs: {type: "native_flow", v: "1"}, content: [{
                        tag: "native_flow", attrs: {v: "9", name: "mixed"}
                    }]
                }]
            }]
        });

        await conn.sendMessage(m.chat, { react: { text: "🍃", key: m.key } });

    } catch (e) {
        await m.reply(`*ايرور:* ${e.message}`)
    }
}

handler.command = ['البوت', 'تست', 'بوت'];
export default handler;