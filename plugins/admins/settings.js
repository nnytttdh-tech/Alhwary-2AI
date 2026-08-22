async function handler(m, { conn, command, args }) {
    const chatId = m.chat;
    const subCmd = args[0]?.toLowerCase();
    const menu = `
╭─❖⋆⋅⋆  ⋆⋅⋆❖─╮
│ ✦ *نظام التفعيل * ✦
│    🫣 هواري بيقولك بحبك  
╰─❖⋆⋅⋆  ⋆⋅⋆❖─╯
`;
    if (!subCmd) {
        await conn.sendButton(m.chat, {
            bodyText:  menu,
            footerText: "O̷W̷N̷E̷R̷ | ڵــﮪــﯡٰڕې",
            buttons: [
    { name: "quick_reply", params: { display_text: "🌑 ايقاف التنصيب (البوتات الفرعي)", id: ".تفعيل ايقاف_الفرعي" } },
    { name: "quick_reply", params: { display_text: "🌕 تشغيل التنصيب", id: ".تفعيل تشغيل_الفرعي" } },
    { name: "quick_reply", params: { display_text: "🔕 ايقاف الترحيب", id: ".تفعيل ايقاف_الترحيب" } },
    { name: "quick_reply", params: { display_text: "🔔 تشغيل الترحيب", id: ".تفعيل تشغيل_الترحيب" } },
    { name: "quick_reply", params: { display_text: "🛡️ تشغيل الادمن", id: ".تفعيل تشغيل_الادمن" } },
    { name: "quick_reply", params: { display_text: "🧑‍🤝‍🧑 ايقاف الادمن", id: ".تفعيل ايقاف_الادمن" } },
    { name: "quick_reply", params: { display_text: "💎 مطور فقط", id: ".تفعيل مطور_فقط" } },
    { name: "quick_reply", params: { display_text: "🌐 مطور عام", id: ".تفعيل مطور_عام" } },
    { name: "quick_reply", params: { display_text: "⛔ تشغيل مضاد الروابط", id: ".تفعيل تشغيل_مضاد_الروابط" } },
    { name: "quick_reply", params: { display_text: "🔗 ايقاف مضاد الروابط", id: ".تفعيل ايقاف_مضاد_الروابط" } },
    { name: "quick_reply", params: { display_text: "🔒 تشغيل خاص لـ المطورين فقط", id: ".تفعيل ايقاف_خاص" } },
    { name: "quick_reply", params: { display_text: "🔓 ايقاف التشغيل خاص لـ المطورين فقط", id: ".تفعيل تشغيل_خاص" } }
],
          mentions: [m.sender],
  newsletter: {
      name: 'O̷W̷N̷E̷R̷ | ڵــﮪــﯡٰڕې',
      jid: '201556853817@newsletter'
    },
  interactiveConfig: {
    buttons_limits: 1, // لازم تبقي واحد
    list_title: "Available Options",
    button_title: "Click Here",
    canonical_url: "https://example.com"
  }
        }, m);
        return;
    }

    let result;

    switch (subCmd) {
    case 'ايقاف_الفرعي':
            if (!m.isOwner) {
                result = '「 ⛔ 」*الأمر ده بس لـ المطور*';
                break;
            }
            global.db.noSub = true;
            result = '╭─❖ 🌑 ❖─╮\n*تم ايقاف تنصيب البوتات الفرعيه*\n↳ ماحدش هيعرف يستخدم امر تنصيب تاني\n╰─────────╯';
            break;

        case 'تشغيل_الفرعي':
            if (!m.isOwner) {
                result = '「 ⛔ 」*الأمر ده بس لـ المطور*';
                break;
            }
            global.db.noSub = false;
            result = '╭─❖ 🌕 ❖─╮\n*تم تشغيل تنصيب البوتات الفرعيه*\n↳ دلوقتي الكل يقدر يستخدم البوتات الفرعيه\n╰─────────╯';
            break;
        case 'ايقاف_الترحيب':
            if (!m.isOwner && !m.isAdmin) {
                result = '「 🛑 」*هذا الأمر للمشرفين فقط*';
                break;
            }
            global.db.groups[chatId].noWelcome = true;
            result = '╭─❖ 🔕 ❖─╮\n*تم تفعيل وضع عدم الترحيب*\n↳ البوت هيبطل يرحب بالاعضاء\n╰─────────╯';
            break;

        case 'تشغيل_الترحيب':
            if (!m.isOwner && !m.isAdmin) {
                result = '「 🛑 」*هذا الأمر للمشرفين فقط*';
                break;
            }
            global.db.groups[chatId].noWelcome = false;
            result = '╭─❖ 🔔 ❖─╮\n*تم تفعيل وضع الترحيب*\n↳ البوت يرحب بالاعضاء\n╰─────────╯';
            break;

        case 'تشغيل_الادمن':
            if (!m.isOwner && !m.isAdmin) {
                result = '「 🛑 」*هذا الأمر للمشرفين فقط*';
                break;
            }
            global.db.groups[chatId].adminOnly = true;
            result = '╭─❖ 🛡️ ❖─╮\n*تم تفعيل وضع الادمن*\n↳ البوت سيتفاعل مع المشرفين فقط\n╰─────────╯';
            break;

        case 'ايقاف_الادمن':
            if (!m.isOwner && !m.isAdmin) {
                result = '「 🛑 」*هذا الأمر للمشرفين فقط*';
                break;
            }
            global.db.groups[chatId].adminOnly = false;
            result = '╭─❖ 🧑‍🤝‍🧑 ❖─╮\n*تم فك وضع الادمن*\n↳ البوت سيتفاعل مع جميع الأعضاء\n╰─────────╯';
            break;

        case 'مطور_فقط':
            if (!m.isOwner) {
                result = '「 ⛔ 」*هذا الأمر للمطور فقط*';
                break;
            }
            global.db.ownerOnly = true;
            result = '╭─❖ 💎 ❖─╮\n*تم تفعيل وضع المطور فقط*\n↳ البوت سيتفاعل مع المطورين فقط\n╰─────────╯';
            break;

        case 'مطور_عام':
            if (!m.isOwner) {
                result = '「 ⛔ 」*هذا الأمر للمطور فقط*';
                break;
            }
            global.db.ownerOnly = false;
            result = '╭─❖ 🌐 ❖─╮\n*تم تفعيل وضع المطور العام*\n↳ البوت سيتفاعل مع الجميع\n╰─────────╯';
            break;

        case 'تشغيل_مضاد_الروابط':
            if (!m.isOwner && !m.isAdmin) {
                result = '「 🛑 」*هذا الأمر للمشرفين فقط*';
                break;
            }
            global.db.groups[chatId].antiLink = true;
            result = '╭─❖ ⛔ ❖─╮\n*تم تفعيل مضاد الروابط*\n↳ البوت هيحذف أي رابط\n╰─────────╯';
            break;

        case 'ايقاف_مضاد_الروابط':
            if (!m.isOwner && !m.isAdmin) {
                result = '「 🛑 」*هذا الأمر للمشرفين فقط*';
                break;
            }
            global.db.groups[chatId].antiLink = false;
            result = '╭─❖ 🔗 ❖─╮\n*تم ايقاف مضاد الروابط*\n↳ البوت مايحذفش الروابط\n╰─────────╯';
            break;
            case 'ايقاف_خاص':
            if (!m.isOwner) {
                result = '「 ⛔ 」*هذا الأمر للمطورين فقط*';
                break;
            }
            global.db.dev = true;
            result = '╭─❖ 🔒 ❖─╮\n*تم ايقاف الخاص للمستخدمين*\n↳ فقط المطورين يقدروا يستحدموه خاص\n╰─────────╯';
            break;
            case 'تشغيل_خاص':
            if (!m.isOwner) {
                result = '「 ⛔ 」*هذا الأمر للمطورين فقط*';
                break;
            }
            global.db.dev = false;
            result = '╭─❖ 🔓 ❖─╮\n*تم تشغيل البوت خاص ل الكل*\n↳ كله دلوقت يقدر يستخدم البوت خاص\n╰─────────╯';
            break;
        default:
            return m.reply("╭─❖⋆⋅⋆ 🕸️ ⋆⋅⋆❖─╮\n│ ✦ *نظام التفعيل والتشغيل* ✦\n│\n│ 🔕 ايقاف_الترحيب\n│ 🔔 تشغيل_الترحيب\n│ 🛡️ تشغيل_الادمن\n│ 🧑‍🤝‍🧑 ايقاف_الادمن\n│ 💎 مطور_فقط\n│ 🌐 مطور_عام\n│ ⛔ تشغيل_مضاد_الروابط\n│ 🔗 ايقاف_مضاد_الروابط\n╰─❖⋆⋅⋆ 🕸️ ⋆⋅⋆❖─╯");
    }

    if (result) {
        m.reply(result);
    }
};

handler.usage = ['تفعيل'];
handler.category = 'admin';
handler.command = ['تفعيل'];

export default handler;
