const handler = async (m, { conn }) => {
  const req = await conn.groupRequestParticipantsList(m.chat);
  if (!req?.length) return m.reply(`╭─❖ 🗂️ ❖─╮\n│ مفيش طلبات انضمام حاليًا\n╰────────────╯`);

  const arg = parseInt(m.text.split(" ")[1]);
  const limit = Number.isFinite(arg) && arg > 0 ? arg : req.length;

  const list = req.slice(0, limit);

  // نبعت كل الأرقام دفعة واحدة بدل ما نلوب ونستنى كل واحد لوحده
  await conn.groupRequestParticipantsUpdate(
    m.chat,
    list.map(r => r.phone_number),
    "approve"
  );

  const text = `
◇— 〔 ✅ تم القبول 〕 —◇

✦ تم قبول ${list.length} طلب انضمام
⟡ ⵌ 𝐴𝐿𝐻𝑊𝐴𝑅𝑌 SYSTEM ⵌ ⟡`.trim();

  await m.reply(text);
};

handler.command = ["اقبل_ريكوستات"];
handler.usage = ['اقبل_ريكوستات', 'اقبل_الطلبات'];
handler.category = "admin";
handler.admin = true;
handler.botAdmin = true

export default handler;
