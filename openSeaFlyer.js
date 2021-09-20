require('dotenv').config()
const Discord = require('discord.js')
const {Client, Intents} = Discord
const discordBot = new Client({intents: [Intents.FLAGS.GUILDS]})
// const { TextChannel } = Discord
const fetch = require('node-fetch')
const {ethers} = require("ethers")

const OPENSEA_SHARED_STOREFRONT_ADDRESS = '0x495f947276749Ce646f68AC8c248420045cb7b5e';
let channel
discordBot.login(process.env.DISCORD_BOT_TOKEN);
discordBot.on('ready', async () => {
  channel = await discordBot.channels.fetch(process.env.DISCORD_CHANNEL_ID)
  main()
})

const buildMessage = sale => {

  const {asset} = (sale || {})
  if (asset) {

    // console.log(asset)

    let {token_id, name, permalink, collection, image_original_url} = asset

    if (!name) {
      name = `EverDragons #${token_id}`
    }
    let buyer = sale.winner_account ? sale.winner_account.address : ''
    let seller = sale.seller ? sale.seller.address : ''

    return new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle(name + ' sold!')
        .setURL(permalink || '')
        // .setAuthor('Open Sea Flyer', 'https://files.readme.io/566c72b-opensea-logomark-full-colored.png', 'https://github.com/sbauch/opensea-discord-bot')
        // .setThumbnail(collection.image_url)
        .addFields(
            {name: 'Name', value: name},
            {
              name: 'Amount',
              value: `${ethers.utils.formatEther(sale.total_price || '0')}${ethers.constants.EtherSymbol}`
            },
            {name: 'Buyer', value: buyer},
            {name: 'Seller', value: seller},
        )
        .setImage(image_original_url.replace(/svg$/, 'png'))
        .setTimestamp(Date.parse(`${sale.created_date}Z`))
        .setFooter('Sold on OpenSea', 'https://files.readme.io/566c72b-opensea-logomark-full-colored.png')
  }
}

function has(obj, ...props) {
  if (!obj) {
    return false
  } else {
    for (let p of props) {
      if (!obj[p]) {
        return false
      }
      obj = obj[p]
    }
  }
  return true
}

async function sleep(millis) {
  return new Promise(resolve => setTimeout(resolve, millis))
}

async function main() {
  const seconds = process.env.SECONDS ? parseInt(process.env.SECONDS) : 3600;
  // const seconds = 22000
  const afterLastCheck = (Math.round(new Date().getTime() / 1000) - (seconds))

  const params = new URLSearchParams({
    offset: '0',
    event_type: 'successful',
    only_opensea: 'false',
    occurred_after: afterLastCheck.toString(),
    collection_slug: process.env.COLLECTION_SLUG
  })

  if (process.env.CONTRACT_ADDRESS !== OPENSEA_SHARED_STOREFRONT_ADDRESS) {
    params.append('asset_contract_address', process.env.CONTRACT_ADDRESS)
  }

  const openSeaResponse = await fetch(
      "https://api.opensea.io/api/v1/events?" + params).then((resp) => resp.json());

  if (has(openSeaResponse, 'asset_events')) {

    let embeds = []
    for (let sale of openSeaResponse.asset_events.reverse()) {
      embeds.push(buildMessage(sale))
    }

    await channel.send({embeds})
  }

  await sleep(parseInt(process.env.SECONDS) * 1000)
  main()
}
