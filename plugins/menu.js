const CATEGORIES = [
    [1, 'التـحـمـيـل', 'downloads', '📥'],
    [2, 'الـمـجـمـوعـات', 'group', '👥'],
    [3, 'الـمـلـصـقـات', 'sticker', '🎨'],
    [4, 'الـمـطـوريـن', 'owner', '👑'],
    [5, 'الـأدوات', 'tools', '🛠️'],
    [6, 'الـبـحـث', 'search', '🔍'],
    [7, 'الـأدمــن', 'admin', '🛡️'],
    [8, 'الـألــعـاب', 'games', '🎮'],
    [9, 'الـچـيـف', 'gif', '🎬'],
    [10, 'الـبــنـك', 'bank', '💳'],
    [11, 'الـذكـاء الاصـطـنـاعـي', 'ai', '🧠'],
    [12, 'الـبـوتـات الـفـرعـيـة', 'sub', '🤖'],
    [13, 'مـعـلـومـات الـبـوت', 'info', 'ℹ️'],
    [14, 'الـألــقــاب', 'nicknames', '🏷️'],
    [15, 'الـلـوجـوهــات', 'logos', '💎'],
    [16, 'تـغـيـر الاصـوات', 'voices', '🎙️'],
    [17, 'أخــرى', 'other', '🔮']
];

const getCat = n => CATEGORIES.find(c => c[0] === n);

const IMAGE_URL = "https://j.top4top.io/p_3894432qz0.jpg";

const context = (jid) => ({
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
});

async function handler(m, { conn, bot, command, args }) {
    const selected = parseInt(args[0]);
    const now = new Date();

    const uptimeSeconds = process.uptime();
    const hours = Math.floor(uptimeSeconds / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    const seconds = Math.floor(uptimeSeconds % 60);
    const uptimeFormatted = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    const date = now.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
    const time = now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    if (!selected && !args[0]) {
        const sections = [{
            title: "𓆩⚡ الأقسام المتاحة ⚡𓆪",
            rows: CATEGORIES.map(c => ({
                title: `${c[3]} ┃ ${c[1]}`,
                description: `⇜ اضغط لعرض أوامر قسم ${c[1]} ⇝`,
                id: `.${command} ${c[0]}`
            }))
        }];

        const menuText = `
*╭━━━ 𝑨𝑳𝑯𝑾𝑨𝑹𝒀  ━━━°⃟⚡*
> °⃟⚡ *المستخدم:* @${m.sender.split("@")[0]}
> °⃟⚡ *التشغيل:* ${uptimeFormatted}
> °⃟⚡ *التاريخ:* ${date}
> °⃟⚡ *الوقت:* ${time}
*╰━━━ 𝑨𝑳𝑯𝑾𝑨𝑹𝒀  ━━━°⃟⚡*

> *𝐎𝐖𝐍𝐄𝐑: 𝑨𝑳𝑯𝑾𝑨𝑹𝒀 👑*

*╭━━━━━━━━━━°⃟⚡*
 *〔 أهـلاً بـك في بوت  الـهـواري ⚡ 〕*
 *〔 صلي علي النبي🌺 〕*
*╰━━━━━━━━━━°⃟⚡*

> ⚡ 𝑨𝑳𝑯𝑾𝑨𝑹𝒀 — 𝑺𝒀𝑺𝑻𝑬𝑴 𝑶𝑵𝑳𝑰𝑵𝑬
   `.trim();

        await conn.sendButtonNormal(m.chat, {
            media: { url: IMAGE_URL },
            mediaType: 'image',
            caption: menuText,
            buttons: [
                {
                    name: "single_select",
                    params: {
                        title: "𓆩⚡┇ الأقسام ┇⚡𓆪",
                        sections: sections
                    }
                },
                {
                    name: "cta_url",
                    params: {
                        display_text: "「 هہ‏‏وآريـﮯ 」",
                        url: "https://wa.me/201556853817"
                    }
                },
                {
                    name: "cta_url",
                    params: {
                        display_text: "「  القناة  」",
                        url: "https://whatsapp.com/channel/0029Vb6VF4R3bbUwgCtJlC3U"
                    }
                }
            ],
            mentions: [m.sender],
            newsletter: {
                name: 'آلهہ‏‏وآريـﮯ',
                jid: '01556853817@newsletter'
            }
        }, global.reply_status || m);
        return;
    }

    const cat = getCat(selected);
    if (!cat) {
        await conn.sendMessage(m.chat, { text: `╭─❖ تنبيه ❖─╮\n⚠️ الرجاء اختيار رقم قسم صحيح من 1 إلى ${CATEGORIES.length}\n╰────────────╯`, contextInfo: context(m.sender) }, { quoted: m });
        return;
    }

    const cmds = await bot.getAllCommands();
    const categoryCmds = cmds.filter(c => c.category === cat[2]);

    if (!categoryCmds.length) {
        await conn.sendMessage(m.chat, { text: `╭─❖ تنبيه ❖─╮\n⚠️ هذا القسم لا يحتوي على أوامر حالياً.\n╰────────────╯`, contextInfo: context(m.sender) }, { quoted: m });
        return;
    }

    const cmdsList = categoryCmds.map(c => {
        if (Array.isArray(c.usage)) {
            return `┃ ${cat[3]} ／${c.usage.join(`\n┃ ${cat[3]} ／`)}`;
        }
        return `┃ ${cat[3]} ／${c.usage || c.name || 'command'}`;
    }).join('\n');

    await conn.sendMessage(m.chat, { text: `
*╭━━━ 𓆩 ${cat[3]} 𓆪 قسم： ${cat[1]} ━━━°⃟⚡*
┃
${cmdsList}
┃
*╰━━━━━━━━━━━━━━━━━━━°⃟⚡*
   ✦ رَبَّنَا اغْفِرْ لَنَا وَلِإِخْوَانِنَا ✦`.trim(), contextInfo: context(m.sender) }, { quoted: m });
}

handler.command = ['اوامر', 'أوامر', 'الاوامر', 'm', 'menu'];
export default handler;