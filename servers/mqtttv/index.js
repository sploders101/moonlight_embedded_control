//Satisfy variable expectations to avoid errors as we only want to autorun this script
module.exports = function(){};

let http = require("http");
let mqtt = require("mqtt");
lat client = mqtt.connect("mqtt://openhabianpi.local");

client.on("connect",function() {
    client.subscribe("lrtv");
});
client.on("message",function(topic,message) {
    if(topic=="lrtv" && message=="on") {
        http.request({
            host: "127.0.0.1",
            path: "/tvon"
        });
    } else if (topic=="lrtv" && message=="off") {
        http.request({
            host: "127.0.0.1",
            path: "/tvoff"
        });
    }
});
