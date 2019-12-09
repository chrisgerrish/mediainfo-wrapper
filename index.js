var path = require('path'),
    xml2js = require('xml2js'),
    glob = require('glob'),
    exec = require('child_process').exec;

function getCmd() {
    return "LD_LIBRARY_PATH=" + safeLocalPath(path.join(__dirname, '/lib')) + " " + safeLocalPath(path.join(__dirname, '/lib/mediainfo'));
    // return safeLocalPath(path.join(__dirname, '/linux64/mediainfo'));
}


function buildOutput(obj) {
    var out = {};
    var idVid = idAud = idTex = idMen = idOth = 0;
    
    for (var i in obj.track) {
        if (obj.track[i]['$']['type'] === 'General') {
            // out.file = obj.track[i]['Complete_name'][0];
            out.general = {};
            for (var f in obj.track[i]) {
                if (f !== '$') out.general[f.toLowerCase()] = obj.track[i][f];
            }
        } else if (obj.track[i]['$']['type'] === 'Video') {
            if (!idVid) out.video = [];
            out.video[idVid] = {};
            for (var f in obj.track[i]) {
                if (f !== '$') out.video[idVid][f.toLowerCase()] = obj.track[i][f];
            }
            idVid++;
        } else if (obj.track[i]['$']['type'] === 'Audio') {
            if (!idAud) out.audio = [];
            out.audio[idAud] = {};
            for (var f in obj.track[i]) {
                if (f !== '$') out.audio[idAud][f.toLowerCase()] = obj.track[i][f];
            }
            idAud++;
        } else if (obj.track[i]['$']['type'] === 'Text') {
            if (!idTex) out.text = [];
            out.text[idTex] = {};
            for (var f in obj.track[i]) {
                if (f !== '$') out.text[idTex][f.toLowerCase()] = obj.track[i][f];
            }
            idTex++;
        } else if (obj.track[i]['$']['type'] === 'Menu') {
            if (!idMen) out.menu = [];
            out.menu[idMen] = {};
            for (var f in obj.track[i]) {
                if (f !== '$') out.menu[idMen][f.toLowerCase()] = obj.track[i][f];
            }
            idMen++;
        } else {
            if (!idOth) out.other = [];
            out.other[idOth] = {};
            for (var f in obj.track[i]) {
                if (f !== '$') out.other[idOth][f.toLowerCase()] = obj.track[i][f];
            }
            idOth++;
        }
    }
    return out;
}

function buildJson(xml) {
    return new Promise(function (resolve, reject) {
        xml2js.parseString(xml, function (err, obj) {
            
            if (err){
                return reject(err);
            }

            if (!obj['MediaInfo']) return reject('Something went wrong');

            obj = obj['MediaInfo'];

            var out = [];

            if (Array.isArray(obj.media)) {
                for (var i in obj.media) {
                    out.push(buildOutput(obj.media[i]));
                }
            } else {
                out.push(buildOutput(obj.media));
            }

            resolve(out);
        });
    });
}

function safeLocalPath(path) {
    if (process.platform.match('win32')) {
        path = '"' + path + '"';// wrap with double quotes
    } else {
        path = path.replace(/'/g, '\'"\'"\''); // escape single quotes
        path = '\'' + path + '\'';// wrap with single quotes
    }
    return path;
}

function MediaInfo() {
    var args = [].slice.call(arguments);
    var cmd_options = typeof args[0] === 'object' ? args.shift() : {};
    var cmd = [];

    cmd.push(getCmd()); // base command
    cmd.push('--Output=XML --Full'); // args
    
    Array.prototype.slice.apply(args).forEach(function (val, idx) {
        var files = glob.sync(val, {cwd: (cmd_options.cwd || process.cwd()), nonull: true});
        for (var i in files) {
            cmd.push(safeLocalPath(files[i])); // files
        }
    });

    return new Promise(function (resolve, reject) {
        exec(cmd.join(' '), cmd_options, function (error, stdout, stderr) {
            // console.log('error', error);
            // console.log('stdout', stdout);
            // console.log('stderr', stderr);

            if (error !== null || stderr !== '') return reject(error || stderr);
            console.log('going to build now', stdout);
            
            buildJson(stdout).then(res => 
                {
                    resolve(res)
                }).catch( e => {
                    console.log(e);
                    reject(e)
                });
        });
    });
};

module.exports.MediaInfo = MediaInfo()

const object = {
    '$': {
        'ref': 'http://s3.amazonaws.com/cdn.streammonkey.com-dev/fsjbUjd/original/test_video1.mp4'
    },
    'track': [
        {
            '$': {
                'type': 'General'
            },
            'VideoCount': [
                '1'
            ],
            'AudioCount': [
                '1'
            ],
            'FileExtension': [
                'mp4'
            ],
            'Format': [
                'MPEG-4'
            ],
            'Format_Profile': [
                'Base Media'
            ],
            'CodecID': [
                'isom'
            ],
            'CodecID_Compatible': [
                'isom/iso2/avc1/mp41'
            ],
            'FileSize': [
                '1055736'
            ],
            'Duration': [
                '5.312'
            ],
            'OverallBitRate_Mode': [
                'VBR'
            ],
            'OverallBitRate': [
                '1589964'
            ],
            'FrameRate': [
                '25.000'
            ],
            'FrameCount': [
                '132'
            ],
            'StreamSize': [
                '4277'
            ],
            'HeaderSize': [
                '40'
            ],
            'DataSize': [
                '1051467'
            ],
            'FooterSize': [
                '4229'
            ],
            'IsStreamable': [
                'No'
            ],
            'Encoded_Date': [
                'UTC 1970-01-01 00:00:00'
            ],
            'Tagged_Date': [
                'UTC 2014-07-19 17:15:29'
            ],
            'Encoded_Application': [
                'Lavf53.24.2'
            ]
        },
        {
            '$': {
                'type': 'Video'
            },
            'StreamOrder': [
                '0'
            ],
            'ID': [
                '1'
            ],
            'Format': [
                'AVC'
            ],
            'Format_Profile': [
                'Main'
            ],
            'Format_Level': [
                '3.1'
            ],
            'Format_Settings_CABAC': [
                'Yes'
            ],
            'Format_Settings_RefFrames': [
                '1'
            ],
            'CodecID': [
                'avc1'
            ],
            'Duration': [
                '5.280'
            ],
            'BitRate': [
                '1205959'
            ],
            'Width': [
                '1280'
            ],
            'Height': [
                '720'
            ],
            'Sampled_Width': [
                '1280'
            ],
            'Sampled_Height': [
                '720'
            ],
            'PixelAspectRatio': [
                '1.000'
            ],
            'DisplayAspectRatio': [
                '1.778'
            ],
            'Rotation': [
                '0.000'
            ],
            'FrameRate_Mode': [
                'CFR'
            ],
            'FrameRate_Mode_Original': [
                'VFR'
            ],
            'FrameRate': [
                '25.000'
            ],
            'FrameCount': [
                '132'
            ],
            'ColorSpace': [
                'YUV'
            ],
            'ChromaSubsampling': [
                '4:2:0'
            ],
            'BitDepth': [
                '8'
            ],
            'ScanType': [
                'Progressive'
            ],
            'StreamSize': [
                '795933'
            ],
            'Encoded_Date': [
                'UTC 1970-01-01 00:00:00'
            ],
            'Tagged_Date': [
                'UTC 1970-01-01 00:00:00'
            ],
            'extra': [
                {
                    'Codec_configuration_box': [
                        'avcC'
                    ]
                }
            ]
        },
        {
            '$': {
                'type': 'Audio'
            },
            'StreamOrder': [
                '1'
            ],
            'ID': [
                '2'
            ],
            'Format': [
                'AAC'
            ],
            'Format_AdditionalFeatures': [
                'LC'
            ],
            'CodecID': [
                'mp4a-40-2'
            ],
            'Duration': [
                '5.312'
            ],
            'BitRate_Mode': [
                'VBR'
            ],
            'BitRate': [
                '384000'
            ],
            'BitRate_Maximum': [
                '400392'
            ],
            'Channels': [
                '6'
            ],
            'ChannelPositions': [
                'Front: L C R, Side: L R, LFE'
            ],
            'ChannelLayout': [
                'C L R Ls Rs LFE'
            ],
            'SamplesPerFrame': [
                '1024'
            ],
            'SamplingRate': [
                '48000'
            ],
            'SamplingCount': [
                '254976'
            ],
            'FrameRate': [
                '46.875'
            ],
            'FrameCount': [
                '249'
            ],
            'Compression_Mode': [
                'Lossy'
            ],
            'StreamSize': [
                '255526'
            ],
            'StreamSize_Proportion': [
                '0.24204'
            ],
            'Default': [
                'Yes'
            ],
            'AlternateGroup': [
                '1'
            ],
            'Encoded_Date': [
                'UTC 1970-01-01 00:00:00'
            ],
            'Tagged_Date': [
                'UTC 1970-01-01 00:00:00'
            ]
        }
    ]
}

// MediaInfo({maxBuffer: Infinity}, 'https://s3.amazonaws.com/cdn.streammonkey.com-dev/fsjbUjd/original/test_video1.mp4').then(res => {
//     console.log(res);
// }).catch(e => {
//     console.log(e);
    
// })

// console.log(buildOutput(object))
