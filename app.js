var express = require('express');
var app = express();
var cors = require('cors');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var config = require('./config.js');
var fs = require('fs');

app.use(cors());

app.use(bodyParser.json());

// Connect to mongodb
mongoose.connect(`mongodb://${config.HOST}:${config.PORT}/${config.DB_NAME}`, {useNewUrlParser: true});

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

/// DEFAULT GET HERE ///
app.get('/api/songs', checkAuth, function (req, res) {

    Song.find().then(songs => {
        res.json(songs)
    });
});

/// GET SONGS BY id ///
app.get('/api/songs/:id', function (req, res) {

    Song.findOne({
            _id: req.params.id
    }).then((song) => song ? res.json(song) : res.status(404).json({error: 'no song found'}))
});

/// POST NEW SONG ///
app.post('/api/songs/', function (req, res) {

    Song.create({
        title: req.body.title,
        artist: req.body.artist,
        album: req.body.album,
        album_img: req.body.album_img,
        filename: req.body.filename,

    }).then((song) => res.json(song))
});

/// DELETE SONG ///
app.delete('/api/songs/:id', function (req, res) {

    Song.remove({
            _id: req.params.id
    }).then((song) => song ? res.json(song) : res.status(404).json({error: 'unknown song with id : ' + req.params.id}))
});

// STREAM SONG ///
app.get('/api/stream/:filename', function (req, res) {
    let file = fs.createReadStream('./res/' + req.params.filename);
    return file.pipe(res);
});

app.listen(3000, "0.0.0.0");
console.log('Running on port 3000...');