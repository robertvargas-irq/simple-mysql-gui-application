const express = require('express');
const sessions = require('express-session');
const path = require('path');
const PORT = 3000;
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

// custom modules
const db_connections = require('./db_connections');

// initialize app
const app = express();

// initialize view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// initialize body parser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}));
// parse application/json
app.use(bodyParser.json());

// authentication middle-ware
// ! NOT USED IN A SECURE MANNER, ONLY FOR DEMONSTRATION PURPOSES
// initialize session middleware
app.use(sessions({
    secret: "$6v1v=_*vqr2&zldstuf74(xmuj(+mn*&%5oj&8&(=y+y=%5&y",
    saveUninitialized: true,
    cookie: { maxAge: 24 * 60 * 60 * 1000 },
    resave: false
}));
app.use('/database', (req, res, next) => {
    // if not logged in, return with a 401 status and error
    if (!req.session.userId && !db_connections.get(req.session.userId)) {
        return res.status(401).send('Your credentials have expired and your session has been closed.\n<a href=\'/\'>Please sign in again.</a>');
    }
    next();
});  

// homepage route
app.get('/', (req, res) => {
    res.render('index');
});

app.get('/database/home', async (req, res) => {

    // get connection from session userId
    const userId = req.session.userId;
    const con = db_connections.get(userId);
    
    // get DigitalDisplays from connection
    const digitalDisplays = (await con.execute('SELECT * FROM DigitalDisplay'))[0];
    console.log(digitalDisplays);
    
    // display database homepage
    const config = con.config;
    res.render('database/home', {
        digitalDisplays,
        dbname: config.database,
        hostname: config.host,
        username: config.user
    });
});

// login POST route
app.post('/db_login', async (req, res) => {

    console.log(req.body);
    for (const [key, value] of Object.entries(req.body))
        console.log({[key]: value});

    // connect to the database
    const {success, error_message} = await db_connections.login(req.body);

    // redirect to database home if successfully logged in
    if (success) {
        // add authorization to header
        const session=req.session;
        session.userId=req.body.username;
        console.log(req.session);

        // redirect to database home page
        res.redirect('/database/home');
    }
    else {
        // render login page with error
        res.render('index', {
            hostname: req.body.hostname || '',
            dbname: req.body.dbname || '',
            username: req.body.username || '',
            error: error_message
        });
    }

});

// logout route
app.get('/logout', (req, res) => {
    // destroy session and redirect to the homepage
    req.session.destroy();
    res.redirect('/');
});

// begin server
app.listen(PORT || 3000, () => {
    console.log(`Server initialized on port ${PORT || 3000}`);
});