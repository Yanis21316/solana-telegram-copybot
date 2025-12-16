import 'dotenv/config';
import { Telegraf } from 'telegraf';
import fetch from 'node-fetch';
import { Connection, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { CONFIG } from './config.js';

/* ============================
   CONNEXIONS SOLANA
============================ */
const connectionHttp = new Connection(
  process.env.SOLANA_RPC_HTTP,
  { commitment: 'processed' }
);

const connectionWs = new Connection(
  process.env.SOLANA_RPC_HTTP,
  {
    wsEndpoint: process.env.SOLANA_RPC_WSS,
    commitment: 'processed'
  }
);

/* ============================
   BOT TELEGRAM
============================ */
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

let virtualBalanceUSD = CONFIG.TEST_BALANCE_USD;
let pnlUSD = 0;

/* ============================
   PRIX SOL
============================ */
async function getSolPrice() {
  const res = await fetch(process.env.SOL_PRICE_API);
  const data = await res.json();
  return data.solana.usd;
}

/* ============================
   START
============================ */
bot.start(async (ctx) => {
  const solPrice = await getSolPrice();

  ctx.reply(
`🤖 *Solana Copy Bot*

Mode: ${process.env.BOT_MODE}
Balance TEST: ${virtualBalanceUSD.toFixed(2)} $
Prix SOL: ${solPrice} $

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

/* ============================
   ACTIONS
============================ */
bot.action('test', (ctx) => {
  ctx.reply('🧪 Mode TEST activé\nCapital fictif : 100 $');
});

bot.action('live', (ctx) => {
  ctx.reply('⚠️ Mode LIVE\nLes vraies SOL seront utilisées');
});

bot.action('pnl', async (ctx) => {
  const solPrice = await getSolPrice();

  ctx.reply(
`📊 *PnL*

Balance: ${virtualBalanceUSD.toFixed(2)} $
PnL: ${pnlUSD.toFixed(2)} $
Prix SOL: ${solPrice} $`,
    { parse_mode: 'Markdown' }
  );
});

/* ============================
   EXEMPLE LISTENER WSS
============================ */
connectionWs.onLogs(
  'all',
  (logs) => {
    // Ici plus tard : détection wallet, pumpfun, etc.
  },
  'processed'
);

bot.launch();
console.log('🤖 Bot lancé (HTTPS + WSS)');