const Duration = require("humanize-duration")
require("dotenv").config()

const keepAlive = require('./server');
const Monitor = require('ping-monitor');
 
keepAlive();
const monitor = new Monitor({
    website: 'https://Host.itzfox.repl.co',
    title: 'Secundario',
    interval: 5 // minutes
});

monitor.on('up', (res) => console.log(`${res.website} está encedido.`));
monitor.on('down', (res) => console.log(`${res.website} se ha caído - ${res.statusMessage}`));
monitor.on('stop', (website) => console.log(`${website} se ha parado.`) );
monitor.on('error', (error) => console.log(error));

//Discord
const Discord = require("discord.js")
const { MessageButton, MessageActionRow } = require("discord-buttons")
const { Collection, Client, MessageEmbed } = require("discord.js")
const cdUtil = require("./util/cooldowns.js")
const bdUtil = require("./util/sortBadges.js")
const ms = require("ms")
const fs = require("fs")

const bot = new Client({
  disableMentions: `everyone`
})

require("discord-buttons")(bot)

bot.games = new Map()

bot.cooldowns = new Collection()
bot.commands = new Collection()
bot.aliases = new Collection()
bot.categories = fs.readdirSync("./commands/");
["command"].forEach(handler => {
  require(`./handlers/${handler}`)(bot)
})

bot.config = require("./configuration/config.json")
bot.db = require("./base/db.json")

bot.login(process.env.token).catch(err => { console.log(err) })
bot.on("ready", () =>{
  console.log(`Done!\n${bot.user.tag} is now ready to bring the fun!`)
  bot.user.setActivity(`Connecting.. | ${bot.config.version}`, {type: "LISTENING"})

  let replace_phrases_guildcnt = [
    { text: `good`, min: 0, max: 25 },
    { text: `cool`, min: 25, max: 50 },
    { text: `epic`, min: 50, max: 100 },
    { text: `fantastic`, min: 100, max: 200 },
    { text: `legendary`, min: 200, max: 500 },
    { text: `squaretastic`, min: 500, max: 1000 },
  ]

  setInterval(function(){
    let status = [
      `participate in the monthly event`,
      `${bot.users.cache.size} users`,
      `${bot.guilds.cache.size} servers, that's ${replace_phrases_guildcnt.find(r => bot.guilds.cache.size >= r.min && bot.guilds.cache.size < r.max) ? replace_phrases_guildcnt.find(r => bot.guilds.cache.size >= r.min && bot.guilds.cache.size < r.max).text : replace_phrases_guildcnt[replace_phrases_guildcnt.length-1].text}`,
      `bring the vibe to Squarez`,
      `give it a go`
    ]

    bot.user.setActivity(status[Math.floor(Math.random() * status.length)] + ` | ${bot.config.version}`, {type: "LISTENING"})
  }, 15000)
})
bot.on("message", async(message) =>{

  // if(message.guild.id === "836264176149725226") return

  let prefix = bot.config.prefix
  const team = bot.db.teams.find(team => team.team.teamMembers.find(member => member.userID === message.author.id))
  if(team){

    // {
    //   "name": "Raise your team to the level 2",
    //   "reward": 120,
    //   "config": {"type": "raise", "apply": "team"},
    //   "allMembers": false,
    //   "completed": false
    // }

    if(team.leveling.xp >= team.leveling.rxp){
      team.leveling.xp = 0
      team.leveling.rxp += 150
      team.leveling.lvl++
    }
    
    //Beta: Only team level
    team.team.teamChallenges.forEach(challenge =>{
      if(challenge.name.includes("Raise") || challenge.name.includes("raise") && challenge.config.apply === "team"){
        let lvl = parseInt(challenge.name.split(" ").filter(char => !isNaN(char))[0])
        if(team.leveling.lvl >= lvl) challenge.completed = true
      }
    })

    fs.writeFile("./base/db.json", JSON.stringify(bot.db), (err) => { if(err) console.log(err) })
  }

  if(!message.guild) return
  if(!message.member) return
  if(message.member.user.bot) return

  //Sorting
  bot.db.data.forEach(user =>{
    bdUtil.sort(user.userID, bot)
  })
  fs.writeFile("./base/db.json", JSON.stringify(bot.db), (err) => { if(err) console.log(err) })

  //New user instance
  if(!bot.db.data.find(user => user.userID === message.author.id)){
    bot.db.data.push({
      userID: message.author.id,
      connection:{
        firstPlayed: null,
        firstLast: null
      },
      profile:{
        badge: {
          badges: []
        },
        gamesPlayed: 0,
        gamesWon: 0,
        gamesLost: 0,
        gridsColored: 0,
        powersTaken: 0
      },
      leveling:{
        xp: 0,
        nxp: 150,
        lvl: 1
      }
    })
    fs.writeFile("./base/db.json", JSON.stringify(bot.db), (err) => { if(err) console.log(err) })
  }

  if(Date.now() >= bot.db.event.deadline && bot.db.event.running){
    let leaderboard = bot.db.data.sort((a, b) => b.leveling.lvl === a.leveling.lvl ? b.leveling.xp - a.leveling.xp : b.leveling.lvl - a.leveling.xp)
    leaderboard = leaderboard.filter(user => !user.profile.badge.badges.includes("<:bad_10:853499394854354954>") && bot.users.cache.get(user.userID))

    let date = new Date()
    let days = new Date(date.getFullYear(), date.getMonth() + 2, 0).getDate()

    let winner_count = leaderboard.length >= 3 ? 3 : leaderboard.length

    const adChannel = bot.guilds.cache.get("838086291458621460").channels.cache.find(ch => ch.name.includes("events"))
    if(!adChannel) return

    const congMsg = await adChannel.send(`> **Event has Ended!**\n> **Winners:** ${leaderboard.map(user => { return `${bot.users.cache.get(user.userID) ? bot.users.cache.get(user.userID) : `Unknown user`}` }).join(", ")}`, {
      embed:{
        description: `The event of **${new Intl.DateTimeFormat("en-us").format(Date.now())}** has reached to their end!\nWe have **${leaderboard.length} winners** to announce`,
        fields:[
          {name: `Winners`, value: `${leaderboard.map(user => { return `**${bot.users.cache.get(user.userID) ? bot.users.cache.get(user.userID).tag : `Unknown user`}** : ${user.profile.badge.badges.includes("<:bad_10:853499394854354954>") ? `They have claimed their badge! Hope they like it` : `They haven't claimed their badge yet.. Let's wait until they claim it`}` })}`}
        ],
        image: { url: `https://cdn.discordapp.com/attachments/836246355693142056/849671017089597530/congrats.png` },
        color: bot.config.embed_color,
        timestamp: Date.now(),
        footer: { text: bot.user.username }
      }
    })

    for(let i = 0; i < winner_count; i++){
      if(leaderboard[i]){
        const member = bot.users.cache.get(leaderboard[i].userID)
        if(!member) return

        const acceptBadge = new MessageButton()
        .setStyle("blurple")
        .setLabel("Sweet!")
        .setID("accept-badge-button")

        const claimAction = new MessageActionRow()
        .addComponent(acceptBadge)

        const msg = await member.send(`> **Congratulations!**`, {
          embed:{
            description: `Hey there!\nHow's your day going? I hope that you're doing well\n\nI'm here to announce something speciall for you, it's about the event of every month`,
            fields:[
              {name: `Statistics`, value: `> **Final rank:** #${i+1}\n> **Prize:** You have received an unique and speciall badge in your profile of Squarez. This is how the badge looks like: <:bad_10:853499394854354954>\n> Enjoy it!`}
            ],
            color: bot.config.embed_color,
            timestamp: Date.now(),
            footer: { text: bot.user.username }
          },
          component: claimAction
        }).catch(err => { if(err) console.log(err) })
        if(!msg) return

        let filter = (button) => button.clicker.user.id === member.id
        const collector = await msg.createButtonCollector(filter)
        collector.on("collect", async(button) =>{
            button.defer()
            if(button.id === "accept-badge-button"){

              button.message.delete()

              const okButton = new MessageButton()
              .setStyle("blurple")
              .setLabel("Great!")
              .setID("okay-button")

              const okSadButton = new MessageButton()
              .setStyle("red")
              .setLabel("Oh ok..")
              .setID("okay-button")

              const player = bot.db.data.find(pl => pl.userID === button.clicker.user.id)
              if(player.profile.badge.badges.includes("<:bad_10:853499394854354954>")) return button.channel.send(`> **Oops!**`, {
                embed:{
                  description: `Looks like you already have the badge on your profile..\nThat badge looks pretty good on your profile :)`,
                  color: bot.config.embed_color,
                  timestamp: Date.now(),
                  footer: { text: bot.user.username }
                },
                component: okButton
              })
              if(!player){
                button.channel.send(`> **Oops!**`, {
                  embed:{
                    description: `Looks like something went wrong while giving you the badge..`,
                    color: bot.config.embed_color,
                    timestamp: Date.now(),
                    footer: { text: bot.user.username }
                  },
                  component: okSadButton
                })
                return
              }

              player.profile.badge.badges.push("<:bad_10:853499394854354954>")

              button.channel.send(`> **Sweet!**`, {
                embed:{
                  description: `Great!\nYou have claimed your badge! Enjoy it`,
                  color: bot.config.embed_color,
                  timestamp: Date.now(),
                  footer: { text: bot.user.username }
                },
                component: okButton
              })

              congMsg.edit(`> **Event has Ended!**\n> **Winners:** ${leaderboard.map(user => { return `${bot.users.cache.get(user.userID) ? bot.users.cache.get(user.userID) : `Unknown user`}` }).join(", ")}`, {
                embed:{
                  description: `The event of **${new Intl.DateTimeFormat("en-us").format(Date.now())}** has reached to their end!\nWe have **${leaderboard.length} winners** to announce`,
                  fields:[
                    {name: `Winners`, value: `${leaderboard.map(user => { return `**${bot.users.cache.get(user.userID) ? bot.users.cache.get(user.userID).tag : `Unknown user`}** : ${user.profile.badge.badges.includes("<:bad_10:853499394854354954>") ? `They have claimed their badge! Hope they like it` : `They haven't claimed their badge yet.. Let's wait until they claim it`}` })}`}
                  ],
                  image: { url: `https://cdn.discordapp.com/attachments/836246355693142056/849671017089597530/congrats.png` },
                  color: bot.config.embed_color,
                  timestamp: Date.now(),
                  footer: { text: bot.user.username }
                }
              })

              const mem = congMsg.guild.members.cache.get(button.clicker.user.id)
              if(mem){
                mem.roles.add("849671627033935902")
              }

              fs.writeFile("./base/db.json", JSON.stringify(bot.db), (err) => { if(err) console.log(err) })
            }
        })
      }
    }

    bot.db.event.deadline = Date.now() + 1000 * 60 * 60 * 24 * (days + 1)
    fs.writeFile("./base/db.json", JSON.stringify(bot.db), (err) => { if(err) console.log(err) })
  }

  if(!message.content.startsWith(prefix)) return
  
  const args = message.content.slice(prefix.length).trim().split(/ +/g);
  const cmd = args.shift().toLowerCase();

  const nfc_embed = new MessageEmbed()
  .setDescription(`There's no command called as **${cmd}**\nIf you don't know the commands, please run the command **${bot.config.prefix}help** for information`)
  .setColor(bot.config.embed_color)
  .setTimestamp()
  .setFooter(`${bot.user.username}`)

  let command = bot.commands.get(cmd)
  if(!command) command = bot.commands.get(bot.aliases.get(cmd))
  if(!command) return message.channel.send(`> **Unknown Command**`, nfc_embed)
  if(cdUtil.getCooldown(message.member, command, bot)) return message.channel.send(`> **Cooldown..**`, {
    embed:{
      description: `Sorry bud!\nYou must wait another **${cdUtil.getCooldown(message.member, command, bot)}** before using the command \`${command.name}\``,
      color: bot.config.embed_color,
      timestamp: Date.now(),
      footer: { text: bot.user.username }
    }
  }).then(m => { m.delete({timeout:5000}) })
  if(command){
    command.run(bot, message, args)
    cdUtil.addCooldown(message.member, command, bot)
  }
})
bot.on("click", (button) =>{

  button.defer()

  if(button.id === "okay-button"){
    button.message.delete()
  }
})