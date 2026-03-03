import express from 'express';
import dotenv from 'dotenv';
import {Bot} from 'grammy'
import fetch from 'node-fetch'
import fs from 'fs'
import { fetcher } from './fetcher.js';

dotenv.config()
const app = express();

const bot =  new Bot(process.env.TELEGRAM_API_KEY)

bot.command('start',async(ctx)=>{
    ctx.reply("Welcome to Tender bot ");
})

bot.command('tender',async(ctx)=>{
    fetcher(ctx);
})

app.listen(process.env.PORT,()=>{
    console.log("Server listening on port ")
})

bot.start();