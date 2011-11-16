var odbc = require("odbc");
console.log("start")

var db = new odbc.Database();
console.log(db)
db.open("DRIVER={MonetDB};Server=localhost;Port=50000;UID=monetdb;PWD=monetdb;DATABASE=my-first-db", function(err)
{
	db.query("INSERT INTO lyon_farts VALUES ('sbd', 2, 5);")
	db.query("INSERT INTO lyon_farts VALUES ('pop', 1, 2);")
	db.query("INSERT INTO lyon_farts VALUES ('shard', 3, 10);")
    db.query("SELECT * FROM lyon_farts WHERE severity > 3;", function(err, rows, moreResultSets)
    {
        console.log(rows);
        db.close(function(){});
    });
});