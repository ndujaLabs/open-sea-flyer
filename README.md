# Discord Bot for OpenSea

### Forked from [https://github.com/0xEssential/opensea-discord-bot](https://github.com/0xEssential/opensea-discord-bot) and converted to pure Javascript

[comment]: <> (Need help? [Join us on Discord]&#40;https://discord.gg/BheNSUfcvm&#41;!)


This project includes a script that can be used to routinely hit the OpenSea API, check for recent sales on a collection, and post embeds into a Discord channel with information about the sale.

Please don't abuse the OpenSea API by running this more frequently than once per hour. Ideally you should request an API key from OpenSea, and in a perfect world you would instead use Webhooks from OpenSea.

## Prerequisites

You'll need a Discord bot who has the ability to post in a channel in your Discord server.

First, you need a Discord server where you have permission to add a Bot. It's free and easy to create your own Discord server.

Once you have a server you can use, grab the channel ID following the instructions at this Discord support article. You'll enable developer mode, which will allow you to easily copy the channel ID from the Discord app - https://support.discord.com/hc/en-us/articles/206346498-Where-can-I-find-my-User-Server-Message-ID-.

Next, create a New Application on the Discord developer portal by clicking the button in the top right corner at https://discord.com/developers/applications.

Give your application a name.

Click into the Bot menu item. You can name your bot and give it an avatar, but the only requirement is that you copy the Bot token:

![Discord bot token screenshot](./.github/bot-token.png)

Click into the OAuth2 menu item. Give your application the bot scope:

![Discord scopes screenshot](./.github/discord-scope.png)

Then, in the next section, give your bot the Send Messages permission under Text Permissions:

![Discord bot permissions screenshot](./.github/discord-bot-permissions.png)

Now you're ready to authenticate your bot to your server - copy the OAuth URL from the scopes box and open it in your browser. You'll be asked to give permission to the bot to enter your server.

Once the bot is in your server, ensure you have the following two values and you are ready to deploy or run your script:

- **botToken** i.e `SBI1MDI0NzUyNDQ3NzgyOTEz.YF36LQ.Sw-rczOfalK0lVzuW8vBjjcnsy0`
- **channelId** i.e. `814900494928445450`

## Run locally or on a remote machine

You can run this script locally by pulling the repo to your local machine.

First, install the dependencies with `npm` or `yarn`.

Then copy the `.env.example` file to `.env` and replace the example values with your own.

```
$ npm run start
```

Notice that Open Sea Flyer requires at least Node 14, because `discord.js` requires it.

If you put it on a remote server, use a process manager. We suggests [pm2](https://pm2.keymetrics.io/)

After installing it, you can run to launch the app with pm2 
```
./start.sh
```

# Copyright

Original author: [Sam Bauch](https://github.com/sbauch)

Contributors to the pure JS versions: [Francesco Sullo](https://francesco.sullo.co)

# License

MIT