const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("TR54 Bot Aktif");
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Web server aktif");
});

const {
Client,
GatewayIntentBits,
PermissionsBitField,
ChannelType,
EmbedBuilder,
ActionRowBuilder,
ButtonBuilder,
ButtonStyle,
ModalBuilder,
TextInputBuilder,
TextInputStyle
} = require("discord.js");

const TOKEN = process.env.TOKEN; 

const JOIN_CHANNEL_ID = "1478397454817951966";
const AUTO_ROLE_ID = "1478125999626649761";
const REGISTER_CHANNEL_ID = "1478126023554891950";
const TICKET_CATEGORY_ID = "1478408800871645364";
const CLOSED_CATEGORY_ID = "1478409183236980939";
const MESSAGE_LOG_CHANNEL_ID = "1478400764299710516";
const KICK_LOG_CHANNEL_ID = "1478401069775192190";
const CHANNEL_LOG_CHANNEL_ID = "1478126024788021309";
const LEAVE_CHANNEL_ID = "1478397454817951966";


const client = new Client({
intents:[
GatewayIntentBits.Guilds,
GatewayIntentBits.GuildMessages,
GatewayIntentBits.MessageContent,
GatewayIntentBits.GuildMembers
]
});

/* READY */

client.once("ready",()=>{
console.log(`${client.user.tag} aktif`);
});



/* AUTO ROLE */

client.on("guildMemberAdd",async member=>{
const role = member.guild.roles.cache.get(AUTO_ROLE_ID);
if(role) member.roles.add(role).catch(()=>{});
});



/* GELİŞMİŞ GİRİŞ SİSTEMİ */

const JOIN_CHANNEL_ID = "KANAL_ID_BURAYA";

client.on("guildMemberAdd", async member => {

const channel = member.guild.channels.cache.get(JOIN_CHANNEL_ID);
if(!channel) return;

const created = member.user.createdAt;

const embed = new EmbedBuilder()
.setColor(0x00ff00)
.setTitle("TR54 Ailesine Hoş Geldin")
.setThumbnail(member.user.displayAvatarURL({dynamic:true}))
.setDescription(`${member} sunucuya katıldı.`)
.addFields(
{ name:"Kullanıcı", value:`${member.user.tag}`, inline:true },
{ name:"ID", value:`${member.user.id}`, inline:true },
{ name:"Hesap Oluşturma", value:`<t:${Math.floor(created.getTime()/1000)}:F>` },
{ name:"Üye Sayısı", value:`${member.guild.memberCount}`, inline:true }
)
.setFooter({text:"TR54 Yönetim Ekibi"})
.setTimestamp();

channel.send({embeds:[embed]});

});



/* GELİŞMİŞ ÇIKIŞ SİSTEMİ */

client.on("guildMemberRemove", async member => {

const channel = member.guild.channels.cache.get(LEAVE_CHANNEL_ID);
if(!channel) return;

const joinDate = member.joinedAt;
const leaveDate = new Date();

let days = 0;

if(joinDate){
days = Math.floor((leaveDate - joinDate) / (1000 * 60 * 60 * 24));
}

const embed = new EmbedBuilder()
.setColor(0xff0000)
.setTitle("Sunucudan Ayrılan Üye")
.setThumbnail(member.user.displayAvatarURL({dynamic:true}))
.addFields(
{ name:"Kullanıcı", value:`${member.user.tag}`, inline:true },
{ name:"ID", value:`${member.user.id}`, inline:true },
{ name:"Sunucuya Giriş", value: joinDate ? `<t:${Math.floor(joinDate.getTime()/1000)}:F>` : "Bilinmiyor" },
{ name:"Sunucuda Kalma Süresi", value:`${days} gün`, inline:true },
{ name:"Sunucudan Ayrılma", value:`<t:${Math.floor(leaveDate.getTime()/1000)}:F>` },
{ name:"Güncel Üye Sayısı", value:`${member.guild.memberCount}`, inline:true }
)
.setFooter({text:"TR54 Yönetim Ekibi"})
.setTimestamp();

channel.send({embeds:[embed]});

});







/* INTERACTION */

client.on("interactionCreate",async interaction=>{

if(!interaction.isButton() && !interaction.isModalSubmit()) return;

/* BAŞVURU */

if(interaction.isButton() && interaction.customId==="basvuru"){

const modal = new ModalBuilder()
.setCustomId("form")
.setTitle("TR54 Başvuru");

const isim = new TextInputBuilder()
.setCustomId("isim")
.setLabel("İsim")
.setStyle(TextInputStyle.Short);

const yas = new TextInputBuilder()
.setCustomId("yas")
.setLabel("Yaş")
.setStyle(TextInputStyle.Short);

const saat = new TextInputBuilder()
.setCustomId("saat")
.setLabel("Saat")
.setStyle(TextInputStyle.Short);

const steam = new TextInputBuilder()
.setCustomId("steam")
.setLabel("Steam ID")
.setStyle(TextInputStyle.Short);

modal.addComponents(
new ActionRowBuilder().addComponents(isim),
new ActionRowBuilder().addComponents(yas),
new ActionRowBuilder().addComponents(saat),
new ActionRowBuilder().addComponents(steam)
);

await interaction.showModal(modal);
}

/* FORM */

if(interaction.isModalSubmit() && interaction.customId==="form"){

const isim = interaction.fields.getTextInputValue("isim");
const yas = interaction.fields.getTextInputValue("yas");
const saat = interaction.fields.getTextInputValue("saat");
const steam = interaction.fields.getTextInputValue("steam");

const channel = await interaction.guild.channels.create({
name:`basvuru-${interaction.user.username}`,
type:ChannelType.GuildText,
parent:TICKET_CATEGORY_ID,
permissionOverwrites:[
{
id:interaction.guild.id,
deny:[PermissionsBitField.Flags.ViewChannel]
},
{
id:interaction.user.id,
allow:[PermissionsBitField.Flags.ViewChannel]
}
]
});

const embed = new EmbedBuilder()
.setColor("Blue")
.setTitle("Yeni Başvuru")
.addFields(
{ name:"Kullanıcı", value:interaction.user.tag },
{ name:"İsim", value:isim },
{ name:"Yaş", value:yas },
{ name:"Saat", value:saat },
{ name:"Steam ID", value:steam }
);

const row = new ActionRowBuilder().addComponents(
new ButtonBuilder()
.setCustomId("sahiplen")
.setLabel("Sahiplen")
.setStyle(ButtonStyle.Primary),
new ButtonBuilder()
.setCustomId("kapat")
.setLabel("Kapat")
.setStyle(ButtonStyle.Danger)
);

channel.send({embeds:[embed],components:[row]});

await interaction.reply({content:"Başvurun oluşturuldu",ephemeral:true});
}

/* SAHİPLEN */

if(interaction.isButton() && interaction.customId==="sahiplen"){
await interaction.reply(`${interaction.user} ticketı sahiplendi`);
}

/* KAPAT */

if(interaction.isButton() && interaction.customId==="kapat"){
await interaction.channel.setParent(CLOSED_CATEGORY_ID);
await interaction.reply("Ticket kapatıldı.");
}

});


  

client.on("messageDelete", async message => {

if (!message.guild) return;

const logChannel = message.guild.channels.cache.get(MESSAGE_LOG_CHANNEL_ID);
if (!logChannel) return;

try{

const auditLogs = await message.guild.fetchAuditLogs({
limit: 1,
type: 72
});

const entry = auditLogs.entries.first();
const deleter = entry ? entry.executor : null;

const embed = new (require("discord.js").EmbedBuilder)()
.setColor("Red")
.setTitle("Mesaj Silindi")
.addFields(
{ name:"Silinen Mesaj", value: message.content || "Embed / Media" },
{ name:"Silinen Kanal", value: message.channel.name },
{ name:"Sileni Kişi", value: deleter ? deleter.tag : "Bulunamadı" }
)
.setTimestamp();

logChannel.send({ embeds:[embed] });

}catch(err){
console.log(err);
}

});


client.on("guildMemberRemove", async member => {

const logChannel = member.guild.channels.cache.get(KICK_LOG_CHANNEL_ID);
if (!logChannel) return;

try{

const auditLogs = await member.guild.fetchAuditLogs({
limit:1,
type: 20
});

const entry = auditLogs.entries.first();
if(!entry) return;

const kicker = entry.executor;

const embed = new (require("discord.js").EmbedBuilder)()
.setColor("Orange")
.setTitle("Kick Log")
.addFields(
{ name:"Kick Atılan", value: member.user.tag },
{ name:"Kicker", value: kicker ? kicker.tag : "Bilinmiyor" }
)
.setTimestamp();

logChannel.send({ embeds:[embed] });

}catch(err){
console.log(err);
}

});


client.on("channelCreate", async channel => {

if (!channel.guild) return;

const logChannel = channel.guild.channels.cache.get(CHANNEL_LOG_CHANNEL_ID);
if (!logChannel) return;

try{

const auditLogs = await channel.guild.fetchAuditLogs({
limit:1,
type: 10
});

const entry = auditLogs.entries.first();
const creator = entry ? entry.executor : null;

const embed = new (require("discord.js").EmbedBuilder)()
.setColor("Green")
.setTitle("Kanal Oluşturuldu")
.addFields(
{ name:"Kanal", value: channel.name },
{ name:"Oluşturan", value: creator ? creator.tag : "Bilinmiyor" }
)
.setTimestamp();

logChannel.send({ embeds:[embed] });

}catch(err){
console.log(err);
}

});



client.on("channelCreate", async channel => {

if (!channel.guild) return;
if (channel.type !== 4) return; // 4 = kategori

const logChannel = channel.guild.channels.cache.get(CHANNEL_LOG_CHANNEL_ID);
if (!logChannel) return;

const embed = new (require("discord.js").EmbedBuilder)()
.setColor("Blue")
.setTitle("Kategori Oluşturuldu")
.setDescription(`Kategori: ${channel.name}`)
.setTimestamp();

logChannel.send({ embeds:[embed]});

});




client.on("messageCreate", async message => {

if (message.author.bot) return;


/* KUR */
if (message.content === "!kur") {

if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator))
return;

const channel = message.guild.channels.cache.get(REGISTER_CHANNEL_ID);
if (!channel) return;

const row = new ActionRowBuilder().addComponents(
new ButtonBuilder()
.setCustomId("basvuru")
.setLabel("Başvuru Yap")
.setStyle(ButtonStyle.Success)
);

const embed = new EmbedBuilder()
.setColor("Orange")
.setTitle("TR54 Kayıt Şartları")
.setDescription(`
• 1300+ Saat
• +18 Yaş
• Toksiklik Yasak
• Saygı Zorunlu
`);
channel.send({ embeds:[embed], components:[row] });

}
/* UNBANALL */
if (message.content === "!unbanall") {

if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers))
return message.reply("Yetkin yok.");

try {

const bans = await message.guild.bans.fetch();

for (const ban of bans.values()) {
await message.guild.members.unban(ban.user.id);
}

message.reply("✅ Tüm yasaklılar kaldırıldı.");

} catch (err) {
console.log(err);
}

}

});

process.on("uncaughtException", err => {
console.log("Hata:", err);
});

process.on("unhandledRejection", err => {
console.log("Promise hata:", err);
});

client.login(TOKEN);