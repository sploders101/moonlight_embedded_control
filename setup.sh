#!/usr/bin/env bash
echo "This script is intended to be used with raspbian jessie lite. If you are running stretch or later, this may not work for you. Please press ^c within 5 seconds and refer to the readme."
sleep 5s
echo "Creating gamestream directory..."
mkdir /home/pi/gamestream
cd /home/pi/gamestream
echo "Installing git, lightdm, and lxde..."
apt-get install git lightdm lxde
echo "Installing nvm and node..."
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.5/install.sh | bash
nvm install 8.6.0
nvm use 8.6.0
echo "Cloning source..."
git clone https://github.com/sploders101/moonlight_embedded_control.git
#echo "If using raspbian stretch, try adding \"deb http://mirrordirector.raspbian.org/raspbian/ jessie main contrib non-free rpi\" to /etc/apt/sources.list"
echo "Adding moonlight-embedded's repository..."
echo "deb http://archive.itimmer.nl/raspbian/moonlight jessie main" >> /etc/apt/sources.list
wget http://archive.itimmer.nl/itimmer.gpg
apt-key add itimmer.gpg
echo "Installing moonlight-embedded"
apt-get update
apt-get install moonlight-embedded
echo "Setting up Virtualhere..."
mkdir usb
cd /home/pi/gamestream/usb
wget http://www.virtualhere.com/sites/default/files/usbserver/vhusbdarm
chmod +x ./vhusbdarm
echo "AutoAttachToKernel=0\nClaimPorts=1" >> ./config.ini
echo "Adding Startup File"
echo "[Desktop Entry]\nEncoding=UTF-8\nName=\"Start Node Control\"\nGenericName=\"Start Node Remote Control\"\nExec=sudo lxterminal -e \"node /home/pi/gamestream/moonlight_embedded_control/masterServer.js\"\nIcon=lxterminal\nType=Application" >> /home/pi/.config/autostart/server.desktop
echo "Now pairing with your PC..."
moonlight pair
