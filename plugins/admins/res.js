const handler = async (m, { conn }) => {
  const req = await conn.groupRequestParticipantsList(m.chat);
  if (!req?.length) return m.reply(`╭─❖ 🗂️ ❖─╮\n│ مفيش طلبات انضمام حاليًا\n╰────────────╯`);

  let text = req.map((r, i) =>
    `┆ ${i + 1}. @${r.phone_number.split("@")[0]}`
  ).join("\n");

  const listText = `
◇— 〔 ⏳ طلبات الانضمام 〕 —◇

${text}

◇──────────────◇
✦ الإجمالي: ${req.length} طلب ✦
⟡ ⵌ 𝐴𝐿𝐻𝑊𝐴𝑅𝑌 SYSTEM ⵌ ⟡`.trim();

  await conn.sendMessage(m.chat, {
    text: listText,
    mentions: req.map(r => r.phone_number)
  }, { quoted: global.reply_status || m });
};

handler.command = ["الريكوستات", "الطلبات"];
handler.usage = ['الريكوستات'];
handler.category = "admin";
handler.admin = true;
handler.botAdmin = true

export default handler;
