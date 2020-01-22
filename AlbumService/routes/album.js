var monk = require('monk');
var db = monk('localhost:27017/assignment2');
var cookieParser = require('cookie-parser');
var express = require('express');
var router = express.Router();
var fs = require('fs');
var cors = require('cors');

router.use(cookieParser());

var corsOptions = {

    origin: 'http://localhost:3000',

    credentials: true

}


router.options("/*", cors(corsOptions), function (req, res) {
});

router.use(express.static('public'), cors(corsOptions), function (req, res, next) {
    req.db = db;
    next();
})

router.get('/init', cors(corsOptions), function (req, res) {
    console.log(11);
    var db = req.db;
    var collection = db.get('userList');
    if (req.cookies.userID) {
        collection.find({ "_id": req.cookies.userID }, {}, function (err, docs) {
            if (err == null && docs.length > 0) {
                var selfusername = docs[0]['username'];
                var friendsnames = docs[0]['friends'];
                var friends = new Array();
                for (var i = 0; i < friendsnames.length; i++) {
                    var friendname = friendsnames[i];
                    collection.find({ "username": friendname }, {}, function (err2, docs2) {
                        if (err2 == null && docs2.length > 0) {
                            friends.push({
                                friendname: docs2[0]['username'],
                                friendsid: docs2[0]['_id']
                            })
                            if (friends.length == friendsnames.length) {
                                var response = {
                                    selfid: req.cookies.userID,
                                    selfusername: selfusername,
                                    friends: friends
                                }
                                res.json(response);
                            }
                        } else res.send(err2);
                    })
                }
            } else res.send(err);
        })
    } else {
        res.send("");
    }
});

router.post('/login', cors(corsOptions), express.urlencoded({ extended: true }), function (req, res) {
    console.log(11);
    var name = req.body.userName;
    var pwd = req.body.password;
    var db = req.db;
    var collection = db.get('userList');
    collection.find({ 'username': name, 'password': pwd }, {}, function (err, docs) {
        if (err == null && docs.length > 0) {
            var selfusername = docs[0]['username'];
            var selfuserID = docs[0]['_id'];
            var friendsnames = docs[0]['friends'];
            var friends = new Array();
            for (var i = 0; i < friendsnames.length; i++) {
                var friendname = friendsnames[i];
                collection.find({ "username": friendname }, {}, function (err2, docs2) {
                    if (err2 == null && docs2.length > 0) {
                        friends.push({
                            friendname: docs2[0]['username'],
                            friendsid: docs2[0]['_id']
                        })
                        if (friends.length == friendsnames.length) {
                            var response = {
                                selfid: selfuserID,
                                selfusername: selfusername,
                                friends: friends
                            }
                            var milliseconds = 60 * 60 * 1000;
                            res.cookie('userID', selfuserID, { maxAge: milliseconds });
                            res.json(response);
                        }
                    } else res.send(err2);
                })
            }
        } else res.send("Login failure");
    })
})

router.get('/logout', cors(corsOptions), function (req, res) {
    res.clearCookie('userID');
    res.send("");
});

router.get('/getalbum/:userid', cors(corsOptions), function (req, res) {
    var db = req.db;
    var collection = db.get('photoList');
    var userID = req.params.userid;
    var selfuserID = req.cookies.userID;
    if (userID == "0") {
        collection.find({ 'userid': selfuserID }, { userid: 0 }, function (err, docs) {
            if (err == null && docs.length > 0) {
                res.json(docs);
            } else res.send(err);
        })
    } else {
        collection.find({ 'userid': userID }, { userid: 0 }, function (err, docs) {
            if (err == null && docs.length > 0) {
                res.json(docs);
            } else res.send(err);
        })
    }
})

router.post('/uploadphoto', cors(corsOptions), function (req, res) {
    var db = req.db;
    var collection = db.get('photoList');
    var selfuserID = req.cookies.userID;
    var filename = parseInt(Math.random() * 100 + 10) + ".jpg";
    var filepath = "./public/uploads/" + filename;
    req.pipe(fs.createWriteStream(filepath));
    collection.insert({ url: 'http://localhost:3002/uploads/' + filename, userid: selfuserID, likedby: [] }, function (err, doc) {
        if (err == null && doc != null) {
            var response = {
                _id: doc['_id'],
                url: doc['url']
            }
            res.json(response);
        } else res.send(err);
    })

})

router.delete('/deletephoto/:photoid', cors(corsOptions), function (req, res) {
    var db = req.db;
    var collection = db.get('photoList');
    var photoid = req.params.photoid;
    collection.find({ '_id': photoid }, {}, function (err1, doc1) {
        if (err1 == null && doc1.length > 0) {
            var filepath = "./public/uploads/" + doc1[0]['url'].split("/")[4]
            fs.unlink(filepath, function (err2) {
                if (err2 != null)
                    res.send(err2);
                else {
                    collection.remove({ '_id': photoid }, function (err, doc) {
                        if (err == null) {
                            res.send("");
                        } else res.send(err);
                    });
                }
            })

        } else res.send(err1);
    })
});

router.put('/updatelike/:photoid', cors(corsOptions), function (req, res) {
    var db = req.db;
    var collection1 = db.get('userList');
    var collection = db.get('photoList');
    var photoid = req.params.photoid;
    var selfuserID = req.cookies.userID;

    collection1.find({ _id: selfuserID }, {}, function (err, docs) {
        if (err == null && docs.length > 0) {
            selfusername = docs[0]['username'];
            collection.update({ _id: photoid }, { $push: { likedby: selfusername } }, function (err2, result2) {
                if (err2 == null) {
                    collection.find({ _id: photoid }, {}, function (err3, result3) {
                        if (err3 == null && result3.length > 0) {
                            res.json(result3[0]['likedby']);
                        } else res.send(err3);
                    })
                } else res.send(err2);
            })
        } else res.send(err);
    })
});

module.exports = router;