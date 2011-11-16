var odbc = require("odbc");
console.log("start")

var db = new odbc.Database();
console.log(db)
db.open("DRIVER={monetdb5};Server=localhost;Port=50000;UID=monetdb;PWD=monetdb;DATABASE=my-first-db", function(err)
{
    db.query("select * from table", function(err, rows, moreResultSets)
    {
        console.log(rows);
        db.close(function(){});
    });
});