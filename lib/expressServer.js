(function() {
  var ExpressServ, db, redis;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
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
      this.app.get("/apps/:app/quick-stats-hour", this.quick_stats_hour);
      this.app.get("/apps/:app/quick-stats-day", this.quick_stats_day);
      this.app.get("/apps/:app/quick-stats-week", this.quick_stats_week);
      this.app.get("/apps/:app/web-requests", this.web_requests);
      this.app.get("/apps/:app/response-time", this.response_time);
      this.app.get("/apps/:app/slowest-response-time", this.slowest_response);
      this.app.get("/apps/:app/most-viewed", this.most_viewed);
      this.app.get("/", this.hello_world);
      this.app.get("/apps/:app", this.app_name);
      this.app.get("/average", this.average);
      return this.app.get("/sum", this.sum);
    };
    ExpressServ.prototype.quick_stats_hour = function(req, res) {
      return db.query("SELECT count(*) as \"total\", count(distinct pd) as \"unique\", avg(rt) as \"response\" FROM webrequest WHERE ai='" + req.params.app + "' and t>'2011-11-17'", function(err, rows, moreResultSets) {
        if (err) {
          return res.send(err);
        } else {
          return res.send(rows);
        }
      });
    };
    ExpressServ.prototype.quick_stats_day = function(req, res) {
      return redis.get("" + req.params.app + "-quick_stats_day", function(err, response) {
        if (response) {
          return res.send(response);
        } else {
          this.send_data = "not yet implemented";
          res.send(this.send_data);
          redis.set("" + req.params.app + "-quick_stats_day", this.send_data);
          return redis.expire("" + req.params.app + "-quick_stats_day", 60);
        }
      });
    };
    ExpressServ.prototype.quick_stats_week = function(req, res) {
      return redis.get("" + req.params.app + "-quick_stats_week", function(err, response) {
        if (response) {
          return res.send(response);
        } else {
          this.send_data = "not yet implemented";
          res.send(this.send_data);
          redis.set("" + req.params.app + "-quick_stats_week", this.send_data);
          return redis.expire("" + req.params.app + "-quick_stats_week", 60);
        }
      });
    };
    ExpressServ.prototype.web_requests = function(req, res) {
      return redis.get("" + req.params.app + "-web_requests", function(err, response) {
        if (response) {
          return res.send(response);
        } else {
          this.send_data = "not yet implemented";
          res.send(this.send_data);
          redis.set("" + req.params.app + "-web_requests", this.send_data);
          return redis.expire("" + req.params.app + "-web_requests", 60);
        }
      });
    };
    ExpressServ.prototype.response_time = function(req, res) {
      return redis.get("" + req.params.app + "-response_time", function(err, response) {
        if (response) {
          return res.send(response);
        } else {
          this.send_data = "not yet implemented";
          res.send(this.send_data);
          redis.set("" + req.params.app + "-response_time", this.send_data);
          return redis.expire("" + req.params.app + "-response_time", 60);
        }
      });
    };
    ExpressServ.prototype.slowest_response = function(req, res) {
      return redis.get("" + req.params.app + "-slowest_response", function(err, response) {
        if (response) {
          return res.send(response);
        } else {
          this.send_data = "not yet implemented";
          res.send(this.send_data);
          redis.set("" + req.params.app + "-slowest_response", this.send_data);
          return redis.expire("" + req.params.app + "-slowest_response", 60);
        }
      });
    };
    ExpressServ.prototype.most_viewed = function(req, res) {
      return redis.get("" + req.params.app + "-most_viewed", function(err, response) {
        if (response) {
          return res.send(response);
        } else {
          this.send_data = "not yet implemented";
          res.send(this.send_data);
          redis.set("" + req.params.app + "-most_viewed", this.send_data);
          return redis.expire("" + req.params.app + "-most_viewed", 60);
        }
      });
    };
    ExpressServ.prototype.hello_world = function(req, res) {
      return res.send("hello BIG world");
    };
    ExpressServ.prototype.app_name = function(req, res) {
      return res.send("app name = " + req.params.app);
    };
    ExpressServ.prototype.average = function(req, res) {
      return redis.get("average", __bind(function(err, response) {
        if (response) {
          return res.send("average: " + response + " (cached)");
        } else {
          return db.query("SELECT avg(rt) as response FROM webrequest", function(err, rows, moreResultSets) {
            res.send("average: " + rows[0].response);
            redis.set("average", rows[0].response);
            return redis.expire("average", 5);
          });
        }
      }, this));
    };
    ExpressServ.prototype.sum = function(req, res) {
      return db.query("SELECT sum(severity) as sum FROM lyon_farts", function(err, rows, moreResultSets) {
        rows[0].user_time = new Date().toTimeString();
        return res.send(rows[0]);
      });
    };
    return ExpressServ;
  })();
}).call(this);
