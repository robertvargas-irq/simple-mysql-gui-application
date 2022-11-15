const express = require('express');
const sessions = require('express-session');
const path = require('path');
const PORT = 3000;
const bodyParser = require('body-parser');

// custom modules
const db_connections = require('./db_connections');
const db_util = require('./db_util');

// initialize app
const app = express();

// initialize view engine
app.set('views', path.join(__dirname, 'views'));
app.locals.basedir = app.get('views');
app.set('view engine', 'pug');

// initialize public for CSS
app.use(express.static(path.join(__dirname, 'public')));

// initialize body parser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}));
// parse application/json
app.use(bodyParser.json());

/*
 * Authentication via session middle-ware
 * ! NOT USED IN A SECURE MANNER, ONLY FOR DEMONSTRATION PURPOSES
 */
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


/*
 * 
 * ======
 * Routes
 * ======
 * 
 */



// homepage route
app.get('/', (req, res) => {
    res.render('index');
});

// database dashboard route
app.get('/database/home', async (req, res) => {

    // get connection from session userId
    const userId = req.session.userId;
    const con = db_connections.get(userId);
    
    // get DigitalDisplays from connection
    const digitalDisplays = (await con.execute('SELECT * FROM DigitalDisplay'))[0];
    console.log(digitalDisplays);

    // get Models from connection
    const models = (await con.execute('SELECT * FROM Model'))[0];
    console.log(models);
    
    // display database homepage
    const config = con.config;
    res.render('database/home', {
        digitalDisplays,
        models,
        dbname: config.database,
        hostname: config.host,
        username: config.user
    });
});

// database view model
app.get('/database/view/model/:modelNo', async (req, res) => {
    
    // get connection from session userId
    const userId = req.session.userId;
    const con = db_connections.get(userId);

    // get requested digital display WITH PREPARED STATEMENT
    // ! PREPARED
    const model = (await con.execute(
        'SELECT * FROM Model WHERE (modelNo = ?)', // prepared values populated in ?
        [req.params.modelNo] // prepared values
    ))[0][0]; // select first of resulting rows
    console.log({model});

    // if model was found, render detailed view
    if (model) {
        res.render('database/view/model', { model });
    }
    else {
        res.send(`Unable to locate Model with modelNo ${req.params.modelNo}`);
    }
});


// delete Digital Display
app.post('/database/delete/digitaldisplay/:serialno', async (req, res) => {

    // get connection from session userId
    const userId = req.session.userId;
    const con = db_connections.get(userId);

    // get Digital Display to get associated modelNo
    // ! PREPARED
    const display = (await con.execute(
        'SELECT * FROM DigitalDisplay WHERE (serialNo = ?)', // prepared values populated in ?
        [req.params.serialno] // prepared values
    ))[0][0];
    // if no longer exists, redirect home
    if (!display) {
        return res.redirect('/database/home');
    }
    const modelNo = display.modelNo;

    // delete requested digital display WITH PREPARED STATEMENT
    // ! PREPARED
    const success = (await con.execute(
        'DELETE FROM DigitalDisplay WHERE (serialNo = ?)', // prepared values populated in ?
        [req.params.serialno] // prepared values
    ))[0].affectedRows > 0;
    console.log({success});

    // check to see if modelNo is associated with any DigitalDisplays, or if it may be deleted
    await db_util.removeModelIfNotReferenced(con, modelNo);

    // redirect home to view results
    res.redirect('/database/home');
});

// update Digital Display
app.get('/database/update/digitaldisplay/:serialno', async (req, res) => {
    
    // get connection from session userId
    const userId = req.session.userId;
    const con = db_connections.get(userId);

    // get requested digital display WITH PREPARED STATEMENT
    // ! PREPARED
    const display = (await con.execute(
        'SELECT * FROM DigitalDisplay WHERE (serialNo = ?)', // prepared values populated in ?
        [req.params.serialno] // prepared values
    ))[0][0]; // select first of resulting rows
    console.log({display});

    // if Digital Display was found, render detailed view
    if (display) {
        res.render('database/forms/digitaldisplay', {
            display,
            updating: true
        });
    }
    else {
        res.send(`Unable to locate DigitalDisplay with serialNo ${req.params.serialno}`);
    }

});

// handle incoming data to update Digital Display
app.post('/database/update/digitaldisplay/:serialno', async (req, res) => {
    // get connection from session userId
    const userId = req.session.userId;
    const con = db_connections.get(userId);
    
    // prepare objects
    const originalSerialNo = req.params.serialno;
    const display = {
        serialNo: req.body.serialNo,
        modelNo: req.body.modelNo,
        schedulerSystem: req.body.schedulerSystem,
    };
    const model = {
        modelNo: req.body.modelNo,
        width: req.body.width,
        height: req.body.height,
        weight: req.body.weight,
        depth: req.body.depth,
        screenSize: req.body.screenSize
    };



    // check if Model exists in the database
    const modelExists = await db_util.modelExists(con, display.modelNo);
    
    // if model does not exist and model information is empty, prompt for Model creation
    if (!modelExists && (req.body.width === undefined)) {
        return res.render('database/forms/digitaldisplay', {
            display, model,
            createModel: true,
            updating: true
        });
    }

    // get original Display from the database to track changes to the ModelNo
    const originalDisplay = (await con.execute(
        'SELECT * FROM DigitalDisplay WHERE (serialNo = ?)', // prepared values populated in ?
        [originalSerialNo] // prepared values
    ))[0][0];
    if (!originalDisplay) {
        res.redirect('/database/home');
    }

    // track original model number
    const originalModelNo = originalDisplay.modelNo;


    // perform insertions to the database
    try {
        // insert model if needed
        // ! PREPARED
        if (req.body.width !== undefined) {
            await con.execute(
                'INSERT INTO Model VALUES (?, ?, ?, ?, ?, ?)', // prepared values populated in ?
                [model.modelNo, model.width, model.height, model.weight, model.depth, model.screenSize] // prepared values
            );
        }

        // update digital display
        // ! PREPARED
        await con.execute(
            'UPDATE DigitalDisplay SET serialNo = ?, schedulerSystem = ?, modelNo = ? WHERE (serialNo = ?);', // prepared values populated in ?
            [display.serialNo, display.schedulerSystem, display.modelNo, originalSerialNo] // prepared values
        );
        
    }
    catch (e) {
        return res.render('database/forms/digitaldisplay', {
            display, model,
            createModel: !modelExists,
            error: e || 'Something went wrong, please try again.'
        });
    }

    // finally, check to see if modelNo is associated with any DigitalDisplays, or if it may be deleted
    await db_util.removeModelIfNotReferenced(con, originalModelNo);

    // on success, redirect home
    return res.redirect('/database/home');
});

// insert Digital Display
app.get('/database/insert/digitaldisplay', async (req, res) => {

    // render empty form
    res.render('database/forms/digitaldisplay', {
        display: {},
        updating: false,
    });

});

// handle incoming data to insert Digital Display 
app.post('/database/insert/digitaldisplay', async(req, res) => {
    // get connection from session userId
    const userId = req.session.userId;
    const con = db_connections.get(userId);
    
    // prepare objects
    const display = {
        serialNo: req.body.serialNo,
        modelNo: req.body.modelNo,
        schedulerSystem: req.body.schedulerSystem,
    };
    const model = {
        modelNo: req.body.modelNo,
        width: req.body.width,
        height: req.body.height,
        weight: req.body.weight,
        depth: req.body.depth,
        screenSize: req.body.screenSize
    };



    // check if Model exists in the database
    // ! PREPARED
    const modelExists = await db_util.modelExists(con, display.modelNo);
    
    // if model does not exist and model information is empty, prompt for Model creation
    if (!modelExists && (req.body.width === undefined)) {
        return res.render('database/forms/digitaldisplay', {
            display, model,
            createModel: true,
        });
    }

    // perform insertions to the database
    try {
        // insert model if needed
        // ! PREPARED
        if (req.body.width !== undefined) {
            await con.execute(
                'INSERT INTO Model VALUES (?, ?, ?, ?, ?, ?)', // prepared values populated in ?
                [model.modelNo, model.width, model.height, model.weight, model.depth, model.screenSize] // prepared values
            );
        }

        // insert digital display
        // ! PREPARED
        await con.execute(
            'INSERT INTO DigitalDisplay VALUES (?, ?, ?)', // prepared values populated in ?
            [display.serialNo, display.schedulerSystem, display.modelNo] // prepared values
        );
        
    }
    catch (e) {
        return res.render('database/forms/digitaldisplay', {
            display, model,
            createModel: !modelExists,
            error: e || 'Something went wrong, please try again.'
        });
    }

    // on success, redirect home
    return res.redirect('/database/home');

});

// search by Scheduler System
app.get('/database/search/digitaldisplay', async(req, res) => {
    // get connection from session userId
    const userId = req.session.userId;
    const con = db_connections.get(userId);
    
    // get search query; redirect to the home page if none was inputted
    const schedulerRequested = req.query.scheduler;
    if (!schedulerRequested) res.redirect('/database/home');

    // get all database entries that match the given scheduler
    // ! PREPARED
    const results = (await con.execute(
        'SELECT * FROM DigitalDisplay WHERE (schedulerSystem = ?)', // prepared values populated in ?
        [schedulerRequested] // prepared values
    ))[0];

    // render the page with the given results
    return res.render('database/search/digitaldisplay', {
        results, schedulerRequested
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
app.post('/db_logout', (req, res) => {
    // destroy session and redirect to the homepage
    req.session.destroy();
    res.redirect('/');
});

// begin server
app.listen(PORT || 3000, () => {
    console.log(`Server initialized on port ${PORT || 3000}`);
});