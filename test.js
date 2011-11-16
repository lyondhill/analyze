var sys  = require("sys");
var odbc = require("odbc");

var db = new odbc.Database();
db.open("DRIVER={monetdb5};Server=localhost;Port=50000;UID=monetdb;PWD=monetdb;DATABASE=my-first-db", function(err)
{
    db.query("select * from table", function(err, rows, moreResultSets)
    {
        sys.debug(sys.inspect(rows));
        db.close(function(){});
    });
});