var express = require('express');
var app = express();
var cors = require('cors');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var config = require('./config.js');
var fs = require('fs');
var rp = require('request-promise');

app.use(cors());

app.use(bodyParser.json());

// Connect to mongodb
mongoose.connect(`mongodb://${config.DB_HOST}:${config.DB_PORT}/${config.DB_NAME}`, {useNewUrlParser: true});

/***
 * Auth - Middleware to secure the api with an api_key
 */
let checkAuth = (req, res, next) => {
    var apiKey = req.get('Authorization');

    if(apiKey === config.API_KEY) {
        next();
    } else {
        res.status(401).send('Unauthorized')
    }
};

const Song = mongoose.model('Song', {
    title: String,
    artist: String,
    album: String,
    album_img: String,
    filename: String
});

const User = mongoose.model('User', {
    email: String,
    password: String,
    firstname: String,
    lastname: String
});

const Fruit = mongoose.model('Fruit', {
   name: String,
   color: String,
   isSeed: Boolean
});

/***
 * API - SONGS
 */

/// GET ALL SONGS ///
app.get('/api/songs', checkAuth, function (req, res) {

    let log = {
        level: 'info',
        content: 'sending GET request to /api/songs...'
    };

    var options = {
        method: 'POST',
        uri: `http://${config.ES_HOST}:${config.ES_PORT}/${config.ES_INDEX}/_doc/_create`,
        body: log,
        json: true
    };

    rp(options).then((parsedBody) => {
       console.log('elastic response', parsedBody);
        Song.find().then(songs => {
            res.json(songs)
        });
    }).catch((e) => {
       console.log('elastic error', e);
    });
});

/// GET SONG BY ID ///
app.get('/api/songs/:id', function (req, res) {

    let log = {
        level: 'info',
        content: 'sending GET request to /api/songs/' + req.params.id + '...'
    };

    var options = {
        method: 'POST',
        uri: `http://${config.ES_HOST}:${config.ES_PORT}/${config.ES_INDEX}/_doc/_create`,
        body: log,
        json: true
    };

    rp(options).then((parsedBody) => {
        console.log('elastic response', parsedBody);
        Song.findOne({
            _id: req.params.id
        }).then((song) => song ? res.json(song) : res.status(404).json({error: 'no song found'}));
    }).catch((e) => {
        console.log('elastic error', e);
    });
});

/// CREATE SONG ///
app.post('/api/songs/', function (req, res) {

    // todo -- download mp3 & save it to /res folder

    let log = {
        level: 'info',
        content: 'sending POST request to /api/songs/...'
    };

    var options = {
        method: 'POST',
        uri: `http://${config.ES_HOST}:${config.ES_PORT}/${config.ES_INDEX}/_doc/_create`,
        body: log,
        json: true
    };

    rp(options).then((parsedBody) => {
        console.log('elastic response', parsedBody);
        Song.create({
            title: req.body.title,
            artist: req.body.artist,
            album: req.body.album,
            album_img: req.body.album_img,
            filename: req.body.filename,

        }).then((song) => res.json(song));
    }).catch((e) => {
        console.log('elastic error', e);
    });
});

/// UPDATE SONG ///
app.put('/api/songs/:id', function (req, res) {

    let log = {
        level: 'info',
        content: 'sending PUT request to /api/songs/' + req.params.id + '...'
    };

    var options = {
        method: 'POST',
        uri: `http://${config.ES_HOST}:${config.ES_PORT}/${config.ES_INDEX}/_doc/_create`,
        body: log,
        json: true
    };

    rp(options).then((parsedBody) => {
        console.log('elastic response', parsedBody);
        Song.findOne({
            _id: req.params.id
        }).then((song) => {
            if(song) {
                song.title = req.body.title;
                song.artist = req.body.artist;
                song.album = req.body.album;
                song.album_img = req.body.album_img;
                song.fileNname = req.body.filename;

                return song.save().then(() => res.json(song));
            } else {
                return res.status(404).json({error: 'unknown song with id : ' + req.params.id});
            }
        });
    }).catch((e) => {
        console.log('elastic error', e);
    });
});

/// DELETE SONG ///
app.delete('/api/songs/:id', function (req, res) {

    let log = {
        level: 'info',
        content: 'sending DELETE request to /api/songs/' + req.params.id + '...'
    };

    var options = {
        method: 'POST',
        uri: `http://${config.ES_HOST}:${config.ES_PORT}/${config.ES_INDEX}/_doc/_create`,
        body: log,
        json: true
    };

    rp(options).then((parseBody) => {
        console.log('elastic response', parseBody);
        Song.remove({
            _id: req.params.id
        }).then((song) => song ? res.json(song) : res.status(404).json({error: 'unknown song with id : ' + req.params.id}));
    }).catch((e) => console.log('elastic error', e));
});

// STREAM SONG ///
app.get('/api/stream/:filename', function (req, res) {
    let file = fs.createReadStream('./res/' + req.params.filename);
    return file.pipe(res);
});

/***
 * API - USERS
 */

/// GET ALL USERS ///
app.get('/api/users', checkAuth, function (req, res) {

    let log = {
        level: 'info',
        content: 'sending GET request to /api/users/...'
    };

    var options = {
        method: 'POST',
        uri: `http://${config.ES_HOST}:${config.ES_PORT}/${config.ES_INDEX}/_doc/_create`,
        body: log,
        json: true
    };

    rp(options).then((parsedBody) => {
       console.log('elastic response', parsedBody);
        User.find().then(users => {
            res.json(users)
        });
    }).catch((e) => console.log('elastic error', e));
});

/// GET USER BY ID ///
app.get('/api/users/:id', function (req, res) {

    let log = {
        level: 'info',
        content: 'sending GET request to /api/users/' + req.params.id + '...'
    };

    var options = {
        method: 'POST',
        uri: `http://${config.ES_HOST}:${config.ES_PORT}/${config.ES_INDEX}/_doc/_create`,
        body: log,
        json: true
    };

    rp(options).then((parsedBody) => {
        console.log('elastic response', parsedBody);
        User.findOne({
            _id: req.params.id
        }).then((user) => user ? res.json(user) : res.status(404).json({error: 'no user found'}));
    }).catch((e) => console.log('elastic error', e));
});

/// CREATE USER ///
app.post('/api/users/', function (req, res) {

    let log = {
        level: 'info',
        content: 'sending POST request to /api/users/...'
    };

    var options = {
        method: 'POST',
        uri: `http://${config.ES_HOST}:${config.ES_PORT}/${config.ES_INDEX}/_doc/_create`,
        body: log,
        json: true
    };

    rp(options).then((parsedBody) => {
        console.log('elastic response', parsedBody);
        User.create({
            email: req.body.email,
            password: req.body.password,
            firstname: req.body.firstname,
            lastname: req.body.lastname

        }).then((user) => res.json(user));
    }).catch((e) => console.log('elastic error', e));
});

/// UPDATE USER ///
app.put('/api/users/:id', function (req, res) {

    let log = {
        level: 'info',
        content: 'sending PUT request to /api/users/' + req.params.id + '...'
    };

    var options = {
        method: 'POST',
        uri: `http://${config.ES_HOST}:${config.ES_PORT}/${config.ES_INDEX}/_doc/_create`,
        body: log,
        json: true
    };

    rp(options).then((parsedBody) => {
        console.log('elastic response', parsedBody);
        User.findOne({
            _id: req.params.id
        }).then((user) => {
            if(user) {
                user.email = req.body.email;
                user.password = req.body.password;
                user.firstname = req.body.firstname;
                user.lastname = req.body.lastname;

                return user.save().then(() => res.json(user));
            } else {
                return res.status(404).json({error: 'unknown user with id : ' + req.params.id});
            }
        });
    }).catch((e) => console.log('elastic error', e));
});

/// DELETE USER ///
app.delete('/api/users/:id', function (req, res) {

    let log = {
        level: 'info',
        content: 'sending DELETE request to /api/users/' + req.params.id + '...'
    };

    var options = {
        method: 'POST',
        uri: `http://${config.ES_HOST}:${config.ES_PORT}/${config.ES_INDEX}/_doc/_create`,
        body: log,
        json: true
    };

    rp(options).then((parsedBody) => {
        console.log('elastic response', parsedBody);
        User.remove({
            _id: req.params.id
        }).then((user) => user ? res.json(user) : res.status(404).json({error: 'unknown user with id : ' + req.params.id}));
    }).catch((e) => console.log('elastic error', e));
});

/***
 * API - FRUITS
 */

/// GET ALL FRUITS ///
app.get('/api/fruits', checkAuth, function (req, res) {

    let log = {
        level: 'info',
        content: 'sending GET request to /api/fruits...'
    };

    var options = {
        method: 'POST',
        uri: `http://${config.ES_HOST}:${config.ES_PORT}/${config.ES_INDEX}/_doc/_create`,
        body: log,
        json: true
    };

    rp(options)
        .then((parsedBody) => {
            console.log('elastic response', parsedBody);
            // POST succeeded...
            Fruit.find().then(fruits => {

                res.json(fruits)
            });
        })
        .catch(function (err) {
            console.log('elastic error', err);
        });
});

/// GET FRUIT BY id ///
app.get('/api/fruits/:id', function (req, res) {

    let log = {
        level: 'info',
        content: 'sending GET request to /api/fruits/' + req.params.id + '...'
    };

    var options = {
        method: 'POST',
        uri: `http://${config.ES_HOST}:${config.ES_PORT}/${config.ES_INDEX}/_doc/_create`,
        body: log,
        json: true
    };

    rp(options).then((parsedBody) => {
       console.log('elastic response', parsedBody);
        Fruit.findOne({
            _id: req.params.id
        }).then((fruit) => fruit ? res.json(fruit) : res.status(404).json({error: 'no fruit found'}));
    })
    .catch((err) => {
      console.log('elastic error', err);
    });
});

/// CREATE FRUIT ///
app.post('/api/fruits/', function (req, res) {

    let log = {
        level: 'info',
        content: 'sending POST request to /api/fruits/...'
    };

    var options = {
        method: 'POST',
        uri: `http://${config.ES_HOST}:${config.ES_PORT}/${config.ES_INDEX}/_doc/_create`,
        body: log,
        json: true
    };

    rp(options).then((parsedBody) => {
        console.log('elastic response', parsedBody);
        Fruit.create({
            name: req.body.name,
            color: req.body.color,
            isSeed: req.body.isSeed

        }).then((fruit) => res.json(fruit));
    }).catch((e) => {
        console.log('elastic error', e);
    });
});

/// UPDATE FRUIT ///
app.put('/api/fruits/:id', function (req, res) {

    let log = {
        level: 'info',
        content: 'sending PUT request to /api/fruits/' + req.params.id + '...'
    };

    var options = {
        method: 'POST',
        uri: `http://${config.ES_HOST}:${config.ES_PORT}/${config.ES_INDEX}/_doc/_create`,
        body: log,
        json: true
    };

    rp(options).then((parsedBody) => {
        console.log('elastic response', parsedBody);
        Fruit.findOne({
            _id: req.params.id
        }).then((fruit) => {
            if(fruit) {
                fruit.name = req.body.name;
                fruit.color = req.body.color;
                fruit.isSeed = req.body.isSeed;

                return fruit.save().then(() => res.json(fruit));
            } else {
                return res.status(404).json({error: 'unknown fruit with id : ' + req.params.id});
            }
        });
    }).catch((e) => {
        console.log('elastic error', e);
    });
});

/// DELETE FRUIT ///
app.delete('/api/fruits/:id', function (req, res) {

    let log = {
        level: 'info',
        content: 'sending DELETE request to /api/fruits/' + req.params.id + '...'
    };

    var options = {
        method: 'POST',
        uri: `http://${config.ES_HOST}:${config.ES_PORT}/${config.ES_INDEX}/_doc/_create`,
        body: log,
        json: true
    };

    rp(options).then((parsedBody) => {
        console.log('elastic response', parsedBody);
        Fruit.remove({
            _id: req.params.id
        }).then((fruit) => fruit ? res.json(fruit) : res.status(404).json({error: 'unknown fruit with id : ' + req.params.id}))
    }).catch((e) => {
    console.log('elastic error', e)
    });
});

app.listen(config.PORT, config.PORT);
console.log(`Running on ${config.HOST}:${config.PORT}...`);