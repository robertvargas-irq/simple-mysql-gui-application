const http = require('http');
const path = require('path');
const fs = require('fs');
const qs = require('querystring');
// const { body, validationResult } = require('express-validator');
const { URLSearchParams } = require('url');

// custom modules
const db_connections = require('./db_connections');

// const base_dir = './www';
global.appRoot = './www';
// global.appRoot = path.resolve(base_dir);

function connect() {
    
    const mysql = require('mysql');
    
    let con = mysql.createConnection({
        // database: '',
        host: 'localhost',
        user: 'root',
        password: 'DROrigins@0123'
    });
    
    con.connect((err) => {
        if (err) throw err;
        console.log(`Connected to DB ${con.config.database} as user ${con.config.user} via host ${con.config.host} with password ${con.config.password}`);
    });


}




const server = http.createServer(async(req, res) => {

    if (req.method === 'POST') {

        if (req.url === '/db_login') {

            // write data stream to body
            let body = '';
            req.on('data', (data) => body += data);

            // parse POST request body
            req.on('end', async () => {
                const parse = new URLSearchParams(body);
                for (const [key, value] of parse)
                    console.log({[key]: value});

                // connect to the database
                const {success, error_message} = await db_connections.login(Object.fromEntries(parse.entries()));

                // redirect to database home if successfully logged in
                if (success) {
                    // 302 redirect
                    res.writeHead(302, {
                        Location: '/database/home.html'
                    });
                    res.end();
                }
                else {
                    res.writeHead(402, {});
                    res.end(error_message);
                }
            });

        }

    }

    if (req.method === 'GET') {
        console.log({req_url: req.url});
        let url = req.url;
        if (url === '/') url = '/index.html';

        // extension
        let ext = url.split('.').at(-1).replace(/[^a-zA-Z]/g,'');

        console.log({url, ext});

        switch (ext) {
            case 'html':{
                res.writeHead(200, {'Content-Type': 'text/html'});
                fs.readFile(global.appRoot + '/' + ext + url, (err, file) => {
                    // print error
                    if (err) return res.end(err.message);

                    // write to user
                    res.write(file);
                    res.end();
                });
                break;
            }
            case 'js':{
                res.writeHead(200, {'Content-Type': 'text/javascript'});
                fs.readFile(global.appRoot + '/' + ext + url, (err, file) => {
                    // print error
                    if (err) return res.end(err.message);

                    // write to user
                    res.write(file);
                    res.end();
                });
                break;
            }
            case 'css':{
                res.writeHead(200, {'Content-Type': 'text/css'});
                fs.readFile(global.appRoot + '/' + ext + url, (err, file) => {
                    // print error
                    if (err) return res.end(err.message);

                    // write to user
                    res.write(file);
                    res.end();
                });
                break;
            }
            default: {
                res.end('Invalid URL');
            }
        }
    }
      
}).listen(3000);

console.log('Http server started on port ' + server.address().port);