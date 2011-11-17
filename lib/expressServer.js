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
      redis.expire("average", 5);
    }
    ExpressServ.prototype.set_routes = function() {
      this.app.get("/", this.hello_world);
      this.app.get("/apps/:app", this.app_name);
      this.app.get("/average", this.average);
      return this.app.get("/sum", this.sum);
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
          return db.query("SELECT avg(severity) as average FROM lyon_farts", function(err, rows, moreResultSets) {
            res.send("average: " + rows[0].average);
            redis.set("average", rows[0].average);
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
