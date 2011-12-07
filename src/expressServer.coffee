db = new require("odbc").Database();
redis = require('redis').createClient(6379, '10.60.38.98')

module.exports = class ExpressServ

  constructor: (@host, @port) ->
    @app = require('express').createServer();
    @set_routes()
    @app.listen(@port, @host)
    db.open "DRIVER={MonetDB};Server=10.60.38.97;Port=50000;UID=bakerd;PWD=!rLXoM@y)yr2;DATABASE=web_requests"

  set_routes: () ->
    @app.get "/apps/:app/quick-stats-day", @quick_stats_day
    @app.get "/apps/:app/quick-stats-week", @quick_stats_week
    @app.get "/apps/:app/quick-stats-month", @quick_stats_month
    @app.get "/apps/:app/web-requests", @web_requests
    @app.get "/apps/:app/response-time", @response_time
    @app.get "/apps/:app/slowest-response-time", @slowest_response
    @app.get "/apps/:app/most-viewed", @most_viewed
    @app.get "/", @hello_world

  quick_stats_day: (req, res) ->
    db.query "SELECT count(*) as \"total\", count(distinct pd) as \"unique\", avg(rt) / 1000 as \"response\" FROM webrequest WHERE ai='#{req.params.app}' and t>CURRENT_TIMESTAMP - INTERVAL '1' DAY", (err, result, moreResultSets) ->
      console.log(err) if err
      res.send data: result, description: "Last 24 Hours"

  quick_stats_week: (req, res) ->
    redis.get "#{req.params.app}-quick_stats_week", (err, response) ->
      if response
        res.send JSON.parse(response)
      else
        db.query "SELECT count(*) as \"total\", count(distinct pd) as \"unique\", avg(rt) / 1000 as \"response\" FROM webrequest WHERE ai='#{req.params.app}' and t>CURRENT_TIMESTAMP - INTERVAL '7' DAY", (err, result, moreResultSets) ->
          console.log(err) if err
          data = data: result, description: "Last 7 Days"
          res.send data
          redis.set("#{req.params.app}-quick_stats_week", JSON.stringify(data))
          redis.expire("#{req.params.app}-quick_stats_week", 3600)

  quick_stats_month: (req, res) ->
    redis.get "#{req.params.app}-quick_stats_month", (err, response) ->
      if response
        res.send JSON.parse(response)
      else
        db.query "SELECT count(*) as \"total\", count(distinct pd) as \"unique\", avg(rt) / 1000 as \"response\" FROM webrequest WHERE ai='#{req.params.app}' and t>CURRENT_TIMESTAMP - INTERVAL '30' DAY", (err, result, moreResultSets) ->
          console.log(err) if err
          data = data: result, description: "Last 30 Days"
          res.send data
          redis.set("#{req.params.app}-quick_stats_month", JSON.stringify(data))
          redis.expire("#{req.params.app}-quick_stats_month", 86400)

  web_requests: (req, res) ->
    redis.get "#{req.params.app}-web_requests", (err, response) ->
      if response
        res.send JSON.parse(response)
      else
        db.query "SELECT count(*) as \"total\", avg(rt) as \"average\", EXTRACT(hour from t) as \"hour\" FROM webrequest WHERE ai='#{req.params.app}' and t>CURRENT_TIMESTAMP - INTERVAL '1' DAY GROUP BY \"hour\" ORDER BY \"hour\"", (err, result, moreResultSets) ->
          console.log(err) if err
          data = data: result
          res.send data
          redis.set("#{req.params.app}-web_requests", JSON.stringify(data))
          redis.expire("#{req.params.app}-web_requests", 300)

  response_time: (req, res) ->
    redis.get "#{req.params.app}-response_time", (err, response) ->
      if response
        res.send JSON.parse(response)
      else
        db.query "SELECT (quarter.count * 100.0) / (total.count * 1.0) as quarter, (half.count * 100.0) / (total.count * 1.0) as half, (one.count * 100.0) / (total.count * 1.0) as one, ((quarter.count + half.count + one.count) * 100.0) / (total.count * 1.0) as full_second, (two.count * 100.0) / (total.count * 1.0) as two, (three.count * 100.0) / (total.count * 1.0) as three, (four.count * 100.0) / (total.count * 1.0) as four, (more.count * 100.0) / (total.count * 1.0) as more FROM (SELECT COUNT(*) as count FROM webrequest WHERE ai='#{req.params.app}' AND t>CURRENT_TIMESTAMP - INTERVAL '1' DAY AND rt <= 250000) quarter, (SELECT COUNT(*) as count FROM webrequest WHERE ai='#{req.params.app}' AND t>CURRENT_TIMESTAMP - INTERVAL '1' DAY AND rt <= 500000  AND rt > 250000) half, (SELECT COUNT(*) as count FROM webrequest WHERE ai='#{req.params.app}' AND t>CURRENT_TIMESTAMP - INTERVAL '1' DAY AND rt <= 1000000 AND rt > 500000) one, (SELECT COUNT(*) as count FROM webrequest WHERE ai='#{req.params.app}' AND t>CURRENT_TIMESTAMP - INTERVAL '1' DAY AND rt <= 2000000 AND rt > 1000000) two, (SELECT COUNT(*) as count FROM webrequest WHERE ai='#{req.params.app}' AND t>CURRENT_TIMESTAMP - INTERVAL '1' DAY AND rt <= 3000000 AND rt > 2000000) three, (SELECT COUNT(*) as count FROM webrequest WHERE ai='#{req.params.app}' AND t>CURRENT_TIMESTAMP - INTERVAL '1' DAY AND rt <= 4000000 AND rt > 3000000) four, (SELECT COUNT(*) as count FROM webrequest WHERE ai='#{req.params.app}' AND t>CURRENT_TIMESTAMP - INTERVAL '1' DAY AND rt >  4000000) more, (SELECT CASE COUNT(*) WHEN 0 THEN 1 ELSE COUNT(*) END as count FROM webrequest WHERE ai='#{req.params.app}' AND t>CURRENT_TIMESTAMP - INTERVAL '1' DAY) total", (err, result, moreResultSets) ->
            console.log(err) if err
            data = data: result
            res.send data
            redis.set("#{req.params.app}-response_time", JSON.stringify(data))
            redis.expire("#{req.params.app}-response_time", 3600)

  slowest_response: (req, res) ->
    redis.get "#{req.params.app}-slowest_response", (err, response) ->
      if response
        res.send JSON.parse(response)
      else
        db.query "SELECT pt, avg(rt) as \"response\" FROM webrequest WHERE ai='#{req.params.app}' and t>CURRENT_TIMESTAMP - INTERVAL '1' DAY GROUP BY \"pt\" ORDER BY \"response\" DESC LIMIT 20", (err, result, moreResultSets) ->
          console.log(err) if err
          data = data: result
          res.send data
          redis.set("#{req.params.app}-slowest_response", JSON.stringify(data))
          redis.expire("#{req.params.app}-slowest_response", 3600)

  most_viewed: (req, res) ->
    redis.get "#{req.params.app}-most_viewed", (err, response) ->
      if response
        res.send JSON.parse(response)
      else
        db.query "SELECT pages.pt as pt, (pages.count * 100.0) / (total.count * 1.0) as \"percent\" FROM (SELECT pt, count(*) as \"count\" FROM webrequest WHERE ai='#{req.params.app}' and t>CURRENT_TIMESTAMP - INTERVAL '1' DAY GROUP BY pt) pages, (SELECT CASE COUNT(*) WHEN 0 THEN 1 ELSE COUNT(*) END as count FROM webrequest WHERE ai='#{req.params.app}' AND t>CURRENT_TIMESTAMP - INTERVAL '1' DAY) total ORDER BY \"percent\" DESC LIMIT 20;", (err, result, moreResultSets) ->
            console.log(err) if err
            data = data: result
            res.send data
            redis.set("#{req.params.app}-most_viewed", JSON.stringify(data))
            redis.expire("#{req.params.app}-most_viewed", 3600)

  hello_world: (req, res) ->
    res.send "hello BIG world"
