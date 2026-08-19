import fs from "fs";
import path from "path";

const group = async (ctx, event, eventType) => {
    try {
        if (!event?.participants) return null;

        const participants = event.participants.filter(p => p?.phoneNumber).map(p => p.phoneNumber);
        const author = event.author;
        let txt;

        const users = participants.length 
            ? participants.map(p => '@' + p.split('@')[0]).join(' و ') 
            : 'محدش';
        const authorTag = author ? '@' + author.split('@')[0] : 'غير معروف';

        const messages = {
            add: `⌢̆̈⌢̆̈⌢̆̈⌢̆̈⌢̆̈⌢̆̈⌢̆̈
✦  أهـلاً وسـهـلاً  ✦
⌣̈⌣̈⌣̈⌣̈⌣̈⌣̈⌣̈

مـنـور الجروب يا ${users} 🌙
${authorTag === users ? "" : `‏‏‎ ‎‏‏‎ ‎بدعوة من ${authorTag} ✦`}`,

            remove: `⌢̆̈⌢̆̈⌢̆̈⌢̆̈⌢̆̈⌢̆̈⌢̆̈
✦  وداعـًا  ✦
⌣̈⌣̈⌣̈⌣̈⌣̈⌣̈⌣̈

${users} خرج من الجروب 🥀
${authorTag === users ? "" : `‏‏‎ ‎‏‏‎ ‎بواسطة ${authorTag} ✦`}`,

            promote: `⌢̆̈⌢̆̈⌢̆̈⌢̆̈⌢̆̈⌢̆̈⌢̆̈
✦  تـرقـيـة إدارة  ✦
⌣̈⌣̈⌣̈⌣̈⌣̈⌣̈⌣̈

مـبـروك يا ${users} بقيت أدمن 👑
‏‏‎ ‎‏‏‎ ‎بواسطة ${authorTag} ✦`,

            demote: `⌢̆̈⌢̆̈⌢̆̈⌢̆̈⌢̆̈⌢̆̈⌢̆̈
✦  سـحـب إدارة  ✦
⌣̈⌣̈⌣̈⌣̈⌣̈⌣̈⌣̈

${users} بقى عضو عادي 🍂
‏‏‎ ‎‏‏‎ ‎بواسطة ${authorTag} ✦`
        };

        txt = messages[eventType];
        if (!txt) return null;

        if (global.db.groups[event.chat].noWelcome === true) return 9999;

        const img = ["remove", "add"].includes(eventType) 
            ? (event.userUrl || "https://files.catbox.moe/hm9iq4.jpg") 
            : "https://files.catbox.moe/hm9iq4.jpg";

        await ctx.sock.msgUrl(event.chat, txt, {
            img,
            title: ctx.config?.info.nameBot || "WhatsApp Bot",
            body: "𝐴 𝑠𝑖𝑚𝑝𝑙𝑒 𝑊𝒉𝑎𝑡𝑠𝐴𝑝𝑝 𝑏𝑜𝑡 𝑓𝑜𝑟 𝑏𝑒𝑔𝑖𝑛𝑛𝑒𝑟𝑠, 𝑏𝑦 O̷W̷N̷E̷R̷ | ڵــﮪــﯡٰڕې",
            mentions: author ? [author, ...participants] : participants,
            newsletter: {
                name: 'O̷W̷N̷E̷R̷ | ڵــﮪــﯡٰڕې',
                jid: '201556853817@newsletter'
            },
            big: ["remove", "add"].includes(eventType)
        });

    } catch (e) {
        console.error(e);
    }
    return null;
};

const access = async (msg, checkType, time) => {
    const conn = await msg.client();

    const quoted = {
        key: {
            participant: `${msg.sender.split('@')[0]}@s.whatsapp.net`,
            remoteJid: 'status@broadcast',
            fromMe: false,
        },
        message: {
            contactMessage: {
                displayName: `${msg.pushName}`,
                vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:${msg.pushName}\nitem1.TEL;waid=${msg.sender.split('@')[0]}:${msg.sender.split('@')[0]}\nEND:VCARD`,
            },
        },
        participant: '0@s.whatsapp.net',
    };

    const messages = {
        cooldown: `┏━ˏˋ ⏳ˎˊ━┓
استنى ${time || 'بعض كام ثانيه'} ثانية وكمل
┗━━━━━━━━━┛
‏‏‎ ‎‏‏‎ ‎لازم تصبر شويه، الأمر ده مينفعش فيه سبام`,

        owner: `┏━ˏˋ 🇩🇪 ˎˊ━┓
الأمر ده لـ المطورين فقط
┗━━━━━━━━━┛
‏‏‎ ‎‏‏‎ ‎لازم تكون مطور البوت عشان تقدر تستخدمه`,

        group: `┏━ˏˋ 💠 ˎˊ━┓
الأمر ده بيشتغل بس ف الجروبات
┗━━━━━━━━━┛
‏‏‎ ‎‏‏‎ ‎لازم تستخدمه جوه جروب فقط`,

        admin: `┏━ˏˋ 📯 ˎˊ━┓
الأمر ده لـ الأدمن فقط
┗━━━━━━━━━┛
‏‏‎ ‎‏‏‎ ‎انت مجرد عضو، لازم تبقى أدمن الأول`,

        private: `┏━ˏˋ 🏷️ ˎˊ━┓
الأمر ده في الخاص فقط
┗━━━━━━━━━┛
‏‏‎ ‎‏‏‎ ‎ابعته على الخاص وجرب تاني`,

        botAdmin: `┏━ˏˋ 📌 ˎˊ━┓
لازم أكون أدمن عشان أنفذ الأمر
┗━━━━━━━━━┛
‏‏‎ ‎‏‏‎ ‎حطني أدمن وجرب تاني`,

        noSub: `┏━ˏˋ 🫒 ˎˊ━┓
الأمر ده في البوت الأساسي فقط
┗━━━━━━━━━┛`,

        disabled: `┏━ˏˋ 🗃️ ˎˊ━┓
الأمر ده متوقف مؤقتًا (تحت الصيانة)
┗━━━━━━━━━┛
‏‏‎ ‎‏‏‎ ‎هيرجع يشتغل تاني قريب`,

        error: `┏━ˏˋ ⚠️ ˎˊ━┓
حصل خطأ غير متوقع
┗━━━━━━━━━┛
‏‏‎ ‎‏‏‎ ‎تواصل مع المطورين لإصلاح المشكلة

💡 اكتب *.المطور* للحصول على رقم المطور 👑`
    };

    if (conn && messages[checkType]) {
        await conn.msgUrl(msg.chat, messages[checkType], {
            img: "https://i.pinimg.com/originals/02/c3/51/02c351dfd4eb72a62f225ce964dc510d.jpg",
            title: "𝐀𝐥𝐞𝐫𝐭𝐬 | 𝐖𝐚𝐫𝐧𝐢𝐧𝐠𝐬",
            body: "𝐵𝑜𝑡 𝑎𝑙𝑒𝑟𝑡𝑠: 𝑅𝑒𝑎𝑑 𝑡𝒉𝑒 𝑚𝑒𝑠𝑠𝑎𝑔𝑒 𝑡𝑜 𝑙𝑒𝑎𝑟𝑛 𝑚𝑜𝑟𝑒",
            newsletter: {
                name: 'O̷W̷N̷E̷R̷ | ڵــﮪــﯡٰڕې',
                jid: '201556853817@newsletter'
            },
            big: false
        }, quoted);
        return false;  
    }
    return null;  
};

export { access, group };
