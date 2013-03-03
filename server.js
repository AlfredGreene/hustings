var http = require('http');
var express = require('express')
var config = require('./config').config;
var sockjs = require('sockjs');
var colors = require('colors');
var redis = require("redis");

// Holds each client's connection
var broadcast = {};

var voteValue = 0;

var votingStatus = false;

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

    // Log this connected client
    console.log(('[+] New client connected ' + conn.remoteAddress + ":" + conn.remotePort).green);
    
    if(votingStatus) {
        conn.write("ENABLE_VOTING");        
    } else {
        conn.write("DISABLE_VOTING");                
    }

    conn.on('close', function() {
        delete broadcast[conn.id];
        
        console.log(('[-] Client disconnected ' + conn.remoteAddress + ":" + conn.remotePort).red);
        
        // Announce the count everytime a new client connects
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

        if(split[0] == "ADMIN_SECRET_YOUVEBEENCAUGHTON") {

            if(split[1] == "CANDIDATE_CHANGE") {
                console.log("Received CANDIDATE_CHANGE command for " + split[2] + ":" + split[3]);
                for(var id in broadcast) {
                    broadcast[id].write("CANDIDATE_CHANGE:" + split[2] + ":" + split[3]);
                }
            }

            if(split[1] == "DISABLE_VOTING") { 
                console.log("Received DISABLE_VOTING command");
                votingStatus = false;
                for(var id in broadcast) {
                    broadcast[id].write("DISABLE_VOTING");
                }
            }

            if(split[1] == "ENABLE_VOTING") {
               console.log("Received ENABLE_VOTING command");
               votingStatus = true;
                for(var id in broadcast) {
                    broadcast[id].write("ENABLE_VOTING");
                }
            }

        }
    });

    setInterval(function(){
        for(var id in broadcast) {
            broadcast[id].write("VOTE_VALUE_UPDATE:" + voteValue);
        }
    }, 1500);


    setInterval(function(){
        if(voteValue < 0) {
            voteValue++;
        }

        if(voteValue > 0) {
            voteValue--;
        }
    }, 8000);
});

// Create the express server for serving static content
var app = express();
app.use(express.static(__dirname + "/html"));

// Create node.js HTTP server
var server = http.createServer(app);

console.log('LA1:TV Hustings WebSocket Server');
console.log('Listening on 0.0.0.0:9999 (nginx proxying hustings.la1tv.co.uk:80)');

sockjs_server.installHandlers(server, {prefix:'/votes'});
server.listen(80);