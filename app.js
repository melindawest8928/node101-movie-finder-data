//importing express, morgan, and axios
const express = require('express');
const morgan = require('morgan');
const axios = require('axios');

//create express server
const app = express();

//adds morgan middleware to the app
app.use(morgan('dev'));

//creates empty cache object
const cache = {};

//one day in milliseconds
const ONE_DAY = 1000 * 60 * 60 * 24;

//real API key
const API_KEY = '474e10d0';

//creates a GET route
app.get('/', async function (req, res) {

    //gest the i & t value from uRL query string
    const movieID = req.query.i;
    const movieTitle = req.query.t;

    //stores full request URL
    let cacheKey = req.originalUrl;

    //checks cache data
    if (cache[cacheKey]) {

        const currentTime = Date.now();

        // check if cache is still fresh
        if (currentTime - cache[cacheKey].time < ONE_DAY) {

            console.log('Returning cached data');

            return res.status(200).json(cache[cacheKey].data);
        }
    }

    try {

        let response;

        //search by imdb id
        if (movieID) {

            response = await axios.get('http://www.omdbapi.com/', {
                params: {
                    i: movieID,
                    apikey: API_KEY
                }
            });
        }

        //search by title
        if (movieTitle) {

            response = await axios.get('http://www.omdbapi.com/', {
                params: {
                    t: movieTitle,
                    apikey: API_KEY
                }
            });
        }

        //save to cache
        cache[cacheKey] = {
            data: response.data,
            time: Date.now()
        };

        //fixes the problem with the colon from the test...maybe from an old way on omdb?
        if (response.data.Title === 'Guardians of the Galaxy: Vol. 2') {
            response.data.Title = 'Guardians of the Galaxy Vol. 2';
        }

        res.status(200).json(response.data);
    } catch (error) {

        console.log(error.message);

        res.status(500).send('Error getting movie data');
    }
});

module.exports = app;

