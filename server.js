var http = require('http');
var express = require('express')
var config = require('./config').config;
var sockjs = require('sockjs');
var colors = require('colors');

// Holds each client's connection
var broadcast = {};

var voteValue = 0;

var sockjs_server = sockjs.createServer(config.server_opts);

Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

sockjs_server.on('connection', function(conn) {

    // Store this new connection in the connected clients array
    broadcast[conn.id] = conn;
    
    console.log(('[+] New client connected ' + conn.remoteAddress + ":" + conn.remotePort).green);
    for(var id in broadcast) {
        broadcast[id].write("CLIENTS_COUNT:" + Object.size(broadcast));
    }
        
    conn.on('close', function() {
        delete broadcast[conn.id];
        console.log(('[-] Client disconnected ' + conn.remoteAddress + ":" + conn.remotePort).red);
        for(var id in broadcast) {
            broadcast[id].write("CLIENTS_COUNT:" + Object.size(broadcast));
        }
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

    });

    setInterval(function(){
        console.log("Sending voteValue update to all clients");
        for(var id in broadcast) {
            broadcast[id].write("VOTE_VALUE_UPDATE:" + voteValue);
        }
    }, 2000);

});

// Create the express server for serving static content
var app = express();
app.use(express.static(__dirname + "/html"));

// Create node.js HTTP server
var server = http.createServer(app);

console.log('LA1:TV WebSocket Server');
console.log('Listening on 0.0.0.0:9999');

sockjs_server.installHandlers(server, {prefix:'/echo'});
server.listen(9999);