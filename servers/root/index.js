const { spawn } = require('child_process');

let moonlight;
let vh;
let cecClient;

function start() {
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
}
function stop() {
    if(moonlight!=null) {
        moonlight.kill();
        moonlight = null;
    }
    if(vh!=null) {
        vh.kill();
        vh = null;
    }
}

//Setup CEC control and renaming
//>> source deactivated:
//>> source activated:
cecClient = spawn("cec-client",["-o","GamestreamPi","-t","p"]);
cecClient.stdout.on("data",function(data) {
    if(data.indexOf(">> source deactivated:")>-1) {
        stop();
    } else if (data.indexOf(">> source activated:")>-1) {
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
