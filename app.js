var path = require('path');
var express = require('express');
//var hbs = require('hbs');
var fs = require('fs');
var app = express();
var session = require('express-session');
var async = require('async');
var simplenote = require('simplenote');
var org2html = require('./api/org2html');

var rootDir = __dirname;

function isEmptyObject(obj) {
    for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            return false;
        }
    }
    return true;
}

//app.set('view engine', 'hbs');
app.set('views', path.join(rootDir, 'templates'));

app.use('/images', express.static(path.join(rootDir, 'static', 'images')));
app.use('/css', express.static(path.join(rootDir, 'static', 'css')));
app.use('/js', express.static(path.join(rootDir, 'static', 'js')));

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded());

app.use(session({
    secret: "Jungle2015"
}))


app.get('/api/getNotesWithContent', function (req, res) {
    email = "test"
    pass = "testpass"

    var note = simplenote(email, pass);
    note.all(function(err, notes) {
        if (err) throw err;
        var keys = notes.select('tags.length');
        var inserted = 0;
        keys = keys.slice(0, 10)
        keys.forEach(function (key, index, arr) {
            note.get(key.key, function(err, note) {
                key.content = note.content;
                key.title = note.content.split("\n")[0];
                key.orgRender = org2html(note.content);
                if(++inserted == keys.length){
                    res.setHeader('Content-Type', 'application/json');
                    res.setHeader('Access-Control-Allow-Origin', '*');
                    return res.send(JSON.stringify(keys));
                }
            });
        });
        
        // keys.forEach(function (key, index, arr) {
        //     note.get(key.key, function(err, note) {
        //         console.log(note.content);
        //         key.content = note.content;
        //         key.title = note.content.split("\n")[0];
        //         if(index == keys.length - 1){
        //             console.log("ok");
        //             res.setHeader('Content-Type', 'application/json');
        //             res.setHeader('Access-Control-Allow-Origin', '*');
        //             return res.send(JSON.stringify(keys));
        //         }
        //     });
        // });

        
        // async.eachSeries(keys, function (key, callback, next) {
        //     note.get(key.key, function(err, note) {
        //         console.log(key.key)
        //         console.log(note.content)
        //         key.content = note.content;
        //         key.title = note.content.split("\n")[0];
        //         return next()
        //     });
        // }, function (err) { // DONE
        //     console.log("DONE");
        //     if (err) { throw err; }
        //     res.setHeader('Content-Type', 'application/json');
        //     res.setHeader('Access-Control-Allow-Origin', '*');
        //     return res.send(JSON.stringify(keys));
        // });
    });
});

app.get('/api/getNotes', function (req, res) {
    email = "test"
    pass = "testpass"

    var note = simplenote(email, pass);
    note.all(function(err, notes) {
        if (err) throw err;
        var keys = notes.select('tags.length');
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        return res.send(JSON.stringify(keys));
    });
});

app.post('/api/org2html', function (req, res) {
    orgCode = req.body.orgCode || "**Hello World !**";
    console.log(orgCode);
    // return res.send(org2html(orgCode));
    return res.send(org2html(orgCode));
});

app.get('/api/getNote/:key', function (req, res) {
    email = "vuquangtam1994@gmail.com"
    pass = "asd"
    var key = req.params.key;
    var note = simplenote(email, pass);
    note.get(key, function(err, note) {
        if (err) throw err;
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        return res.send(JSON.stringify(note));
    });
});

app.get('/', function (req, res) {
    if (!req.session.login) {
        return res.render("note", {note: "", login: req.session.login});
    }
    db.getAllNotes(function(result) {
        return res.render("note", {note: result, login: req.session.login});
    });
});

app.post('/login', function(req, res) {
    username = req.body.username;
    password = req.body.password;
    db.checkPassword(username, password, function(result){
        console.log(result);
        if (result) {
            req.session.login = true;
            result = { message: "Login Success!", status: true };
        }
        else {
            req.session.login = false;
            result = { message: "Username or password is incorrect!", status: false };
        }
        res.setHeader('Content-Type', 'application/json');
        return res.send(JSON.stringify(result));
    });
})

app.get('/logout', function (req, res) {
    if (req.session.login) {
        req.session.destroy();
    }
    return res.redirect("/");
});

module.exports = app

