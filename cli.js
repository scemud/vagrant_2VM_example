var vorpal = require('vorpal')();
var proc = require('child_process');
var dockerode = require('dockerode');
var Readable = require('stream').Readable;
var JSONStream = require('JSONStream');
var fs = require('fs-extra');
var moment = require('moment');
var Rx = require('rx');
var RxNode = require('rx-node');
var _ = require('lodash');

var started = new moment();

function shellout(cmd) {
    return new Promise(function(resolve, reject) {
        proc.exec(cmd, function(err, stdout, stderr) {
            if (err) { reject(stderr); }
            else { resolve(stdout); }
        });
    });
}

function log(msg) { vorpal.log(` [cli] ${msg}`); }

function logTiming() {
    let diff = new moment().diff(started, 'milliseconds');
    let duration = moment.utc(diff).format('HH:mm:ss.SS');
    log(`Command complete! (${duration})\n`);
}

var mongoTag = 'mongo:2.2.7'
var docker = new dockerode();

docker.pullImage = (tag) => {
    let exists = () => {
        return new Promise((resolve, reject) => {
            log(`Image ${mongoTag} - exists?`);

            docker.listImages(function(err, images){
                if (err) { reject(err); }

                let tags = _.flatMap(images, (image) => {
                    return image.RepoTags;
                });

                if (_.includes(tags, tag)) {
                    log(`Image ${mongoTag} - found!`)
                    resolve(true)
                } else {
                    log(`Image ${mongoTag} - missing!`)
                    resolve(false);
                }
            });
        });
    };

    let pull = () => {
        return new Promise((resolve, reject) => {
            log(`Image ${mongoTag} - pulling`);

            docker.pull(tag, (err, stream) => {
                if (err) { reject(err); }
                
                let source = RxNode.fromStream(stream)
                    .map((line) => { return JSON.parse(line); })
                    .map((json) =>  { return JSON.stringify(json); })
                    .map((line) => { fs.appendFile(logFile, `${line}\n`); });

                let subscription = source.subscribe(
                    () => {},
                    (err) => { reject(err); },
                    () => { 
                        log(`Image ${mongoTag} - pulled`)
                        resolve();
                    }
                );
            });
        });
    };

    return exists()
        .then((found) => {
            return found ? new Promise((resolve) => { resolve(); }) : pull();
        });
}

vorpal
    .command('mongo status', 'Return status of local mongo server.')
    .option('-d, --dev', 'development instance')
    .option('-t, --test', 'test instance')
    .action(function(args, cb) {
        
    });

vorpal
    .command('mongo start', 'Start local mongo server.')
    .option('-d, --dev', 'development instance')
    .option('-t, --test', 'test instance')
    .action(function(args, cb) {
        docker.pullImage(mongoTag)
            .catch((err) => { log(err); })
            .then(() => { logTiming() });
    });

vorpal
    .command('mongo stop', 'Stop local mongo server.')
    .option('-d, --dev', 'development instance')
    .option('-t, --test', 'test instance')
    .action(function(args, cb) {
        
    });

vorpal
    .command('mongo restart', 'Restarts local mongo server.')
    .option('-d, --dev', 'development instance')
    .option('-t, --test', 'test instance')
    .action(function(args, cb) {
        
    });

var logFile = 'cli.log';
function clearLog() { fs.truncateSync(logFile, 0); }

var cacheFile = `${logFile}.cache`;
function cacheLog() { fs.copySync(logFile, cacheFile); }

vorpal
    .command('log clear', 'Truncates the CLI log.')
    .action(function(args, cb) { clearLog(); });

vorpal
    .command('log cache', 'Caches current CLI log.')
    .action(function(args, cb) {
        cacheLog();
        clearLog();
    });

vorpal.parse(process.argv);