var odbc = require("odbc");
console.log("start")

var db = new odbc.Database();
console.log(db)
db.open("DRIVER={MonetDB};Server=localhost;Port=50000;UID=monetdb;PWD=monetdb;DATABASE=my-first-db", function(err)
{

	// db.query("INSERT INTO lyon_farts VALUES ('sbd', 2, 4);")
	// db.query("INSERT INTO lyon_farts VALUES ('pop', 1, 7);")
	// db.query("INSERT INTO lyon_farts VALUES ('shard', 3, 10);")
    // db.query("SELECT * FROM lyon_farts WHERE severity > 3;", function(err, rows, moreResultSets)
    // {
    // 	console.log(rows.length)
    // 	console.log("--------")
    // 	console.log(moreResultSets)
    // 	console.log("--------")
    //     console.log(rows);
    //     console.log("--------")
    //     db.close(function(){});
    // });
	db.query("SELECT sum(severity) as sum, avg(severity) as average FROM lyon_farts", function(err, rows, moreResultSets)
	{
	    console.log(rows);
	});
	console.log('1')
	db.query("SELECT sum(severity) as sum, avg(severity) as average FROM lyon_farts", function(err, rows, moreResultSets)
	{
	    console.log(rows);
	});
	console.log('2')
	db.query("SELECT sum(severity) as sum, avg(severity) as average FROM lyon_farts", function(err, rows, moreResultSets)
	{
	    console.log(rows);
	});
	console.log('3')
	db.query("SELECT sum(severity) as sum, avg(severity) as average FROM lyon_farts", function(err, rows, moreResultSets)
	{
	    console.log(rows);
	});
	console.log('4')

	db.query("SELECT sum(severity) as sum, avg(severity) as average FROM lyon_farts", function(err, rows, moreResultSets)
	{
	    console.log(rows);
	});
	console.log('5')
	db.query("SELECT sum(severity) as sum, avg(severity) as average FROM lyon_farts", function(err, rows, moreResultSets)
	{
	    console.log(rows);
	});
	console.log('6')
	db.query("SELECT sum(severity) as sum, avg(severity) as average FROM lyon_farts", function(err, rows, moreResultSets)
	{
	    console.log(rows);
	});
	console.log('7')
	db.query("SELECT sum(severity) as sum, avg(severity) as average FROM lyon_farts", function(err, rows, moreResultSets)
	{
	    console.log(rows);
	});
	console.log('8')
	db.query("SELECT sum(severity) as sum, avg(severity) as average FROM lyon_farts", function(err, rows, moreResultSets)
	{
	    console.log(rows);
	    db.close(function(){});
	});




});

