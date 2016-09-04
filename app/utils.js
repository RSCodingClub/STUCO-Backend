const log = require('log-util');
const request = require('request-promise-native');
const cluster = require('cluster');
module.exports = {
    getDistance: function(lat1, lng1, lat2, lng2) {
        log.verbose('getDistance(' + lat1 + ', ' + lng1 + ', ' + lat2 + ', ' + lng2 + ')');

        let earthRadius = 6371000; // meters
        let dLat = (lat2 - lat1) * (Math.PI / 180);
        let dLng = (lng2 - lng1) * (Math.PI / 180);
        let a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((lat1) * (Math.PI / 180)) * Math.cos((lat2) * (Math.PI / 180)) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
        let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        let dist = earthRadius * c;
        return dist;
    },
    getLocationFromAddress: function(address) {
        return new Promise((done, reject) => {
            request({
                method: 'get',
                uri: 'https://maps.googleapis.com/maps/api/geocode/json?key=' + global.API_KEY + '&address=' + encodeURIComponent(address.toString())
            }).then((body) => {
                try {
                    let data = JSON.parse(body);
                    let r = {
                        lat: data.results[0].geometry.location.lat,
                        lng: data.results[0].geometry.location.lng
                    };
                    return done(r);
                } catch (e) {
                    return reject(e);
                }
            }).catch((err) => {
                return reject(err);
            });
        });
    },
    getErrorObject: function(err) {
        return {
            error: err.message,
            errorid: global.ERR_CODES[err.message] === undefined ? global.ERR_CODES[err.message] : -1
        };
    },
    getUTCOffsetString: function(utcstring) {
        let offset = -5,
            r = '';
        global.TZ.forEach(function(tz) {
            if (tz.utc) {
                tz.utc.forEach(function(utc) {
                    if (utc === utcstring) {
                        offset = tz;
                    }
                });
            }
        });
        r += offset >= 0 ? '+' : '-';
        r += Math.abs(offset) >= 10 ? Math.abs(parseInt(offset)) : '0' + Math.abs(parseInt(offset));
        r += ':';
        r += Math.abs(offset) % 1 > 0 ? ((Math.abs(offset) % 1) * 60 >= 10 ? (Math.abs(offset) % 1) * 60 : '0' + (Math.abs(offset) % 1) * 60) : '00';
        return r;
    },
    repeatStr: function(str, count) {
        let finalStr = '' + str;
        for (let i = 0; i < count; i++) {
            finalStr += str;
        }
        return finalStr;
    },
    initCluster: function(callback) {
        if (cluster.isMaster) {
            let numWorkers = process.env.THREADS | require('os').cpus().length;
            log.debug('Master cluster setting up ' + numWorkers + ' workers...');

            for (let i = 0; i < numWorkers; i++) {
                cluster.fork();
            }

            cluster.on('online', function(worker) {
                log.debug('Worker ' + worker.process.pid + ' is online');
            });

            cluster.on('exit', function(worker, code, signal) {
                log.warn('Worker ' + worker.process.pid + ' died with code: ' + code + ', and signal: ' + signal);
                log.info('Starting a new worker');
                cluster.fork();
            });
        } else {
            process.on('message', function(message) {
                if (message.type === 'shutdown') {
                    throw new Error('Shutdown Error');
                }
            });
            return callback();
        }
    }
};
