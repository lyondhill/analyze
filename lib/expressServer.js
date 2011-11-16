(function() {
  var ExpressServ, odbc;
  odbc = require("odbc");
  module.exports = ExpressServ = (function() {
    function ExpressServ(host, port) {
      this.host = host;
      this.port = port;
      this.app = require('express').createServer();
      this.set_routes();
      this.app.listen(this.port, this.host);
    }
    console.log("1");
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
      this.db = this.db || new odbc.Database();
      return this.db.open("DRIVER={MonetDB};Server=localhost;Port=50000;UID=monetdb;PWD=monetdb;DATABASE=my-first-db", function(err) {
        return this.db.query("SELECT avg(severity) as average FROM lyon_farts", function(err, rows, moreResultSets) {
          return res.send("average: " + rows[0].average);
        });
      });
    };
    ExpressServ.prototype.sum = function(req, res) {
      this.db = this.db || new odbc.Database();
      return this.db.open("DRIVER={MonetDB};Server=localhost;Port=50000;UID=monetdb;PWD=monetdb;DATABASE=my-first-db", function(err) {
        return this.db.query("SELECT sum(severity) as sum FROM lyon_farts", function(err, rows, moreResultSets) {
          rows[0].user_time = new Date().toTimeString();
          return res.send(rows[0]);
        });
      });
    };
    return ExpressServ;
  })();
}).call(this);
