'use strict';

require('dotenv').config();
const { response } = require('express');
const express = require('express');
require('ejs');
const methodoverride = require('method-override');
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
app.use(methodoverride('_method'));

//routes to be added
// app.get('/search', renderSearchPage);
app.get('/', renderHomePageWithDBBooks);
app.get('/searches/new', renderSearchPage);
app.post('/searches', handleNewSearch);
app.get('/pages/error', handleErrorPage);
app.get('/books/:id', renderIndividualBookDisplay);
app.post('/books', addBookToDatabase);
app.delete('/delete/:id', deleteBookFromDB);
app.get('*', handleErrorPage);
// app.get('/searches/show', handleSearchResults);

function addBookToDatabase(request, response) {
  //get info on which book user wants added
  console.log('data passed for adding book: ', request.body);
  const {title, authors, imageURL, description, isbn} = request.body;

  //add book to DB
  const sql = 'INSERT INTO books (title, author, image_url, description, isbn) VALUES ($1, $2, $3, $4, $5) RETURNING id;';

  const safeValues = [title, authors, imageURL, description, isbn];

  client.query(sql, safeValues)
    .then( (results) => {
      // get new primary ID for book just added to DB
      console.log('after store new book to DB, return: ', results.rows[0]);
      console.log('after store new book to DB, returns ID: ', results.rows[0].id);
      // const bookID = results.rows[0].id;

      // redirect user to the detailed book page
      // response.status(200).send(results.rows[0].id);

      response.status(200).redirect(`/books/${results.rows[0].id}`);


    })
    .catch( (error) => {
      console.log('error adding new book to DB',error);
      response.status(500).redirect('pages/error');    
    });

  // object
  // title
  // authors
  // imageURL
  // description
  // isbn

  // SQL row
  // id
  // title ,
  // author (),
  // image_url ,
  // description ,
  // isbn ()

  //redirect user to detail page for selected book

}

function deleteBookFromDB(request,response) {
  const id = request.params.id;
  // https://www.w3schools.com/sql/sql_delete.asp
  const sql = `DELETE FROM books WHERE id=$1;`;
  const safeValues = [id];
  client.query(sql, safeValues)
    .then(results => {
      console.log('results from deleting book: ',results);
      response.status(200).redirect('/');   
    })
    .catch( (error) => {
      console.log('error getting deleting book from DB',error);
      response.status(500).redirect('pages/error');    
    });
}


function renderIndividualBookDisplay(request,response) {
  // Chance's guidance about how to use the same route for "view detail" as showing a book after adding it to the DB by using the ID we get back from entering it in the database.
  
  // console.log(request.params);
  const id = request.params.id; 
  // console.log(request.params.id);

  const sql = `SELECT * FROM books WHERE id=$1;`;
  const safeValues = [id];
  client.query(sql, safeValues)
    .then(results => {
      console.log('results from serverjs: ',results);
      const myChosenBook = results.rows[0];
      response.status(200).render('pages/books/show',{book: myChosenBook});
    })
    .catch( (error) => {
      console.log('error getting single book page',error);
      response.status(500).redirect('pages/error');    
    });
}

function renderHomePageWithDBBooks(request,response) {
  // get the books from the database
  const sql = `SELECT * FROM books;`;
  client.query(sql)
    .then(booksIncomingFromDB => {
      console.log(booksIncomingFromDB.rows);
      const allBooksFromDB = booksIncomingFromDB.rows;
      // send them to the index as we call it
      response.status(200).render('pages/index',{allBooksFromDB: allBooksFromDB});
    })
    .catch( (error) => {
      console.log('error getting books from DB');
      response.status(500).redirect('pages/error');    
    });
}


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
  this.isbn = bookObject.volumeInfo.isbn ? bookObject.volumeInfo.isbn : "ISBN not available.";
  // IN SQL:
  // author VARCHAR(255),
  // image_url TEXT,
  // to match SQL and have easier pass offs, we are going to chagne the names across MAYBE

  // constructor
  // title
  // authors
  //imageURL
  //description
  //isbn


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


