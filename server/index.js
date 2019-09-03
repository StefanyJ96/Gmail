var express = require('express');
var app = express();
var server = require('http').Server(app);
var nodemailer = require('nodemailer');
var io = require('socket.io')(server);

const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');

app.use(express.static('cliente'));


var usuario = [{
    alias: '',
    imagen: ''
}];

var registros_archivados = [];
var registros_eliminados = [];

var mensajeList = [];

var mailOptions = {
    from: 'eljaya_est@utmachala.edu.ec',
    to: 'eljaya_est@utmachala.edu.ec',
    subject: '',
    text: ''
};


io.on('connection', function(socket){
    var address = socket.handshake.address;
    console.log('El cliente con ip: ' +address+ ' se ha conectado');
    socket.emit('datos_usuarios', usuario);

    socket.on('add_mensaje', function(data){
       //console.log(data);
        usuario = [{
            alias: data.alias,
            imagen: data.imagen
        }];      
        //console.log(usuario);  
        socket.emit('datos_usuarios', usuario);
    });

    //adjuntar_en_eliminados
    socket.on('adjuntar_en_eliminados', function(data){    
        registros_eliminados.push(data);
        console.log(registros_eliminados);  
        console.log('------------------------------');  
        socket.emit('registros_eliminados', registros_eliminados);
     });

    socket.on('adjuntar_en_archivar', function(data){       
        registros_archivados.push(data);
        console.log(registros_archivados);  
        console.log('------------------------------');  
        socket.emit('registros_archivados', registros_archivados);
     });

    //escuchando al cliente
    socket.on('add_email', function(data){
        //console.log(data);
        mailOptions = {
            from: data.from,
            to: data.to,
            subject: data.subject,
            text: data.text
         };    

         //console.log(mailOptions)

        var transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: 'eljaya_est@utmachala.edu.ec',
                pass: '0707079521*Liz' 
            }
        });

        // Enviamos el email
        transporter.sendMail(mailOptions, function(error, info){
            if (error){
                console.log(error);
                //res.send(500, err.message);
                socket.emit('resultado_de_email', 'ERROR, no se puede enviar');
            } else {
                console.log("Email sent");
                socket.emit('resultado_de_email', 'EXITO, mensaje enviado');
                //alert('MENSAJE ENVIADO CON EXITO');
                res.status(200).jsonp(req.body);
            }
        });
    });    

    // If modifying these scopes, delete token.json.
    const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];
    // The file token.json stores the user's access and refresh tokens, and is
    // created automatically when the authorization flow completes for the first
    // time.
    const TOKEN_PATH = 'token.json';

    // Load client secrets from a local file.
    fs.readFile('server/credentials.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);
    // Authorize a client with credentials, then call the Gmail API.

    authorize(JSON.parse(content), listLabels);
    authorize(JSON.parse(content), getEmails);

    });

    /**
     * Create an OAuth2 client with the given credentials, and then execute the
     * given callback function.
     * @param {Object} credentials The authorization client credentials.
     * @param {function} callback The callback to call with the authorized client.
     */
    function authorize(credentials, callback) {
    const {client_secret, client_id, redirect_uris} = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) return getNewToken(oAuth2Client, callback);
        oAuth2Client.setCredentials(JSON.parse(token));
        callback(oAuth2Client);
    });
    }

    /**
     * Get and store new token after prompting for user authorization, and then
     * execute the given callback with the authorized OAuth2 client.
     * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
     * @param {getEventsCallback} callback The callback for the authorized client.
     */
    function getNewToken(oAuth2Client, callback) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', (code) => {
        rl.close();
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
    });
    }

    /**
     * Lists the labels in the user's account.
     *
     * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
     */
    function listLabels(auth) {
        const gmail = google.gmail({version: 'v1', auth});
        gmail.users.labels.list({
                userId: 'me',
            }, (err, res) => {
                if (err) return console.log('The API returned an error: ' + err);
                const labels = res.data.labels;
                if (labels.length) {
                    console.log('Labels:');
                    labels.forEach((label) => {
                        console.log(`- ${label.name}`);
                    });
                } else {
                    console.log('No labels found.');
                }
        });
    }

    //metodo para obtener la bandeja de entrada de inbox
    function getEmails(auth){
        
        var index = 0;
        const email = google.gmail({version: 'v1', auth});
        email.users.messages.list({auth:auth, userId: 'me', labelIds: ['INBOX']}, function(err, response){
            if(err){
                console.log(`ERROR ${err}`);
            }
            response['data']['messages'].map(message => {
                let mensageArray = {};
                let messageId = message['id'];

                email.users.messages.get({auth: auth, userId: 'me', id: messageId, format: 'metadata', metadataHeaders: ['From', 'Date', 'Subject']}, function(err, responseData){
                    if(err){
                        console.log(`ERROR ${err}`);
                    }
                    
                    mensageArray['index'] = index;
                    mensageArray[responseData.data.payload.headers[0].name] = responseData.data.payload.headers[0].value;
                    mensageArray[responseData.data.payload.headers[1].name] = responseData.data.payload.headers[1].value;
                    mensageArray[responseData.data.payload.headers[2].name] = responseData.data.payload.headers[2].value;

                    mensajeList.push(mensageArray);
                    //console.log(responseData.data.payload.headers);
                    index++;
                    if(index === response['data']['messages'].length){
                        //console.log(mensajeList);
                        socket.emit('datos_email', mensajeList);
                    }
                }); 
            });
        });    
    }

});

server.listen(8000, function(){
    console.log('Servidor funcionado en http://localhost:8000');
})
