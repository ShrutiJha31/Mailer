const express = require("express");
const https = require("https");
const bodyParser = require("body-parser");


const app = express();


const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');


const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];

const TOKEN_PATH = 'token.json';



/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */

app.set("view engine", "ejs");

app.use(express.urlencoded({extended: true}));
app.use(express.static(__dirname + '/public'));

app.get("/", function(req, res) {
  res.sendFile(__dirname + "/index.html");
})

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */

app.post("/", function(credentials, callback){
   
  
fs.readFile('credentials.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);
   
    authorize(JSON.parse(content), listLabels);
  });

  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);
    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err, token) => {
      if (err) return getNewToken(oAuth2Client, callback);
      oAuth2Client.setCredentials(JSON.parse(token));
      callback(oAuth2Client);
    });
    function getNewToken(oAuth2Client, callback) {
 
        oAuth2Client.getToken(code, (err, token) => {
          if (err) return console.error('Error retrieving access token', err);
          oAuth2Client.setCredentials(token);
          // Store the token to disk for later program executions
          fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
            if (err) return console.error(err);
            console.log('Token stored to', TOKEN_PATH);
          });
          callback(oAuth2Client);
        });
      };
    
    
    /**
     * 
     *
     * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
     */
    function listLabels(auth) {
      const gmail = google.gmail({version: 'v1', auth});
      gmail.users.labels.list({
        userId: 'me',
      }, (err, res) => {
        if (err) return console.log('The API returned an error: ' + err);
        const gmail = google.gmail({version: 'v1', auth});
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout,
        });
        rl.question('Enter the mail you want to search: ', (mail) => {
          rl.close();
        gmail.users.messages.list({
            auth: auth,
            userId: 'me',
            q:`from:${mail}`
        }, (err, response) => {
            const messages=response.data.messages;
            const size=response.data.resultSizeEstimate;
            console.log("Number of emails received  : "+messages.length);
            
            var size1;
        if (messages.length) {
          console.log('Messages:');
          messages.forEach((message) => {
            gmail.users.messages.list({
              auth: auth,
            userId: 'me',
            id:message.id
            },(err,result)=>{
            
              size1=result.data.resultSizeEstimate;
              console.log("Size Of The Mail"+size1);
             
            })
          }
          );
          
        } else {
          console.log('No labels found.');
        }
        });
      })});
    };
 
})

app.listen(3000, function() {
    console.log("Server is running on port 3000");
  })  
