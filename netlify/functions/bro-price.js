const TelegramBot = require('node-telegram-bot-api');
const Pact = require('pact-lang-api');

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
        await bot.sendMessage(TELEGRAM_GROUP_ID, `Bro Price: ${broPrice} KDA`);
        console.log('Token Details:', result);
    } catch (error) {
        console.error('Error fetching token details:', error);
    }
}

exports.handler = async function(event, context) {
    setInterval( async () => {
        await getTokenDetails();
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'BRO price fetched successfully.' }),
        };
    } , 60 * 1000);
};
