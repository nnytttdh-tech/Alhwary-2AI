import { generateWAMessageFromContent, proto } from '@whiskeysockets/baileys';

async function handler(m, { conn }) {
    await conn.sendMessage(m.chat, { react: { text: "⚡", key: m.key } });

    if (!m.quoted) {
        return m.reply("⚠️ *يرجى الرد على الرسالة المراد استخراج كود الـ Eval والتفاصيل لها!*");
    }

    try {
        const quoted = m.quoted;
        const rawMessage = quoted.message || { conversation: quoted.text || "" };
        const mtype = quoted.mtype || 'unknown';
        const sender = quoted.sender ? quoted.sender.split('@')[0] : 'unknown';

        // 1. بناء هيكل كود الـ Eval المباشر لـ relayMessage
        const evalCode = `=> conn.relayMessage(\n  m.chat,\n  ${JSON.stringify(rawMessage, null, 2)},\n  { quoted: m }\n)`;

        // 2. إعداد الحامل الداخلي للبيانات المنسقة (Unified Response Payload)
        const responseData = {
            response_id: `crm-${Date.now()}`,
            sections: [
                {
                    view_model: {
                        primitive: {
                            text: "# ⚡ Relay Snippet",
                            __typename: "GenAIMarkdownTextUXPrimitive"
                        },
                        __typename: "GenAISingleLayoutViewModel"
                    }
                },
                {
                    view_model: {
                        primitive: {
                            text: `• Type     : ${mtype}\n• Source   : store\n• Chat     : ${m.chat}\n• ID       : ${quoted.id || 'N/A'}\n• Sender   : ${sender}\n• Children : 0`,
                            __typename: "GenAIMetadataTextPrimitive"
                        },
                        __typename: "GenAISingleLayoutViewModel"
                    }
                },
                {
                    __typename: "GenAIUnifiedResponseSection",
                    view_model: {
                        primitives: [
                            {
                                prompt_text: mtype,
                                prompt_type: "SUGGESTED_PROMPT",
                                __typename: "GenAIFollowUpSuggestionPillPrimitive"
                            },
                            {
                                prompt_text: m.chat,
                                prompt_type: "SUGGESTED_PROMPT",
                                __typename: "GenAIFollowUpSuggestionPillPrimitive"
                            },
                            {
                                prompt_text: quoted.id || "ID",
                                prompt_type: "SUGGESTED_PROMPT",
                                __typename: "GenAIFollowUpSuggestionPillPrimitive"
                            }
                        ],
                        __typename: "GenAIHScrollLayoutViewModel"
                    }
                },
                {
                    view_model: {
                        primitive: {
                            language: "javascript",
                            code_blocks: [
                                {
                                    content: evalCode,
                                    type: "DEFAULT"
                                }
                            ],
                            __typename: "GenAICodeUXPrimitive"
                        },
                        __typename: "GenAISingleLayoutViewModel"
                    }
                }
            ]
        };

        // 3. تحويل الكائن إلى Base64 Buffer لتأطيره في واجهة AI
        const base64Data = Buffer.from(JSON.stringify(responseData)).toString('base64');

        // 4. بناء هيكل الرسالة النهائي الموجه للتمرير الفوري
        const messagePayload = {
            messageContextInfo: {
                deviceListMetadata: {},
                deviceListMetadataVersion: 2,
                botMetadata: {
                    messageDisclaimerText: "",
                    botResponseId: `bot-${Date.now()}`,
                    verificationMetadata: {
                        proofs: [
                            {
                                version: 1,
                                useCase: 1,
                                signature: "TklYRUwuTWVzc2FnZUJ1aWxkZXJWNC43LVZlcmlmaWNhdGlvblNpZ25hdHVyZS5NZXRhZGF0YW30XLufHVxVkA==",
                                certificateChain: [
                                    "TklYRUwuTWVzc2FnZUJ1aWxkZXJWNC43LUNlcnRpZmljYXRlQ2hhaW4uTWV0YWRhdGFuihSnY6RDKQaGBUoTJBfi6IIxPkp6ztn4UWjwWhsumU37CmEEU8uppcM/6EdDYL0laaGbxIIfv/Sf8Tx3wGvvt2JJ72DDdpi6eSRqHP7uvPQaIPCfblDzroM1yJ5sEWUgfMJDovCbFi2bxwfyiHDklpYCGws8EiysKXPBcuKEzUED3t6tnpAIcRo26oOHwstUZ4lg9jcgQ3FHplJjMtlSg2dvrCVKGIiTCKm8ZhKX+ygPSBeKaNAj4tTkUmex1NPHXcwbcVw02xjNm5bgV47e82sn51LrNoCUU+H5bGDo2a/v8HZx3RXUL/d7a++Z6BDnTo87/evXQNFHWz+eSR34X+Cmk88BcdLtIFIV1yWrlV/z352yFWXVSitNWskMH3HAWuKiQU9J/Y6XFH5cpkU3NyZPxPRSil/IukYMe1lIRa6zKFDj02fbMbsXk1IYeMntSThHa9Vmc7Sizzx5/7Md/iO+Kjs98ffIK5QikzRYSaN7DiihTyTP+J8zNloLKegIbUV8PDI/Kt2BCuaV0i9xwgvect7gew37/ifeg2u8BDJQMPgWp2E10U8lqMwYzSH/qK5/75kjXdyGQG2FurqYXMPsGoIENKM8hIbqjHvXC+HjNI7qK4EbvaglSux6Oi199qgzSqvsLN8eJivdAKlo/YELfMSOT1pPU1O6QNfAO4XH83AXl4+onvra5Ul7hOiryjYTepBXwbLE5nAPsD37zD0sF0IoJIm2H5TA5Pk9xaWtwRjzOBrtrI6c0hIcE+yi3LmHYxr0Fw1l6EBdGI/K6N3lf73thJZQjcCo3a/7cAXOp9GDsMH2jCka6cvKaqGWxSMUh6JvVGl/"
                                ]
                            }
                        ]
                    }
                }
            },
            botForwardedMessage: {
                message: {
                    richResponseMessage: {
                        messageType: 1,
                        unifiedResponse: {
                            data: base64Data
                        },
                        contextInfo: {
                            stanzaId: m.key.id,
                            participant: m.sender,
                            quotedMessage: quoted.message,
                            forwardingScore: 1,
                            isForwarded: true,
                            forwardedAiBotMessageInfo: {
                                botJid: "867051314767696@bot"
                            },
                            forwardOrigin: 4,
                            quotedType: 0
                        }
                    }
                }
            }
        };

        const extraNodes = {
            additionalNodes: [
                {
                    tag: "biz",
                    attrs: {},
                    content: [
                        {
                            tag: "interactive",
                            attrs: { type: "native_flow", v: "1" },
                            content: [
                                {
                                    tag: "native_flow",
                                    attrs: { v: "9", name: "mixed" }
                                }
                            ]
                        }
                    ]
                }
            ]
        };

        // 5. إرسال الرسالة باستخدام relayMessage
        await conn.relayMessage(m.chat, messagePayload, extraNodes);
        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

    } catch (error) {
        console.error(error);
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        m.reply(`❌ حدث خطأ أثناء استخراج الـ Snippet: ${error.message}`);
    }
}

handler.command = ['crm', 'snip', 'toeval2'];
handler.category = 'tools';
export default handler;