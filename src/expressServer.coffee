db = new require("odbc").Database();
redis = require('redis').createClient() # (6379, '127.0.0.1')

module.exports = class ExpressServ

  constructor: (@host, @port) ->
    @app = require('express').createServer();
    @set_routes()
    @app.listen(@port, @host)
    db.open "DRIVER={MonetDB};Server=localhost;Port=50000;UID=monetdb;PWD=monetdb;DATABASE=my-first-db"

  set_routes: () ->
    @app.get "/apps/:app/quick-stats-hour", @quick_stats_hour
    @app.get "/apps/:app/quick-stats-day", @quick_stats_day
    @app.get "/apps/:app/quick-stats-week", @quick_stats_week
    @app.get "/apps/:app/web-requests", @web_requests
    @app.get "/apps/:app/response-time", @response_time
    @app.get "/apps/:app/slowest-response-time", @slowest_response
    @app.get "/apps/:app/most-viewed", @most_viewed

# testing stuff
    @app.get "/", @hello_world
    @app.get "/apps/:app", @app_name
    @app.get "/average", @average
    @app.get "/sum", @sum

  quick_stats_hour: (req, res) ->
    db.query "SELECT avg(severity) as average FROM lyon_farts", (err, rows, moreResultSets) ->
      res.send "average: #{rows[0].average}"

  quick_stats_day: (req, res) ->
    redis.get "#{req.params.app}-quick_stats_day", (err, response) ->
      if response
        res.send response
      else
        # body...

  quick_stats_week: (req, res) ->
    redis.get "#{req.params.app}-quick_stats_week", (err, response) ->
      if response
        res.send response
      else
        # body...


  web_requests: (req, res) ->
    redis.get "#{req.params.app}-web_requests", (err, response) ->
      if response
        res.send response
      else
        # body...


  response_time: (req, res) ->
    redis.get "#{req.params.app}-response_time", (err, response) ->
      if response
        res.send response
      else
        # body...


  slowest_response: (req, res) ->
    redis.get "#{req.params.app}-slowest_response", (err, response) ->
      if response
        res.send response
      else
        # body...


  most_viewed: (req, res) ->
    redis.get "#{req.params.app}-most_viewed", (err, response) ->
      if response
        res.send response
      else
        # body...



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

  