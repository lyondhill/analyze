db = new require("odbc").Database();
redis = require('redis').createClient() # (6379, '127.0.0.1')

module.exports = class ExpressServ

  constructor: (@host, @port) ->
    @app = require('express').createServer();
    @set_routes()
    @app.listen(@port, @host)
    db.open "DRIVER={MonetDB};Server=localhost;Port=50000;UID=monetdb;PWD=monetdb;DATABASE=my-first-db"
    redis.expire("average", 5)

  set_routes: () ->
    @app.get "/", @hello_world
    @app.get "/apps/:app", @app_name
    @app.get "/average", @average
    @app.get "/sum", @sum

  hello_world: (req, res) ->
    res.send "hello BIG world"

  app_name: (req, res) ->
    res.send "app name = #{req.params.app}"

  average: (req, res) ->
    redis.get "average", (err, response) =>
      if response
        res.send "average: #{response} (cached)"
      else
        db.query "SELECT avg(severity) as average FROM lyon_farts", (err, rows, moreResultSets) ->
          res.send "average: #{rows[0].average}"
          redis.set("average", rows[0].average)
          redis.expire("average", 5)

  
  sum: (req, res) ->
    db.query "SELECT sum(severity) as sum FROM lyon_farts", (err, rows, moreResultSets) ->
      rows[0].user_time = new Date().toTimeString()
      res.send rows[0]

  