import express from 'express';
import dotenv from 'dotenv';
import {Bot} from 'grammy'
import fetch from 'node-fetch'
import fs from 'fs'
import { interval } from './fetcher.js';
import { ensureCollection, searchTenders } from './vectorStore.js';
import { client } from './db/vectorDb.js';

dotenv.config()
const app = express();

const bot =  new Bot(process.env.TELEGRAM_API_KEY)

bot.command('start',async(ctx)=>{
    ctx.reply("Welcome to Tender bot ");
})

bot.command('tender', async (ctx) => {
  interval(ctx);
});

bot.command('search', async (ctx) => {
  const query = ctx.message?.text?.replace(/^\/search\s*/i, '').trim();
  if (!query) {
    await ctx.reply('Usage: /search [query]\nExample: /search medical supplies');
    return;
  }
  try {
    const results = await searchTenders(query, 5);
    if (!results?.length) {
      await ctx.reply('No matching tenders found.');
      return;
    }
    const lines = results.map((r, i) => {
      const p = r.payload ?? {};
      return `${i + 1}. ${p.lotName ?? 'N/A'}\n   Entity: ${p.procuringEntity ?? ''}\n   Deadline: ${p.submissionDeadline ?? ''}\n   Score: ${(r.score ?? 0).toFixed(3)}`;
    });
    await ctx.reply(lines.join('\n\n'));
  } catch (err) {
    console.error('Search error:', err);
    await ctx.reply('Search failed. Make sure Qdrant is running and tenders are indexed.');
  }
});

app.listen(process.env.PORT,()=>{
    console.log("Server listening on port ")
})


await ensureCollection();
const result = await client.getCollections();
console.log("Lists of collection : ", result.collections);
bot.start();