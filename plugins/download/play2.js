// ============================================================
// بحث وتشغيل أغنية — يوتيوب ميوزك + كلمات متزامنة + مشغل HTML
// محوّل لهيكل بوت 𓆩 𝑨𝑳𝑯𝑾𝑨𝑹𝒀 𓆪
// ============================================================
import { randomUUID } from 'crypto';
import yts from 'yt-search';
import YTMusic from 'ytmusic-api';
import { getLRCLyrics, parseSyncedLyrics, plainLyricsToSynced } from '../lib/lrclib.js';
import { savetubeRetry } from '../lib/savetube.js';
import { downloadAudioBuffer, compressAudio } from '../lib/ffmpeg.js';
import { getThumb, createMusicPlayer } from '../lib/player.js';

let ytMusicInstance = null;
async function getYTMusic() {
  if (!ytMusicInstance) {
    ytMusicInstance = new YTMusic();
    await ytMusicInstance.initialize();
  }
  return ytMusicInstance;
}

function secondsFromTimestamp(timestamp = '') {
  const parts = String(timestamp).split(':').map(Number);
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return 0;
}

function formatDuration(seconds = 0) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

async function sendMusicPlayer(conn, m, html) {
  const responseId = randomUUID();
  await conn.relayMessage(m.chat, {
    messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2, botMetadata: { botResponseId: responseId } },
    botForwardedMessage: {
      message: {
        richResponseMessage: {
          messageType: 1,
          submessages: [{ messageType: 2, messageText: 'Music Player' }],
          unifiedResponse: {
            data: Buffer.from(JSON.stringify({
              response_id: responseId,
              sections: [{ view_model: { primitive: { __typename: 'GenAIaeacdsnwHtmlPrimitive', payload: html, trusted_sources: [] }, __typename: 'GenAISingleLayoutViewModel' } }]
            })).toString('base64')
          },
          contextInfo: { forwardingScore: 1, isForwarded: true, forwardedAiBotMessageInfo: { botJid: '867051314767696@bot' }, forwardOrigin: 4 }
        }
      }
    }
  }, { messageId: responseId });
}

async function handler(m, { conn, args, command }) {
  const query = args.join(' ').trim();

  if (!query) {
    await conn.sendMessage(m.chat, {
      text: `╭─❖ تنبيه ❖─╮\n🎵 اكتب اسم الأغنية بعد الأمر\nمثال: .${command} chase atlantic\n╰────────────╯`
    }, { quoted: m });
    return;
  }

  await m.react('🎧');

  try {
    let ytUrl = query;
    let title = 'غير معروف', artist = 'فنان غير معروف', duration = '0:00', durationSec = 0, thumbUrl = '', trackIdForLyrics = null, album = '';

    if (!/youtube\.com|youtu\.be/i.test(query)) {
      const ytm = await getYTMusic();
      const songs = await ytm.search(query);
      const track = songs.find(s => s.type === 'SONG') || songs[0];
      if (!track || !track.videoId) throw new Error('الأغنية غير موجودة');

      trackIdForLyrics = track.videoId;
      ytUrl = `https://www.youtube.com/watch?v=${track.videoId}`;
      title = track.name || track.title || 'غير معروف';
      artist = track.artists?.map(a => a.name).join(', ') || track.artist?.name || 'فنان غير معروف';
      durationSec = Number(track.duration || 0);
      duration = formatDuration(durationSec);
      thumbUrl = track.thumbnails?.[track.thumbnails.length - 1]?.url || '';
      album = track.album?.name || '';
    } else {
      const detail = await yts(ytUrl);
      const vid = detail?.videos?.[0];
      if (!vid) throw new Error('الفيديو غير موجود');

      title = vid.title || 'غير معروف';
      artist = vid.author?.name || 'يوتيوب';
      duration = vid.timestamp || '0:00';
      durationSec = secondsFromTimestamp(duration);
      thumbUrl = vid.thumbnail;
      const match = ytUrl.match(/(?:v=|shorts\/|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/);
      if (match) trackIdForLyrics = match[1];
    }

    let syncedLyrics = [];
    const lrclib = await getLRCLyrics({ title, artist, duration: durationSec, album });
    if (lrclib?.syncedLyrics) syncedLyrics = parseSyncedLyrics(lrclib.syncedLyrics);

    if (!syncedLyrics.length && trackIdForLyrics) {
      try {
        const ytm = await getYTMusic();
        const lyricsData = await ytm.getLyrics(trackIdForLyrics);
        const fallbackLyrics = typeof lyricsData === 'string' ? lyricsData : lyricsData?.lyrics || '';
        if (fallbackLyrics) syncedLyrics = parseSyncedLyrics(fallbackLyrics) || plainLyricsToSynced(fallbackLyrics);
      } catch {}
    }

    const thumb = await getThumb(thumbUrl);
    const imageSrc = thumb?.length ? `data:image/jpeg;base64,${thumb.toString('base64')}` : '';

    const audio = await savetubeRetry(ytUrl, { downloadType: 'audio', quality: '128kbps' });
    if (!audio?.url) throw new Error('رابط الصوت غير متاح');

    const originalBuffer = await downloadAudioBuffer(audio.url);
    const compressedBuffer = await compressAudio(originalBuffer);
    const audioSrc = `data:audio/ogg;base64,${compressedBuffer.toString('base64')}`;

    const html = createMusicPlayer({ title, artist, duration, audioSrc, imageSrc, lyrics: syncedLyrics });
    await sendMusicPlayer(conn, m, html);
    await m.react('✅');

  } catch (error) {
    console.error('[SONG SEARCH ERROR]', error);
    await m.react('❌');
    await conn.sendMessage(m.chat, {
      text: `❌ فشل تجهيز الأغنية.\n\n> ${error?.message || 'خطأ غير معروف'}`
    }, { quoted: m });
  }
}

handler.help = ['اغنيه <اسم الأغنية>'];
handler.category = 'downloads';
handler.command = ['اغنيه', 'بحث_اغنيه', 'play2', 'song'];
handler.limit = true;

export default handler;
