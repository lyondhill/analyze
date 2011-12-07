(function() {
  var ExpressServ, db, redis;
  db = new require("odbc").Database();
  redis = require('redis').createClient(6379, '10.60.38.98');
  module.exports = ExpressServ = (function() {
    function ExpressServ(host, port) {
      this.host = host;
      this.port = port;
      this.app = require('express').createServer();
      this.set_routes();
      this.app.listen(this.port, this.host);
      db.open("DRIVER={MonetDB};Server=10.60.38.97;Port=50000;UID=bakerd;PWD=!rLXoM@y)yr2;DATABASE=web_requests");
    }
    ExpressServ.prototype.set_routes = function() {
      this.app.get("/apps/:app/quick-stats-day", this.app_quick_stats_day);
      this.app.get("/apps/:app/quick-stats-week", this.app_quick_stats_week);
      this.app.get("/apps/:app/quick-stats-month", this.app_quick_stats_month);
      this.app.get("/apps/:app/web-requests", this.app_web_requests);
      this.app.get("/apps/:app/response-time", this.app_response_time);
      this.app.get("/apps/:app/slowest-response-time", this.app_slowest_response);
      this.app.get("/apps/:app/most-viewed", this.app_most_viewed);
      this.app.get("/component/:component/quick-stats-day", this.component_quick_stats_day);
      this.app.get("/component/:component/quick-stats-week", this.component_quick_stats_week);
      this.app.get("/component/:component/quick-stats-month", this.component_quick_stats_month);
      this.app.get("/component/:component/web-requests", this.component_web_requests);
      this.app.get("/component/:component/response-time", this.component_response_time);
      this.app.get("/component/:component/slowest-response-time", this.component_slowest_response);
      this.app.get("/component/:component/most-viewed", this.component_most_viewed);
      return this.app.get("/", this.hello_world);
    };
    ExpressServ.prototype.app_quick_stats_day = function(req, res) {
      return db.query("SELECT count(*) as \"total\", count(distinct pd) as \"unique\", avg(rt) as \"response\" FROM webrequest WHERE ai='" + req.params.app + "' and t>CURRENT_TIMESTAMP - INTERVAL '1' DAY", function(err, result, moreResultSets) {
        if (err) {
          console.log(err);
        }
        result[0]['response'] = "" + ((eval(result[0]['response']) / 1000).toFixed()) + " ms";
        return res.send({
          data: result,
          description: "Last 24 Hours"
        });
      });
    };
    ExpressServ.prototype.app_quick_stats_week = function(req, res) {
      return redis.get("" + req.params.app + "-quick_stats_week", function(err, response) {
        if (response) {
          return res.send(JSON.parse(response));
        } else {
          return db.query("SELECT count(*) as \"total\", count(distinct pd) as \"unique\", avg(rt) as \"response\" FROM webrequest WHERE ai='" + req.params.app + "' and t>CURRENT_TIMESTAMP - INTERVAL '7' DAY", function(err, result, moreResultSets) {
            var data;
            if (err) {
              console.log(err);
            }
            result[0]['response'] = "" + ((eval(result[0]['response']) / 1000).toFixed()) + " ms";
            data = {
              data: result,
              description: "Last 7 Days"
            };
            res.send(data);
            redis.set("" + req.params.app + "-quick_stats_week", JSON.stringify(data));
            return redis.expire("" + req.params.app + "-quick_stats_week", 3600);
          });
        }
      });
    };
    ExpressServ.prototype.app_quick_stats_month = function(req, res) {
      return redis.get("" + req.params.app + "-quick_stats_month", function(err, response) {
        if (response) {
          return res.send(JSON.parse(response));
        } else {
          return db.query("SELECT count(*) as \"total\", count(distinct pd) as \"unique\", avg(rt) as \"response\" FROM webrequest WHERE ai='" + req.params.app + "' and t>CURRENT_TIMESTAMP - INTERVAL '30' DAY", function(err, result, moreResultSets) {
            var data;
            if (err) {
              console.log(err);
            }
            result[0]['response'] = "" + ((eval(result[0]['response']) / 1000).toFixed()) + " ms";
            data = {
              data: result,
              description: "Last 30 Days"
            };
            res.send(data);
            redis.set("" + req.params.app + "-quick_stats_month", JSON.stringify(data));
            return redis.expire("" + req.params.app + "-quick_stats_month", 86400);
          });
        }
      });
    };
    ExpressServ.prototype.app_web_requests = function(req, res) {
      return redis.get("" + req.params.app + "-web_requests", function(err, response) {
        if (response) {
          return res.send(JSON.parse(response));
        } else {
          return db.query("SELECT count(*) as \"total\", avg(rt) as \"average\", EXTRACT(hour from t) as \"hour\" FROM webrequest WHERE ai='" + req.params.app + "' and t>CURRENT_TIMESTAMP - INTERVAL '1' DAY GROUP BY \"hour\" ORDER BY \"hour\"", function(err, result, moreResultSets) {
            var data;
            if (err) {
              console.log(err);
            }
            data = {
              data: result
            };
            res.send(data);
            redis.set("" + req.params.app + "-web_requests", JSON.stringify(data));
            return redis.expire("" + req.params.app + "-web_requests", 300);
          });
        }
      });
    };
    ExpressServ.prototype.app_response_time = function(req, res) {
      return redis.get("" + req.params.app + "-response_time", function(err, response) {
        if (response) {
          return res.send(JSON.parse(response));
        } else {
          return db.query("SELECT (quarter.count * 100.0) / (total.count * 1.0) as quarter, (half.count * 100.0) / (total.count * 1.0) as half, (one.count * 100.0) / (total.count * 1.0) as one, ((quarter.count + half.count + one.count) * 100.0) / (total.count * 1.0) as full_second, (two.count * 100.0) / (total.count * 1.0) as two, (three.count * 100.0) / (total.count * 1.0) as three, (four.count * 100.0) / (total.count * 1.0) as four, (more.count * 100.0) / (total.count * 1.0) as more FROM (SELECT COUNT(*) as count FROM webrequest WHERE ai='" + req.params.app + "' AND t>CURRENT_TIMESTAMP - INTERVAL '1' DAY AND rt <= 250000) quarter, (SELECT COUNT(*) as count FROM webrequest WHERE ai='" + req.params.app + "' AND t>CURRENT_TIMESTAMP - INTERVAL '1' DAY AND rt <= 500000  AND rt > 250000) half, (SELECT COUNT(*) as count FROM webrequest WHERE ai='" + req.params.app + "' AND t>CURRENT_TIMESTAMP - INTERVAL '1' DAY AND rt <= 1000000 AND rt > 500000) one, (SELECT COUNT(*) as count FROM webrequest WHERE ai='" + req.params.app + "' AND t>CURRENT_TIMESTAMP - INTERVAL '1' DAY AND rt <= 2000000 AND rt > 1000000) two, (SELECT COUNT(*) as count FROM webrequest WHERE ai='" + req.params.app + "' AND t>CURRENT_TIMESTAMP - INTERVAL '1' DAY AND rt <= 3000000 AND rt > 2000000) three, (SELECT COUNT(*) as count FROM webrequest WHERE ai='" + req.params.app + "' AND t>CURRENT_TIMESTAMP - INTERVAL '1' DAY AND rt <= 4000000 AND rt > 3000000) four, (SELECT COUNT(*) as count FROM webrequest WHERE ai='" + req.params.app + "' AND t>CURRENT_TIMESTAMP - INTERVAL '1' DAY AND rt >  4000000) more, (SELECT CASE COUNT(*) WHEN 0 THEN 1 ELSE COUNT(*) END as count FROM webrequest WHERE ai='" + req.params.app + "' AND t>CURRENT_TIMESTAMP - INTERVAL '1' DAY) total", function(err, result, moreResultSets) {
            var data;
            if (err) {
              console.log(err);
            }
            data = {
              data: result
            };
            res.send(data);
            redis.set("" + req.params.app + "-response_time", JSON.stringify(data));
            return redis.expire("" + req.params.app + "-response_time", 3600);
          });
        }
      });
    };
    ExpressServ.prototype.app_slowest_response = function(req, res) {
      return redis.get("" + req.params.app + "-slowest_response", function(err, response) {
        if (response) {
          return res.send(JSON.parse(response));
        } else {
          return db.query("SELECT pt, avg(rt) as \"response\" FROM webrequest WHERE ai='" + req.params.app + "' and t>CURRENT_TIMESTAMP - INTERVAL '1' DAY GROUP BY \"pt\" ORDER BY \"response\" DESC LIMIT 20", function(err, result, moreResultSets) {
            var data;
            if (err) {
              console.log(err);
            }
            data = {
              data: result
            };
            res.send(data);
            redis.set("" + req.params.app + "-slowest_response", JSON.stringify(data));
            return redis.expire("" + req.params.app + "-slowest_response", 3600);
          });
        }
      });
    };
    ExpressServ.prototype.app_most_viewed = function(req, res) {
      return redis.get("" + req.params.app + "-most_viewed", function(err, response) {
        if (response) {
          return res.send(JSON.parse(response));
        } else {
          return db.query("SELECT pages.pt as pt, (pages.count * 100.0) / (total.count * 1.0) as \"percent\" FROM (SELECT pt, count(*) as \"count\" FROM webrequest WHERE ai='" + req.params.app + "' and t>CURRENT_TIMESTAMP - INTERVAL '1' DAY GROUP BY pt) pages, (SELECT CASE COUNT(*) WHEN 0 THEN 1 ELSE COUNT(*) END as count FROM webrequest WHERE ai='" + req.params.app + "' AND t>CURRENT_TIMESTAMP - INTERVAL '1' DAY) total ORDER BY \"percent\" DESC LIMIT 20;", function(err, result, moreResultSets) {
            var data;
            if (err) {
              console.log(err);
            }
            data = {
              data: result
            };
            res.send(data);
            redis.set("" + req.params.app + "-most_viewed", JSON.stringify(data));
            return redis.expire("" + req.params.app + "-most_viewed", 3600);
          });
        }
      });
    };
    ExpressServ.prototype.component_quick_stats_day = function(req, res) {
      return db.query("SELECT count(*) as \"total\", count(distinct pd) as \"unique\", avg(rt) as \"response\" FROM webrequest WHERE ci='" + req.params.component + "' and t>CURRENT_TIMESTAMP - INTERVAL '1' DAY", function(err, result, moreResultSets) {
        if (err) {
          console.log(err);
        }
        result[0]['response'] = "" + ((eval(result[0]['response']) / 1000).toFixed()) + " ms";
        return res.send({
          data: result,
          description: "Last 24 Hours"
        });
      });
    };
    ExpressServ.prototype.component_quick_stats_week = function(req, res) {
      return redis.get("" + req.params.component + "-quick_stats_week", function(err, response) {
        if (response) {
          return res.send(JSON.parse(response));
        } else {
          return db.query("SELECT count(*) as \"total\", count(distinct pd) as \"unique\", avg(rt) as \"response\" FROM webrequest WHERE ci='" + req.params.component + "' and t>CURRENT_TIMESTAMP - INTERVAL '7' DAY", function(err, result, moreResultSets) {
            var data;
            if (err) {
              console.log(err);
            }
            result[0]['response'] = "" + ((eval(result[0]['response']) / 1000).toFixed()) + " ms";
            data = {
              data: result,
              description: "Last 7 Days"
            };
            res.send(data);
            redis.set("" + req.params.component + "-quick_stats_week", JSON.stringify(data));
            return redis.expire("" + req.params.component + "-quick_stats_week", 3600);
          });
        }
      });
    };
    ExpressServ.prototype.component_quick_stats_month = function(req, res) {
      return redis.get("" + req.params.component + "-quick_stats_month", function(err, response) {
        if (response) {
          return res.send(JSON.parse(response));
        } else {
          return db.query("SELECT count(*) as \"total\", count(distinct pd) as \"unique\", avg(rt) as \"response\" FROM webrequest WHERE ci='" + req.params.component + "' and t>CURRENT_TIMESTAMP - INTERVAL '30' DAY", function(err, result, moreResultSets) {
            var data;
            if (err) {
              console.log(err);
            }
            result[0]['response'] = "" + ((eval(result[0]['response']) / 1000).toFixed()) + " ms";
            data = {
              data: result,
              description: "Last 30 Days"
            };
            res.send(data);
            redis.set("" + req.params.component + "-quick_stats_month", JSON.stringify(data));
            return redis.expire("" + req.params.component + "-quick_stats_month", 86400);
          });
        }
      });
    };
    ExpressServ.prototype.component_web_requests = function(req, res) {
      return redis.get("" + req.params.component + "-web_requests", function(err, response) {
        if (response) {
          return res.send(JSON.parse(response));
        } else {
          return db.query("SELECT count(*) as \"total\", avg(rt) as \"average\", EXTRACT(hour from t) as \"hour\" FROM webrequest WHERE ci='" + req.params.component + "' and t>CURRENT_TIMESTAMP - INTERVAL '1' DAY GROUP BY \"hour\" ORDER BY \"hour\"", function(err, result, moreResultSets) {
            var data;
            if (err) {
              console.log(err);
            }
            data = {
              data: result
            };
            res.send(data);
            redis.set("" + req.params.component + "-web_requests", JSON.stringify(data));
            return redis.expire("" + req.params.component + "-web_requests", 300);
          });
        }
      });
    };
    ExpressServ.prototype.component_response_time = function(req, res) {
      return redis.get("" + req.params.component + "-response_time", function(err, response) {
        if (response) {
          return res.send(JSON.parse(response));
        } else {
          return db.query("SELECT (quarter.count * 100.0) / (total.count * 1.0) as quarter, (half.count * 100.0) / (total.count * 1.0) as half, (one.count * 100.0) / (total.count * 1.0) as one, ((quarter.count + half.count + one.count) * 100.0) / (total.count * 1.0) as full_second, (two.count * 100.0) / (total.count * 1.0) as two, (three.count * 100.0) / (total.count * 1.0) as three, (four.count * 100.0) / (total.count * 1.0) as four, (more.count * 100.0) / (total.count * 1.0) as more FROM (SELECT COUNT(*) as count FROM webrequest WHERE ci='" + req.params.component + "' AND t>CURRENT_TIMESTAMP - INTERVAL '1' DAY AND rt <= 250000) quarter, (SELECT COUNT(*) as count FROM webrequest WHERE ci='" + req.params.component + "' AND t>CURRENT_TIMESTAMP - INTERVAL '1' DAY AND rt <= 500000  AND rt > 250000) half, (SELECT COUNT(*) as count FROM webrequest WHERE ci='" + req.params.component + "' AND t>CURRENT_TIMESTAMP - INTERVAL '1' DAY AND rt <= 1000000 AND rt > 500000) one, (SELECT COUNT(*) as count FROM webrequest WHERE ci='" + req.params.component + "' AND t>CURRENT_TIMESTAMP - INTERVAL '1' DAY AND rt <= 2000000 AND rt > 1000000) two, (SELECT COUNT(*) as count FROM webrequest WHERE ci='" + req.params.component + "' AND t>CURRENT_TIMESTAMP - INTERVAL '1' DAY AND rt <= 3000000 AND rt > 2000000) three, (SELECT COUNT(*) as count FROM webrequest WHERE ci='" + req.params.component + "' AND t>CURRENT_TIMESTAMP - INTERVAL '1' DAY AND rt <= 4000000 AND rt > 3000000) four, (SELECT COUNT(*) as count FROM webrequest WHERE ci='" + req.params.component + "' AND t>CURRENT_TIMESTAMP - INTERVAL '1' DAY AND rt >  4000000) more, (SELECT CASE COUNT(*) WHEN 0 THEN 1 ELSE COUNT(*) END as count FROM webrequest WHERE ci='" + req.params.component + "' AND t>CURRENT_TIMESTAMP - INTERVAL '1' DAY) total", function(err, result, moreResultSets) {
            var data;
            if (err) {
              console.log(err);
            }
            data = {
              data: result
            };
            res.send(data);
            redis.set("" + req.params.component + "-response_time", JSON.stringify(data));
            return redis.expire("" + req.params.component + "-response_time", 3600);
          });
        }
      });
    };
    ExpressServ.prototype.component_slowest_response = function(req, res) {
      return redis.get("" + req.params.component + "-slowest_response", function(err, response) {
        if (response) {
          return res.send(JSON.parse(response));
        } else {
          return db.query("SELECT pt, avg(rt) as \"response\" FROM webrequest WHERE ci='" + req.params.component + "' and t>CURRENT_TIMESTAMP - INTERVAL '1' DAY GROUP BY \"pt\" ORDER BY \"response\" DESC LIMIT 20", function(err, result, moreResultSets) {
            var data;
            if (err) {
              console.log(err);
            }
            data = {
              data: result
            };
            res.send(data);
            redis.set("" + req.params.component + "-slowest_response", JSON.stringify(data));
            return redis.expire("" + req.params.component + "-slowest_response", 3600);
          });
        }
      });
    };
    ExpressServ.prototype.component_most_viewed = function(req, res) {
      return redis.get("" + req.params.component + "-most_viewed", function(err, response) {
        if (response) {
          return res.send(JSON.parse(response));
        } else {
          return db.query("SELECT pages.pt as pt, (pages.count * 100.0) / (total.count * 1.0) as \"percent\" FROM (SELECT pt, count(*) as \"count\" FROM webrequest WHERE ci='" + req.params.component + "' and t>CURRENT_TIMESTAMP - INTERVAL '1' DAY GROUP BY pt) pages, (SELECT CASE COUNT(*) WHEN 0 THEN 1 ELSE COUNT(*) END as count FROM webrequest WHERE ci='" + req.params.component + "' AND t>CURRENT_TIMESTAMP - INTERVAL '1' DAY) total ORDER BY \"percent\" DESC LIMIT 20;", function(err, result, moreResultSets) {
            var data;
            if (err) {
              console.log(err);
            }
            data = {
              data: result
            };
            res.send(data);
            redis.set("" + req.params.component + "-most_viewed", JSON.stringify(data));
            return redis.expire("" + req.params.component + "-most_viewed", 3600);
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
