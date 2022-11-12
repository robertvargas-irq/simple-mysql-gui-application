const express = require('express');
const path = require('path');
const PORT = 3000;

// initialize app
const app = express();

// initialize view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// homepage route
app.get('/', (req, res) => {
    // res.send('Hiya!');
    res.render('index', {
        second_header: 'woahg'
    });
});

// begin server
app.listen(PORT || 3000, () => {
    console.log(`Server initialized on port ${PORT || 3000}`);
})