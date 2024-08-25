import { config } from 'dotenv';
import TelegramBot from 'node-telegram-bot-api';
import Pact from 'pact-lang-api';
import cron from 'node-cron';
import express from 'express';

const app = express();
const port = process.env.PORT || 3000;

// Load environment variables
config();

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_GROUP_ID = process.env.TELEGRAM_GROUP_ID;
const NETWORK_ID = process.env.NETWORK_ID;
const API_HOST = process.env.API_HOST;
const PUBLIC_KEY = process.env.PUBLIC_KEY;
const SECRET_KEY = process.env.SECRET_KEY;
const BRO_MAINNET_KEY = process.env.BRO_MAINNET_KEY;
const BRO = `${BRO_MAINNET_KEY}.bro`;
const BRO_TREASURY = `${BRO_MAINNET_KEY}.bro-treasury`;

const KEY_PAIR = {
    publicKey: PUBLIC_KEY,
    secretKey: SECRET_KEY,
};

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: false });

const creationTime = () => Math.round(new Date().getTime() / 1000);

async function getTokenDetails() {
    const cmd = {
        networkId: NETWORK_ID,
        keyPairs: [KEY_PAIR],
        pactCode: `(let ((acct (${BRO_TREASURY}.dex-account)))
                 (round (/ (coin.get-balance acct)
                           (${BRO}.get-balance acct))
                        2))`,
        envData: {},
        meta: {
            creationTime: creationTime(),
            ttl: 600,
            gasLimit: 150000,
            chainId: '18',
            gasPrice: 0.0000001,
            sender: KEY_PAIR.publicKey,
        },
    };

    try {
        const result = await Pact.fetch.local(cmd, API_HOST);
        const broPrice = result.result?.data;
        // if (broPrice > 1800 || broPrice < 1700) {
            await bot.sendMessage(TELEGRAM_GROUP_ID, `Bro Price: ${broPrice} KDA`);
        // }
        console.log('Token Details:', result);
    } catch (error) {
        console.error('Error fetching token details:', error);
    }
}

// // Schedule the task to run every 1 minutes
// cron.schedule('*/1 * * * *', async () => {
//     try {
//         console.log('Fetching bro price...');
//         await getTokenDetails();
//         console.log('BRO price fetched successfully.');
//     } catch (error) {
//         console.error('Error running task:', error);
//     }
// });

// setInterval( async () => {
//     try {
//         console.log('Fetching bro price...');
//         await getTokenDetails();
//         console.log('BRO price fetched successfully.');
//     } catch (error) {
//         console.error('Error running task:', error);
//     }
// } , 5000)

app.get('/', async (req, res) => {
    try {
        console.log('Fetching BRO price...');
        const broPrice = await getTokenDetails();
        console.log('BRO price fetched successfully.');
        res.status(200).json({ message: `BRO Price: ${broPrice} KDA` });
    } catch (error) {
        console.error('Error running task:', error);
        res.status(500).json({ error: 'Failed to fetch BRO price' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
