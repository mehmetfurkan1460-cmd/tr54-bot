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

const AUTO_ROLE_ID = "1478125999626649761";
const WELCOME_CHANNEL_ID = "1478397454817951966";
const REGISTER_CHANNEL_ID = "1478126023554891950";
const TICKET_CATEGORY_ID = "1478408800871645364";
const CLOSED_CATEGORY_ID = "1478409183236980939";
const MESSAGE_LOG_CHANNEL_ID = "1478400764299710516";
const KICK_LOG_CHANNEL_ID = "1478401069775192190";
const CHANNEL_LOG_CHANNEL_ID = "1478126024788021309";


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

/* TEST KOMUT */

client.on("messageCreate",message=>{
if(message.author.bot) return;

if(message.content==="!ping"){
message.reply("Bot çalışıyor.");
}

/* KUR */

if(message.content==="!kur"){

if(!message.member.permissions.has(PermissionsBitField.Flags.Administrator))
return;

const channel = message.guild.channels.cache.get(REGISTER_CHANNEL_ID);
if(!channel) return;

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

channel.send({embeds:[embed],components:[row]});

}
});

/* AUTO ROLE */

client.on("guildMemberAdd",async member=>{
const role = member.guild.roles.cache.get(AUTO_ROLE_ID);
if(role) member.roles.add(role).catch(()=>{});
});

/* WELCOME */

client.on("guildMemberAdd",async member=>{

const channel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
if(!channel) return;

const embed = new EmbedBuilder()
.setColor("Orange")
.setTitle("TR54 Ailesine Katılım")
.setDescription(`HOŞ GELDİN ${member.user.username}`)
.setThumbnail(member.user.displayAvatarURL({dynamic:true}))
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


client.on("messageCreate", async message => {

if(message.author.bot) return;

if(message.content === "!unbanall"){

if(!message.member.permissions.has("BanMembers"))
return message.reply("Yetkin yok.");

try{

const bans = await message.guild.bans.fetch();

bans.forEach(async ban => {
await message.guild.members.unban(ban.user.id);
});

message.reply("✅ Tüm yasaklılar kaldırıldı.");

}catch(err){
console.log(err);
}

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



client.login(TOKEN);