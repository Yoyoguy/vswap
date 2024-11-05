require("dotenv").config();
const { Telegraf, Markup, session } = require("telegraf");
const express = require('express');
const fetch = require('node-fetch');
// const cors = require('cors');
const app = express();
const bodyParser = require("body-parser");
const axios = require("axios");

const port = process.env.PORT || 4040;
const hook = process.env.WEBHOOK_URL;
const { BOT_TOKEN, SERVER_URL } = process.env;

const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;
const URI = `/webhook/${BOT_TOKEN}`;
const WEBHOOK_URL = SERVER_URL + URI;

app.use(express.json());
app.use(bodyParser.json());

const init = async () => {
    try {
        const res = await axios.get(`${TELEGRAM_API}/setWebhook?url=${WEBHOOK_URL}`);
        console.log('Webhook set:', res.data);
    } catch (error) {
        console.error('Error setting webhook:', error);
    }
};

app.listen(port, async () => {
    console.log('App is running on port', port);
    await init();
});

const bot = new Telegraf(BOT_TOKEN);

const web_link = "https://vanilllaswap.netlify.app/";

// Define the URL of the image you want to send
const imageUrl = "https://postimg.cc/dDVZzf99"; // 📌 **Replace this with your actual image URL**

bot.start((ctx) => {
    const startPayload = ctx.startPayload;
    const urlSent = `${web_link}?ref=${startPayload}`;
    const user = ctx.message.from;
    const userName = user.username ? `@${user.username}` : user.first_name;

    // Send the image with caption and inline keyboard
    ctx.replyWithPhoto(imageUrl, {
        caption: `*Hey, ${userName}! Welcome to Demo Tap App!*\n\nClick on Play Now to start mining Ton Coin`,
        parse_mode: "Markdown",
        reply_markup: {
            inline_keyboard: [
                [{ text: "⚡️Play now!⚡️", web_app: { url: urlSent } }],
                [{ text: "🧩 Join Our Telegram Channel 🧩", url: "https://t.me/vanillaswap_channel" }]
                // [{ text: "Bot App Demo 2 🧩", web_app: { url: urlSentTwo } }],
            ]
        }
    });
});

app.get("/", async (req, res) => {
    res.send("Hello! Get me here I work fine.");
});

app.post(URI, (req, res) => {
    bot.handleUpdate(req.body);
    res.status(200).send('Received Telegram webhook');
});

app.get('/webhook', (req, res) => {
    res.send('Hey, Bot is awake!');
});
