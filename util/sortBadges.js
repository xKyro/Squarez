module.exports.sort = async(userid, bot) =>{
  const data = bot.db.data.find(user => user.userID === userid)
  if(!data) return

  data.profile.badge.badges = await data.profile.badge.badges.sort((a, b) => bot.db.badges.sort[a] - bot.db.badges.sort[b])
}