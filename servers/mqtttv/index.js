//Satisfy variable expectations to avoid errors as we only want to autorun this script
module.exports = function(){};

let http = require("http");
let mqtt = require("mqtt");
let client = mqtt.connect("mqtt://openhabianpi.local");

client.on("connect",function() {
    client.subscribe("lrtv");
    console.log("connected and subscribed");
});
client.on("message",function(topic,message) {
    console.log("received "+message+" from topic "+topic);
    if(topic=="lrtv" && message=="on") {
        console.log("tv on");
        http.request({
            host: "127.0.0.1",
            path: "/tvon"
        });
    } else if (topic=="lrtv" && message=="off") {
        console.log("tv off");
        http.request({
            host: "127.0.0.1",
            path: "/tvoff"
        });
    }
});
