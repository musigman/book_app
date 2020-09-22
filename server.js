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
app.post('/searches', handleNewSearch);

function renderTestPage(request, response) {
  response.render('pages/index');
}

function renderSearchPage(request, response) {
  response.render('pages/searches/new.ejs');
}

function handleNewSearch(request,response) {
  console.log(request.body);
  const searchQuery = request.body.search[0];
  const searchType = request.body.search[1];

  let url = `https://www.googleapis.com/books/v1/volumes?q=`;
  if(searchType === 'title'){url += `+intitle:${searchQuery}`}
  if(searchType === 'author'){ url += `+inauthor:${searchQuery}`}
  console.log('url search by us: ',url);
  superagent.get(url)
    .then(data => {
      console.log(data.body.item);
    })
    // .catch( )
}

function Book(bookObject){
  this.title = book.title ? book.title : 'Title not found.';
  this.author = book.author ? book.author : 'No author credited.';
  this.imageURL = book.imageURL ? book.imageURL : 'https://i.imgur.com/J5LVHEL.jpg';
  this.description = book.description ? book.description : "No summary available.";
}


app.listen(PORT, () => {
    console.log(`listening on ${PORT}`);
})


