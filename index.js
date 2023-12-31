require('dotenv').config()
const express = require('express')
const bP = require('body-parser')
const ex = require('axios')
const cheerio = require('cheerio')
const winston = require('winston')

const logger = winston.createLogger({                                   //logger constant creation
    format: winston.format.simple(),
    transports:[
        new winston.transports.File({ filename: 'combined.log' })
      ]
})

const {TOKEN, SERVER_URL} = process.env                                 //saving Token ans Server url from environment variables file
const T_API = 'https://api.telegram.org/bot'+TOKEN;                     //API for Telegram bot, not to be disclosed
const URI = '/webhook/'+TOKEN;                                          // https://wikibot-kwb5.onrender.com
const W_URL = SERVER_URL+URI;                                           //webhook URL

var Title;
var fin;

var wiki_random_search = 'https://en.wikipedia.org/wiki?search=';//URL for random wikipedia page generation 

const app = express()
app.use(bP.json())

const init = async () =>{                                                //Initialization to the bot
    try{
        const res = await ex.get(T_API+'/setWebhook?url='+W_URL)
        logger.log(res.data)
    }
    catch(err){
        logger.error("Error in init");
        logger.error(err);
    }
}

app.post(URI, async (req, res) => {                                     //for bot to send a message 
    try{
        var msg = req.body.message.text;
        sendersChatID = req.body.message.chat.id;
        logger.info('Message Text : '+msg+'\n\t  From : '+req.body.message.from.first_name+'\n\t  Chat ID : '+sendersChatID);
        console.log('Message Text : '+msg+'\n\t  From : '+req.body.message.from.first_name+'\n\t  Chat ID : '+sendersChatID);
        if(msg == "/start")
        {
            text = "Hello "+req.body.message.from.first_name+", Welcome to WikiBot😁 Please type the keyword which you want to search and let me do the rest for you. For more information, type /info."
            const SendURL = T_API+'/sendMessage?chat_id='+sendersChatID+'&text='+text;
            const response = await ex.post(SendURL)
            logger.info('Reply sent : '+text)
            console.log('Reply sent : '+text)
            wiki_random_search = 'https://en.wikipedia.org/wiki?search='
        }
        else if (msg == "/info")
        {
            text = "Hello "+req.body.message.from.first_name+", I am WikiBot. I can fetch you any existing wikipedia page. All you need to do us to type what you want to search for and hit the send button. I will fetch the wikipedia page and bring it to you!"
            const SendURL = T_API+'/sendMessage?chat_id='+sendersChatID+'&text='+text;
            const response = await ex.post(SendURL)
            logger.info('Reply sent : '+text)
            console.log('Reply sent : '+text)
            wiki_random_search = 'https://en.wikipedia.org/wiki?search='
        }
        else if(msg != "")
        {
            wiki_random_search = wiki_random_search+msg;
            const wiki_result = await ex.get(wiki_random_search);
            const $=cheerio.load(wiki_result.data);
            //console.log(wiki_result)
            Title = $("h1").text();
            fin = 'https://en.wikipedia.org'+wiki_result.request.path;
            RChatID = 5031164121;//req.body.my_chat_member.chat.id;
            if(Title != 'Search results')
            {
                text = 'You have got the information about '+Title+'. To get more information on this topic, the wikipedia link to this topic is '+fin;
            }
            else{
                text = 'No wikipedia page found. Please check spelling and try again';
            }

            if(req.body.message.from.first_name == 'Riyaa')
            {
                const SendURL = T_API+'/sendMessage?chat_id=1069308235&text='+msg;
                const response = await ex.post(SendURL)
                logger.info('Reply sent to Vedant : '+text)
                console.log('Reply sent to Vedant : '+text)
                wiki_random_search = 'https://en.wikipedia.org/wiki?search='
            }
            if(req.body.message.from.first_name == 'Vedantt')
            {
                const SendURL = T_API+'/sendMessage?chat_id=5031164121&text='+msg;
                const response = await ex.post(SendURL)
                logger.info('Reply sent to Riya : '+text)
                wiki_random_search = 'https://en.wikipedia.org/wiki?search='
            }
            else{
                const SendURL = T_API+'/sendMessage?chat_id='+sendersChatID+'&text='+text;
                const response = await ex.post(SendURL)
                logger.info('Reply sent : '+text)
                console.log('Reply sent : '+text)
                wiki_random_search = 'https://en.wikipedia.org/wiki?search='
            }
            
        }
        else{
            logger.info('No reply sent')
        }
        console.log('Response of '+req.body.message.from.first_name+' logged successfully.')
        return res.send()
    }
    catch(err){
        logger.error("Error in post");
        logger.error(err);
    }            
})

app.listen(process.env.PORT || 5000, async () => {                              //For bot to accept incoming message and details of the account
    try{
        console.log('App running on port', process.env.PORT || 5000)
        await init()
    }
    catch(err){
        logger.error("Error in listen");
        logger.error(err);
    }
})
