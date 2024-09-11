const TelegramBot = require("node-telegram-bot-api");

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_NEW_BOT_TOKEN;
const TELEGRAM_GROUP_ID = process.env.TELEGRAM_NEW_GROUP_ID;
const URL = process.env.ALPH_URL;

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: false });

async function sendTelegramMessage(message) {
    await bot.sendMessage(TELEGRAM_GROUP_ID, message, { parse_mode: 'HTML' });
}

exports.handler = async function () {
    const now = new Date();
    const twoMinutesAgo = new Date(now.getTime() - 2 * 60 * 1000); // 2 minutes ago
    const timestampInMs = twoMinutesAgo.getTime();

    try {
        const response = await fetch(URL, { method: 'GET' });
        const data = await response.json();

        const filteredData = data.data.filter(v => v.date >= timestampInMs);

        let message = 'Testing';
        filteredData.forEach(v => {
            message += `<strong>Type: ${v.type}</strong> <br> AlphPad Amount: ${v.token_amount} <br> Value in USD: ${v.token_amount_usd} <br><br>`;
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
