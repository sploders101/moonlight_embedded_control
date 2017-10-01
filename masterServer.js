#!/usr/sbin/node
//Preliminary settings
process.umask(0o000);
process.chdir(__dirname);

var servers = [
    {
        name: "",
        location: "./servers/root"
    },
];

var express = require("express");
var app = require("express-ws-routes")();

//Disable caching on all pages, as all content can update frequently and dynamically
app.use(function(req,res,next) {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    next();
});

for(var i=0;i<servers.length;i++) {

    var router = express.Router();
    require(servers[i].location)(router,express);
    app.use("/"+servers[i].name,router);

}

app.use("/restart",function(req,res,next) {
    res.send("Restarting server...");
    process.exit();
});

app.listen( process.env.PORT || 80 , function(err) {
    if(!err) {
        console.log("listening");
    }
} );
