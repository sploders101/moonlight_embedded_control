//Configuration
const serverMac = "70:85:C2:3C:60:77";
//Import libraries
const { spawn } = require('child_process');
const robotjs = require("robotjs");
const wol = require("wol");

//Declare global-scope variables
let moonlight;
let vh;
let cecClient;
let state = false;

//Start GamestreamClient
function start() {
    wol.wake(serverMac,function(data) {
        console.log(data);
    });
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
//Stop GamestreamClient
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
/*

#: Disabled

#Change input to pi: start GamestreamClient
Change input from pi: stop GamestreamClient
Turn off TV: stop GamestreamClient

CH+: start GamestreamClient
CH-: stop GamestreamClient

Remote DPad: Arrow keys and enter

0: Shutdown Pi
1: Update client from GitHub. Manual server restart required. (Should automatically merge config files)
9: Restart Pi

*/
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
    } else if(data.indexOf("key pressed: 1")>-1) { //UPDATE FROM GITHUB ON KEY 1
        console.log("updating...");
        spawn("git",["pull"],{cwd:"/home/pi/gamestream/moonlight_embedded_control",env:process.env});
    }
});

//Setup http control
/*
    /on: start GamestreamClient
         turn on TV
         switch input
    /off: stop GamestreamClient
         turn off TV
    /tvon
         turn on tv
    /tvoff
         turn off tv
*/
module.exports = function(app,express) {

    app.use(express.static("./servers/root/www"));
    app.get("/on",function(req,res) {
        start();
        cecClient.stdin.write("on\n");
        cecClient.stdin.write("as\n");
        res.send("<script>alert(\"Successfully started!\");/*location.assign(\"/\")*/</script>");
    });
    app.get("/off",function(req,res) {
        stop();
        cecClient.stdin.write("standby 0\n");
        res.send("<script>alert(\"Successfully stopped!\");/*location.assign(\"/\")*/</script>");
    });
    app.get("/tvon",function(req,res) {
        cecClient.stdin.write("on 0\n");
    });
    app.get("/tvoff",function(req,res) {
        cecClient.stdin.write("standby 0\n");
    });

}
