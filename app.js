const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const config = require('./config.js');

const app = express();

app.use(cors());

app.use(bodyParser.json());
app.use(express.static(__dirname+'/client'));


const port = config.PORT;
const host = config.HOST;

let checkAuth = (req, res, next) => {
    const apiKey = req.get('Authorization');

    if(apiKey && apiKey === config.API_KEY) {
        next();
    } else {
        res.status(401).send('Unauthorized')
    }
};

/// POST NEW SONG ///
app.post('/download/', checkAuth, function (req, res) {

    let buildUrl = (youtubeId) => {
        return 'https://www.youtube.com/watch?v=' + youtubeId;
    }

    let downloadYTFile = () => {
        return new Promise((resolve, reject) => {

            exec('cd ' + path.join(__dirname, 'res/') + ' && youtube-dl ' + buildUrl(req.body.youtubeId) + ' --extract-audio --audio-format mp3 --audio-quality 0', (err, stdout, stderr) => {
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

            if(req.body.filename) {
                exec('cd ' + path.join(__dirname, 'res/') + ' && mv ' + '"' + result.filename + '" ' + path.join(__dirname, 'res') + '/' + req.body.filename, (err, stdout, stderr) => {
                    if (err) {
                        console.log(err);
                        console.log(stderr);
                        console.log(stdout);
                        return res.json({success: false, error: err});
                    } else {
                        return res.json({success: true, filename: req.body.filename});
                    }
                });
            } else {
                return res.json({success: false, message: "Filename is undefined"});
            }
        }
    }).catch(e => {
        console.log('error', e);
        return res.json({success: false});
    });
});

// STREAM SONG ///
app.get('/stream/:filename', checkAuth, function (req, res) {
    let file = fs.createReadStream(path.join(__dirname, 'res/') + req.params.filename);

    let stat = fs.statSync('./res/' + req.params.filename);

    res.writeHead(200, {
        'Content-Type': 'audio/mpeg',
        'Content-Length': stat.size
    });

    return file.pipe(res);
});

app.listen(port, host, () => {
    console.log(`Running on ${host}:${port}...`);
});
