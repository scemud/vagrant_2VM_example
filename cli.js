var Q = require('q');
var proc = require('child_process');
var vorpal = require('vorpal')();

function shellout(cmd) {
    return new Q.promise(function(resolve, reject, notify) {
        proc.exec(cmd, function(err, stdout, stderr) {
            if (err) { reject(stderr); }
            else { resolve(stdout); }
        });
    });
}

vorpal
    .command('mongo status', 'Return status of local mongo server.')
    .option('-d, --dev', 'development instance')
    .option('-t, --test', 'test instance')
    .action(function(args, cb) {
        this.log(args);
    });

vorpal
    .command('mongo start', 'Start local mongo server.')
    .option('-d, --dev', 'development instance')
    .option('-t, --test', 'test instance')
    .action(function(args, cb) {
        var self = this;
        shellout("ls -la").then(function(stdout){ self.log(stdout); })
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

vorpal.parse(process.argv);