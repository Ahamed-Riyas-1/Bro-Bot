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

        const filteredData = data.data.filter(v => v.date >= timestampInMs);

        let message = '';
        filteredData.forEach(v => {
            message += `Type: ${v.type}  ,  AlphPad Amount: ${v.token_amount}  ,  Value in USD: ${v.token_amount_usd}`;
        });

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
