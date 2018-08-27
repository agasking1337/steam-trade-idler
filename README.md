# node-steam-trade-farm 

This is a Steam Trade BOT, that takes 2 of your accounts, and makes trades in order to bump up 'Trades Done' on your Steam Profile.

## Getting Started
For you to get started you need the following
```
NODEJS
NPM Package Installer
Your Identity Secret
Your Shared Secret
```

### Installing

First off get your Identity Secret, and Shared Secret. Read this Thread here (https://forums.backpack.tf/index.php?/topic/46354-guide-how-to-find-the-steam-identity_secret-on-an-android-phone/)

Or use SteamDesktopAuthenticator (https://github.com/Jessecar96/SteamDesktopAuthenticator.git)
Enter the SDA folder in the maFiles folder open the file that has your SteamID name and look for Identity Secret and Shared Secret code.


Fill in config.json

After this open console, and write the following.
```
mkdir steam-tradeidle-master
npm install steam-user
npm install steam-tradeoffer-manager
npm install steamcommunity
npm install steam-totp
npm install fs

```

After this make way to this directory, and drop in the code.
Once this is complete type the following into Command Prompt.

```
cd steam-trade-idler
node index.js
```
Or make a batch file where you put the following command
```
@echo off
color 2
node index.js
pause
```
And save as start.bat in steam-trade-idle folder.
