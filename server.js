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
// app.get('/searches/show', handleSearchResults);

function renderTestPage(request, response) {
  response.render('pages/index');
}

function renderSearchPage(request, response) {
  response.render('pages/searches/new.ejs');
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
      response.status(500).send('Sorry, something went wrong  -  error code 6048');
    });
}






function Book(bookObject){
  this.title = bookObject.volumeInfo.title ? bookObject.volumeInfo.title : 'Title not found.';
  this.authors = bookObject.volumeInfo.authors ? bookObject.volumeInfo.authors : 'No author credited.';
  this.imageURL = bookObject.volumeInfo.imageLinks.smallThumbnail ? bookObject.volumeInfo.imageLinks.smallThumbnail : 'https://i.imgur.com/J5LVHEL.jpg';
  this.description = bookObject.volumeInfo.description ? bookObject.volumeInfo.description : "No summary available.";

  // trying to figure out http -> https

  // const str1 = 'http://www.google.com';
  // const str2 = 'https://www.google.com';

  // let regex = /(http:)/;

  // console.log(str1);
  // console.log(str2);
  // console.log(regex);

  // console.log('str1: ',regex.test(str1));
  // console.log('str2: ',regex.test(str2));

  // if (regex.test(str1) === 1) {
  //   let imageURL = str1.replace(regex,'https:');
  //   str1.replace(regex,'https:');

  // } else {
  //   let imageURL = str1;
  // }

  // // str.replace(regex,'-');
  // console.log('end states');
  // console.log(str1);
  // console.log(str2);
  // console.log(regex);
  // console.log(imageURL);

}


app.listen(PORT, () => {
    console.log(`listening on ${PORT}`);
})


