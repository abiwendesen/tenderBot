import express from 'express';
import dotenv from 'dotenv';
import {Bot} from 'grammy'
import fetch from 'node-fetch'
import fs from 'fs'
import { interval } from './fetcher.js';
import { client } from './db/vectorDb.js';
import { searchTender } from './vectorStrore.js';

dotenv.config()
const app = express();

const bot =  new Bot(process.env.TELEGRAM_API_KEY)

bot.command('start',async(ctx)=>{
    ctx.reply("Welcome to Tender bot ");
})

bot.command('tender',async(ctx)=>{
    interval(ctx);
});


bot.command("search", async(ctx)=>{
   let message  = ctx.message?.text?.replace(/^\/search\s*/i, '').trim();
   
   if(message.length< 2){
    return ctx.reply("Please use the correct command i.e /search car")
   }
  const result = await searchTender(message);
  const filtered = result.filter(r=> r.score > 0.5)
      console.log(filtered)

})

app.listen(process.env.PORT,()=>{
    console.log("Server listening on port ")
})


const result = await client.getCollections()
console.log("Lists of collection : ", result.collections)
bot.start();