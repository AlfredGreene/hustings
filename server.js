var http = require('http');
var express = require('express')
var config = require('./config').config;
var sockjs = require('sockjs');
var colors = require('colors');
var redis = require("redis");
var redis_client = redis.createClient();

// Holds each client's connection
var broadcast = {};

var voteValue = 0;

redis_client.get("votes", function (err, reply) {
    voteValue = reply;
});

Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

var sockjs_server = sockjs.createServer(config.server_opts);

sockjs_server.on('connection', function(conn) {

    // Store this new connection in the connected clients array
    broadcast[conn.id] = conn;

    // Store the client's IP address in Redis
    redis_client.sadd("connections", conn.remoteAddress + ":" + conn.remotePort);

    // Log this connected client
    console.log(('[+] New client connected ' + conn.remoteAddress + ":" + conn.remotePort).green);

    // Get the number of connected clients and announce the count everytime a new client connects
    redis_client.scard("connections", function(err, reply) {
        for(var id in broadcast) {
            broadcast[id].write("CLIENTS_COUNT:" + reply);
        }
    });
        
    conn.on('close', function() {
        delete broadcast[conn.id];
        
        console.log(('[-] Client disconnected ' + conn.remoteAddress + ":" + conn.remotePort).red);
        
        redis_client.srem("connections", conn.remoteAddress + ":" + conn.remotePort);

        // Get the number of connected clients and announce the count everytime a new client connects
        redis_client.scard("connections", function(err, reply) {
            for(var id in broadcast) {
                broadcast[id].write("CLIENTS_COUNT:" + reply);
            }
        });

    });
    
    conn.on('data', function(message) {
        if(message.toUpperCase() == "UP" || message.toUpperCase() == "DOWN") {
            console.log(('[*] ' + message + ' vote received from ' + conn.remoteAddress + ":" + conn.remotePort).yellow);

            if (message.toUpperCase() == "UP") {
                voteValue++;
            } else {
                voteValue--;
            }

        }

        var split = message.split(":");
        if(split[0] == "CANDIDATE_CHANGE") {
            console.log("Received CANDIDATE_CHANGE command for " + split[1] + ":" + split[2]);
            for(var id in broadcast) {
                broadcast[id].write("CANDIDATE_CHANGE:" + split[1] + ":" + split[2]);
            }
        }
        
        if(split[0] == "DISABLE_VOTING") { 
            console.log("Received DISABLE_VOTING command");
            for(var id in broadcast) {
                broadcast[id].write("DISABLE_VOTING");
            }
        }

        if(split[0] == "ENABLE_VOTING") {
           console.log("Received ENABLE_VOTING command");
            for(var id in broadcast) {
                broadcast[id].write("ENABLE_VOTING");
            }
        }
    });

    setInterval(function(){
        for(var id in broadcast) {
            broadcast[id].write("VOTE_VALUE_UPDATE:" + voteValue);
        }
    }, 8000);

});

// Create the express server for serving static content
var app = express();
app.use(express.static(__dirname + "/html"));

// Create node.js HTTP server
var server = http.createServer(app);

console.log('LA1:TV WebSocket Server');
console.log('Listening on 0.0.0.0:9999');

sockjs_server.installHandlers(server, {prefix:'/votes'});
server.listen(9999);