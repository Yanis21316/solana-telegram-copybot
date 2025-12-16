require('dotenv').config()
const TelegramBot = require('node-telegram-bot-api')
const { Connection, LAMPORTS_PER_SOL } = require('@solana/web3.js')
const axios = require('axios')
const config = require('./config')

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true })
const connection = new Connection(process.env.SOLANA_RPC_URL, 'confirmed')

let mode = null
let testBalanceSol = (config.MODE_TEST_CAPITAL_EUR / config.SOL_PRICE_USD)
let pnlSol = 0
let trades = []

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id,
`🤖 BOT SOLANA COPY-TRADING

Choisis un mode :
1️⃣ Mode TEST (capital fictif)
2️⃣ Mode RÉEL (⚠️ vrai SOL)

Réponds avec :
/test
/real`)
})

bot.onText(/\/test/, (msg) => {
  mode = 'TEST'
  pnlSol = 0
  trades = []
  bot.sendMessage(msg.chat.id,
`🧪 MODE TEST ACTIVÉ

Capital fictif :
${testBalanceSol.toFixed(4)} SOL (~${config.MODE_TEST_CAPITAL_EUR}€)

Aucun vrai SOL n’est utilisé.`)
})

bot.onText(/\/real/, (msg) => {
  mode = 'REAL'
  pnlSol = 0
  trades = []
  bot.sendMessage(msg.chat.id,
`⚠️ MODE RÉEL ACTIVÉ

Les transactions utiliseront du vrai SOL.
Assure-toi d’avoir compris les risques.`)
})

bot.onText(/\/buy/, async (msg) => {
  if (!mode) {
    return bot.sendMessage(msg.chat.id, '❌ Lance /start d’abord')
  }

  const amountSol = config.DEFAULT_BUY_SOL

  if (mode === 'TEST') {
    testBalanceSol -= amountSol
    const fakeProfit = amountSol * 0.5
    pnlSol += fakeProfit

    trades.push({
      type: 'BUY',
      sol: amountSol,
      profit: fakeProfit
    })

    bot.sendMessage(msg.chat.id,
`🧪 BUY SIMULÉ

Montant : ${amountSol} SOL
Profit simulé : +${fakeProfit.toFixed(4)} SOL`)
  } else {
    bot.sendMessage(msg.chat.id,
`🚀 BUY RÉEL ENVOYÉ

Montant : ${amountSol} SOL
(Exécution dépend du réseau Solana)`)
  }
})

bot.onText(/\/pnl/, (msg) => {
  const pnlUsd = pnlSol * config.SOL_PRICE_USD

  bot.sendMessage(msg.chat.id,
`📊 PNL

Mode : ${mode}
PNL : ${pnlSol.toFixed(4)} SOL
PNL USD : ${pnlUsd.toFixed(2)} $

Nombre de trades : ${trades.length}`)
})

bot.onText(/\/status/, async (msg) => {
  const slot = await connection.getSlot()
  bot.sendMessage(msg.chat.id,
`🟢 BOT ACTIF

RPC OK
Slot actuel : ${slot}`)
})