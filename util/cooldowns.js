const Duration = require("humanize-duration")
module.exports.addCooldown = (user, command, bot) =>{
  if(!command || !bot) return
  switch(command.cooldown.type){
    case "s":
      bot.cooldowns.set(`${user.id}-cd.${command.name}`, Date.now() + 1000 * command.cooldown.time)
      setTimeout(() =>{
        bot.cooldowns.delete(`${user.id}-cd.${command.name}`)
      }, 1000 * command.cooldown.time)
      break
    case "m":
      bot.cooldowns.set(`${user.id}-cd.${command.name}`, Date.now() + 1000 * 60 * command.cooldown.time)
      setTimeout(() =>{
        bot.cooldowns.delete(`${user.id}-cd.${command.name}`)
      }, 1000 * 60 * command.cooldown.time)
      break
    case "h":
      bot.cooldowns.set(`${user.id}-cd.${command.name}`, Date.now() + 1000 * 60 * 60 * command.cooldown.time)
      setTimeout(() =>{
        bot.cooldowns.delete(`${user.id}-cd.${command.name}`)
      }, 1000 * 60 * 60 * command.cooldown.time)
      break
    default:
      throw new Error(`INVALID_COOLDOWN_TIME_TYPE`)
      break
  }
}
module.exports.getCooldown = (user, command, bot) =>{
  if(!command || !bot) return
  const cooldown = bot.cooldowns.get(`${user.id}-cd.${command.name}`)
  if(!cooldown) return
  const rem = Duration(cooldown - Date.now(), { units: ["h", "m", "s"], largest: 2, round: true })
  return rem
}