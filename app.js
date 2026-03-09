import express from 'express';
import dotenv from 'dotenv';
import { Bot } from 'grammy';
import { interval, getKeywords } from './fetcher.js';
import { ensureCollection, searchTenders } from './vectorStore.js';
import { client } from './db/vectorDb.js';

dotenv.config();
const app = express();

const QDRANT_URL = 'http://127.0.0.1:6333';
const token = process.env.TELEGRAM_API_KEY?.trim();

app.get('/tenders', async (req, res) => {
  try {
    const [colRes, scrollRes] = await Promise.all([
      fetch(`${QDRANT_URL}/collections/tenders`),
      fetch(`${QDRANT_URL}/collections/tenders/points/scroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ limit: 100, with_payload: true, with_vector: false }),
      }),
    ]);
    if (!colRes.ok) throw new Error('Qdrant not available');
    const col = await colRes.json();
    const scroll = await scrollRes.json();
    const points = scroll.result?.points ?? [];
    const total = col.result?.points_count ?? points.length;
    res.type('html').send(`
<!DOCTYPE html>
<html>
<head><title>TenderBot - Stored Tenders</title>
<style>
  body{font-family:system-ui;max-width:900px;margin:2rem auto;padding:0 1rem}
  h1{color:#333}
  .stats{background:#f0f0f0;padding:1rem;border-radius:8px;margin:1rem 0}
  .tender{border:1px solid #ddd;padding:1rem;margin:0.5rem 0;border-radius:6px}
  .tender h3{margin:0 0 0.5rem;font-size:1rem}
  .meta{color:#666;font-size:0.9rem}
</style>
</head>
<body>
  <h1>TenderBot - Indexed Tenders</h1>
  <div class="stats"><strong>Total vectors:</strong> ${total} | <strong>Showing:</strong> ${points.length}</div>
  ${points.length ? points.map((p, i) => {
    const pl = p.payload ?? {};
    return `<div class="tender"><h3>${i + 1}. ${(pl.lotName || 'N/A').slice(0, 100)}</h3>
      <div class="meta">${pl.procuringEntity || ''} | Deadline: ${pl.submissionDeadline || 'N/A'} | Ref: ${pl.procurementReferenceNo || ''}</div>
    </div>`;
  }).join('') : '<p>No tenders indexed yet. Use /tender in Telegram to fetch.</p>'}
</body>
</html>`);
  } catch (err) {
    res.status(500).send(`Error: ${err.message}. Is Qdrant running?`);
  }
});


if (token) {
  const bot = new Bot(token);
  bot.command('start', async (ctx) => {
    ctx.reply(
      "Welcome to Tender bot\n\n" +
      "/tender — Fetch new tenders\n" +
      "/search [query] — Find tenders by meaning (AI semantic search)\n" +
      "/keywords — View filter keywords"
    );
  });
  bot.command('keywords', async (ctx) => {
    const keywords = getKeywords();
    if (!keywords.length) {
      await ctx.reply('No keywords set. Add KEYWORDS to .env (comma-separated)\nExample: medical,ICT,construction');
      return;
    }
    await ctx.reply(`Current keywords: ${keywords.join(', ')}\n\n/tender fetches only tenders matching these.`);
  });
  bot.command('tender', async (ctx) => {
    const keywords = getKeywords();
    if (keywords.length) {
      await ctx.reply(`Fetching tenders matching: ${keywords.join(', ')}...`);
    } else {
      await ctx.reply('Fetching all tenders...');
    }
    interval(ctx);
  });
  bot.command('search', async (ctx) => {
    const query = ctx.message?.text?.replace(/^\/search\s*/i, '').trim();
    if (!query) {
      await ctx.reply('Usage: /search [query]\nExample: /search medical supplies');
      return;
    }
    const loadingMsg = await ctx.reply('🔍 Searching with AI (semantic match)...');
    try {
      const results = await searchTenders(query, 10);
      await ctx.api.deleteMessage(ctx.chat.id, loadingMsg.message_id).catch(() => {});
      if (!results?.length) {
        await ctx.reply('No matching tenders found.');
        return;
      }
      const lines = results.map((r, i) => {
        const p = r.payload ?? {};
        const score = ((r.score ?? 0) * 100).toFixed(0);
        const deadline = p.submissionDeadline ? new Date(p.submissionDeadline).toLocaleDateString() : 'N/A';
        return (
          `📋 ${i + 1}. ${(p.lotName ?? 'N/A').slice(0, 80)}${(p.lotName?.length ?? 0) > 80 ? '...' : ''}\n` +
          `   🏛 ${p.procuringEntity ?? ''}\n` +
          `   📅 ${deadline} | Match: ${score}%`
        );
      });
      const text = `Found ${results.length} tenders matching "${query}" (embedding search)\n\n` + lines.join('\n\n');
      const MAX_LEN = 4000;
      if (text.length > MAX_LEN) {
        await ctx.reply(text.slice(0, MAX_LEN) + '\n\n...[truncated]');
      } else {
        await ctx.reply(text);
      }
    } catch (err) {
      await ctx.api.deleteMessage(ctx.chat.id, loadingMsg.message_id).catch(() => {});
      console.error('Search error:', err);
      await ctx.reply('Search failed. Make sure Qdrant is running and tenders are indexed.');
    }
  });

  process.on('SIGTERM', () => bot.stop());
  process.on('SIGINT', () => bot.stop());

  await ensureCollection();
  const result = await client.getCollections();
  console.log("Collections:", result.collections?.map(c => c.name).join(", ") || "none");

  async function startBot(retries = 3) {
    for (let i = 0; i < retries; i++) {
      try {
        await bot.start();
        console.log("Telegram bot started.");
        return;
      } catch (err) {
        if (err.error_code === 409 && i < retries - 1) {
          const wait = 10 * (i + 1);
          console.warn(`Bot conflict (409), waiting ${wait}s before retry...`);
          await new Promise(r => setTimeout(r, wait * 1000));
        } else {
          throw err;
        }
      }
    }
  }
  startBot().catch((err) => {
    console.error("Telegram bot failed:", err.description || err.message);
    process.exit(1);
  });
} else {
  console.warn("TELEGRAM_API_KEY not set — Telegram bot disabled. Add it to .env to enable.");
  await ensureCollection();
  console.log("Qdrant ready. Express server running (bot disabled).");
}

app.listen(process.env.PORT || 3000, () => {
  console.log("Server listening on port", process.env.PORT || 3000);
});