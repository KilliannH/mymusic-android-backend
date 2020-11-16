const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const config = require('./config.js');

const app = express();

app.use(cors());

app.use(bodyParser.json());

const port = config.PORT;
const host = config.HOST;

// Connect to mongodb
const db_url = `mongodb://${config.DB_HOST}:${config.DB_PORT}/${config.DB_NAME}`;

mongoose.connect(db_url, (err) => {
    if(err) {
        console.error(err);
    } else {
        console.log("Database connection established successfully");
    }
});

let checkAuth = (req, res, next) => {
    const apiKey = req.get('Authorization');

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
app.get('/api/songs/', checkAuth, function (req, res) {
        return Song.find().then(songs => {
            return res.json(songs)
        });
});


/// GET SONG BY id ///
app.get('/api/songs/:id', function (req, res) {

    Song.findOne({
            _id: req.params.id
    }).then((song) => song ? res.json(song) : res.status(404).json({error: 'no song found'}))
});

/// POST NEW SONG ///
app.post('/api/songs/', checkAuth, function (req, res) {

    let downloadYTFile = () => {
        return new Promise((resolve, reject) => {

            exec('cd ' + path.join(__dirname, 'res/') + ' && youtube-dl ' + req.body.youtube_url + ' --extract-audio --audio-format mp3 --audio-quality 0', (err, stdout, stderr) => {
                if (err) {
                    // node couldn't execute the command
                    console.log(stdout);
                    console.error(stderr);
			return res.json({success: false, error: err});
                }

                if (stdout.includes('Deleting original file')) {

                    let filename = stdout.split('Deleting original file ')[1];
                    filename = filename.split('.webm')[0];
                    filename += '.mp3';

                    return resolve({success: true, filename: filename});
                }
            });
        }).catch(e => {
            console.log('error', e);
            return res.json({success: false});
        });
    };

    downloadYTFile().then((result) => {
        if(result.success) {

            exec('cd ' + path.join(__dirname, 'res/') + ' && mv ' + '"' + result.filename + '" ' + path.join(__dirname, 'res') + '/' + req.body.filename, (err, stdout, stderr) => {
                if (err) {
                    console.log(err);
                    console.log(stderr);
                    console.log(stdout);
		return res.json({success: false, error: err});
                }
                    return Song.create({
                        title: req.body.title,
                        artist: req.body.artist,
                        album: req.body.album,
                        album_img: req.body.album_img,
                        filename: req.body.filename,

                    }).then((song) => res.json({success: true, song: song}));
            });
        }
    }).catch(e => {
        console.log('error', e);
        return res.json({success: false});
    });
});

/// UPDATE SONG ///
app.put('/api/songs/:id', checkAuth, function (req, res) {
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
app.delete('/api/songs/:id', checkAuth, function (req, res) {

    Song.remove({
            _id: req.params.id
    }).then((song) => song ? res.json(song) : res.status(404).json({error: 'unknown song with id : ' + req.params.id}))
});

// STREAM SONG ///
app.get('/api/stream/:filename', checkAuth, function (req, res) {
    let file = fs.createReadStream('./res/' + req.params.filename);
    return file.pipe(res);
});

app.listen(port, host, () => {
    console.log(`Running on ${host}:${port}...`);
});
