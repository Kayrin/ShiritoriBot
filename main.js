const Discord = require('discord.js');
const client = new Discord.Client();
const token = 'MzY3OTQ1NjAwNjMwNzg0MDA5.DMCzyA.6AsA59J24ac_X2XuJLqkgO3wgQY';
const prefix = '>'

var request = require('request');

function randomIntFromInterval(min,max)
{
   return Math.floor(Math.random()*(max-min+1)+min);
}



client.on('ready', () => {
  console.log('準備できた');
});

/*
let word = 'ともだち';
console.log(word.substring(word.length-1));

let res = undefined;
request('http://jisho.org/api/v1/search/words?keyword=' + word + '*', function (error, response, body) {
  console.log('error:', error); // Print the error if one occurred
  console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
  //console.log('body:', body); // Print the HTML for the Google homepage.
  res = JSON.parse(body);
  //console.log(res.data);
  var data = (res.data).filter(res => res.is_common == true);
  console.log(data.length);

  var randomIndex = Math.floor(Math.random() * data.length);

  var content = data[randomIndex];
  console.log(content);
  console.log(content.japanese[0].word);
  // make a list from the data
  var senses = JSON.stringify(content.senses[0].english_definitions).replace(/\"/g, '').replace(/,/g, '\n');
  // remove brackets
  senses = senses.substring(1, senses.length-1);
  // markdown format
  senses = senses.replace(/^/gm, '- ');
  console.log(senses);
});
*/

client.on('message', message => {
  // Here we separate our "command" name, and our "arguments" for the command.
  // e.g. if we have the message "+say Is this the real life?" , we'll get the following:
  // command = say
  // args = ["Is", "this", "the", "real", "life?"]
  const args = message.content.slice(prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();


  if (message.content === 'ping') {
    message.reply('pong');
  }
  if (command == 's' && args[0] == 'だれですか') {
    message.reply('なのです');
  }

  if (command == 's' && args[0] != 'だれですか') {
    let syllable = args[0].substring(args[0].length-1);
    console.log(syllable);
    let query = encodeURI(syllable);

    let res;
    request('http://jisho.org/api/v1/search/words?keyword=' + query + '*', function (error, response, body) {
      console.log('error:', error); // Print the error if one occurred
      console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received

      //console.log(body);
      res = JSON.parse(body);
      console.log(res.data.length > 0);
      if (res.data.length > 0) {
        //console.log(res.data);
        var data = (res.data).filter(res => res.is_common == true);

        // pick a random word starting with the last syllable
        var randomIndex = Math.floor(Math.random() * data.length);
        var content = data[randomIndex];
        // reroll if the reading is outdated (one-syllable words)
        while (! content.japanese[0].reading.startsWith(syllable)){
          randomIndex = Math.floor(Math.random() * data.length);
          var content = data[randomIndex];
        }

        console.log(content);
        //console.log(content.japanese);

        // format the english definitions for the embed message
        // make a list from the data
        var senses = JSON.stringify(content.senses[0].english_definitions).replace(/\"/g, '').replace(/,/g, '\n');
        // remove brackets
        senses = senses.substring(1, senses.length-1);
        // markdown format
        senses = senses.replace(/^/gm, '- ');
        console.log(senses);

        message.channel.send({embed: {
          color: 3447003,
          author: {
            name: client.user.username,
            icon_url: client.user.avatarURL
          },
          fields: [{
            name: 'Word',
            value: content.japanese[0].word
          },
          {
            name: 'Reading',
            value: content.japanese[0].reading
          },
          {
            name: 'English definitions',
            value: senses
          }
          ]
        }});
      }
      // no results
      else {
        message.channel.send('わかりません！')
      }
    });
  }

  if (command == 'def') {
    let query = encodeURI(args[0]);

    let res;
    request('http://jisho.org/api/v1/search/words?keyword=' + query + '*', function (error, response, body) {
      console.log('error:', error); // Print the error if one occurred
      console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received

      //console.log(body);
      res = JSON.parse(body);
      console.log(res.data.length > 0);
      if (res.data.length > 0) {
        //console.log(res.data);
        var data = (res.data).filter(res => res.is_common == true);

        var randomIndex = Math.floor(Math.random() * data.length);
        var content = data[randomIndex];
        console.log(content);
        //console.log(content.japanese);

        // format the english definitions for the embed message
        // make a list from the data
        var senses = JSON.stringify(content.senses[0].english_definitions).replace(/\"/g, '').replace(/,/g, '\n');
        // remove brackets
        senses = senses.substring(1, senses.length-1);
        // markdown format
        senses = senses.replace(/^/gm, '- ');
        console.log(senses);

        message.channel.send({embed: {
          color: 3447003,
          author: {
            name: client.user.username,
            icon_url: client.user.avatarURL
          },
          fields: [{
            name: 'Word',
            value: content.japanese[0].word
          },
          {
            name: 'Reading',
            value: content.japanese[0].reading
          },
          {
            name: 'English definitions',
            value: senses,
          }
          ]
        }});
      }
      // no results
      else {
        message.channel.send('わかりません！')
      }
    });
  }
});

client.login(token);
