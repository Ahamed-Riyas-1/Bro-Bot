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
        const response = await fetch(URL, { method: 'GET' });
        const data = await response.json();

        const buyData = response.data.filter(v => v.type === 'buy').map(v => v.token_amount_usd);
        const sellData = response.data.filter(v => v.type === 'sell').map(v => v.token_amount_usd);
        const buySum = buyData.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
        const sellSum = sellData.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
        // const buyData = response.data.filter(v => v.type === 'buy' && v.date >= timestampInMs).map(v => v.token_amount_usd);
        let message = '';
        if (buySum > 1000) {
            message = `AlphPad buy for the amount of total ${buySum} USD in last one minute`;
        } else if (sellSum > 1000) {
            message = `AlphPad sell for the amount of total ${sellSum} USD in last one minute`;
        }

        if (message) {
            await sendTelegramMessage(message);
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Telegram message sent successfully', data: filteredData }),
        };
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to fetch price or send message' }),
        };
    }
};
