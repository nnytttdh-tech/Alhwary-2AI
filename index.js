import { Client } from 'meowsab';
import { group, access } from "./system/control.js";
import UltraDB from "./system/UltraDB.js";
import sub from './sub.js';

/* =========== Client ========== */
const client = new Client({
  phoneNumber:'201211883781', // Bot number
  prefix: [".", "/", "!"],
  fromMe: false, 
  owners: [
  // Owner 1
    { name: "ALH", lid: "201556853817@lid", jid: "201556853817@s.whatsapp.net" },
  // Owner 2
    { name: "ALHWARY", lid: "201556853817@lid", jid: "201556853817@s.whatsapp.net" },
  // Owner 3
    { name: "Sukuna", jid: "201556853817@s.whatsapp.net", lid: "201556853817@lid" },
  // Owner 4 
   { name: "عمورتي", jid: "201211883781@s.whatsapp.net", lid: "201211883781@lid" }
  ],
  settings: { noWelcome: false },
  commandsPath: './plugins'
});

client.onGroupEvent(group);
client.onCommandAccess(access);

/* =========== Database ========== */
if (!global.db) {
    global.db = new UltraDB();
}

/* =========== Config ========== */
const { config } = client;
config.info = { 
  nameBot: "O̷W̷N̷E̷R̷ | ڵــﮪــﯡٰڕې", 
  nameChannel: "O̷W̷N̷E̷R̷ | ڵــﮪــﯡٰڕې", 
  idChannel: "201556853817@newsletter",
  urls: {
    repo: "201556853817",
    api: "https://emam-api.web.id",
    channel: "https://whatsapp.com/channel/0029VaQim2bAu3aPsRVaDq3v"
  },
  copyright: { 
    pack: 'O̷W̷N̷E̷R̷ | ڵــﮪــﯡٰڕې', 
    author: 'O̷W̷N̷E̷R̷ | ڵــﮪــﯡٰڕې'
  },
  images: [
    "https://i.pinimg.com/originals/11/26/97/11269786cdb625c60213212aa66273a9.png",
    "https://i.pinimg.com/originals/e2/21/20/e221203f319df949ee65585a657501a2.jpg",
    "https://i.pinimg.com/originals/bb/77/0f/bb770fad66a634a6b3bf93e9c00bf4e5.jpg"
  ]
};

/* =========== Start ========== */
client.start();

setTimeout(async () => {
if (client.commandSystem) { 
sub(client)
  }
}, 2000);


/* =========== Catch Errors ========== */
process.on('uncaughtException', (e) => {
    if (e.message.includes('rate-overlimit')) {}
});

process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err)
});


/* 
=========== Memory Monitor ========== 

setInterval(() => {
    const used = process.memoryUsage().rss / 1024 / 1024
    if (used > 800) {
        console.log(`🔄 Bot memory full (${used.toFixed(1)}MB), restarting...`)
        process.exit(1) 
    }
}, 300_000) 

*/
