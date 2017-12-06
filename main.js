const Discord = require('discord.js');
const client = new Discord.Client();
const settings = require('./settings.json');

var request = require('request');

function randomIntFromInterval(min,max)
{
   return Math.floor(Math.random()*(max-min+1)+min);
}

client.on('ready', () => {
  console.log('準備できています');
});

client.on('message', message => {
  // Here we separate our "command" name, and our "arguments" for the command.
  // e.g. if we have the message "+say Is this the real life?" , we'll get the following:
  // command = say
  // args = ["Is", "this", "the", "real", "life?"]
  const args = message.content.slice(settings.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase(); // '>' is the current prefix, set in settings.json


  // ping command, shows the latency
  if (message.content === 'ping') {
    message.reply(`Pong! \'${Date.now() - message.createdTimestamp} ms \``);
  }

  // ask who the bot is
  if (message.content === 'だれですか') {
    message.reply('なのです');
  }

  /*
  Takes the last syllable of the argument and looks for a new word
  that starts with that syllable.
  e.g. かぞく　--> くに
  */
  if (command == 's') {
    var regex = /[\u3000-\u303F]|[\u3040-\u309F]|[\u30A0-\u30FF]/; // hiragana/katakana regex
    var regex_halfwidth = /ゃ|ょ|ゅ/; // half-width hiragana

    // if the word is longer than one syllable, filter the last one
    var syllable;
    if (args[0].length > 1){
      syllable = args[0].substring(args[0].length-1);

      // cannot search half-width kana alone, filter the last two syllables instead
      if (regex_halfwidth.test(syllable)) {
        syllable = args[0].substring(args[0].length-2);
      }
    }
    else {
      syllable = args[0];

      // cannot search half-width kana alone
      if (regex_halfwidth.test(syllable)) {
        message.channel.send('わかりません！');
        return;
      }
    }

    // check if the argument is written in hiragana/katakana
    if (! regex.test(syllable)) {
      message.channel.send('かなを書いてください');
      return;
    }

    // compound syllable, filters the last two characters of the word

    //console.log(syllable);

    // if the last syllable is one of these: き,ぎ,し,じ,ち,ぢ,ひ,び,ぴ,み,に,り
    //syllable = (/し[^ゃょゅ]+/).toString();

    // encodes special characters (any japanese character) for the query
    var query = encodeURI(syllable);
    // random query page, 20 results per page
    // var randomPage = randomIntFromInterval(1, 4);

    request('http://jisho.org/api/v1/search/words?keyword=' + query + '*', function (error, response, body) {
      console.log('error:', error); // Print the error if one occurred
      console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received

      // parses the data received in string format
      var res = JSON.parse(body);

      // if there is at least one result
      if (res.data.length > 0) {

        // only deals with common words
        var data = (res.data).filter(res => res.is_common == true);
        console.log ("Data: " + data.length + " items");

        // select data[0] if there is only one result
        // pick a random word in the array of results
        // if there is more than one word, randomize the index
        var randomIndex = Math.floor(Math.random() * data.length);
        var content = data[randomIndex];

        // reroll if the reading is outdated (especially for one-syllable words)
        while (! content.japanese[0].reading.startsWith(syllable) || content.japanese[0].reading.endsWith('ん')){
          randomIndex = Math.floor(Math.random() * data.length);
          content = data[randomIndex];
        }

        // formats the english definitions for the embed message
        // makes a list from the data
        var definitions = [];
        for (var i = 0; i < content.senses.length; i++){
          definitions.push(content.senses[i].english_definitions);
        }
        var senses = definitions.join("\n");

        // markdown format
        // space after commas
        senses = senses.replace(/,/gm, ', ');
        // adds a bullet at the beginning of each line
        senses = senses.replace(/^/gm, '・');

        // message with the result to send
        var word_defined = (content.japanese[0].word != undefined) ? content.japanese[0].word : content.japanese[0].reading;
        message.channel.send({embed: {
          title: "Jisho.org results for " + word_defined,
          color: 3447003,
          url: "http://jisho.org/search/" + word_defined,
          timestamp: new Date(Date.now()),
          fields: [{
            // contains the word in kanji (or kana if there is no kanji)
            name: 'Word',
            value: word_defined
          },
          {
            // contains the reading in kana
            name: 'Reading',
            value: content.japanese[0].reading
          },
          {
            // a list of english translations
            name: 'English definitions',
            value: senses
          }
          ]
        }});
      }
      // if the query doesn't return any result
      else {
        message.channel.send('わかりません！')
      }
    });
  }

  /*
    Look up for the translation of a word.
    Takes the first result of the query.
  */
  if (command == 'def') {
    // encodes special characters (any japanese character) for the query
    var query = encodeURI(args[0]);

    request('http://jisho.org/api/v1/search/words?keyword=' + query, function (error, response, body) {
      console.log('error:', error); // Print the error if one occurred
      console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received

      // parses the data received in string format
      var res = JSON.parse(body);

      // if there is at least one result
      if (res.data.length > 0) {

        // takes the first result
        var content = res.data[0];

        // formats the english definitions for the embed message
        // makes a list from the data
        var definitions = [];
        for (var i = 0; i < content.senses.length; i++){
          definitions.push(content.senses[i].english_definitions);
        }
        var senses = definitions.join("\n");

        // markdown format
        // space after commas
        senses = senses.replace(/,/gm, ', ');
        // adds a bullet at the beginning of each line
        senses = senses.replace(/^/gm, '・');

        // message with the result to send
        message.channel.send({embed: {
          title: "Jisho.org results for " + args[0],
          color: 0xbf2f15,
          url: "http://jisho.org/search/" + query,
          timestamp: new Date(Date.now()),
          fields: [{
            // contains the word in kanji (or kana if there is no kanji)
            name: 'Word',
            value: (content.japanese[0].word != undefined) ? content.japanese[0].word : content.japanese[0].reading
          },
          {
            // contains the reading in kana
            name: 'Reading',
            value: content.japanese[0].reading
          },
          {
            // a list of english translations
            name: 'English definitions',
            value: senses
          }
          ]
        }});
      }
      // if the query doesn't return any result
      else {
        message.channel.send('わかりません！')
      }
    });
  }
});

// connect to the server
client.login(settings.token);
