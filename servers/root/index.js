const { spawn } = require('child_process');
const robotjs = require("robotjs");

let moonlight;
let vh;
let cecClient;
let state = false;

function start() {
    if(!state) {
        state=true
        if(moonlight!=null) {
            moonlight.kill();
            moonlight = null;
        }
        if(vh!=null) {
            vh.kill();
            vh = null;
        }
        moonlight = spawn("moonlight",["stream","-1080"]);
        vh = spawn("/home/pi/gamestream/usb/vhusbdarm",["-c","/home/pi/gamestream/usb/config.ini"]);
        console.log("started");
    }
}
function stop() {
    if(state) {
        state=false
        if(moonlight!=null) {
            moonlight.kill();
            moonlight = null;
        }
        if(vh!=null) {
            vh.kill();
            vh = null;
        }
        console.log("stopped");
    }
}

//Setup CEC control and renaming
cecClient = spawn("cec-client",["-o","GamestreamPi","-t","p"]);
cecClient.stdout.on("data",function(data) {
    if(data.indexOf(">> source deactivated:")>-1) { //STOP WHEN INPUT SWITCHED FROM PI
        stop();
    }/* else if(data.indexOf(">> source activated:")>-1) { //START WHEN INPUT SWITCHED TO PI
        start();
    }*/ else if(data.indexOf("key pressed: channel down")>-1) { //STOP ON CHANNEL DOWN
        stop();
    } else if(data.indexOf("key pressed: channel up")>-1) { //START ON CHANNEL UP
        start();
    } else if(data.indexOf("power status changed from 'on'")>-1) { //STOP ON POWER OFF
        stop();
    } else if(data.indexOf("key pressed: up")>-1) { //UP
        robotjs.keyTap("up");
    } else if(data.indexOf("key pressed: right")>-1) { //RIGHT
        robotjs.keyTap("right");
    } else if(data.indexOf("key pressed: down")>-1) { //DOWN
        robotjs.keyTap("down");
    } else if(data.indexOf("key pressed: left")>-1) { //LEFT
        robotjs.keyTap("left");
    } else if(data.indexOf("key pressed: select")>-1) { //SELECT
        robotjs.keyTap("enter");
    } else if(data.indexOf("key pressed: 0")>-1) { //SHUTDOWN ON KEY 0
        spawn("shutdown",["-h","now"]);
    } else if(data.indexOf("key pressed: 9")>-1) { //REBOOT ON KEY 9
        spawn("shutdown",["-r","now"]);
    } else if(data.indexOf("key pressed: 1")>-1) { //UPDATE FROM GITHUB
        spawn("git",["pull"],{cwd:"/home/pi/gamestream/moonlight_embeddedd_control",env:process.env});
    }
});

//Setup http control
module.exports = function(app,express) {

    app.use(express.static("./servers/root/www"));
    app.get("/on",function(req,res) {
        start();
        res.send("<script>alert(\"Successfully started!\");location.assign(\"/\")</script>");
    });
    app.get("/off",function(req,res) {
        stop();
        res.send("<script>alert(\"Successfully stopped!\");location.assign(\"/\")</script>");
    });

}
