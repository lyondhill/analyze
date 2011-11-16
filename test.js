var sys  = require("sys");
var odbc = require("odbc");

var db = new odbc.Database();
db.open("DRIVER={MonetDB};SERVER=localhost;UID=monetdb;PWD=monetdb;DATABASE=my-first-db", function(err)
{
    db.query("select * from table", function(err, rows, moreResultSets)
    {
        sys.debug(sys.inspect(rows));
        db.close(function(){});
    });
});