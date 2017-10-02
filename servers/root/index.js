const { spawn } = require('child_process');

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
//>> source deactivated:
//>> source activated:
//key pressed: channel down
//key pressed: channel up
cecClient = spawn("cec-client",["-o","GamestreamPi","-t","p"]);
cecClient.stdout.on("data",function(data) {
    if(data.indexOf(">> source deactivated:")>-1) {
        stop();
    } else if (data.indexOf(">> source activated:")>-1) {
        start();
    } else if(data.indexOf("key pressed: channel down")>-1) {
        stop();
    } else if (data.indexOf("key pressed: channel up")>-1) {
        start();
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
