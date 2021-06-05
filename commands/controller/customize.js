const {MessageEmbed} = require("discord.js")
const fs = require("fs")
const ms = require("ms")
module.exports={
  name: "customize",
  category: "controller",
  description: "Bring your crazy ideas! Customize your game to make it more fun",
  aliases: ["custom"],
  run: async(bot, message, args) =>{
    
    //Check game instance
    let gameCode = ""
    bot.games.forEach(game =>{
        if(game.gamePlayersJoined.includes(message.author.id)){
            gameCode = game.gameCode
        }
    })

    const game = await bot.games.get(gameCode)
    if(!game) return message.channel.send(`> **Oops!**`, {
        embed:{
            description: `${bot.db.messages.err}\n> \`Your game couldn't be found\``,
            color: bot.config.embed_color,
            timestamp: Date.now(),
            footer: { text: `${bot.user.username}`}
        }
    })
    if(game.gameHost !== message.author.id) return message.channel.send(`> **Oops!**`, {
        embed:{
            description: `${bot.db.messages.err}\n> \`You're not the Host of the actual game\``,
            color: bot.config.embed_color,
            timestamp: Date.now(),
            footer: { text: `${bot.user.username}`}
        }
    })

    //Then do
    let properties = ["game.winners", "game.players", "game.time", "game.grid", "game.privacy", "game.powers", "game.powers.bomb", "game.powers.lr", "game.powers.ud"]
    let property = args[0]
    
    if(!property) return message.channel.send(`> **Arguments**`, {
        embed:{
            description: `${bot.db.messages.args}\n> \`${bot.config.prefix}customize <property> <value>\`\n\nUse any of these properties: \`${properties.map(p => p).join(", ")}\``,
            color: bot.config.embed_color,
            timestamp: Date.now(),
            footer: { text: `${bot.user.username}`}
        }
    })
    if(!properties.includes(property)) return message.channel.send(`> **Oops!**`, {
        embed:{
            description: `${bot.db.messages.err}\n> \`The property "${property}" couldn't be found\`\n> \`Try it out with: ${properties.map(p => p).join(", ")}\``,
            color: bot.config.embed_color,
            timestamp: Date.now(),
            footer: { text: `${bot.user.username}`}
        }
    })

    switch(property){
        case "game.winners":
            if(!args[1]) return message.channel.send(`> **Arguments**`, {
                embed:{
                    description: `${bot.db.messages.args}\n> \`${bot.config.prefix}customize ${property} <value>\``,
                    color: bot.config.embed_color,
                    timestamp: Date.now(),
                    footer: { text: `${bot.user.username}`}
                }
            })

            if(isNaN(args[1])) return message.channel.send(`> **Oops!**`, {
                embed:{
                    description: `${bot.db.messages.err}\n> \`The value must be a number\``,
                    color: bot.config.embed_color,
                    timestamp: Date.now(),
                    footer: { text: `${bot.user.username}`}
                }
            })

            if(parseInt(args[1]) <= 0 || parseInt(args[1]) > 3) return message.channel.send(`> **Oops!**`, {
                embed:{
                    description: `${bot.db.messages.err}\n> \`The value must be in a range from 1 - 3\``,
                    color: bot.config.embed_color,
                    timestamp: Date.now(),
                    footer: { text: `${bot.user.username}`}
                }
            })

            game.gameWinners = parseInt(args[1])
            message.channel.send(`> **Done!**`, {
                embed:{
                    description: `The max winners for the game has been set to **${args[1]} winners**`,
                    color: bot.config.embed_color,
                    timestamp: Date.now(),
                    footer: { text: `${bot.user.username}`}
                }
            })
            break;
        case "game.players":
            if(!args[1]) return message.channel.send(`> **Arguments**`, {
                embed:{
                    description: `${bot.db.messages.args}\n> \`${bot.config.prefix}customize ${property} <value>\``,
                    color: bot.config.embed_color,
                    timestamp: Date.now(),
                    footer: { text: `${bot.user.username}`}
                }
            })

            if(isNaN(args[1])) return message.channel.send(`> **Oops!**`, {
                embed:{
                    description: `${bot.db.messages.err}\n> \`The value must be a number\``,
                    color: bot.config.embed_color,
                    timestamp: Date.now(),
                    footer: { text: `${bot.user.username}`}
                }
            })

            if(parseInt(args[1]) <= 0 || parseInt(args[1]) > 4) return message.channel.send(`> **Oops!**`, {
                embed:{
                    description: `${bot.db.messages.err}\n> \`The value must be in a range from 1 - 4\``,
                    color: bot.config.embed_color,
                    timestamp: Date.now(),
                    footer: { text: `${bot.user.username}`}
                }
            })

            game.gamePlayers = parseInt(args[1])
            message.channel.send(`> **Done!**`, {
                embed:{
                    description: `The max players for the game has been set to **${args[1]} players**`,
                    color: bot.config.embed_color,
                    timestamp: Date.now(),
                    footer: { text: `${bot.user.username}`}
                }
            })
            break;
        case "game.time":
            if(!args[1]) return message.channel.send(`> **Arguments**`, {
                embed:{
                    description: `${bot.db.messages.args}\n> \`${bot.config.prefix}customize ${property} <value>\``,
                    color: bot.config.embed_color,
                    timestamp: Date.now(),
                    footer: { text: `${bot.user.username}`}
                }
            })
            if(!["m"].includes(args[1][args[1].length-1])) return message.channel.send(`> **Oops!**`, {
                embed:{
                    description: `${bot.db.messages.err}\n> \`The value must be "m"\``,
                    color: bot.config.embed_color,
                    timestamp: Date.now(),
                    footer: { text: `${bot.user.username}`}
                }
            })
            if(!ms(args[1])) return message.channel.send(`> **Oops!**`, {
                embed:{
                    description: `${bot.db.messages.err}\n> \`The value is not correct\``,
                    color: bot.config.embed_color,
                    timestamp: Date.now(),
                    footer: { text: `${bot.user.username}`}
                }
            })

            game.gameDuration = args[1]
            message.channel.send(`> **Done!**`, {
                embed:{
                    description: `The game duration has been set to **${args[1]}**`,
                    color: bot.config.embed_color,
                    timestamp: Date.now(),
                    footer: { text: `${bot.user.username}`}
                }
            })
            break;
        case "game.grid":
            if(!args[1]) return message.channel.send(`> **Arguments**`, {
                embed:{
                    description: `${bot.db.messages.args}\n> \`${bot.config.prefix}customize ${property} <value>\``,
                    color: bot.config.embed_color,
                    timestamp: Date.now(),
                    footer: { text: `${bot.user.username}`}
                }
            })
            if(!args[1].split("x") || args[1].split("x").length < 2) return message.channel.send(`> **Oops!**`, {
                embed:{
                    description: `${bot.db.messages.err}\n> \`Enter the grid length in X and Y\`\n> \`Ex: 5x5\``,
                    color: bot.config.embed_color,
                    timestamp: Date.now(),
                    footer: { text: `${bot.user.username}`}
                }
            })
            if(!parseInt(args[1].split("x")[0]) || !parseInt(args[1].split("x")[1])) return message.channel.send(`> **Oops!**`, {
                embed:{
                    description: `${bot.db.messages.err}\n> \`The grid X value is not a number\`\n> \`The grid Y value is not a number\``,
                    color: bot.config.embed_color,
                    timestamp: Date.now(),
                    footer: { text: `${bot.user.username}`}
                }
            })
            if(parseInt(args[1].split("x")[0]) !== parseInt(args[1].split("x")[1])) return message.channel.send(`> **Oops!**`, {
                embed:{
                    description: `${bot.db.messages.err}\n> \`The grid X value is not equal to grid Y value\``,
                    color: bot.config.embed_color,
                    timestamp: Date.now(),
                    footer: { text: `${bot.user.username}`}
                }
            })
            if(parseInt(args[1].split("x")[0]) < 4 || parseInt(args[1].split("x")[0]) > 8 || parseInt(args[1].split("x")[1]) < 4 || parseInt(args[1].split("x")[1]) > 8) return message.channel.send(`> **Oops!**`, {
                embed:{
                    description: `${bot.db.messages.err}\n> \`The grid X and Y value are greater than 8 or less than 4\``,
                    color: bot.config.embed_color,
                    timestamp: Date.now(),
                    footer: { text: `${bot.user.username}`}
                }
            })

            game.gameGridLength = parseInt(args[1].split("x")[0])
            message.channel.send(`> **Done!**`, {
                embed:{
                    description: `The game grid has been set to **${args[1]}**`,
                    color: bot.config.embed_color,
                    timestamp: Date.now(),
                    footer: { text: `${bot.user.username}`}
                }
            })
            break;
        case "game.privacy":
            if(!args[1]) return message.channel.send(`> **Arguments**`, {
                embed:{
                    description: `${bot.db.messages.args}\n> \`${bot.config.prefix}customize ${property} <value>\``,
                    color: bot.config.embed_color,
                    timestamp: Date.now(),
                    footer: { text: `${bot.user.username}`}
                }
            })
            if(args[1] !== "public" && args[1] !== "private") return message.channel.send(`> **Oops!**`, {
                embed:{
                    description: `${bot.db.messages.err}\n> \`The value must be "public" or "private"\``,
                    color: bot.config.embed_color,
                    timestamp: Date.now(),
                    footer: { text: `${bot.user.username}`}
                }
            })
            game.gamePrivacy = args[1]
            message.channel.send(`> **Done!**`, {
                embed:{
                    description: `The game privacy has been set to **${args[1]}**`,
                    color: bot.config.embed_color,
                    timestamp: Date.now(),
                    footer: { text: `${bot.user.username}`}
                }
            })
            break;
        case "game.powers":
            if(!args[1]) return message.channel.send(`> **Arguments**`, {
                embed:{
                    description: `${bot.db.messages.args}\n> \`${bot.config.prefix}customize ${property} <value>\``,
                    color: bot.config.embed_color,
                    timestamp: Date.now(),
                    footer: { text: `${bot.user.username}`}
                }
            })

            if(args[1] !== "no" && args[1] !== "yes") return message.channel.send(`> **Oops!**`, {
                embed:{
                    description: `${bot.db.messages.err}\n> \`The value must be "yes" or "no"\``,
                    color: bot.config.embed_color,
                    timestamp: Date.now(),
                    footer: { text: `${bot.user.username}`}
                }
            })

            game.gamePowers.enabled = args[1]
            message.channel.send(`> **Done!**`, {
                embed:{
                    description: `The game powers were ${args[1] === "yes" ? `activated\nCan spawn powers like: \`Bomb, LR and UD\`` : `deactivated`}`,
                    color: bot.config.embed_color,
                    timestamp: Date.now(),
                    footer: { text: `${bot.user.username}`}
                }
            })
            break;
        case "game.powers.bomb":
            if(game.gamePowers.enabled === "no") return message.channel.send(`> **Oops!**`, {
                embed:{
                    description: `${bot.db.messages.err}\n> \`The powers aren't enabled in this game\``,
                    color: bot.config.embed_color,
                    timestamp: Date.now(),
                    footer: { text: `${bot.user.username}`}
                }
            })
            if(!args[1]) return message.channel.send(`> **Arguments**`, {
                embed:{
                    description: `${bot.db.messages.args}\n> \`${bot.config.prefix}customize ${property} <value>\``,
                    color: bot.config.embed_color,
                    timestamp: Date.now(),
                    footer: { text: `${bot.user.username}`}
                }
            })
            if(isNaN(args[1]) && args[1] !== "0") return message.channel.send(`> **Oops!**`, {
                embed:{
                    description: `${bot.db.messages.err}\n> \`The value is not a number\``,
                    color: bot.config.embed_color,
                    timestamp: Date.now(),
                    footer: { text: `${bot.user.username}`}
                }
            })
            if(parseInt(args[1]) > 2 && args[1] !== "0") return message.channel.send(`> **Oops!**`, {
                embed:{
                    description: `${bot.db.messages.err}\n> \`The value is greater than 2\``,
                    color: bot.config.embed_color,
                    timestamp: Date.now(),
                    footer: { text: `${bot.user.username}`}
                }
            })

            game.gamePowers.powers.find(power => power.name === "bomb").instances = parseInt(args[1]) ? parseInt(args[1]) : 0
            message.channel.send(`> **Done!**`, {
                embed:{
                    description: `The instances of the power **"Bomb"** has been set to **${args[1]}**`,
                    color: bot.config.embed_color,
                    timestamp: Date.now(),
                    footer: { text: `${bot.user.username}`}
                }
            })
            break;
        case "game.powers.lr":
            if(game.gamePowers.enabled === "no") return message.channel.send(`> **Oops!**`, {
                embed:{
                    description: `${bot.db.messages.err}\n> \`The powers aren't enabled in this game\``,
                    color: bot.config.embed_color,
                    timestamp: Date.now(),
                    footer: { text: `${bot.user.username}`}
                }
            })
            if(!args[1]) return message.channel.send(`> **Arguments**`, {
                embed:{
                    description: `${bot.db.messages.args}\n> \`${bot.config.prefix}customize ${property} <value>\``,
                    color: bot.config.embed_color,
                    timestamp: Date.now(),
                    footer: { text: `${bot.user.username}`}
                }
            })
            if(isNaN(args[1]) && args[1] !== "0") return message.channel.send(`> **Oops!**`, {
                embed:{
                    description: `${bot.db.messages.err}\n> \`The value is not a number\``,
                    color: bot.config.embed_color,
                    timestamp: Date.now(),
                    footer: { text: `${bot.user.username}`}
                }
            })
            if(parseInt(args[1]) > 2 && args[1] !== "0") return message.channel.send(`> **Oops!**`, {
                embed:{
                    description: `${bot.db.messages.err}\n> \`The value is greater than 2\``,
                    color: bot.config.embed_color,
                    timestamp: Date.now(),
                    footer: { text: `${bot.user.username}`}
                }
            })

            game.gamePowers.powers.find(power => power.name === "lr").instances = parseInt(args[1]) ? parseInt(args[1]) : 0
            message.channel.send(`> **Done!**`, {
                embed:{
                    description: `The instances of the power **"Lefr-Right Line"** has been set to **${args[1]}**`,
                    color: bot.config.embed_color,
                    timestamp: Date.now(),
                    footer: { text: `${bot.user.username}`}
                }
            })
            break;
        case "game.powers.ud":
            if(game.gamePowers.enabled === "no") return message.channel.send(`> **Oops!**`, {
                embed:{
                    description: `${bot.db.messages.err}\n> \`The powers aren't enabled in this game\``,
                    color: bot.config.embed_color,
                    timestamp: Date.now(),
                    footer: { text: `${bot.user.username}`}
                }
            })
            if(!args[1]) return message.channel.send(`> **Arguments**`, {
                embed:{
                    description: `${bot.db.messages.args}\n> \`${bot.config.prefix}customize ${property} <value>\``,
                    color: bot.config.embed_color,
                    timestamp: Date.now(),
                    footer: { text: `${bot.user.username}`}
                }
            })
            if(isNaN(args[1]) && args[1] !== "0") return message.channel.send(`> **Oops!**`, {
                embed:{
                    description: `${bot.db.messages.err}\n> \`The value is not a number\``,
                    color: bot.config.embed_color,
                    timestamp: Date.now(),
                    footer: { text: `${bot.user.username}`}
                }
            })
            if(parseInt(args[1]) > 2 && args[1] !== "0") return message.channel.send(`> **Oops!**`, {
                embed:{
                    description: `${bot.db.messages.err}\n> \`The value is greater than 2\``,
                    color: bot.config.embed_color,
                    timestamp: Date.now(),
                    footer: { text: `${bot.user.username}`}
                }
            })

            game.gamePowers.powers.find(power => power.name === "ud").instances = parseInt(args[1]) ? parseInt(args[1]) : 0
            message.channel.send(`> **Done!**`, {
                embed:{
                    description: `The instances of the power **"Up-Down Line"** has been set to **${args[1]}**`,
                    color: bot.config.embed_color,
                    timestamp: Date.now(),
                    footer: { text: `${bot.user.username}`}
                }
            })
            break;
    }
  }
}