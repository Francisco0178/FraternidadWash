var express       = require('express');
var app           = express();
var http          = require('http').Server(app);
var io            = require('socket.io')(http);
var MongoClient   = require('mongodb').MongoClient;
var assert        = require('assert');
var bodyParser    = require('body-parser');
var cookieParser  = require('cookie-parser');
var fs            = require('fs');
var imgur         = require('imgur-node-api');
var path          = require('path');
var busboy        = require('connect-busboy');
var shortid       = require('shortid');
var ObjectID      = require('mongodb').ObjectID;
var timeout       = require('connect-timeout');

var mongoURL      = process.env.OPENSHIFT_MONGODB_DB_URL || 'mongodb://localhost:27017/fraternidadwash';

var port          = process.env.OPENSHIFT_NODEJS_PORT || 8080 ;
var year          = 2016;
var carreras      = JSON.parse(fs.readFileSync(__dirname + '/public/json/carreras.json', 'utf8'));


//Conectar con base de Datos Mongo
MongoClient.connect(mongoURL, function(err, db) {

  assert.equal(null, err);
  console.log("Conectado a Mongo");

  var usersDB = db.collection('users');
  var photosDB = db.collection('photos');
  var publicationsDB = db.collection('publications');

  app.use(express.static(__dirname + '/public'));
  app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
  app.use(bodyParser.json({limit: '50mb'}));
  app.use(cookieParser());
  app.use(busboy());
  app.use(timeout(120000));

  imgur.setClientID("a4890278a765a8e");

  http.listen(port, function(){
    console.log('Escuchando en el puerto: ' + port);
  });


  /*
  - - - - - - - - - - - - - - - - -
  - - - - - -  POSTS  - - - - - -
  - - - - - - - - - - - - - - - - -
  */

  //Login
  app.post('/login', function (req, res) {
    usersDB.find({$and:[{email:req.body.email},{pass:req.body.pass}]}).toArray(function(err,docs){
      assert.equal(err, null);
      if(docs.length == 0){
        res.send("Contraseña o correo incorrecto(s)");
      }
      else{
        res.send(true);
      }
    });
  });

  //Obtener mis datos
  app.post('/getMyData', function (req, res) {
    isLogged(req.cookies,res,function(ans){
      if(ans != false){
        ans.carreras = carreras;
        res.send(ans);
      }
    });
  });

  //Registro Inicial
  app.post('/register', function (req, res) {

    if(!('email' in req.body && 'pass' in req.body && 'pass1' in req.body)){
      res.send("Ha ocurrido un error");
      return;
    }

    var email = req.body.email.toLowerCase();
    var pass = req.body.pass;

    if(email.split("@")[1] != "alumnos.uach.cl" || !isValidEmailAddress(email)){
      res.send("Debes ingresar tu correo institucional");
      return;
    }
    if(pass != req.body.pass1){
      res.send("Las contraseñas no coinciden");
      return;
    }
    if(pass.length < 5){
      res.send("La contraseña debe contener mínimo 5 caracteres");
      return;
    }

    usersDB.find({email:email}).toArray(function(err,docs){
      assert.equal(err, null);
      if(docs.length != 0){
        res.send("Ya existe un usuario registrado con este correo");
        return;
      }
      else{
        usersDB.insert({
          fname:null,
          lname:null,
          email:email,
          pass:pass,
          followers:[],
          following:[],
          blockedBy:[],
          chats:[],
          photos:[],
          events:[],
          questions:[],
          groups:[],
          askpass:5,
          publications:[],
          yearIn:null,
          birthdate:null,
          profileImage:null,
          city:null,
          career:null,
          tutorials:{initial:false,profile:false,users:false,questions:false,publications:false,documents:false,events:false},
          status:"incomplete"
        },function(err,result){
          assert.equal(err, null);
          console.log("Nuevo usuario registrado");
          res.send(true);
        });
      }
    });
  });

  //Completar Registro
  app.post('/completeRegister', function (req, res) {
    isLogged(req.cookies,res,function(ans){
      if(ans != false){
        var $ = req.body;
        if(!('fname' in $ && 'lname' in $ && 'city' in $ && 'career' in $ && 'yearIn' in $ && 'year' in $ && 'month' in $ && 'day' in $)){
          res.send("Ha ocurrido un error");
          return;
        }
        if(!isValidName($.fname)){
          res.send({status:false,msg:"Nombre no permitido."});
          return;
        }
        if(!isValidName($.lname)){
          res.send({status:false,msg:"Apellido no permitido."});
          return;
        }
        if(!($.city in carreras)){
          res.send({status:false,msg:"Selecciona tu ciudad."});
          return;
        }
        if(!($.city in carreras)){
          res.send({status:false,msg:"Selecciona tu ciudad."});
          return;
        }
        if(!($.career <= carreras[$.city].length && $.career >= 0) || $.career == null){
          res.send({status:false,msg:"Selecciona tu carrera."});
          return;
        }
        if($.yearIn >= year || $.yearIn <= 1920){
          res.send({status:false,msg:"Selecciona el año de ingreso."});
          return;
        }
        if($.day >= 31 || $.day <= 0){
          res.send({status:false,msg:"Selecciona el día de tu nacimiento."});
          return;
        }
        if($.month >= 12 || $.month <= 0){
          res.send({status:false,msg:"Selecciona el mes de tu nacimiento."});
          return;
        }
        if($.year >= year - 18 || $.year <= 1920 - 18){
          res.send({status:false,msg:"Selecciona el año de tu nacimiento."});
          return;
        }
        var d = new Date($.year, $.month, $.day);
        usersDB.update({'email':ans.email},
          {$set:
            {
            'fname':$.fname,
            'lname':$.lname,
            'career':$.career,
            'city':$.city,
            'yearIn':$.yearIn,
            'birthdate':d,
            "tutorials.initial": true,
            'status':"ok"
          }
          },function(err, doc){
            if (err) throw err;
            ans.fname = $.fname;
            ans.lname = $.lname;
            ans.career = $.career;
            ans.city = $.city;
            ans.yearIn = $.yearIn;
            ans.birthdate = d;
            ans.tutorials.initial = true;
            ans.status = "ok";
            ans.carreras = carreras;
            res.send({status:true,msg:ans});
        });
      }
    });
  });

  //Subir imagen
  app.post('/uploadPhoto', function (req, res) {
    isLogged(req.cookies,res,function(docs){
      var fullImg = req.body.img1.replace(/^data:image\/png;base64,/, "");
      var miniImg = req.body.img2.replace(/^data:image\/png;base64,/, "");
      var fullPath = __dirname + '/tmp/' + shortid.generate() + ".png";
      var miniPath = __dirname + '/tmp/' + shortid.generate() + ".png";
      var link1,link2;
      fs.writeFile( fullPath, fullImg, 'base64', function(err) {
        imgur.upload( fullPath, function (err,resp1) {
          fs.unlink( fullPath ,function(){
            link1 = resp1.data.link;
            fs.writeFile( miniPath, miniImg, 'base64', function(err) {
              imgur.upload( miniPath, function (err,resp2) {
                fs.unlink( miniPath ,function(){
                  link2 = resp2.data.link;
                  photosDB.insert({
                    fullUrl:link1,
                    miniUrl:link2,
                    uploader:docs._id
                  },function(err,result){
                    assert.equal(err, null);
                     publicationsDB.insert({
                       message:null,
                       tagged:[],
                       photos:[result.ops[0]._id],
                       creator:docs._id,
                       likes:[],
                       comments:[],
                       shared:[],
                       type:"profileImage"
                     },function(err,result1){
                       usersDB.update(
                          { _id: docs._id},
                          { $push:{"publications":result1.insertedIds[0],"photos":result.ops[0]._id}, $set: { "profileImage":result.ops[0]._id},
                        },
                        function(err, result2){
                          res.send({publication:result1.ops[0]._id,images:result.ops[0]._id});
                          console.log("Foto subida.");
                        });
                     });
                  });
                });
              });
            });
          });
        });
      });
    });
  });

  //Obtener publicaciones desde IDs
  app.post('/getPublications', function (req, res) {
    isLogged(req.cookies,res,function(ans){
      if(ans != false){
         getPublicationsFromID(req.body,function(data){
            res.send(data);
            console.log("Publicación enviada");
        });
      }
    });
  });

  //Obtener imagenes desde IDs
  app.post('/getImages', function (req, res) {
    isLogged(req.cookies,res,function(ans){
      if(ans != false){
         getImagesFromID(req.body,function(data){
            res.send(data);
            console.log("Foto enviada");
        });
      }
    });
  });


  //Obtener usuarios desde IDs
  app.post('/getUsers', function (req, res) {
    isLogged(req.cookies,res,function(ans){
      if(ans != false){
         getUsersFromID(req.body,function(data){
            res.send(data);
            console.log("Usuario enviado");
        });
      }
    });
  });

  //Obtener usuario de URL
  app.get('/user/:user', function (req, res) {
    isLogged(req.cookies,res,function(docs){
      if(docs == false){
        res.redirect('/404');
      }
      else{
        res.sendFile("public/menu.html", {root: __dirname });
      }
    });
  });

  //Mostrar 404
  app.get('/404', function (req, res) {
    console.log("404");
    res.sendFile("public/404.html", {root: __dirname });
  });

  //Logout
  app.get('/logout', function (req, res) {
    res.sendFile("public/logout.html", {root: __dirname });
  });

  //Login window
  app.get('/login', function (req, res) {
    res.sendFile("public/login.html", {root: __dirname });
  });

  //Evento al obtener el dominio solo
  app.get('/', function (req, res) {
    isLogged(req.cookies,res,function(docs){
      if(docs != false){
        res.redirect('/user/'+req.cookies.email.split("@")[0]);
      }
      else{
        res.redirect('/login');
      }
    });
  });






  /*
  - - - - - - - - - - - - - - - - -
  - - - - - - Funciones - - - - - -
  - - - - - - - - - - - - - - - - -
  */


  //Poner en mayúscula la primera letra
  String.prototype.capitalizeFirstLetter = function() {
      return this.charAt(0).toUpperCase() + this.slice(1);
  }

  //Keys de un objeto
  function objectSize(object){
    var count = 0;
    for(var i in object){
      count++;
    }
    return count;
  }

  //Obtener imagenes desde _id
  function getImagesFromID(photos,callback){
    if(photos.lenght == 0){
      callback([]);
      return;
    }
    photosDB.find({_id:{$in:toObjectID(photos)}}).toArray(function(err,docs){
      for(var doc in docs){
        docs[doc].creationTime = ObjectID(docs[doc]._id).getTimestamp();
      }
      callback(docs);
    });
  }

  //Obtener publicaciones desde _id
  function getPublicationsFromID(publications,callback){
    if(publications.lenght == 0){
      callback([]);
      return;
    }
    else{
      publicationsDB.find({_id:{$in:toObjectID(publications)}}).toArray(function(err,docs){
        for(var doc in docs){
          docs[doc].creationTime = ObjectID(docs[doc]._id).getTimestamp();
        }
        callback(docs);
      });
    }
  }

  //Obtener usuarios desde _id
  function getUsersFromID(users,callback){
    if(users.lenght == 0){
      callback([]);
      return;
    }
    else{
      usersDB.find({_id:{$in:toObjectID(users)}}).toArray(function(err,docs){
        delete docs.pass;
        delete docs.chats;
        callback(docs);
      });
    }
  }

  //Detecta si un email es válido
  function isValidEmailAddress(emailAddress) {
    if(emailAddress.length > 40) return false;
    var pattern = new RegExp(/^(("[\w-+\s]+")|([\w-+]+(?:\.[\w-+]+)*)|("[\w-+\s]+")([\w-+]+(?:\.[\w-+]+)*))(@((?:[\w-+]+\.)*\w[\w-+]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][\d]\.|1[\d]{2}\.|[\d]{1,2}\.))((25[0-5]|2[0-4][\d]|1[\d]{2}|[\d]{1,2})\.){2}(25[0-5]|2[0-4][\d]|1[\d]{2}|[\d]{1,2})\]?$)/i);
    return pattern.test(emailAddress);
  }

  //Detecta si es un nombre válido
  function isValidName(name){
    if(name.length < 3 || name.length > 15) return false;
    return /^[a-zA-Z]+$/.test(name);
  }

  //Objectizar IDs
  function toObjectID(ids){
    for(var id in ids){
      ids[id] = ObjectID(ids[id]);
    }
    return ids;
  }
  //Checkear si el usuario ha iniciado sesión
  function isLogged(cookies,res,callback){
    if(objectSize(cookies) == 0){
      callback(false);
      return;
    }
    else{
      usersDB.find({$and:[{email:cookies.email},{pass:cookies.pass}]}).toArray(function(err,docs){
        assert.equal(err, null);
        if(docs.length != 1){
          callback(false);
          return;
        }
        else{
          callback(docs[0]);
          return;
        }
      });
    }
  }
  app.get("*", function(req, res) {
    res.redirect("/404");
  });
  io.on('connection', function(socket){

  console.log('Se ha conectado un usuario!');

  socket.on('disconnect', function(){
    console.log('Se ha desconectado un usuario :(');
  });

  socket.on('mensajeEvento', function(msg){
    console.log('Mensaje: ' + msg);
    io.emit('rec',msg);
  });

  });
});
