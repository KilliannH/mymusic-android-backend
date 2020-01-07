var express = require('express');
var app = express();
var cors = require('cors');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var config = require('./config.js');
var fs = require('fs');
var bunyan = require('bunyan');

var log = bunyan.createLogger({
    name: 'myapp',
    streams: [
        {
            level: 'info',
            stream: process.stdout            // log INFO and above to stdout
        },
        {
            level: 'info',
            path: './log/myapp-error.log'  // log ERROR and above to a file
        }
    ]
});

// Log stuff like this
log.info({status: 'started'}, 'app started');

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

    log.info({status: 'REQUEST'}, 'GET /api/songs');

        Song.find().then(songs => {
            log.info({status: 'SUCCESS'}, 'response : \n' + songs);
            res.json(songs)
        }).catch((e) => {
       log.error({status: 'ERROR'}, e);
    });
});

/// GET SONG BY ID ///
app.get('/api/songs/:id', function (req, res) {

    log.info({status: 'REQUEST'}, 'GET /api/songs/' + req.params.id);

    Song.findOne({
            _id: req.params.id
        }).then((song) => {
            if (song) {
                log.info({status: 'SUCCESS'}, 'response : \n' + song);
                res.json(song);
            } else {
                log.error({status: 'ERROR'}, 'no song found with id ' + req.params.id);
                res.status(404).json({error: 'no song found'});
            }
        }).catch((e) => {
        log.error({status: 'ERROR'}, e);
    });
});

/// CREATE SONG ///
app.post('/api/songs/', function (req, res) {

    log.info({status: 'REQUEST'}, 'POST /api/songs/');

     Song.create({
         title: req.body.title,
         artist: req.body.artist,
         album: req.body.album,
         album_img: req.body.album_img,
         filename: req.body.filename,

     }).then((song) => {
         log.info({status: 'SUCCESS'}, 'response : \n' + song);
         res.json(song);
    }).catch((e) => {
        log.error({status: 'ERROR'}, e);
    });
});

/// UPDATE SONG ///
app.put('/api/songs/:id', function (req, res) {

    log.info({status: 'REQUEST'}, 'PUT /api/songs/' + req.params.id);

    Song.findOne({
        _id: req.params.id
    }).then((song) => {
        if(song) {
            song.title = req.body.title;
            song.artist = req.body.artist;
            song.album = req.body.album;
            song.album_img = req.body.album_img;
            song.fileNname = req.body.filename;

            return song.save().then(() => {
                log.info({status: 'SUCCESS'}, 'response : \n' + song);
                res.json(song);
            });
        } else {
            log.error({status: 'ERROR'}, 'unknown song with id : ' + req.params.id);
            return res.status(404).json({error: 'unknown song with id : ' + req.params.id});
        }
    });
});

/// DELETE SONG ///
app.delete('/api/songs/:id', function (req, res) {

    log.info({status: 'REQUEST'}, 'DELETE /api/songs/' + req.params.id);

    Song.remove({
        _id: req.params.id
    }).then((song) => {
        if (song) {
            log.info({status: 'SUCCESS'}, 'response : \n' + song);
            res.json(song);
        } else {
            log.error({status: 'ERROR'}, 'unknown song with id : ' + req.params.id);
            res.status(404).json({error: 'unknown song with id : ' + req.params.id})
        }
    });
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

    log.info({status: 'REQUEST'}, 'GET /api/users');

    User.find().then(users => {
        log.info({status: 'SUCCESS'}, 'response : \n' + users);
        res.json(users)
    }).catch((e) => {
        log.error({status: 'ERROR'}, e);
    });
});

/// GET USER BY ID ///
app.get('/api/users/:id', function (req, res) {

    log.info({status: 'REQUEST'}, 'GET /api/users/' + req.params.id);

    User.findOne({
        _id: req.params.id
    }).then((user) => {
        if (user) {
            log.info({status: 'SUCCESS'}, 'response : \n' + user);
            res.json(user);
        } else {
            log.error({status: 'ERROR'}, 'no user found with id ' + req.params.id);
            res.status(404).json({error: 'no user found'});
        }
    }).catch((e) => {
        log.error({status: 'ERROR'}, e);
    });
});

/// CREATE USER ///
app.post('/api/users/', function (req, res) {

    log.info({status: 'REQUEST'}, 'POST /api/users/');

    User.create({
        email: req.body.email,
        password: req.body.password,
        firstname: req.body.firstname,
        lastname: req.body.lastname

    }).then((user) => {
        log.info({status: 'SUCCESS'}, 'response : \n' + user);
        res.json(user);
    }).catch((e) => {
        log.error({status: 'ERROR'}, e);
    });
});

/// UPDATE USER ///
app.put('/api/users/:id', function (req, res) {

    log.info({status: 'REQUEST'}, 'PUT /api/users/' + req.params.id);

    User.findOne({
        _id: req.params.id
    }).then((user) => {
        if(user) {
            user.email = req.body.email;
            user.password = req.body.password;
            user.firstname = req.body.firstname;
            user.lastname = req.body.lastname;

            return user.save().then(() => {
                log.info({status: 'SUCCESS'}, 'response : \n' + user);
                res.json(user);
            });
        } else {
            log.error({status: 'ERROR'}, 'unknown user with id : ' + req.params.id);
            return res.status(404).json({error: 'unknown user with id : ' + req.params.id});
        }
    });
});

/// DELETE USER ///
app.delete('/api/users/:id', function (req, res) {

    log.info({status: 'REQUEST'}, 'DELETE /api/users/' + req.params.id);

    User.remove({
        _id: req.params.id
    }).then((user) => {
        if (user) {
            log.info({status: 'SUCCESS'}, 'response : \n' + song);
            res.json(user);
        } else {
            log.error({status: 'ERROR'}, 'unknown user with id : ' + req.params.id);
            res.status(404).json({error: 'unknown user with id : ' + req.params.id})
        }
    });
});

/***
 * API - FRUITS
 */

/// GET ALL FRUITS ///
app.get('/api/fruits', checkAuth, function (req, res) {
    log.info({status: 'REQUEST'}, 'GET /api/fruits');

    Fruit.find().then(fruits => {
        log.info({status: 'SUCCESS'}, 'response : \n' + fruits);
        res.json(fruits)
    }).catch((e) => {
        log.error({status: 'ERROR'}, e);
    });
});

/// GET FRUIT BY id ///
app.get('/api/fruits/:id', function (req, res) {

    log.info({status: 'REQUEST'}, 'GET /api/fruits/' + req.params.id);

    Fruit.findOne({
        _id: req.params.id
    }).then((fruit) => {
        if (fruit) {
            log.info({status: 'SUCCESS'}, 'response : \n' + fruit);
            res.json(fruit);
        } else {
            log.error({status: 'ERROR'}, 'no fruit found with id ' + req.params.id);
            res.status(404).json({error: 'no fruit found'});
        }
    }).catch((e) => {
        log.error({status: 'ERROR'}, e);
    });
});

/// CREATE FRUIT ///
app.post('/api/fruits/', function (req, res) {

    log.info({status: 'REQUEST'}, 'POST /api/fruits/');

    Fruit.create({
        name: req.body.name,
        color: req.body.color,
        isSeed: req.body.isSeed

    }).then((fruit) => {
        log.info({status: 'SUCCESS'}, 'response : \n' + fruit);
        res.json(fruit);
    }).catch((e) => {
        log.error({status: 'ERROR'}, e);
    });
});

/// UPDATE FRUIT ///
app.put('/api/fruits/:id', function (req, res) {

    log.info({status: 'REQUEST'}, 'PUT /api/fruits/' + req.params.id);

    Fruit.findOne({
        _id: req.params.id
    }).then((fruit) => {
        if(fruit) {
            fruit.name = req.body.name;
            fruit.color = req.body.color;
            fruit.isSeed = req.body.isSeed;

            return fruit.save().then(() => {
                log.info({status: 'SUCCESS'}, 'response : \n' + fruit);
                res.json(fruit);
            });
        } else {
            log.error({status: 'ERROR'}, 'unknown fruit with id : ' + req.params.id);
            return res.status(404).json({error: 'unknown fruit with id : ' + req.params.id});
        }
    });
});

/// DELETE FRUIT ///
app.delete('/api/fruits/:id', function (req, res) {

    log.info({status: 'REQUEST'}, 'DELETE /api/fruits/' + req.params.id);

    Fruit.remove({
        _id: req.params.id
    }).then((fruit) => {
        if (fruit) {
            log.info({status: 'SUCCESS'}, 'response : \n' + fruit);
            res.json(fruit);
        } else {
            log.error({status: 'ERROR'}, 'unknown fruit with id : ' + req.params.id);
            res.status(404).json({error: 'unknown fruit with id : ' + req.params.id})
        }
    });
});

app.listen(config.PORT, config.PORT);
console.log(`Running on ${config.HOST}:${config.PORT}...`);