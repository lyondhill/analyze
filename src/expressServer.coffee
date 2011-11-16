odbc = require("odbc")
# redis = require 'redis'
# https = require 'https'


module.exports = class ExpressServ

  constructor: (@host, @port) ->
    @app = require('express').createServer();
    @set_routes()
    @app.listen(@port, @host)
    @db = new odbc.Database()
    # @db.open "DRIVER={MonetDB};Server=localhost;Port=50000;UID=monetdb;PWD=monetdb;DATABASE=my-first-db", (err) ->
    # @db.query "SELECT sum(severity) as sum, avg(severity) as average FROM lyon_farts", (err, rows, moreResultSets) ->

  console.log "1"

  set_routes: () ->
    @app.get "/", @hello_world
    @app.get "/apps/:app", @app_name
    @app.get "/average", @average

  hello_world: (req, res) ->
    res.send "hello BIG world"

  app_name: (req, res) ->
    res.send "app name = #{req.params.app}"

  average: (req, res) ->
    @db.open "DRIVER={MonetDB};Server=localhost;Port=50000;UID=monetdb;PWD=monetdb;DATABASE=my-first-db", (err) ->
      @db.query "SELECT sum(severity) as sum, avg(severity) as average FROM lyon_farts", (err, rows, moreResultSets) ->
        res.send "average: #{rows[0].average}"

  

