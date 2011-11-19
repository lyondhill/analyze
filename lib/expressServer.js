(function() {
  var ExpressServ, db, redis;
  db = new require("odbc").Database();
  redis = require('redis').createClient();
  module.exports = ExpressServ = (function() {
    function ExpressServ(host, port) {
      this.host = host;
      this.port = port;
      this.app = require('express').createServer();
      this.set_routes();
      this.app.listen(this.port, this.host);
      db.open("DRIVER={MonetDB};Server=localhost;Port=50000;UID=monetdb;PWD=monetdb;DATABASE=my-first-db");
    }
    ExpressServ.prototype.set_routes = function() {
      this.app.get("/apps/:app/quick-stats-day", this.quick_stats_day);
      this.app.get("/apps/:app/quick-stats-week", this.quick_stats_week);
      this.app.get("/apps/:app/quick-stats-month", this.quick_stats_month);
      this.app.get("/apps/:app/web-requests", this.web_requests);
      this.app.get("/apps/:app/response-time", this.response_time);
      this.app.get("/apps/:app/slowest-response-time", this.slowest_response);
      return this.app.get("/apps/:app/most-viewed", this.most_viewed);
    };
    ExpressServ.prototype.quick_stats_day = function(req, res) {
      return db.query("SELECT count(*) as \"total\", count(distinct pd) as \"unique\", avg(rt) as \"response\" FROM webrequest WHERE ai='" + req.params.app + "' and t>CURRENT_TIMESTAMP - INTERVAL '1' DAY", function(err, rows, moreResultSets) {
        if (err) {
          return res.send(err);
        } else {
          return res.send(rows);
        }
      });
    };
    ExpressServ.prototype.quick_stats_week = function(req, res) {
      return redis.get("" + req.params.app + "-quick_stats_day", function(err, response) {
        if (response) {
          console.log("cached");
          return res.send(JSON.parse(response));
        } else {
          return db.query("SELECT count(*) as \"total\", count(distinct pd) as \"unique\", avg(rt) as \"response\" FROM webrequest WHERE ai='" + req.params.app + "' and t>CURRENT_TIMESTAMP - INTERVAL '7' DAY", function(err, result, moreResultSets) {
            console.log("query");
            res.send(result);
            redis.set("" + req.params.app + "-quick_stats_day", JSON.stringify(result));
            return redis.expire("" + req.params.app + "-quick_stats_day", 3600);
          });
        }
      });
    };
    ExpressServ.prototype.quick_stats_month = function(req, res) {
      return redis.get("" + req.params.app + "-quick_stats_week", function(err, response) {
        if (response) {
          console.log("cached");
          return res.send(JSON.parse(response));
        } else {
          return db.query("SELECT count(*) as \"total\", count(distinct pd) as \"unique\", avg(rt) as \"response\" FROM webrequest WHERE ai='" + req.params.app + "' and t>CURRENT_TIMESTAMP - INTERVAL '30' DAY", function(err, result, moreResultSets) {
            console.log("query");
            res.send(result);
            redis.set("" + req.params.app + "-quick_stats_week", JSON.stringify(result));
            return redis.expire("" + req.params.app + "-quick_stats_week", 86400);
          });
        }
      });
    };
    ExpressServ.prototype.web_requests = function(req, res) {
      return redis.get("" + req.params.app + "-web_requests", function(err, response) {
        if (response) {
          return res.send(JSON.parse(response));
        } else {
          return db.query("SELECT count(*) as \"total\", avg(rt) as \"average\", EXTRACT(hour from t) as \"hour\" FROM webrequest WHERE ai='" + req.params.app + "' and t>CURRENT_TIMESTAMP - INTERVAL '1' DAY GROUP BY \"hour\" ORDER BY \"hour\"", function(err, result, moreResultSets) {
            res.send(result);
            redis.set("" + req.params.app + "-web_requests", JSON.stringify(result));
            return redis.expire("" + req.params.app + "-web_requests", 300);
          });
        }
      });
    };
    ExpressServ.prototype.response_time = function(req, res) {
      return redis.get("" + req.params.app + "-response_time", function(err, response) {
        if (response) {
          return res.send(JSON.parse(response));
        } else {
          db.query("", function(err, result, moreResultSets) {});
          res.send(result);
          redis.set("" + req.params.app + "-response_time", JSON.stringify(result));
          return redis.expire("" + req.params.app + "-response_time", 3600);
        }
      });
    };
    ExpressServ.prototype.slowest_response = function(req, res) {
      return redis.get("" + req.params.app + "-slowest_response", function(err, response) {
        if (response) {
          return res.send(JSON.parse(response));
        } else {
          return db.query("SELECT pt, avg(rt) as \"response\" FROM webrequest WHERE ai='" + req.params.app + "' and t>CURRENT_TIMESTAMP - INTERVAL '1' DAY GROUP BY \"pt\" ORDER BY \"response\" DESC LIMIT 20", function(err, result, moreResultSets) {
            res.send(result);
            redis.set("" + req.params.app + "-slowest_response", JSON.stringify(result));
            return redis.expire("" + req.params.app + "-slowest_response", 3600);
          });
        }
      });
    };
    ExpressServ.prototype.most_viewed = function(req, res) {
      return redis.get("" + req.params.app + "-most_viewed", function(err, response) {
        if (response) {
          return res.send(response);
        } else {
          return db.query("SELECT pt, count(*) as \"count\" FROM webrequest WHERE ai='" + req.params.app + "' and t>CURRENT_TIMESTAMP - INTERVAL '1' DAY GROUP BY \"pt\" ORDER BY \"count\" DESC LIMIT 20", function(err, result, moreResultSets) {
            res.send(result);
            redis.set("" + req.params.app + "-most_viewed", JSON.stringify(result));
            return redis.expire("" + req.params.app + "-most_viewed", 3600);
          });
        }
      });
    };
    ExpressServ.prototype.hello_world = function(req, res) {
      return res.send("hello BIG world");
    };
    return ExpressServ;
  })();
}).call(this);
