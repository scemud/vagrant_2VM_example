var vorpal = require('vorpal')();
var proc = require('child_process');
var dockerode = require('dockerode');
var Readable = require('stream').Readable;
var JSONStream = require('JSONStream');
var fs = require('fs');
var moment = require('moment');
var _ = require('lodash');

var mongoTag = 'mongo:2.2.7'
var logFile = 'cli.log';
var started = new moment();

function shellout(cmd) {
    return new Promise(function(resolve, reject) {
        proc.exec(cmd, function(err, stdout, stderr) {
            if (err) { reject(stderr); }
            else { resolve(stdout); }
        });
    });
}

function clearLog() { fs.truncateSync(logFile, 0); }

function fmt(msg) { return ` [cli] ${msg}`; }

function outputTiming() {
    let diff = new moment().diff(started, 'milliseconds');
    let duration = moment.utc(diff).format('HH:mm:ss.SS');
    vorpal.log(fmt(`done! (${duration})\n`));
}

var docker = new dockerode();
docker.pullImage = (tag) => {
    vorpal.log(fmt(`pulling ${tag}`));

    return new Promise((resolve, reject) => {
        // TODO: look into how to NOT pull if image already exists..?
        //   if-else in Promises?  Streams from RxJs?
        // docker.listImages(function(err, images){
        //     let tags = _.flatMap(images, (image) => {
        //         return image.RepoTags;
        //     });
        //     vorpal.log(tags);
        // });

        docker.pull(tag, (err, stream) => {
            if (err) { reject(err); }
            stream
                .on('data', (chunk) => { /* process.stdout.write(chunk); */ })
                .pipe(JSONStream.parse())
                .pipe(JSONStream.stringify(false))
                .pipe(fs.createWriteStream(logFile, {flags:'a'}))
                .on('finish', resolve);
        });
    });
}
docker.imageExists = (tag) => {
    docker.listImages(function(err, images){
        let tags = _.flatMap(images, (image) => {
            return image.RepoTags;
        });
        vorpal.log(tags);
    });
}

vorpal
    .command('mongo status', 'Return status of local mongo server.')
    .option('-d, --dev', 'development instance')
    .option('-t, --test', 'test instance')
    .action(function(args, cb) {
        docker
            .imageExists(mongoTag)
            // .then(() => {
                
            // })
            // .catch((err) => { vorpal.log(err); })
            // .then(() => { outputTiming() });
    });

vorpal
    .command('mongo start', 'Start local mongo server.')
    .option('-d, --dev', 'development instance')
    .option('-t, --test', 'test instance')
    .action(function(args, cb) {
        docker
            .pullImage(mongoTag)
            .then(() => {
                
            })
            .catch((err) => { vorpal.log(err); })
            .then(() => { outputTiming() });
    });

vorpal
    .command('mongo stop', 'Stop local mongo server.')
    .option('-d, --dev', 'development instance')
    .option('-t, --test', 'test instance')
    .action(function(args, cb) {
        this.log(args);
    });

vorpal
    .command('mongo restart', 'Restarts local mongo server.')
    .option('-d, --dev', 'development instance')
    .option('-t, --test', 'test instance')
    .action(function(args, cb) {
        this.log(args);
    });

clearLog();
vorpal.parse(process.argv);