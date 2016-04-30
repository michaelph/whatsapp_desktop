var app = require('app');
var BrowserWindow = require('browser-window');
var Menu = require('menu');
var Path = require('path');
var Tray = require('tray');
var fs = require('fs');
var notifier = require('node-notifier');
var player = require('play-sound')(opts = {});
var async = require('async');



var mainWindow = null;
var aboutWindow = null;
var prefsWindow = null;
var iconPath = Path.join(__dirname, 'img', '_whatsapp.png');
var notifIconPath = Path.join(__dirname, 'img', 'whatsapp_red.png');
var appTray = null;
var newMessages = null;
var  isPlayingTone = false;


app.on('window-all-closed', function() {
    if (process.plataform != 'darwin') {
        app.quit();
    }
});

app.on('ready', function() {
    try {
        async.whilst(
            function() {
                if(newMessages > 0 && isPlayingTone == false)
                    return true;
                return false;
            },
            function(callback) {
                isPlayingTone = true;
                player.play('media/whatsappme.mp3', function(err) {
                    isPlayingTone = false;
                    console.log("Finished playing sound");
                });
                setTimeout(function() {
                    callback(null, count);
                }, 1000);
            },
            function(err, n) {
                // 5 seconds have passed, n = 5
            }
        );

        mainWindow = new BrowserWindow({
            width: 1000,
            height: 650,
            icon: iconPath,
            'node-integration': false,
            show: false,

            title: 'whatsapp desktop for linux'
        });
        Menu.setApplicationMenu(null);
        aboutWindow = new BrowserWindow({
            width: 600,
            height: 400,
            show: false,

        });
        prefsWindow = new BrowserWindow({
            width: 600,
            height: 400,
            show: false,

        });
        aboutWindow.loadUrl('file://' + __dirname + '/about.html');
        prefsWindow.loadUrl('file://' + __dirname + '/preferences.html');
        appTray = new Tray(iconPath);
        mainWindow.loadUrl('https://web.whatsapp.com/', {
            userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.80 Safari/537.36'
        });
        var contextMenu = Menu.buildFromTemplate([{
            label: 'Hide',
            type: 'radio',
            checked: true,
            click: function() {
                mainWindow.hide();
            }
        }, {
            label: 'Show',
            type: 'radio',
            click: function() {
                mainWindow.show();
            }
        }, {
            label: 'Quit',
            type: 'normal',
            click: function() {
                prefsWindow.destroy();
                aboutWindow.destroy();
                mainWindow.destroy();
            }
        }, {
            label: 'Preferences',
            type: 'normal',
            click: function() {
                prefsWindow.show();
            }
        }, {
            label: 'About',
            type: 'normal',
            click: function() {
                aboutWindow.show();
            }
        }]);
        appTray.setToolTip('Whatsapp desktop appplication');
        appTray.setContextMenu(contextMenu);

        appTray.on('clicked', function() {
            if (mainWindow.isVisible()) {
                mainWindow.hide()
            } else {
                mainWindow.show();
            }
        });

        //notifications
        notifier.notify({
            title: 'Whatsapp',
            message: 'Whatsapp desktop for Linux is running',
            icon: iconPath, // absolute path (not balloons) 
            sound: true, // Only Notification Center or Windows Toasters 
            wait: false // wait with callback until user action is taken on notification 
        }, function(err, response) {
            // response is response from notification 
        });

        //mainWindow.openDevTools();
        mainWindow.on('close', function(event) {

            if (event.sender.constructor.name == "BrowserWindow") {

                mainWindow.hide();
                event.preventDefault();
                contextMenu.items[0].checked = true;
                appTray.setContextMenu(contextMenu);
            } else {

                //console.log(event.sender.constructor.name);
            }
        });

        mainWindow.on('page-title-updated', function(event, title) {

            newMessages = title.match(/\((\d+)\)/);
            newMessages = newMessages ? newMessages[1] : '';
            if (newMessages > 0) {
                appTray.setImage(notifIconPath);
                mainWindow.setTitle('(' + newMessages + ')' + ' Whatsapp desktop for linux');
                event.preventDefault();
            } else {
                appTray.setImage(iconPath);
                mainWindow.setTitle('Whatsapp desktop for linux');
                event.preventDefault();
            }

        });

        mainWindow.on('closed', function() {
            mainWindow = null;

        });

        prefsWindow.on('close', function(event) {
            prefsWindow.hide();
            event.preventDefault();
        });

        aboutWindow.on('close', function(event) {
            aboutWindow.hide();
            event.preventDefault();
        });


        mainWindow.webContents.on('dom-ready', function() {
            //console.log('dom-ready');
            mainWindow.setTitle('Whatsapp desktop for linux');

        });
    } catch (error) {
        console.log(error.stack + ' ' + error.message)
    }


});