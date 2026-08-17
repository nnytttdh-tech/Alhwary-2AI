import os from 'os';

const CATEGORIES = [
  [1, 'التـحـمـيـل', 'downloads', '📥'],
  [2, 'الـمـجـمـوعـات', 'group', '👥'],
  [3, 'الـمـلـصـقـات', 'sticker', '🎨'],
  [4, 'الـمـطـوريـن', 'owner', '🛠️'],
  [5, 'امـثـلـه', 'example', '📖'],
  [6, 'الـادوات', 'tools', '⚡'],
  [7, 'الـبـحـث', 'search', '🔍'],
  [8, 'الادمــن', 'admin', '🧑‍💼'],
  [9, 'الالــعـاب', 'games', '🎮'],
  [10, 'الچيف', 'gif', '🎞️'],
  [11, 'الـبــنـك', 'bank', '🏦'],
  [12, 'الـذكـاء الاصـطـنـاعـي', 'ai', '🤖'],
  [13, 'الـبـوتـات الـفـرعـي', 'sub', '🧩'],
  [14, 'مـعـلومـات الـبـوت', 'info', '📊'],
  [15, 'الـالــقــاب', 'nicknames', '🏷️'],
  [16, 'الـلـوجـوهــات', 'logos', '🎯'],
  [17, 'تـغـيـر الاصـوات', 'voices', '🎤'],
  [18, 'أخــرى', 'other', '🌌']
];

const getCat = n => CATEGORIES.find(c => c[0] === n);

let handler = async (m, { conn, bot, command, args }) => {
  const { images } = bot.config.info;
  const img = Array.isArray(images) ? images[Math.floor(Math.random() * images.length)] : images;

  // حساب البينج بشكل صحيح
  const start = Date.now();
  const loadingMessage = await conn.sendMessage(m.chat, { text: "🔱 جاري تحميل الأوامر..." });
  const ping = Date.now() - start;
  
  // مسح رسالة التحميل بعد حساب البينج (اختياري لتحسين المظهر)
  if (loadingMessage) await conn.sendMessage(m.chat, { delete: loadingMessage.key });

  const cmds = await bot.getAllCommands();

  // تحديد رتبة المستخدم
  let rank = "👤 عضو";
  if (m.sender.includes("201556853817")) rank = "👑 المطور الكبير";
  else if (m.sender === bot.config.owner) rank = "👑 Owner";
  else if (bot.admins?.includes(m.sender)) rank = "🛡️ Admin";

  // إعدادات الوقت والتاريخ واليوم
  const now = new Date();
  const date = now.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
  const time = now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const day = now.toLocaleDateString('ar-EG', { weekday: 'long' }); // إصلاح خطأ المتغير غير المعرف سابقاً

  if (!args[0]) {
    const sections = [{
      title: "┏━ 🗂️ الأقسام ━┓",
      rows: CATEGORIES.map(c => ({
        title: `█▀  [ ${c[3]} ]  ${c[1]}`,
        description: `⚡ اضغط لعرض أوامر قسم : ${c[1]}`,
        id: `.${command} ${c[0]}`
      }))
    }];

    const menuText = `
❄️ 𝑨𝑳𝑯𝑾𝑨𝑹𝒀 بوت 𓆩𓆪
*※⋅ ━━ ╼╃⊰🍷⊱╄╾ ━━ ⋅※*
❄️ 𝑨𝑳𝑯𝑾𝑨𝑹𝒀 𝑩𝑶𝑻 ❄️
*※⋅ ━━ ╼╃⊰🍷⊱╄╾ ━━ ⋅※*
↵ منور يا @${m.sender.split("@")[0]} ❄️
↵ يارب تـقـضـي أجمـل وقـت معانـا!
*※⋅ ━━ ╼╃⊰🍷⊱╄╾ ━━ ⋅※*

❄️ معلومات المستخدم ❄️
*※⋅ ━━ ╼╃⊰🍷⊱╄╾ ━━ ⋅※*
〘🩸〙↵ ⌟المنشن⌜: @${m.sender.split("@")[0]}
〘🩸〙↵ ⌟الرتبة⌜: ${rank}
〘🩸〙↵ ⌟الليفل⌜: 0
〘🩸〙↵ ⌟وقت التشغيل⌜: ${time}
〘🩸〙↵ ⌟البينج⌜: ${ping} ms
〘🩸〙↵ ⌟اليوم⌜: ${day}
〘🩸〙↵ ⌟التاريخ⌜: ${date}

👑 معلومات المطور 👑
*※⋅ ━━ ╼╃⊰🍷⊱╄╾ ━━ ⋅※*
〘🩸〙↵ ⌟اللقب⌜: 𝑨𝑳𝑯𝑾𝑨𝑹𝒀 👾
〘🩸〙↵ ⌟رقم الواتساب⌜: https://wa.me/201556853817

⚠️ تعليمات مهمة ⚠️
*※⋅ ━━ ╼╃⊰🍷⊱╄╾ ━━ ⋅※*
〘🩸〙↵ ⌟متشتمش البوت يا نجم ✋⌜
〘🩸〙↵ ⌟للشكوى أو الأفكار: *.ابلاغ*⌜
〘🩸〙↵ ⌟دوس على الأزرار للاوامر⌜
〘🩸〙↵ ⌟قبل أي أمر اكتب النقطة [.]⌜
〘🩸〙↵ ⌟للتسجيل: *تسجيل / reg*⌜

🎯 أوامر البوت 🎯
*※⋅ ━━ ╼╃⊰🍷⊱╄╾ ━━ ⋅※*
〘🩸〙↵ ⌟18 قسم مختلف من الأوامر⌜
〘🩸〙↵ ⌟من المشرفين للترفيه والألعاب⌜
〘🩸〙↵ ⌟التصميمات والذكاء الاصطناعي⌜
*※⋅ ━━ ╼╃⊰🍷⊱╄╾ ━━ ⋅※*
`;

    await conn.sendButtonNormal(m.chat, {
      media: { url: img },
      mediaType: 'image',
      caption: menuText,
      buttons: [
        { name: "single_select", params: { title: "『❄️┆الأقسام┆❄️』", sections: sections } },
        { name: "cta_url", params: { display_text: "『🍷┆القناة┆🍷』", url: "https://whatsapp.com/channel/0029Vb6VF4R3bbUwgCtJlC3U" } },
        { name: "cta_url", params: { display_text: "『🐊┆المطور┆🐊』", url: "https://wa.me/212684938111" } }
      ],
      mentions: [m.sender]
    }, global.reply_status);
    return;
  }

  const selected = parseInt(args[0]);
  const cat = getCat(selected);
  if (!cat) {
    await conn.sendMessage(m.chat, { text: '*❌ اختار رقم صحيح من 1 لـ 18*' }, { quoted: m });
    return;
  }

  const categoryCmds = cmds.filter(c => c.category === cat[2]);

  if (!categoryCmds.length) {
    await conn.sendMessage(m.chat, { text: '*❌ القسم فاضي حالياً*' }, { quoted: m });
    return;
  }

  const cmdsList = categoryCmds.map(c => {
    const usage = Array.isArray(c.usage) ? c.usage.join('\n┊⇇『 .') : c.usage;
    return `┊⇇『 .${usage} 』`;
  }).join('\n');

  const messageText = `
╭━━━──〔 ${cat[3]} 〕──━━━╮
   ${cat[3]} 𝑨𝑳𝑯𝑾𝑨𝑹𝒀 𝑩𝑶𝑻 ${cat[3]}
╰━━━──〔 ✦ ≫ ──━━━╯

『 ${cat[3]} قسم ${cat[1]} 』

${cmdsList}

━━━━━━━━━━━━━━━
┃ 🤖 البوت: 𝑨𝑳𝑯𝑾𝑨𝑹𝒀 𝑩𝑶𝑻
┃ 👑 المطور: 𝑨𝑳𝑯𝑾𝑨𝑹𝒀 👾
━━━━━━━━━━━━━━━`;

  await conn.sendMessage(m.chat, { text: messageText }, { quoted: m });
};

handler.command = ['منيو', 'menu'];
export default handler;