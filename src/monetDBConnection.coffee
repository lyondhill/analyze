# net = require 'net'
# crypto = require 'crypto'
# # crypto.createHash('md5').update(data).digest("hex");


# module.exports = class MonetDB

# 	constructor: (@user = "monetdb", @passwd = "monetdb", @lang = "sql", @host="127.0.0.1", @port = "50000") ->
#     @q_table                    = "1" # SELECT operation
#     @q_ubdate                   = "2" # INSERT/UPDATE operations
#     @q_create                   = "3" # CREATE/DROP TABLE operations
#     @q_transaction              = "4" # TRANSACTION
#     @q_prepare                  = "5"
#     @q_block                    = "6" # QBLOCK message
#     @msg_redirect               = '^' # auth redirection through merovingian
#     @msg_query                  = '&'
#     @msg_schema_header          = '%'
#     @msg_info                   = '!' # info response from mserver
#     @msg_tuple                  = '['
#     @msg_prompt                 =  ""
#     @reply_size                 = '-1'
#     @max_auth_iteration         = 10  # maximum number of atuh iterations (thorough merovingian) allowed
#     @monet_error                = -1
#     @lang_sql                   = "sql"
#     # Protocols
#     @MAPIv8                     = 8
#     @MAPIv9                     = 9
#     @SUPPORTED_PROTOCOLS        = [ @MAPIv8, @MAPIv9 ]
#     @monetdb_merovingian        = "merovingian"
#     @monetdb_mserver            = "monetdb"
#     @merovingian_mas_iterations = 10
#     @client_endianness          = "BIG"
#     @auth_iteration             = 0
#     @connection_established     = false

#     if @lang.substr(0,3) == 'sql'
#       @lang = "sql"

    
#   connect: (@database = "demo", @auth_type = "SHA1") ->
#     @socket = net.createConnection(parseInt(@port), @host)
#     accept_challenge()
    
#   accept_challenge: () ->
#     @socket.on 'data', (data) =>
#       @challenge_callback data
  
#   challenge_callback: (data) ->
#     if data.length == 0
#       # authentication complete
#       @socket.on 'data', (data) =>
#         @on_data data
#     else if data.charAt(0) == @msg_redirect 
#       # Redirect logic
#       redirects = [] # store a list of possible redirects

#       for m in data.split("\n")
#         do ()

#     else
#       server_challenge = data
#       if server_challenge
#         salt = server_challenge.split(':')[0]
#         @server_name = server_challenge.split(':')[1]
#         @protocol = parseInt(server_challenge.split(':')[2])
#         @supported_auth_types = server_challenge.split(':')[3].split(',')
#         @server_endianness = server_challenge.split(':')[4]
#         if @protocol == @MAPIv9
#           @pwhash = server_challenge.split(':')[5]
#       else
#         throw "Error: Server returned an empty challenge string."
      
#       if @supported_auth_types.length == 1
#         auth = @supported_auth_types[0]
#         if auth.toUpperCase() == "RIPEMD160" or auth.toUpperCase() == "CRYPT"
#           throw "#{auth.toUpperCase()} : algorithm not supported by node-monetdb."
      
#       # If the server protocol version is not 8: abort and notify the user.
#       if @protocol != @MAPIv8 and @protocol != @MAPIv9
#         throw "Protocol not supported."
      
#       else if @protocol == @MAPIv8
#         reply = build_auth_string_v8(salt)
#       else if @protocol == @MAPIv9
#         reply = build_auth_string_v9(salt)

#   build_auth_string_v8: (salt) ->
#     if @auth_type.toUpperCase() == "MD5"
#       hashsum = crypto.createHash('md5').update("#{@passwd}#{salt}").digest("hex")
#     else if @auth_type.toUpperCase() == "SHA1"
#       hashsum = crypto.createHash('sha1').update("#{@passwd}#{salt}").digest("hex")
#     else if @auth_type.toLowerCase() == "plain"
#       hashsum = "#{@passwd}#{salt}"
#     else
#       throw "Unsupported auth type"
    
#     "#{@client_endianness}:#{@user}:{#{@auth_type}}#{hashsum}:#{@lang}:#{@database}:"

#   build_auth_string_v9: (salt) ->
#     if (@auth_type.toUpperCase() == "MD5" or @auth_type.toUpperCase() == "SHA1")
#       @auth_type = auth_type.toUpperCase()
#       pwhash  = crypto.createHash(@pwhash).update("#{@passwd}").digest("hex")
#       hashsum = crypto.createHash(@auth_type.toLowerCase()).update("#{@passwd}#{salt}").digest("hex")
#     else if @auth_type.toLowerCase() == "plain"
#       hashsum = "#{@passwd}#{salt}"
#     else
#       throw "Unsupported auth type"

#     "#{@client_endianness}:#{@user}:{#{@auth_type}}#{hashsum}:#{@lang}:#{@database}:"




