var app = require('app');
var BrowserWindow = require('browser-window');
var Menu = require('menu');
var Path = require('path');
var Tray = require('tray');
var fs = require('fs');
var notifier = require('node-notifier');
//var bootstrap_css = fs.readFileSync('./node_modules/bootstrap/dist/css/bootstrap.min.css', "utf8");

//var font_awesome_css = fs.readFileSync('./css/font-awesome/css/font-awesome.min.css', "utf8");
//console.log(file);

require('crash-reporter').start();
var mainWindow = null;
var aboutWindow = null;
var prefsWindow = null;
var iconPath = Path.join(__dirname, 'img', '_whatsapp.png');
var notifIconPath = Path.join(__dirname, 'img', 'whatsapp_red.png');
var appTray = null;


app.on('window-all-closed', function () {
    if (process.plataform != 'darwin') {
        app.quit();
    }
});

app.on('ready', function () {
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 650,
        icon: iconPath,
        'node-integration': false,
        show: false,
        //frame: false
        title: 'whatsapp desktop for linux'
    });
    Menu.setApplicationMenu(null);
    aboutWindow = new BrowserWindow({
        width: 600,
        height: 400,
        show: false,
        //frame: false
    });
    prefsWindow = new BrowserWindow({
        width: 600,
        height: 400,
        show: false,
        //frame: false
    });
    aboutWindow.loadUrl('file://' +__dirname+ '/about.html');
    prefsWindow.loadUrl('file://' +__dirname+ '/preferences.html');
    appTray = new Tray(iconPath);
    mainWindow.loadUrl('https://web.whatsapp.com/', {
        userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.80 Safari/537.36'
    }
        );
    var contextMenu = Menu.buildFromTemplate([
        { label: 'Hide', type: 'radio', checked: true, click: function () { mainWindow.hide(); } },
        { label: 'Show', type: 'radio', click: function () { mainWindow.show(); } },
        { label: 'Quit', type: 'normal', click: function () {
            prefsWindow.destroy();
            aboutWindow.destroy(); 
            mainWindow.destroy(); 
            }},
        { label: 'Preferences', type: 'normal', click: function () { prefsWindow.show(); } },
        { label: 'About', type: 'normal', click: function () { aboutWindow.show(); } }
    ]);
    appTray.setToolTip('Whatsapp desktop appplication');
    appTray.setContextMenu(contextMenu);
    
    //notifications
    notifier.notify({
    title: 'Whatsapp',
    message: 'Whatsapp desktop for Linux is running',
    icon: iconPath, // absolute path (not balloons) 
    sound: true, // Only Notification Center or Windows Toasters 
    wait: false // wait with callback until user action is taken on notification 
    }, function (err, response) {
  // response is response from notification 
    });


    //mainWindow.openDevTools();
    mainWindow.on('close', function (event) {

        if (event.sender.constructor.name == "BrowserWindow") {
            //console.log("BrowserWindow");
            mainWindow.hide();
            event.preventDefault();
            contextMenu.items[0].checked = true;
            appTray.setContextMenu(contextMenu);
        } else {
            //console.log("Not OK");
            //console.log(event.sender.constructor.name);
        }
    });

    mainWindow.on('page-title-updated', function (event, title) {
        //console.log(event);
        var count = title.match(/\((\d+)\)/);
        count = count ? count[1] : '';
        if (count > 0) {
            appTray.setImage(notifIconPath);
            mainWindow.setTitle('('+count+')'+' whatsapp desktop for linux');
            event.preventDefault();
        } else {
            appTray.setImage(iconPath);
            mainWindow.setTitle('whatsapp desktop for linux');
            event.preventDefault();
        }

    });

    mainWindow.on('closed', function () {
        mainWindow = null;
        //aboutWindow = null;
    });

    prefsWindow.on('close', function (event) {
        prefsWindow.hide();
        event.preventDefault();
    });

    aboutWindow.on('close', function (event) {
        aboutWindow.hide();
        event.preventDefault();
    });
    
    
    var htmlNav =  "<div class='navbar-header'>";
    htmlNav +=  "<a class='navbar-brand' href='#'>Whatsapp for Linux</a></div>";
    htmlNav += "<ul class= 'nav navbar-top-links navbar-right'  style= 'margin: 15px;' >";
    htmlNav +=  "<li><a id='close' href='#' style='color:#4FC3F7;'><strong>Close</strong></a></i></ul>";
    
    var jscode = "var nav = document.createElement('nav');\n"    
    jscode += "nav.className = 'navbar navbar-default navbar-static-top';\n"
    jscode += "nav.style.marginBottom = '0';\n"
    jscode += "nav.style.webkitAppRegion = 'drag';\n"
    jscode += "nav.setAttribute('role', 'navigation');\n"
    jscode += "nav.innerHTML = " + '"'+htmlNav+'"' + "\n;"
    jscode += "document.body.insertBefore(nav, document.body.childNodes[0]);\n"
    
    mainWindow.webContents.on('dom-ready', function(){
       //console.log('dom-ready');
       mainWindow.setTitle('whatsapp desktop for linux');
        //mainWindow.webContents.insertCSS(bootstrap_css);
        //mainWindow.webContents.insertCSS(font_awesome_css);
        //mainWindow.webContents.executeJavaScript(jscode);
        
    });
    
    
});
