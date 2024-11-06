require("dotenv").config();
const { Telegraf, Markup, session } = require("telegraf");
const express = require('express');
const fetch = require('node-fetch');
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

// Initialize webhook with proper logging and error handling
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

const web_link = "https://vswaptest.netlify.app";

// Define the URL of the image you want to send
const imageUrl = "https://postimg.cc/dDVZzf99"; // 📌 **Replace this with your actual image URL**

// Handle the /start command with referral
bot.start((ctx) => {
    const startPayload = ctx.startPayload || "no_referrer"; // Extract the start payload (e.g., referral ID)
    const urlSent = `${web_link}?ref=${startPayload}`; // Generate the minigame URL including referral
    const user = ctx.message.from; // Get user details
    const userName = user.username ? `@${user.username}` : user.first_name;

    // Log the start payload and user information to verify if it's received correctly
    console.log("Received /start command with payload:", startPayload);
    console.log("User information:", user);

    // Send the welcome message with the image, caption, and buttons to start the game
    ctx.replyWithPhoto(imageUrl, {
        caption: `*Hey, ${userName}! Welcome to Vanilla Swap*\n\nClick on Play Now to start mining $Vswap now!`,
        parse_mode: "Markdown",
        reply_markup: {
            inline_keyboard: [
                [{ text: "⚡️ Play now! ⚡️", web_app: { url: urlSent } }],
                [{ text: "🧩 Join Our Telegram Channel 🧩", url: "https://t.me/vanillaswap_channel" }]
            ]
        }
    });
});

// Endpoint to check if the bot is awake
app.get("/", async (req, res) => {
    res.send("Hello! Bot is running fine.");
});

// Handle POST requests from Telegram for webhook updates
app.post(URI, (req, res) => {
    try {
        bot.handleUpdate(req.body); // Handle incoming updates from Telegram
        console.log("Received update from Telegram:", req.body); // Log received updates for debugging
        res.status(200).send('Received Telegram webhook');
    } catch (error) {
        console.error("Error processing Telegram update:", error); // Log errors during processing
        res.status(500).send('Error processing Telegram webhook');
    }
});

// Endpoint to verify webhook is set up correctly
app.get('/webhook', (req, res) => {
    res.send('Hey, Bot is awake and webhook is working!');
});

// Launch the bot (useful for local testing if not using webhooks)
bot.launch()
    .then(() => {
        console.log("Bot launched successfully");
    })
    .catch((err) => {
        console.error("Error launching bot:", err);
    });

// Optional: Graceful stop for bot on termination signal
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
