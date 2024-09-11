const TelegramBot = require("node-telegram-bot-api");

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_NEW_BOT_TOKEN;
const TELEGRAM_GROUP_ID = process.env.TELEGRAM_NEW_GROUP_ID;
const URL = process.env.ALPH_URL;

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: false });

async function sendTelegramMessage(message) {
    await bot.sendMessage(TELEGRAM_GROUP_ID, message);
}

exports.handler = async function () {
    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 60 * 1000); // 1 minutes ago
    const timestampInMs = oneMinuteAgo.getTime();

    try {
        let buySum = 0;
        let sellSum = 0;

        // Loop through data once and calculate both buy and sell sums
        data.data.forEach(v => {
            if (v.date >= timestampInMs) {
                if (v.type === 'buy') {
                    buySum += v.token_amount_usd;
                } else if (v.type === 'sell') {
                    sellSum += v.token_amount_usd;
                }
            }
        });

        let message = '';
        if (buySum > 5000) {
            message = `AlphPad buy for the amount of total ${buySum.toFixed(2)} USD in the last minute`;
        } else if (sellSum > 5000) {
            message = `AlphPad sell for the amount of total ${sellSum.toFixed(2)} USD in the last minute`;
        }

        return {
            statusCode: 200,
            body: JSON.stringify({message: message}),
        };
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to fetch price or send message' }),
        };
    }
};
