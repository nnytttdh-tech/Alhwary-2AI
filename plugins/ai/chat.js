// Created by ALHWARY Dev
import axios from 'axios';

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        return conn.sendMessage(m.chat, { text: `❌ عَفْوًا يا صَاحِبِي، كُتِبَ سُؤَالُكَ بَعْدَ الْأَمـْࢪِ. *مـِثَال:* ${usedPrefix + command} شَكُونـْ أَنـْتَ؟` }, { quoted: m });
    }

    await conn.sendMessage(m.chat, { text: ' *انـتظࢪ قليلاً، الـبـوت سيأتيك بالجواب... 🔄*' }, { quoted: m });

    const maxRetries = 10;
    let success = false;
    let aiReply = '';

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const apiUrl = `https://nour-deepseek-api.vercel.app/chat?message=${encodeURIComponent(text)}`;
            const response = await axios.get(apiUrl, { timeout: 10000 });

            if (response.data && response.data.success && response.data.reply) {
                aiReply = response.data.reply;
                success = true;
                break;
            } else {
                throw new Error("الـ API ࢪجعات داتا نـاقصة أو خاوية");
            }
        } catch (error) {
            console.error(`❌ المـحاولة ࢪقمـ [${attempt}] فشلت:`, error.message);
           
        }
    }

    if (success) {
        const finalMessage = `*╮──══─┈•⤣⚡⤤•┈─══─╭*\n> ${aiReply}\n*╯──══─┈•⤣⚡⤤•┈─══─╰*\n> 𝐶𝑜𝑚𝑚𝑎𝑛𝑑 𝑏𝑦 ⏤͟͟͞͞𝐴𝐿𝐻𝑊𝐴𝑅𝑌 𝑑𝑒𝑣 🦇🤍`;
        await conn.sendMessage(m.chat, { text: finalMessage }, { quoted: m });
    } else {
        await conn.sendMessage(m.chat, { text: `❌ عذࢪًا، فشلت جمـيع المـحاولات الـ 10 بسبب مـشاكل في السيࢪفࢪ.\nE R R O R ✨🪦` }, { quoted: m });
    }
};

handler.help = ['𝐴𝐿𝐻𝑊𝐴𝑅𝑌'];
handler.tags = ['ai'];
handler.command = /^(deepseek|ds|ديب-سيك)$/i;

export default handler;