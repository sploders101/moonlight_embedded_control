const { spawn } = require('child_process');

let moonlight;
let vh;

module.exports = function(app,express) {

    app.use(express.static("./servers/root/www"));
    app.get("/on",function(req,res) {
        if(moonlight!=null) {
            moonlight.kill();
            moonlight = null;
        }
        if(vh!=null) {
            vh.kill();
            vh = null;
        }
        moonlight = spawn("moonlight",["stream"]);
        vh = spawn("/home/pi/gamestream/usb/vhusbdarm"["-c /home/pi/gamestream/usb/config.ini"]);

        res.send("<script>alert(\"Successfully started!\");location.assign(\"/\")</script>");
    });
    app.get("/off",function(req,res) {
        if(moonlight!=null) {
            moonlight.kill();
            moonlight = null;
        }
        if(vh!=null) {
            vh.kill();
            vh = null;
        }
        res.send("<script>alert(\"Successfully stopped!\");location.assign(\"/\")</script>");
    });

}
