exports.config = {
    server_opts: {
        sockjs_url: "http://cdn.sockjs.org/sockjs-0.3.min.js",
        log: function(severity, message) {
            if (severity == "error") {
                console.log(message);
            };
        }
    },

    port: 8081,
    host: '0.0.0.0'    
};