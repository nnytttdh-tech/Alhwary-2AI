export default async function before(m, { conn }) {
    const g = global.db?.groups[m.chat];

    if (g?.antiLink && !m.isOwner && !m.isAdmin) {
        // Regex عام لأي رابط يبدأ بـ http أو https أو www
        const anyLinkRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;

        if (anyLinkRegex.test(m.text)) {
            // 1. حذف الرسالة المخالفة أولاً
            await conn.sendMessage(m.chat, {
                delete: m.key
            });

            // 2. إدارة قاعدة البيانات وإنشاء سجل التحذيرات إذا لم يكن موجوداً
            if (!global.db.data) global.db.data = { users: {} };
            if (!global.db.data.users) global.db.data.users = {};
            if (!global.db.data.users[m.sender]) {
                global.db.data.users[m.sender] = { warn: 0 };
            }

            // زيادة عدد الإنذارات
            let user = global.db.data.users[m.sender];
            user.warn = (user.warn || 0) + 1;

            const senderNum = m.sender.split('@')[0];

            // 3. التحقق من الوصول للإنذار الثالث (الحد الأقصى)
            if (user.warn >= 3) {
                // إعادة تصفير إنذارات المستخدم
                user.warn = 0;

                // إرسال رسالة الطرد
                await conn.sendMessage(m.chat, {
                    text: `⚠️ *@${senderNum}* استوفيت الحد الأقصى من الإنذارات (3/3) وتم طردك من المجموعة!`,
                    mentions: [m.sender]
                });

                // طرد العضو من المجموعة
                try {
                    await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove');
                } catch (e) {
                    await conn.sendMessage(m.chat, {
                        text: `❌ تعذر طرد *@${senderNum}*! يرجى التأكد من أن البوت يتملك صلاحيات المشرف (Admin).`,
                        mentions: [m.sender]
                    });
                }
            } else {
                // 4. إرسال تحذير بالعقاب الحالي والإنذارات المتبقية
                await conn.sendMessage(m.chat, {
                    text: `🚫 *تم حذف الرابط*\n\n@${senderNum} ممنوع نشر أي روابط هنا!\n⚠️ *الإنذارات:* [${user.warn}/3]\n\n> عند الوصول للإنذار الثالث سيتم طردك تلقائياً.`,
                    mentions: [m.sender]
                });
            }

            return true;
        }
    }

    return false;
}