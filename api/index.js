import express from 'express';

// pages/api/auto-pump.js
import 'dotenv/config';
import { Pact, isSignedTransaction, createSignWithKeypair, createClient } from '@kadena/client';
import TelegramBot from 'node-telegram-bot-api';
import Decimal from 'decimal.js';

// Environment Variables
const token = process.env.TELEGRAM_BOT_TOKEN;
const BRO_PUBKEY = process.env.BRO_PUBKEY;
const BRO_PRIVKEY = process.env.BRO_PRIVKEY;
const groupId = process.env.GROUP_ID;
const apiHost = process.env.API_HOST || 'https://api.testnet.chainweb.com';
const network = process.env.NETWORK || 'testnet04';
const defaultChain = parseInt(process.env.DEFAULT_CHAIN, 10) || 18;
const GAS_PRICE = process.env.GAS_PRICE || '0.00000001';
const brons = process.env.BRONS;
const bro = `${brons}.bro`;
const bro_treasury = `${brons}.bro-treasury`;

// Create bot
const bot = new TelegramBot(token, { polling: true });

// Create signer
const bot_signer = createSignWithKeypair({ publicKey: BRO_PUBKEY, secretKey: BRO_PRIVKEY });

const getClient = (chain = defaultChain) => createClient(`${apiHost}/chainweb/0.0/${network}/chain/${chain}/pact`);

const app = express();

app.get("/", (req, res) => {
    res.send("Express on Vercel");
    do_auto_pump()
});

app.listen(3000, () => console.log("Server ready on port 3000."));

// Define your auto-pump function
export async function do_auto_pump() {
    const gatherable_rewards = await gatherableRewards();
    console.log(`Rewards available: ${gatherable_rewards}`);

    if (gatherable_rewards.gte(Decimal('0.01'))) {
        console.log('Auto pumping');
        const msg = await bot.sendMessage(groupId, 'Auto-pumping $BRO in progress');
        const requestKey = await gather_rewards();
        const statusResult = await status(requestKey);

        if (statusResult?.result?.status === 'success') {
            await msg.edit('Auto-pump successful');
        } else {
            await msg.edit('Auto-pump error');
        }

        setTimeout(() => msg.delete({ revoke: true }), 3600_000);
        const price = await getBroPrice();
        const priceMessage = `New price: ${price.toString()} KDA / $BRO`;
        const priceMsg = await bot.sendMessage(groupId, priceMessage);
        setTimeout(() => priceMsg.delete({ revoke: true }), 3600_000);
    } else {
        console.log('Not enough rewards to gather => Cancel');
    }
}

const gatherableRewards = async () => {
    const code = `(${bro_treasury}.liquidity-to-remove)`;
    const response = await pactCalls(code, defaultChain);
    return parsePactResponseThrow(response);
};

const gather_rewards = async () => {
    const jsclient = getClient();
    const unsignedTransaction = Pact.builder
        .execution(`(${brons}.bro-treasury.gather-rewards)`)
        .setMeta({
            chainId: String(defaultChain),
            senderAccount: `r:${brons}.bot`,
            gasLimit: 12000,
            gasPrice: GAS_PRICE,
            ttl: 14400,
        })
        .addSigner(BRO_PUBKEY, signFor => [
            signFor('coin.GAS'),
            signFor(`${brons}.bro-treasury.OPERATE-DEX`),
        ])
        .setNetworkId(network)
        .createTransaction();
    const signedTx = await bot_signer(unsignedTransaction);

    const preflightResult = await jsclient.preflight(signedTx);
    if (preflightResult.result.status === 'failure') {
        throw new Error(preflightResult.result.error.message);
    }

    if (isSignedTransaction(signedTx)) {
        const transactionDescriptor = await jsclient.submit(signedTx);
        return transactionDescriptor.requestKey;
    }
};

const status = async (hash) => {
    const jsclient = getClient();
    const result = await jsclient.pollStatus(
        { requestKey: hash, chainId: defaultChain, networkId: network },
        { timeout: 240_000, interval: 5000 }
    );
    return result?.[hash];
};

const getBroPrice = async () => {
    const code = `(let ((acct (${bro_treasury}.dex-account)))
                 (round (/ (coin.get-balance acct)
                           (${bro}.get-balance acct))
                        2))`;
    const response = await pactCalls(code, defaultChain);
    return parsePactResponseThrow(response);
};

const parsePactResponseThrow = (response) => {
    if (response?.result?.status === 'success') {
        return Decimal(response.result.data);
    }
    throw new Error(response?.result?.error?.message);
};

const pactCalls = async (code, chain) => {
    const pactClient = getClient(chain);
    const tx = Pact.builder
        .execution(code)
        .setMeta({
            chainId: String(chain),
            gasLimit: 100000,
            gasPrice: 0.0000001,
        })
        .setNetworkId(network)
        .createTransaction();

    try {
        return await pactClient.dirtyRead(tx);
    } catch (error) {
        console.error('Error fetching account details:', error);
        throw error;
    }
};
