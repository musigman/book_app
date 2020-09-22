'use strict';

require('dotenv').config();
const { response } = require('express');
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


// bring up middleware
app.set('view engine', 'ejs');
app.use(express.static('./public'));
app.use(express.urlencoded({extended:true}));

//routes to be added
app.get('/', renderSearchPage);
app.get('/test', renderTestPage);
app.get('/searches/new', renderSearchPage);

function renderTestPage(request, response) {
  response.render('pages/index');
}

function renderSearchPage(request, response) {
  response.render('pages/searches/new.ejs');
}


app.listen(PORT, () => {
    console.log(`listening on ${PORT}`);
})


