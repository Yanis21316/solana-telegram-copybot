import 'dotenv/config';
import { Telegraf } from 'telegraf';
import fetch from 'node-fetch';
import { CONFIG } from './config.js';

let balanceUSD = CONFIG.VIRTUAL_BALANCE_USD;
let pnlUSD = 0;

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

async function getSolPrice() {
  const res = await fetch(process.env.SOL_PRICE_API);
  const data = await res.json();
  return data.solana.usd;
}

bot.start(async (ctx) => {
  const solPrice = await getSolPrice();
  ctx.reply(
`🤖 *Solana Copy Bot*

Mode: ${process.env.BOT_MODE}
Balance test: ${balanceUSD.toFixed(2)} $
SOL Price: ${solPrice} $

Choisis une option 👇`,
    {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🧪 Mode TEST', callback_data: 'test' }],
          [{ text: '💰 Mode LIVE', callback_data: 'live' }],
          [{ text: '📊 PnL', callback_data: 'pnl' }]
        ]
      }
    }
  );
});

bot.action('test', (ctx) => {
  ctx.reply('🧪 Mode TEST activé (100€ fictifs)');
});

bot.action('live', (ctx) => {
  ctx.reply('⚠️ Mode LIVE\nLes vraies SOL seront utilisées');
});

bot.action('pnl', async (ctx) => {
  const solPrice = await getSolPrice();
  ctx.reply(
`📊 *PnL*

Balance: ${balanceUSD.toFixed(2)} $
PnL: ${pnlUSD.toFixed(2)} $
SOL Price: ${solPrice} $`,
    { parse_mode: 'Markdown' }
  );
});

bot.launch();
console.log('🤖 Bot Telegram lancé');