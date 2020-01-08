var express = require('express');
var app = express();
var cors = require('cors');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var { exec } = require('child_process');
var config = require('./config.js');
var fs = require('fs');
var path = require('path');

app.use(cors());

app.use(bodyParser.json());

// Connect to mongodb
mongoose.connect(`mongodb://${config.DB_HOST}:${config.DB_PORT}/${config.DB_NAME}`, {useNewUrlParser: true});

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

/// GET SONG BY id ///
app.get('/api/songs/:id', function (req, res) {

    Song.findOne({
            _id: req.params.id
    }).then((song) => song ? res.json(song) : res.status(404).json({error: 'no song found'}))
});

/// POST NEW SONG ///
app.post('/api/songs/', function (req, res) {

    let downloadYTFile = () => {
        return new Promise((resolve, reject) => {

            exec('cd ' + path.join(__dirname, 'res') + '&& youtube-dl ' + req.body.url + ' --extract-audio --audio-format mp3', (err, stdout, stderr) => {
                if (err) {
                    // node couldn't execute the command
                    return reject(err);
                }

                console.log(stdout);
                console.error(stderr);

                if (stdout.includes('Deleting original file')) {

                    let filename = stdout.split('Deleting original file ')[1];
                    filename = filename.split('.webm')[0];
                    filename += '.mp3';

                    return resolve({success: true, filename: filename});
                }
            });
        });
    };

    downloadYTFile().then((result) => {
        if(result.success) {

            exec('cd ' + path.join(__dirname, 'res') + ' && mv ' + '"' + result.filename + '" ' + path.join(__dirname, 'res') + '/' + req.body.filename, (err, stdout, stderr) => {
                if (err) {
                    console.log(err);
                    console.log(stderr);
                    console.log(stdout);
                    res.status(500).json('server error please check logs');
                } else {
                    return Song.create({
                        title: req.body.title,
                        artist: req.body.artist,
                        album: req.body.album,
                        album_img: req.body.album_img,
                        filename: req.body.filename,

                    }).then((song) => res.json(song));
                }
            });
        }
    });
});

/// UPDATE SONG ///
app.get('/api/songs/:id', function (req, res) {
    Song.findOne({_id: req.params.id}).then((song) => {
        if(song) {
            song.title = req.body.title;
            song.artist = req.body.artist;
            song.album = req.body.album;
            song.album_img = req.body.album_img;
            song.filename = req.body.filename;

            return song.save().then((song) => res.json(song));
        } else {
            res.status(404).json({error: 'no song found'});
        }
    })
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

app.listen(config.PORT, config.HOST);
console.log(`Running on ${config.HOST}:${config.PORT}...`);