db = new require("odbc").Database();
redis = require('redis').createClient() # (6379, '127.0.0.1')

module.exports = class ExpressServ

  constructor: (@host, @port) ->
    @app = require('express').createServer();
    @set_routes()
    @app.listen(@port, @host)
    db.open "DRIVER={MonetDB};Server=localhost;Port=50000;UID=monetdb;PWD=monetdb;DATABASE=my-first-db"

  set_routes: () ->
    @app.get "/apps/:app/quick-stats-day", @quick_stats_day
    @app.get "/apps/:app/quick-stats-week", @quick_stats_week
    @app.get "/apps/:app/quick-stats-month", @quick_stats_month
    @app.get "/apps/:app/web-requests", @web_requests
    @app.get "/apps/:app/response-time", @response_time
    @app.get "/apps/:app/slowest-response-time", @slowest_response
    @app.get "/apps/:app/most-viewed", @most_viewed

# , count(distinct pd) as \"unique\", avg(rt) as \"response\" FROM webrequest WHERE ai='4eb05aea48afd80192000057';
  quick_stats_day: (req, res) ->
    db.query "SELECT count(*) as \"total\", count(distinct pd) as \"unique\", avg(rt) as \"response\" FROM webrequest WHERE ai='#{req.params.app}' and t>CURRENT_TIMESTAMP - INTERVAL '1' DAY", (err, rows, moreResultSets) ->
      if err
        res.send err
      else
        res.send rows #{}"total: #{rows[0].total}\nunique: #{rows[0].unique}\navg: #{rows[0].response}"

  quick_stats_week: (req, res) ->
    redis.get "#{req.params.app}-quick_stats_day", (err, response) ->
      if response
        console.log "cached"
        res.send JSON.parse(response)
      else
        db.query "SELECT count(*) as \"total\", count(distinct pd) as \"unique\", avg(rt) as \"response\" FROM webrequest WHERE ai='#{req.params.app}' and t>CURRENT_TIMESTAMP - INTERVAL '7' DAY", (err, result, moreResultSets) ->
          console.log "query"
          res.send result
          redis.set("#{req.params.app}-quick_stats_day", JSON.stringify(result))
          redis.expire("#{req.params.app}-quick_stats_day", 3600)

  quick_stats_month: (req, res) ->
    redis.get "#{req.params.app}-quick_stats_week", (err, response) ->
      if response
        console.log "cached"
        res.send JSON.parse(response)
      else
        db.query "SELECT count(*) as \"total\", count(distinct pd) as \"unique\", avg(rt) as \"response\" FROM webrequest WHERE ai='#{req.params.app}' and t>CURRENT_TIMESTAMP - INTERVAL '30' DAY", (err, result, moreResultSets) ->
          console.log "query"
          res.send result
          redis.set("#{req.params.app}-quick_stats_week", JSON.stringify(result))
          redis.expire("#{req.params.app}-quick_stats_week", 86400)

  web_requests: (req, res) ->
    redis.get "#{req.params.app}-web_requests", (err, response) ->
      if response
        res.send JSON.parse(response)
      else
        db.query "SELECT count(*) as \"total\", avg(rt) as \"average\", EXTRACT(hour from t) as \"hour\" FROM webrequest WHERE ai='#{req.params.app}' and t>CURRENT_TIMESTAMP - INTERVAL '1' DAY GROUP BY \"hour\" ORDER BY \"hour\"", (err, result, moreResultSets) ->
          res.send result
          redis.set("#{req.params.app}-web_requests", JSON.stringify(result))
          redis.expire("#{req.params.app}-web_requests", 300)

  response_time: (req, res) ->
    redis.get "#{req.params.app}-response_time", (err, response) ->
      if response
        res.send JSON.parse(response)
      else
        db.query "", (err, result, moreResultSets) ->
        res.send result
        redis.set("#{req.params.app}-response_time", JSON.stringify(result))
        redis.expire("#{req.params.app}-response_time", 3600)

  slowest_response: (req, res) ->
    redis.get "#{req.params.app}-slowest_response", (err, response) ->
      if response
        res.send JSON.parse(response)
      else
        db.query "SELECT pt, avg(rt) as \"response\" FROM webrequest WHERE ai='#{req.params.app}' and t>CURRENT_TIMESTAMP - INTERVAL '1' DAY GROUP BY \"pt\" ORDER BY \"response\" DESC LIMIT 20", (err, result, moreResultSets) ->
          res.send result
          redis.set("#{req.params.app}-slowest_response", JSON.stringify(result))
          redis.expire("#{req.params.app}-slowest_response", 3600)

  most_viewed: (req, res) ->
    redis.get "#{req.params.app}-most_viewed", (err, response) ->
      if response
        res.send response
      else
        db.query "SELECT pt, count(*) as \"count\" FROM webrequest WHERE ai='#{req.params.app}' and t>CURRENT_TIMESTAMP - INTERVAL '1' DAY GROUP BY \"pt\" ORDER BY \"count\" DESC LIMIT 20", (err, result, moreResultSets) ->
          res.send result
          redis.set("#{req.params.app}-most_viewed", JSON.stringify(result))
          redis.expire("#{req.params.app}-most_viewed", 3600)

  hello_world: (req, res) ->
    res.send "hello BIG world"

