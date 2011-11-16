(function() {
  var MonetDB, crypto, net;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  net = require('net');
  crypto = require('crypto');
  module.exports = MonetDB = (function() {
    function MonetDB(user, passwd, lang, host, port) {
      this.user = user != null ? user : "monetdb";
      this.passwd = passwd != null ? passwd : "monetdb";
      this.lang = lang != null ? lang : "sql";
      this.host = host != null ? host : "127.0.0.1";
      this.port = port != null ? port : "50000";
      this.q_table = "1";
      this.q_ubdate = "2";
      this.q_create = "3";
      this.q_transaction = "4";
      this.q_prepare = "5";
      this.q_block = "6";
      this.msg_redirect = '^';
      this.msg_query = '&';
      this.msg_schema_header = '%';
      this.msg_info = '!';
      this.msg_tuple = '[';
      this.msg_prompt = "";
      this.reply_size = '-1';
      this.max_auth_iteration = 10;
      this.monet_error = -1;
      this.lang_sql = "sql";
      this.MAPIv8 = 8;
      this.MAPIv9 = 9;
      this.SUPPORTED_PROTOCOLS = [this.MAPIv8, this.MAPIv9];
      this.monetdb_merovingian = "merovingian";
      this.monetdb_mserver = "monetdb";
      this.merovingian_mas_iterations = 10;
      this.client_endianness = "BIG";
      this.auth_iteration = 0;
      this.connection_established = false;
      if (this.lang.substr(0, 3) === 'sql') {
        this.lang = "sql";
      }
    }
    MonetDB.prototype.connect = function(database, auth_type) {
      this.database = database != null ? database : "demo";
      this.auth_type = auth_type != null ? auth_type : "SHA1";
      this.socket = net.createConnection(parseInt(this.port), this.host);
      return accept_challenge();
    };
    MonetDB.prototype.accept_challenge = function() {
      return this.socket.on('data', __bind(function(data) {
        return this.challenge_callback(data);
      }, this));
    };
    MonetDB.prototype.challenge_callback = function(data) {
      var auth, reply, salt, server_challenge;
      if (data.length === 0) {
        return this.socket.on('data', __bind(function(data) {
          return this.on_data(data);
        }, this));
      } else if (data.charAt(0) === this.msg_redirect) {} else {
        server_challenge = data;
        if (server_challenge) {
          salt = server_challenge.split(':')[0];
          this.server_name = server_challenge.split(':')[1];
          this.protocol = parseInt(server_challenge.split(':')[2]);
          this.supported_auth_types = server_challenge.split(':')[3].split(',');
          this.server_endianness = server_challenge.split(':')[4];
          if (this.protocol === this.MAPIv9) {
            this.pwhash = server_challenge.split(':')[5];
          }
        } else {
          throw "Error: Server returned an empty challenge string.";
        }
        if (this.supported_auth_types.length === 1) {
          auth = this.supported_auth_types[0];
          if (auth.toUpperCase() === "RIPEMD160" || auth.toUpperCase() === "CRYPT") {
            throw "" + (auth.toUpperCase()) + " : algorithm not supported by node-monetdb.";
          }
        }
        if (this.protocol !== this.MAPIv8 && this.protocol !== this.MAPIv9) {
          throw "Protocol not supported.";
        } else if (this.protocol === this.MAPIv8) {
          return reply = build_auth_string_v8(salt);
        } else if (this.protocol === this.MAPIv9) {
          return reply = build_auth_string_v9(salt);
        }
      }
    };
    MonetDB.prototype.build_auth_string_v8 = function(salt) {
      var hashsum;
      if (this.auth_type.toUpperCase() === "MD5") {
        hashsum = crypto.createHash('md5').update("" + this.passwd + salt).digest("hex");
      } else if (this.auth_type.toUpperCase() === "SHA1") {
        hashsum = crypto.createHash('sha1').update("" + this.passwd + salt).digest("hex");
      } else if (this.auth_type.toUpperCase() === "plain") {
        hashsum = "" + this.passwd + salt;
      } else {
        throw "Unsupported auth type";
      }
      return "" + this.client_endianness + ":" + this.user + ":{" + this.auth_type + "}" + hashsum + ":" + this.lang + ":" + db_name + ":";
    };
    MonetDB.prototype.build_auth_string_v9 = function(salt) {};
    return MonetDB;
  })();
}).call(this);
