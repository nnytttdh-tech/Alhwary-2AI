const handler = async (m, { conn }) => {
  try {
    const req = await conn.groupRequestParticipantsList(m.chat);
    if (!req?.length)
      return m.reply(`╭─❖ 🗂️ ❖─╮\n│ مفيش طلبات انضمام حاليًا\n╰────────────╯`);

    const arg = parseInt(m.text.split(" ")[1]);
    const limit = Number.isFinite(arg) && arg > 0 ? arg : req.length;

    const list = req.slice(0, limit);

    // ملاحظة: الأوبجكت اللي بيرجعه groupRequestParticipantsList
    // بيحتوي على "jid" مش "phone_number"
    const jids = list.map(r => r.jid);

    await conn.groupRequestParticipantsUpdate(m.chat, jids, "approve");

    const text = `
◇— 〔 ✅ تم القبول 〕 —◇

✦ تم قبول ${list.length} طلب انضمام
⟡ ⵌ 𝐴𝐿𝐻𝑊𝐴𝑅𝑌 SYSTEM ⵌ ⟡`.trim();

    await m.reply(text);
  } catch (e) {
    console.error(e);
    await m.reply(`❌ حصل خطأ أثناء قبول الطلبات:\n${e.message || e}`);
  }
};

handler.command = ["اقبل_ريكوستات", "اقبل_الطلبات"];
handler.usage = ["اقبل_ريكوستات", "اقبل_الطلبات"];
handler.category = "admin";
handler.admin = true;
handler.botAdmin = true;

export default handler;