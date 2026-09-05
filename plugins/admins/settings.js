// ============================================================
// نظام التفعيل — نسخة برو مقسّمة بالأقسام
// محوّل لهيكل بوت 𓆩 𝑨𝑳𝑯𝑾𝑨𝑹𝒀 𓆪
// نفس الوظيفة بالظبط، بس بقوائم منظمة بدل أزرار مبعثرة
// ============================================================

const IMAGE_URL = "https://j.top4top.io/p_3894432qz0.jpg";

function statusIcon(isOn) {
    return isOn ? '🟢 مفعّل' : '🔴 متوقف';
}

function box(...lines) {
    return `*╭━━━ ⚙️ نتيجة العملية ━━━°⃟⚡*\n${lines.map(l => `┃ ${l}`).join('\n')}\n*╰━━━━━━━━━━━━━━━━━━━°⃟⚡*`;
}

async function sendMainPanel(conn, m, command) {
    const g = global.db.groups[m.chat] || {};
    const noSub = !!global.db.noSub;
    const ownerOnly = !!global.db.ownerOnly;
    const devMode = !!global.db.dev;

    const sections = [
        {
            title: '🤖 البوتات الفرعية',
            rows: [
                { title: `تشغيل التنصيب — ${statusIcon(!noSub)}`, description: 'يسمح للجميع بتنصيب بوتات فرعية', id: `.${command} تشغيل_الفرعي` },
                { title: `إيقاف التنصيب — ${statusIcon(!noSub)}`, description: 'يمنع تنصيب بوتات فرعية جديدة', id: `.${command} ايقاف_الفرعي` }
            ]
        },
        {
            title: '👋 الترحيب بالأعضاء',
            rows: [
                { title: `تشغيل الترحيب — ${statusIcon(!g.noWelcome)}`, description: 'البوت يرحب بالأعضاء الجدد', id: `.${command} تشغيل_الترحيب` },
                { title: `إيقاف الترحيب — ${statusIcon(!g.noWelcome)}`, description: 'البوت يبطل الترحيب', id: `.${command} ايقاف_الترحيب` }
            ]
        },
        {
            title: '🛡️ وضع الأدمن',
            rows: [
                { title: `تفعيل وضع الأدمن — ${statusIcon(g.adminOnly)}`, description: 'البوت يتفاعل مع المشرفين فقط', id: `.${command} تشغيل_الادمن` },
                { title: `فك وضع الأدمن — ${statusIcon(g.adminOnly)}`, description: 'البوت يتفاعل مع الجميع', id: `.${command} ايقاف_الادمن` }
            ]
        },
        {
            title: '💎 صلاحية المطور',
            rows: [
                { title: `مطور فقط — ${statusIcon(ownerOnly)}`, description: 'البوت يتفاعل مع المطورين فقط', id: `.${command} مطور_فقط` },
                { title: `مطور عام — ${statusIcon(ownerOnly)}`, description: 'البوت يتفاعل مع الجميع', id: `.${command} مطور_عام` }
            ]
        },
        {
            title: '🔗 مضاد الروابط',
            rows: [
                { title: `تشغيل مضاد الروابط — ${statusIcon(g.antiLink)}`, description: 'حذف أي رابط تلقائيًا', id: `.${command} تشغيل_مضاد_الروابط` },
                { title: `إيقاف مضاد الروابط — ${statusIcon(g.antiLink)}`, description: 'عدم حذف الروابط', id: `.${command} ايقاف_مضاد_الروابط` }
            ]
        },
        {
            title: '🔒 الخصوصية (الخاص)',
            rows: [
                { title: `خاص للمطورين فقط — ${statusIcon(devMode)}`, description: 'الخاص متاح للمطورين فقط', id: `.${command} ايقاف_خاص` },
                { title: `خاص للجميع — ${statusIcon(devMode)}`, description: 'الخاص متاح للجميع', id: `.${command} تشغيل_خاص` }
            ]
        }
    ];

    await conn.sendButtonNormal(m.chat, {
        media: { url: IMAGE_URL },
        mediaType: 'image',
        caption: `*╭━━━ ⚙️ نظام التفعيل ━━━°⃟⚡*\n┃ دوس على أي إعداد عشان تغيّر حالته\n┃ 🟢 = مفعّل حاليًا · 🔴 = متوقف حاليًا\n*╰━━━━━━━━━━━━━━━━━━━°⃟⚡*`,
        buttons: [{
            name: "single_select",
            params: { title: '⚙️ إعدادات البوت', sections }
        }],
        mentions: [m.sender],
        newsletter: {
            name: '𓆩 𝑨𝑳𝑯𝑾𝑨𝑹𝒀 𓆪',
            jid: '1556853817@newsletter'
        }
    }, m);
}

async function handler(m, { conn, command, args }) {
    const chatId = m.chat;
    const subCmd = args[0]?.toLowerCase();

    if (!global.db.groups[chatId]) global.db.groups[chatId] = {};

    if (!subCmd) {
        await sendMainPanel(conn, m, command);
        return;
    }

    let result;

    switch (subCmd) {
        case 'ايقاف_الفرعي':
            if (!m.isOwner) { result = box('⛔ الأمر ده بس لـ المطور'); break; }
            global.db.noSub = true;
            result = box('🌑 تم إيقاف تنصيب البوتات الفرعية', 'ماحدش هيعرف يستخدم أمر تنصيب تاني');
            break;

        case 'تشغيل_الفرعي':
            if (!m.isOwner) { result = box('⛔ الأمر ده بس لـ المطور'); break; }
            global.db.noSub = false;
            result = box('🌕 تم تشغيل تنصيب البوتات الفرعية', 'دلوقتي الكل يقدر يستخدم البوتات الفرعية');
            break;

        case 'ايقاف_الترحيب':
            if (!m.isOwner && !m.isAdmin) { result = box('🛑 الأمر ده للمشرفين فقط'); break; }
            global.db.groups[chatId].noWelcome = true;
            result = box('🔕 تم تفعيل وضع عدم الترحيب', 'البوت هيبطل يرحب بالأعضاء');
            break;

        case 'تشغيل_الترحيب':
            if (!m.isOwner && !m.isAdmin) { result = box('🛑 الأمر ده للمشرفين فقط'); break; }
            global.db.groups[chatId].noWelcome = false;
            result = box('🔔 تم تفعيل وضع الترحيب', 'البوت يرحب بالأعضاء');
            break;

        case 'تشغيل_الادمن':
            if (!m.isOwner && !m.isAdmin) { result = box('🛑 الأمر ده للمشرفين فقط'); break; }
            global.db.groups[chatId].adminOnly = true;
            result = box('🛡️ تم تفعيل وضع الأدمن', 'البوت سيتفاعل مع المشرفين فقط');
            break;

        case 'ايقاف_الادمن':
            if (!m.isOwner && !m.isAdmin) { result = box('🛑 الأمر ده للمشرفين فقط'); break; }
            global.db.groups[chatId].adminOnly = false;
            result = box('🧑‍🤝‍🧑 تم فك وضع الأدمن', 'البوت سيتفاعل مع جميع الأعضاء');
            break;

        case 'مطور_فقط':
            if (!m.isOwner) { result = box('⛔ الأمر ده للمطور فقط'); break; }
            global.db.ownerOnly = true;
            result = box('💎 تم تفعيل وضع المطور فقط', 'البوت سيتفاعل مع المطورين فقط');
            break;

        case 'مطور_عام':
            if (!m.isOwner) { result = box('⛔ الأمر ده للمطور فقط'); break; }
            global.db.ownerOnly = false;
            result = box('🌐 تم تفعيل وضع المطور العام', 'البوت سيتفاعل مع الجميع');
            break;

        case 'تشغيل_مضاد_الروابط':
            if (!m.isOwner && !m.isAdmin) { result = box('🛑 الأمر ده للمشرفين فقط'); break; }
            global.db.groups[chatId].antiLink = true;
            result = box('⛔ تم تفعيل مضاد الروابط', 'البوت هيحذف أي رابط');
            break;

        case 'ايقاف_مضاد_الروابط':
            if (!m.isOwner && !m.isAdmin) { result = box('🛑 الأمر ده للمشرفين فقط'); break; }
            global.db.groups[chatId].antiLink = false;
            result = box('🔗 تم إيقاف مضاد الروابط', 'البوت مايحذفش الروابط');
            break;

        case 'ايقاف_خاص':
            if (!m.isOwner) { result = box('⛔ الأمر ده للمطورين فقط'); break; }
            global.db.dev = true;
            result = box('🔒 تم إيقاف الخاص للمستخدمين', 'فقط المطورين يقدروا يستخدموه خاص');
            break;

        case 'تشغيل_خاص':
            if (!m.isOwner) { result = box('⛔ الأمر ده للمطورين فقط'); break; }
            global.db.dev = false;
            result = box('🔓 تم تشغيل البوت خاص للكل');
            break;

        default:
            await sendMainPanel(conn, m, command);
            return;
    }

    if (result) {
        await conn.sendMessage(m.chat, { text: result }, { quoted: m });
    }
}

handler.help = ['تفعيل'];
handler.category = 'admin';
handler.command = ['تفعيل'];

export default handler;
