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
      this.db = new odbc.Database();
    }
    console.log("1");
    ExpressServ.prototype.set_routes = function() {
      this.app.get("/", this.hello_world);
      this.app.get("/apps/:app", this.app_name);
      return this.app.get("/average", this.average);
    };
    ExpressServ.prototype.hello_world = function(req, res) {
      return res.send("hello BIG world");
    };
    ExpressServ.prototype.app_name = function(req, res) {
      return res.send("app name = " + req.params.app);
    };
    ExpressServ.prototype.average = function(req, res) {
      return this.db.open("DRIVER={MonetDB};Server=localhost;Port=50000;UID=monetdb;PWD=monetdb;DATABASE=my-first-db", function(err) {
        return this.db.query("SELECT sum(severity) as sum, avg(severity) as average FROM lyon_farts", function(err, rows, moreResultSets) {
          return res.send("average: " + rows[0].average);
        });
      });
    };
    return ExpressServ;
  })();
}).call(this);
