require('dotenv').config();
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

const commands = [
    {
        name: 'explain',
        description: 'Use GPT-3.5 to explain something.',
        type: 1, 
        options: [
            {
                name: 'prompt',
                description: 'The text to be explained (1000 characters limit).',
                type: 3, 
                required: true,
            },
        ],
    },
    {
        name: 'about',
        description: 'Get information about ChatGPT bot.',
        type: 1 
    },
];


// node src/register-commands.js

const rest = new REST({version: '10'}).setToken(process.env.TOKEN);

(async() => {
    try{
        console.log('Registering slash commands');
        
        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: commands }

        )

        console.log('slash commands were registered sucessfully.')

    } catch(error) {
        console.log(`There was an error: ${error}`);


    }


})();