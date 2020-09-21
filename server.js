'use strict';

require('dotenv').config();
const express = require('express');
require('ejs');
const superagent = require('superagent');
// const pg = require('pg');

const PORT = process.env.PORT || 3001;
const app = express();
// const databaseUrl = process.env.DATABASE_URL;
// const client = new pg.Client(databaseUrl);
// client.on('error', (err) => {
//     console.error(err);
// });

app.listen(PORT, () => {
    console.log(`listening on ${PORT}`);
})

// bring up middleware
app.set('view engine', 'ejs');
app.use(express.static('./public'));
app.use(express.urlencoded({extended:true}));

function renderHomePage(request, response) {
response.render('pages/index');

}


//routes to be added
app.get ('/, renderHomePage');


