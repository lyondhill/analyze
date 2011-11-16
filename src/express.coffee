ExpressServ = require './expressServer'
{argv} = require 'optimist'
daemon = require 'daemon'

port = argv.p ? argv.port ? 8080
host = argv.h ? argv.host ? '0.0.0.0'

process.title = 'analyze'

if argv.help
  usage = '''

  Usage: analyze --host [host] --port [port]

  Options:
    -h | --host [optional]
    -p | --port [optional]

    -d          (daemonize)
    --pid
    --log

  '''
  console.log usage
else
  if argv.d

    logfile = argv.log ? '/dev/null'
    pidfile = argv.pid ? '/var/run/pubsub.pid'

    daemon.daemonize logfile, pidfile, (err, pid) ->
      if err
        console.log "Error starting daemon: #{err}"
      else
        console.log "Daemon started successfully with pid: #{pid}"
        new ExpressServ(host, port)
  else
    new ExpressServ(host, port)
