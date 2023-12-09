require('dotenv').config();
const { Client, IntentsBitField, ActivityType, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const { OpenAI } = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });


const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ],
});

let status = [
    {
        name: 'OpenAI',
        type: ActivityType.Playing,
    },
    {
        name: 'GitHub',
        type: ActivityType.Watching,
    },
];


client.on('ready', (c) => {
    console.log(`${c.user.tag} is online.`);

    setInterval(() => {
        let random = Math.floor(Math.random() * status.length);
        client.user.setActivity(status[random]);
    }, 240000);
});

const userStates = {}; // Object to keep track of each user's state

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand() || interaction.commandName !== 'explain') {
        return;
    }

    // Acknowledge the interaction
    await interaction.deferReply();

    const userId = interaction.user.id; // Get the user's ID

    // Initialize user state if not present
    if (!userStates[userId]) {
        userStates[userId] = {
            conversationHistory: [],
            isProcessing: false
        };
    }

    // Check if the user's previous prompt is still being processed
    if (userStates[userId].isProcessing) {
        return await interaction.followUp('Your previous request is still being processed. Please wait.');
    }

    // Mark as processing
    userStates[userId].isProcessing = true;

    const textToExplain = interaction.options.getString('prompt');

    if (!textToExplain) {
        userStates[userId].isProcessing = false; // Reset processing state
        return await interaction.followUp('Please provide text to explain.');
    }

    try {
        // Add the user's input to their conversation history
        userStates[userId].conversationHistory.push({ role: 'user', content: textToExplain });

        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: userStates[userId].conversationHistory, // Use the user's conversation history
        });

        if (response && response.choices && response.choices[0]) {
            const botReply = response.choices[0].message.content;
            const truncatedReply = botReply.slice(0, 1999);
            userStates[userId].conversationHistory.push({ role: 'assistant', content: botReply });

            userStates[userId].isProcessing = false; // Reset processing state
            await interaction.followUp(truncatedReply);
        } else {
            userStates[userId].isProcessing = false; // Reset processing state
            await interaction.followUp('An error occurred with the OpenAI response.');
        }
    } catch (error) {
        console.error('OpenAI error\n', error);
        userStates[userId].isProcessing = false; // Reset processing state
        await interaction.followUp('An error occurred with the OpenAI request.');
    }
});

// The 'about' command logic
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand() || interaction.commandName !== 'about') {
        return;
    }
    await interaction.reply('This bot is developed by KashiCode. You can find the source code on [GitHub](https://github.com/KashiCode).');

});

client.login(process.env.TOKEN);