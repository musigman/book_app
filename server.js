'use strict';

require('dotenv').config();
const { response } = require('express');
const express = require('express');
require('ejs');
const superagent = require('superagent');
const pg = require('pg');

const PORT = process.env.PORT || 3001;
const app = express();
const databaseUrl = process.env.DATABASE_URL;
const client = new pg.Client(databaseUrl);
client.on('error', (err) => {
    console.error(err);
});


// bring up middleware
app.set('view engine', 'ejs');
app.use(express.static('./public'));
app.use(express.urlencoded({extended:true}));

//routes to be added
// app.get('/search', renderSearchPage);
app.get('/', renderHomePageWithDBBooks);
app.get('/searches/new', renderSearchPage);
app.post('/searches', handleNewSearch);
app.get('/pages/error', handleErrorPage);
app.get('*', handleErrorPage);
// app.get('/searches/show', handleSearchResults);

function renderHomePageWithDBBooks(request,response) {
  // get the books from the database
  const sql = `SELECT * FROM books;`;
  client.query(sql)
    .then(booksIncomingFromDB => {
      console.log(booksIncomingFromDB.rows);
      const allBooksFromDB = booksIncomingFromDB.rows;


      // package them appropriately; get data out and structure it appropriately.
    
    
      // send them to the index as we call it
      // renderHomePage(request, response);

      response.status(200).render('pages/index',{allBooksFromDB: allBooksFromDB});
      // , {arrayOfBooksFromDB: arrayOfBooksFromDB});


    })

}

// function renderHomePage(request, response) {
//   response.render('pages/index');
// }

function renderSearchPage(request, response) {
  response.render('pages/searches/new.ejs');
}

function handleErrorPage(request, response) {
  response.render('pages/error.ejs');
}

// function handleSearchResults(request, response) {
//   response.render('pages/searches/show.ejs', {arrayOfBookObjects: arrayOfBookObjects});
// }

function handleNewSearch(request,response) {
  console.log(request.body);
  const searchQuery = request.body.search[0];
  const searchType = request.body.search[1];

  let url = `https://www.googleapis.com/books/v1/volumes?q=`;
  if(searchType === 'title'){url += `+intitle:${searchQuery}`}
  if(searchType === 'author'){ url += `+inauthor:${searchQuery}`}
  console.log('url search by us: ',url);
  superagent
  .get(url)
    .then(data => {
      // console.log(data.body.items);
      // response.send(data.body.items);

      const arrayOfBooKObjectsFromAPI = data.body.items;
      let arrayOfBookObjects = arrayOfBooKObjectsFromAPI.map( value => new Book(value));

      // response.send(arrayOfBookObjects);
      // response.redirect('/searches/show');
      response.render('pages/searches/show.ejs', {arrayOfBookObjects: arrayOfBookObjects});

    })
    .catch( (error) => {
      console.log('Sorry, something went wrong  -  error code 6048; we think no results from API')
      // response.status(500).send('Sorry, something went wrong  -  error code 6048');
      response.status(500).redirect('pages/error');      
    });
}

// function makeImageLinkSecure(imageLink) {
//   const linkFromAPI = 'https://www.google.com';
//   let regex = /(http:)/;
//   var imageURL = 'cat';
//   if (regex.test(linkFromAPI)) {
//     imageURL = linkFromAPI.replace(regex,'https:');
//   } else {
//     imageURL = linkFromAPI;
//   }
// }


function Book(bookObject){
  this.title = bookObject.volumeInfo.title ? bookObject.volumeInfo.title : 'Title not found.';
  this.authors = bookObject.volumeInfo.authors ? bookObject.volumeInfo.authors : 'No author credited.';
  this.imageURL = bookObject.volumeInfo.imageLinks.smallThumbnail ? bookObject.volumeInfo.imageLinks.smallThumbnail : 'https://i.imgur.com/J5LVHEL.jpg';
  this.description = bookObject.volumeInfo.description ? bookObject.volumeInfo.description : "No summary available.";

  // let regex = /(http:)/;
  // if (regex.test(linkFromAPI)) {
  //   this.imageURL = this.imageURL.replace(regex,'https:');
  // }
}


client.connect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`listening on ${PORT}`);
    })
  })
  // do we need to have a catch here?  is it needed/required?
  .catch( (error) => {
    console.log('Sorry, something went wrong  -  error code 8934; we think no we were unable to connect to the postgres database')
    // response.status(500).send('Sorry, something went wrong  -  error code 6048');
    response.status(500).redirect('pages/error');
  });


