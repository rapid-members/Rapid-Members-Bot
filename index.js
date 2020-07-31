const Discord = require('discord.js');
const client = new Discord.Client();
const config = require('./config.json');
const fs = require('fs')
let modules = ['members', 'misc', 'developers']
const orders = require('./orders.json');
let order_keys = Object.keys(orders);
const coins = require('./coins.json')
const inviteMapper = new Map();
const transactions = require('./trhis.json');
let lottery = require('./lottery.json');
let date = new Date();
let explorer = require('./explorer.json')


client.once('ready', () => {
    console.log('Ready to clutter');
    client.user.setActivity(`people get members`, {type: 'WATCHING'});
    client.guilds.cache.forEach(guild => {
        guild.fetchInvites().then(invites => {
            inviteMapper.set(guild.id, invites)
        }).catch(err => console.log(err));
    });
});

client.on('message', message => {
    if(!coins[message.author.id]) coins[message.author.id] = 0;
    if(!message.content.startsWith(config.prefix) || config.yeeted.includes(message.author.id)) return;
    const args = message.content.slice(config.prefix.length).split(/ +/)
    const command = args.shift().toLowerCase();
    try {
        switch(command)
    {
        case 'ping':
            message.channel.send(`Pong, took me \`${client.ws.ping}ms\` to respond`);
        break;
        case 'help':
            if(!args[0] || !modules.includes(args[0]))
            {
                const helpEmbed = new Discord.MessageEmbed()
                    .setTitle(`Rapid Members Help`)
                    .setDescription(`The modules. Use \`/help [module]\` to view a module's commands`)
                    .addField(`Members`, `Get members! (this also manages the economy)`, true)
                    .addField(`Misc`, `Miscellaneous stuff`, true)
                    .addField(`Developers`, `Some commands you don't need to know :)`)
                    .setFooter(`help`);
                message.channel.send(helpEmbed);
            }
            else if(args[0] === `members`)
            {
                const helpEmbed = new Discord.MessageEmbed()
                    .setTitle(`Rapid Members Help`)
                    .setDescription(`MEMBERS Module`)
                    .addField(`/earn`, `Earn coins for members`, true)
                    .addField(`/buy`, `Buy members`, true)
                    .addField(`/order`, `View info on your order`, true)
                    .addField(`/balance`, `Check your balance`, true)
                    .addField(`/pay`, `Pay someone!`, true)
                    .addField(`/lottery`, `Enter the lottery for 2 coins for a large sum of coins!`, true)
                    .addField(`/getbal`, `View another person's MONI`, true)
                    .setFooter(`Not all commands have been tested yet`);
                message.channel.send(helpEmbed);
            }
            else if(args[0] === `misc`)
            {
                const helpEmbed = new Discord.MessageEmbed()
                    .setTitle(`Rapid Members Help`)
                    .setDescription(`MISC Module`)
                    .addField(`/ping`, `How much ping do I have? Only the command knows!`, true)
                    .addField(`/invite`, `Invite me`, true)
                    .setFooter(`What should I put here? Miscellaneous help?`);
                message.channel.send(helpEmbed);
            }
            else if(args[0] === `developers`)
            {
                if(!config.developers.includes(message.author.id)) return message.channel.send(`How to use this command:\n1. Be a developer`)
                const helpEmbed = new Discord.MessageEmbed()
                    .setTitle(`Rapid Members Help`)
                    .setDescription(`DEVELOPER EXCLUSIVE commands`)
                    .addField(`/devpay`, `Create coins out of thin air and pay someone them!`, true)
                    .addField(`/devpurge`, `Purge the world of a user's coins`, true)
                    .addField(`/endlottery`, `Self-expanatory. End the current lottery.`)
                    .addField(`/yeet`, `Blacklist someone from the bot.`, true)
                    .addField(`/eval`, `Evaluate expressions and methods. ONLY USE IF YOU KNOW WHAT YOU ARE DOING!`)
                    .setFooter(`You're a developer, have these commands`);
                message.channel.send(helpEmbed);
            }
        break;
        case 'earn':
            if(orders.servers.length === 0) return message.channel.send(`Error; No servers have an unfinished order`);
            let buy = orders[orders.servers[Math.floor(Math.random() * orders.servers.length)]];
            let buyTwo = orders[orders.servers[Math.floor(Math.random() * orders.servers.length)]];
            if(orders.servers.length === 1) return message.channel.send(`Only one guild available: ${buy.invite}`);
            for(i=0;buyTwo===buy;i++)
            {
                buyTwo = orders[orders.servers[Math.floor(Math.random() * orders.servers.length)]];
            }
            if(orders.servers.length === 0) return message.channel.send(`Error; No servers have an unfinished order`);
            else {
                const earnEmb = new Discord.MessageEmbed()
                    .setTitle(`Rapid Members`)
                    .setDescription(`Join these servers for a coin:`)
                    .addField(buy.name, buy.invite)
                    .addField(buyTwo.name, buyTwo.invite)
                    .setColor(`#ff0000`)
                    .addField(`Permanent servers`, `These servers will always be on the list.`)
                    .addField(`Support Server`, `https://discord.gg/6TfcRcB`)
                    .setFooter(`Rapid Members bot`);
                message.channel.send(earnEmb)
            }
        break;
        case 'eval':
            if(!config.developers.includes(message.author.id)) return message.channel.send(`No`);
            try {
                let evaluated = eval(args.join(' '));
                message.channel.send(`Evaluated!\nContent: ${args.join(' ')}\nResult: ${evaluated}`);
            } catch(err) {
                message.channel.send(`There was an error evaluating this:\n\`${err}\``)
            }
        break;
        case 'yeet':
            if(!config.moderators.includes(message.author.id)) return;
            config.yeeted.push(message.mentions.users.first().id);
            let yeetBR = args.shift()
            let yeetR = args.join(' ')
            message.channel.send(`Successfully yeeted ${message.mentions.users.first().tag}!`);
            message.mentions.users.first().send(`***IMPORTANT NOTICE***\nYou have been blacklisted from Rapid Members for the following reason: ${yeetR}\nFeel this was unjust? Appeals coming soon!`)
        break;
        case 'buy':
            if(!message.guild.me.permissions.has(`MANAGE_GUILD`)) return message.channel.send(`Issue with purchase;\nBot does not have \`Manage Server\` permissions.`)
            if(!args[0] || isNaN(args[0]) || coins[message.author.id]<args[0] || 1>args[0]) return message.channel.send(`Hmm, something's not right with that request.`)
            orders[message.guild.id] = {};
            message.channel.createInvite({maxAge:0,reason:"Requested for Rapid Members",unique:true}).then(rminv => {
                orders[message.guild.id] = {
                    left: parseInt(args[0], 10),
                    invite: rminv.url,
                    name: message.guild.name
                } 
            });
            message.channel.send(`Buying ${args[0]} member(s). This may take a bit of time`);
            orders.orders = orders.orders + 1;
            coins[message.author.id] = coins[message.author.id] - args[0]
            orders.servers.push(message.guild.id)
        break;
        case 'order':
            if(!orders[message.guild.id] || orders[message.guild.id] === 0) return message.channel.send(`You do not have an order`);
            message.channel.send(`**${message.guild.name}'s order:**\nYou have ${orders[message.guild.id].left} more member(s) from your order.`);
        break;
        case 'balance':
            const balEmbed = new Discord.MessageEmbed()
                .setTitle(`Your Balance`)
                .setDescription(`You have ${coins[message.author.id]} coins.`)
                .setColor(`#00ff00`);
            message.channel.send(balEmbed);
        break;
        case 'bal':
            const balanceCheckEmbed = new Discord.MessageEmbed()
                .setTitle(`Your Balance`)
                .setDescription(`You have ${coins[message.author.id]} coins.`)
                .setColor(`#00ff00`);
            message.channel.send(balanceCheckEmbed);
        break;
        case 'getbal':
            if(!message.mentions.users.size || !coins[message.mentions.users.first().id]) return message.channel.send(`Error;\nNo mention or mentioned user not cached`);
            let tagged = message.mentions.users.first();
            const balanceCheckOtherEmbed = new Discord.MessageEmbed()
                .setTitle(`${tagged.tag}'s Balance`)
                .setDescription(`${tagged.username} has ${coins[tagged.id]} coins.`)
                .setColor(`#00ff00`);
            message.channel.send(balanceCheckOtherEmbed);
        case "devpay":
            if(!config.developers.includes(message.author.id)) return message.channel.send(`Haha, no, you're not a dev in my eyes.`)
            if(!args[1] || isNaN(args[1]) || !message.mentions.users.size) return;
            if(!coins[message.mentions.users.first().id]) coins[message.mentions.users.first().id] = 0;
            coins[message.mentions.users.first().id] = coins[message.mentions.users.first().id] + parseInt(args[1], 10);
            message.channel.send(`Successful!`)
        break;
        case 'pay':
            if(!args[1] || isNaN(args[1]) || !message.mentions.users.size || coins[message.author.id]<args[0] || message.mentions.users.first().bot) return message.channel.send(`Hmm, something's not right.`);
            coins[message.author.id] = coins[message.author.id] - parseInt(args[1], 10)
            coins[message.mentions.users.first().id] = coins[message.mentions.users.first().id] + parseInt(args[1], 10);
            message.mentions.users.first().send(`Make sure to thank ${message.author.tag} for the coins!`)
            message.channel.send(`Successful!`);
        break;
        case 'bet':
            if(!args[0] || isNaN(args[0]) || args[0]>coins[message.author.id]) return message.channel.send(`HMM there is an issue.`);
            message.channel.send(`**Gambling game**\n\`${message.author.tag}\`  Rolling...\n           \`Rapid Members\`  Rolling...`).then(betmsg => {
                let yesbet = Math.floor(Math.random() * 5) + 1; 
                let nobet = Math.floor(Math.random() * 5) + 1; 
                setTimeout(() => {
                    betmsg.edit(`**Gambling game**\n\`${message.author.tag}\`  ${yesbet}\n           \`Rapid Members\`  ${nobet}`);
                    if(yesbet>nobet){
                        coins[message.author.id] = coins[message.author.id] + parseInt(args[0],10);
                        message.channel.send(`You win, and earn ${args[0]} coins`);
                    }
                    if(nobet>yesbet){
                        coins[message.author.id] = coins[message.author.id] - parseInt(args[0],10);
                        message.channel.send(`You lose, and ${args[0]} coins go down the drain`);
                    }
                    if(yesbet===nobet){
                        message.channel.send(`A draw! Nothing happened.`);
                    }
                }, 3000)
            })
        break;
        case 'invite':
            const invEmbe = new Discord.MessageEmbed()
                .setTitle(`Invites`)
                .addField(`  Invite bot `, `[Invite Rapid Members](https://discord.com/api/oauth2/authorize?client_id=735392851999064084&permissions=8&scope=bot)`);
            message.channel.send(invEmbe);
        break;
        case 'devpurge':
            if(!config.developers.includes(message.author.id)) return message.channel.send(`Haha, no`);
            if(!message.mentions.users.size || !args[1] || isNaN(args[1])) return;
            coins[message.mentions.users.first().id] = coins[message.mentions.users.first().id] - parseInt(args[1], 10);
            message.channel.send(`And a yeet, you successfully purge the world of ${args[1]} of ${message.mentions.users.first().tag}'s coins`);
        break;
        case 'flip':
            if(!args[0] || isNaN(args[0]) || args[0]>coins[message.author.id]) return message.channel.send(`You need some coins to gamble`)
            const sides = ['heads', 'tails'];
            let definer =  Math.floor(Math.random() * sides.length);
            message.channel.send(`You landed on ${sides[definer]}!`);
            if(sides[definer] === 'heads')
            {
                coins[message.author.id] = coins[message.author.id] + parseInt(args[0], 10);
                message.channel.send(`You got ${args[0]} coins!`)
            }
            if(sides[definer] === 'tails')
            {
                coins[message.author.id] = coins[message.author.id] - parseInt(args[0], 10);
                message.channel.send(`You lost ${args[0]} coins! See, kids, this is why you don't gamble.`)
            }
        break;
        case 'lottery':
            if(lottery.entries.includes(message.author.id)) return message.channel.send(`Mate you're already in the lottery`)
            if(coins[message.author.id]<2) return message.channel.send(`Yeah, what are you going to pay with? Air? You need 2 coins`);
            lottery.entries.push(message.author.id);
            coins[message.author.id] = coins[message.author.id] - 2;
            lottery.prize = lottery.prize + 2;
            const lottoEmb = new Discord.MessageEmbed()
                .setTitle(`Lottery entered`)
                .setDescription(`You bought a lottery ticket!\n[To see who wins, click me to join this server](https://discord.gg/6TfcRcB)`)
                .setColor(`#003cff`)
                .setFooter(`Bought ticket`);
            message.channel.send(lottoEmb);
        break;
        case 'purposefail':
            if(!config.developers.includes(message.author.id)) return;
            const yeeet = "ye";
            yeeet = "meat";
            message.channel.send(yeeet);
        break
        case 'endlottery':
            if(!config.developers.includes(message.author.id)) return message.channel.send(`No`)
            let winnerEntry = Math.floor(Math.random() * lottery.entries.length);
            let winner = client.users.cache.get(lottery.entries[winnerEntry]);
            winner.send(`You won the lottery, no scam!\nYou earned ${lottery.prize} coins!`);
            let lwC = client.channels.cache.get(`735346723844653199`);
            coins[winner.id] = coins[winner.id] + lottery.prize;
            lwC.send(`${lottery.entries.length} users entered, **${winner.tag}** walked away with ${lottery.prize} coins`);
            lottery = {
                entries: [],
                prize: 15
            }
            message.channel.send(`Lottery ended, and ${winner.tag} was the winner!`)
        break;
    }
    } catch(err) {
        message.channel.send(`Error executing command;\n\`${err}\``);
    }

    fs.writeFile('orders.json', JSON.stringify(orders), (err) => {if(err) console.log(err)});
    fs.writeFile('coins.json', JSON.stringify(coins), (err) => {if(err) console.log(err)});
    fs.writeFile('trhis.json', JSON.stringify(transactions), (err) => {if(err) console.log(err)});
    fs.writeFile('lottery.json', JSON.stringify(lottery), (err) => {if(err) console.log(err)});
    fs.writeFile('config.json', JSON.stringify(config), (err) => {if(err) console.log(err)});
});

client.on('guildMemberAdd', async member => {
    const guild = member.guild;
    if(orders[guild.id].left === 0) return; else {
        if(!coins[member.id]) coins[member.id] = 0;
        coins[member.id] = coins[member.id] + 1;
        orders[guild.id].left = orders[guild.id].left - 1;
        if(orders[guild.id].left === 0){
            orders.orders = orders.orders - 1;
            orders.servers.splice(orders.servers.indexOf(guild.id),1)
        }
    }
    fs.writeFile('orders.json', JSON.stringify(orders), (err) => {if(err) console.log(err)});
    fs.writeFile('coins.json', JSON.stringify(coins), (err) => {if(err) console.log(err)});
});

client.on('inviteCreate', async invite => inviteMapper.set(invite.guild.id, await invite.guild.fetchInvites()));

client.login(config.token)