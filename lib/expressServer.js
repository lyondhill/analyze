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
      this.app.get("/apps/:app/most-viewed", this.most_viewed);
      return this.app.get("/", this.hello_world);
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
          return db.query("SELECT (quarter.count * 100.0) / (total.count * 1.0) as quarter, (half.count * 100.0) / (total.count * 1.0) as half, (one.count * 100.0) / (total.count * 1.0) as one, ((quarter.count + half.count + one.count) * 100.0) / (total.count * 1.0) as full_second, (two.count * 100.0) / (total.count * 1.0) as two, (three.count * 100.0) / (total.count * 1.0) as three, (four.count * 100.0) / (total.count * 1.0) as four, (more.count * 100.0) / (total.count * 1.0) as more FROM (SELECT COUNT(*) as count FROM webrequest WHERE ai='" + req.params.app + "' AND t>CURRENT_TIMESTAMP - INTERVAL '10' DAY AND rt <= 250000) quarter, (SELECT COUNT(*) as count FROM webrequest WHERE ai='" + req.params.app + "' AND t>CURRENT_TIMESTAMP - INTERVAL '10' DAY AND rt <= 500000  AND rt > 250000) half, (SELECT COUNT(*) as count FROM webrequest WHERE ai='" + req.params.app + "' AND t>CURRENT_TIMESTAMP - INTERVAL '10' DAY AND rt <= 1000000 AND rt > 500000) one, (SELECT COUNT(*) as count FROM webrequest WHERE ai='" + req.params.app + "' AND t>CURRENT_TIMESTAMP - INTERVAL '10' DAY AND rt <= 2000000 AND rt > 1000000) two, (SELECT COUNT(*) as count FROM webrequest WHERE ai='" + req.params.app + "' AND t>CURRENT_TIMESTAMP - INTERVAL '10' DAY AND rt <= 3000000 AND rt > 2000000) three, (SELECT COUNT(*) as count FROM webrequest WHERE ai='" + req.params.app + "' AND t>CURRENT_TIMESTAMP - INTERVAL '10' DAY AND rt <= 4000000 AND rt > 3000000) four, (SELECT COUNT(*) as count FROM webrequest WHERE ai='" + req.params.app + "' AND t>CURRENT_TIMESTAMP - INTERVAL '10' DAY AND rt >  4000000) more, (SELECT COUNT(*) as count FROM webrequest WHERE ai='" + req.params.app + "' AND t>CURRENT_TIMESTAMP - INTERVAL '10' DAY) total", function(err, result, moreResultSets) {
            return res.send(result);
          });
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
          return res.send(JSON.parse(response));
        } else {
          return db.query("SELECT pages.pt as pt, (pages.count * 100.0) / (total.count * 1.0) as \"percent\" FROM (SELECT pt, count(*) as \"count\" FROM webrequest WHERE ai='" + req.params.app + "' and t>CURRENT_TIMESTAMP - INTERVAL '1' DAY GROUP BY pt) pages, (SELECT COUNT(*) as count FROM webrequest WHERE ai='" + req.params.app + "' AND t>CURRENT_TIMESTAMP - INTERVAL '1' DAY) total ORDER BY \"percent\" DESC LIMIT 20;", function(err, result, moreResultSets) {
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
