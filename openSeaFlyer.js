require('dotenv').config()
const chalk = require('chalk')
const Discord = require('discord.js')
const {Client, Intents} = Discord
const discordBot = new Client({intents: [Intents.FLAGS.GUILDS]})
// const { TextChannel } = Discord
const {ethers} = require("ethers")
const superagent = require('superagent')
const { SHA3 } = require('sha3')

const OPENSEA_SHARED_STOREFRONT_ADDRESS = '0x495f947276749Ce646f68AC8c248420045cb7b5e'

let failed = []
;[
  'CONTRACT_ADDRESS',
  'COLLECTION_SLUG',
  'DISCORD_BOT_TOKEN',
  'DISCORD_CHANNEL_ID'].map(f => {
  if (!process.env[f]) {
    failed.push(f)
  }
})
if (failed.length) {
  console.log(chalk.red(`.env file not properly configured.
The following variables are missing:
${failed.join('\n')}  
`))
  process.exit(1)
}

let channel
discordBot.login(process.env.DISCORD_BOT_TOKEN);
discordBot.on('ready', async () => {
  channel = await discordBot.channels.fetch(process.env.DISCORD_CHANNEL_ID)
  main()
})

const history = {}

const buildMessage = sale => {

  const {asset} = (sale || {})
  if (asset) {

    let {token_id, name, permalink, collection, image_original_url} = asset

    if (!name) {
      name = `EverDragons #${token_id}`
    }
    let buyer = sale.winner_account ? sale.winner_account.address : ''
    let seller = sale.seller ? sale.seller.address : ''

    let title
    let fields

    function getPrice(price) {
      return `${ethers.utils.formatEther(price || '0')}${ethers.constants.EtherSymbol}`
    }
    console.log('Event_type', sale.event_type)
    switch (sale.event_type) {
      case 'successful':
        title = name + ' sold!'
        fields = [
          {name: 'Seller', value: seller},
          {name: 'Buyer', value: buyer},
          {name: 'Price', value: getPrice(sale.total_price)}
        ]
        break
      case 'created':
        title = name + ' is on auction!'
        fields = [
          {name: 'Seller', value: seller},
          {name: 'Price', value: getPrice(sale.starting_price)}
        ]
        break
      case 'bid_entered':
        title = 'New bid for ' + name
        fields = [
          {name: 'Buyer', value: buyer},
          {name: 'Price', value: getPrice(sale.bid_amount)}
        ]
        break
      case 'offer_entered':
        title = 'New offer for ' + name
        fields = [
          {name: 'From', value: sale.from_account.address},
          {name: 'Price', value: getPrice(sale.bid_amount)}
        ]
        break
      case 'transfer':
        title = name + ' transferred'
        fields = [
          {name: 'From', value: sale.from_account.address},
          {name: 'To', value: sale.to_account.address}
        ]
        break
      default:
        // not supported event types
        console.log('Event_type', sale.event_type)
        return false
    }
    const hash = new SHA3(512)
    hash.update(JSON.stringify({data: [title, fields]}))
    const key = hash.digest('hex')
    if (history[key]) return false
    history[key] = true

    return new Discord.MessageEmbed()
        .setColor('#fff8bb')
        .setTitle(title)
        .setURL(permalink || '')
        // .setAuthor('Open Sea Flyer', 'https://files.readme.io/566c72b-opensea-logomark-full-colored.png', 'https://github.com/sbauch/opensea-discord-bot')
        // .setThumbnail(collection.image_url)
        .addFields(...fields)
        .setImage(image_original_url.replace(/svg$/, 'png'))
        .setTimestamp(Date.parse(`${sale.created_date}Z`))
        .setFooter('OpenSea', 'https://files.readme.io/566c72b-opensea-logomark-full-colored.png')
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
  const afterLastCheck = (Math.round(new Date().getTime() / 1000) - (seconds))

  const params = new URLSearchParams({
    offset: '0',
    // event_type: 'offer_entered',
    only_opensea: 'false',
    limit: '10',
    occurred_after: afterLastCheck.toString(),
    collection_slug: process.env.COLLECTION_SLUG
  })

  if (process.env.CONTRACT_ADDRESS !== OPENSEA_SHARED_STOREFRONT_ADDRESS) {
    params.append('asset_contract_address', process.env.CONTRACT_ADDRESS)
  }

  try {
    let openSeaResponse = (await superagent.get("https://api.opensea.io/api/v1/events?" + params)
        .set({Accept: 'application/json'})).body

    if (has(openSeaResponse, 'asset_events')) {

      for (let sale of openSeaResponse.asset_events.reverse()) {
        const message = buildMessage(sale)
        if (message) {
          // console.log(message)
          await channel.send({embeds: [message]})
          await sleep(3000)
        }
      }
    }
  } catch (e) {
    console.error(e)
  }

  await sleep(parseInt(process.env.SECONDS) * 1000)
  // await sleep(10 * 1000)
  main()
}
