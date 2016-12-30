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
var urlParser     = require('url');
var sockets       = new Object();


var mongoURL      = process.env.OPENSHIFT_MONGODB_DB_URL + process.env.OPENSHIFT_APP_NAME || 'mongodb://localhost:27017/fraternidadwash';

var port          = process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || 3002 ;
var ipaddress     = process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1";
var year          = 2016;
var carreras      = JSON.parse(fs.readFileSync(__dirname + '/public/json/carreras.json', 'utf8'));


//Conectar con base de Datos Mongo
MongoClient.connect(mongoURL, function(err, db) {

  console.log(err);
  //assert.equal(null, err);
  console.log("Conectado a Mongo");

  var usersDB         = db.collection('users');
  var photosDB        = db.collection('photos');
  var publicationsDB  = db.collection('publications');
  var chatsDB         = db.collection('chats');
  var commentsDB      = db.collection('comments');


  app.use(express.static(__dirname + '/public'));
  app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
  app.use(bodyParser.json({limit: '50mb'}));
  app.use(cookieParser());
  app.use(busboy());
  app.use(timeout(120000));


  imgur.setClientID("a4890278a765a8e");

  http.listen( port, ipaddress, function() {
    console.log((new Date()) + ' Server is listening on port ' + port);
  });

  /*
  - - - - - - - - - - - - - - - - -
  - - - - - -  POSTS  - - - - - -
  - - - - - - - - - - - - - - - - -
  */

  app.all("*",function(req,res,next){
    res.header('Access-Control-Allow-Origin', "*")
    next();
  });

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
        ans.host = req.get('host');
        ans.carreras = carreras;
        res.send(ans);
      }
    });
  });

  //Cambia datos del usuario
  app.post('/updateUser', function (req, res) {
    isLogged(req.cookies,res,function(ans){
      if(ans != false){
        usersDB.update({email:ans.email,pass:ans.pass},{$set:req.body},function(err,data){
          res.send();
        });
      }
    });
  });
  
  //Bloquear otros usuarios
  app.post('/blockUser', function (req, res) {
    isLogged(req.cookies,res,function(ans){
      if(ans != false){
        usersDB.update({email:ans.email,pass:ans.pass},{$push:{blockedUsers:{$each:req.body}}},function(err,data){
          res.send();
        });
      }
    });
  });

  //Permitir etiquetar en fotos
  app.post('/allowLabel', function (req, res) {
    isLogged(req.cookies,res,function(ans){
      if(ans != false){
        usersDB.update({email:ans.email,pass:ans.pass},{$set:{allowLabel:true}},function(err,data){
          res.send();
        });
      }
    });
  });
  //Prohibir etiquetar en fotos
  app.post('/forbidLabel', function (req, res) {
    isLogged(req.cookies,res,function(ans){
      if(ans != false){
        usersDB.update({email:ans.email,pass:ans.pass},{$set:{allowLabel:false}},function(err,data){
          res.send();
        });
      }
    });
  });

  //Permitir recuperacion por contrasena
  app.post('/allowPass', function (req, res) {
    isLogged(req.cookies,res,function(ans){
      if(ans != false){
        usersDB.update({email:ans.email,pass:ans.pass},{$set:{allowPass:true}},function(err,data){
          res.send();
        });
      }
    });
  });
  //No Permitir recuperacion por contrasena
  app.post('/forbidPass', function (req, res) {
    isLogged(req.cookies,res,function(ans){
      if(ans != false){
        usersDB.update({email:ans.email,pass:ans.pass},{$set:{allowPass:false}},function(err,data){
          res.send();
        });
      }
    });
  });

  //Permitir encontrar a uno por nombre
  app.post('/allowName', function (req, res) {
    isLogged(req.cookies,res,function(ans){
      if(ans != false){
        usersDB.update({email:ans.email,pass:ans.pass},{$set:{allowName:true}},function(err,data){
          res.send();
        });
      }
    });
  });
  //No Permitir encontrar a uno por nombre
  app.post('/forbidName', function (req, res) {
    isLogged(req.cookies,res,function(ans){
      if(ans != false){
        usersDB.update({email:ans.email,pass:ans.pass},{$set:{allowName:false}},function(err,data){
          res.send();
        });
      }
    });
  });

  //Permitir encontrar a uno por carrera
  app.post('/allowCareer', function (req, res) {
    isLogged(req.cookies,res,function(ans){
      if(ans != false){
        usersDB.update({email:ans.email,pass:ans.pass},{$set:{allowCareer:true}},function(err,data){
          res.send();
        });
      }
    });
  });
  //No Permitir encontrar a uno por carrera
  app.post('/forbidCareer', function (req, res) {
    isLogged(req.cookies,res,function(ans){
      if(ans != false){
        usersDB.update({email:ans.email,pass:ans.pass},{$set:{allowCareer:false}},function(err,data){
          res.send();
        });
      }
    });
  });

  //Mostrar fotos a fraternos
  app.post('/showPhotos', function (req, res) {
    isLogged(req.cookies,res,function(ans){
      if(ans != false){
        usersDB.update({email:ans.email,pass:ans.pass},{$set:{showPhotos:true}},function(err,data){
          res.send();
        });
      }
    });
  });
  //No Mostrar fotos a fraternos
  app.post('/forbidPhotos', function (req, res) {
    isLogged(req.cookies,res,function(ans){
      if(ans != false){
        usersDB.update({email:ans.email,pass:ans.pass},{$set:{showPhotos:false}},function(err,data){
          res.send();
        });
      }
    });
  });

  //Mostrar documentos a fraternos
  app.post('/showDocs', function (req, res) {
    isLogged(req.cookies,res,function(ans){
      if(ans != false){
        usersDB.update({email:ans.email,pass:ans.pass},{$set:{showDocs:true}},function(err,data){
          res.send();
        });
      }
    });
  });
  //No Mostrar documentos a fraternos
  app.post('/forbidDocs', function (req, res) {
    isLogged(req.cookies,res,function(ans){
      if(ans != false){
        usersDB.update({email:ans.email,pass:ans.pass},{$set:{showDocs:false}},function(err,data){
          res.send();
        });
      }
    });
  });

  //Mostrar publicaciones a fraternos
  app.post('/showPubs', function (req, res) {
    isLogged(req.cookies,res,function(ans){
      if(ans != false){
        usersDB.update({email:ans.email,pass:ans.pass},{$set:{showPubs:true}},function(err,data){
          res.send();
        });
      }
    });
  });
  //No Mostrar publicaciones a fraternos
  app.post('/forbidPubs', function (req, res) {
    isLogged(req.cookies,res,function(ans){
      if(ans != false){
        usersDB.update({email:ans.email,pass:ans.pass},{$set:{showPubs:false}},function(err,data){
          res.send();
        });
      }
    });
  });


  //Mostrar preguntas a fraternos
  app.post('/showAnswers', function (req, res) {
    isLogged(req.cookies,res,function(ans){
      if(ans != false){
        usersDB.update({email:ans.email,pass:ans.pass},{$set:{showAnswers:true}},function(err,data){
          res.send();
        });
      }
    });
  });
  //Mostrar preguntas a fraternos
  app.post('/forbidAnswers', function (req, res) {
    isLogged(req.cookies,res,function(ans){
      if(ans != false){
        usersDB.update({email:ans.email,pass:ans.pass},{$set:{showAnswers:false}},function(err,data){
          res.send();
        });
      }
    });
  });

  //Mostrar anuncios a fraternos
  app.post('/showAds', function (req, res) {
    isLogged(req.cookies,res,function(ans){
      if(ans != false){
        usersDB.update({email:ans.email,pass:ans.pass},{$set:{showAds:true}},function(err,data){
          res.send();
        });
      }
    });
  });
  //No Mostrar anuncios a fraternos
  app.post('/forbidAds', function (req, res) {
    isLogged(req.cookies,res,function(ans){
      if(ans != false){
        usersDB.update({email:ans.email,pass:ans.pass},{$set:{showAds:false}},function(err,data){
          res.send();
        });
      }
    });
  });



  //Reproducir sonido de publicaciones
  app.post('/soundPubs', function (req, res) {
    isLogged(req.cookies,res,function(ans){
      if(ans != false){
        usersDB.update({email:ans.email,pass:ans.pass},{$set:{soundPubs:true}},function(err,data){
          res.send();
        });
      }
    });
  });
  //No Reproducir sonido de publicaciones
  app.post('/forbidSoundPubs', function (req, res) {
    isLogged(req.cookies,res,function(ans){
      if(ans != false){
        usersDB.update({email:ans.email,pass:ans.pass},{$set:{soundPubs:false}},function(err,data){
          res.send();
        });
      }
    });
  });

  //Reproducir sonido de mensajes
  app.post('/soundMsg', function (req, res) {
    isLogged(req.cookies,res,function(ans){
      if(ans != false){
        usersDB.update({email:ans.email,pass:ans.pass},{$set:{soundMsg:true}},function(err,data){
          res.send();
        });
      }
    });
  });
  //No Reproducir sonido de publicaciones
  app.post('/forbidSoundMsg', function (req, res) {
    isLogged(req.cookies,res,function(ans){
      if(ans != false){
        usersDB.update({email:ans.email,pass:ans.pass},{$set:{soundMsg:false}},function(err,data){
          res.send();
        });
      }
    });
  });

  //Notificaciones al correo electronico
  app.post('/notMail', function (req, res) {
    isLogged(req.cookies,res,function(ans){
      if(ans != false){
        usersDB.update({email:ans.email,pass:ans.pass},{$set:{notMail:true}},function(err,data){
          res.send();
        });
      }
    });
  });
  //No permitir notificaciones al correo electronico
  app.post('/forbidNotMail', function (req, res) {
    isLogged(req.cookies,res,function(ans){
      if(ans != false){
        usersDB.update({email:ans.email,pass:ans.pass},{$set:{notMail:false}},function(err,data){
          res.send();
        });
      }
    });
  });

  //Notificaciones de etiquetado
  app.post('/notLabel', function (req, res) {
    isLogged(req.cookies,res,function(ans){
      if(ans != false){
        usersDB.update({email:ans.email,pass:ans.pass},{$set:{notLabel:true}},function(err,data){
          res.send();
        });
      }
    });
  });
  //No permitir notificaciones de etiquetado
  app.post('/forbidNotLabel', function (req, res) {
    isLogged(req.cookies,res,function(ans){
      if(ans != false){
        usersDB.update({email:ans.email,pass:ans.pass},{$set:{notLabel:false}},function(err,data){
          res.send();
        });
      }
    });
  });

  //Notificaciones de eventos
  app.post('/notEvent', function (req, res) {
    isLogged(req.cookies,res,function(ans){
      if(ans != false){
        usersDB.update({email:ans.email,pass:ans.pass},{$set:{notEvent:true}},function(err,data){
          res.send();
        });
      }
    });
  });
  //No permitir notificaciones de eventos
  app.post('/forbidNotEvent', function (req, res) {
    isLogged(req.cookies,res,function(ans){
      if(ans != false){
        usersDB.update({email:ans.email,pass:ans.pass},{$set:{notEvent:false}},function(err,data){
          res.send();
        });
      }
    });
  });

  //Notificaciones de preguntas
  app.post('/notAnswer', function (req, res) {
    isLogged(req.cookies,res,function(ans){
      if(ans != false){
        usersDB.update({email:ans.email,pass:ans.pass},{$set:{notAnswer:true}},function(err,data){
          res.send();
        });
      }
    });
  });
  //No permitir notificaciones de preguntas
  app.post('/forbidNotAnswer', function (req, res) {
    isLogged(req.cookies,res,function(ans){
      if(ans != false){
        usersDB.update({email:ans.email,pass:ans.pass},{$set:{notAnswer:false}},function(err,data){
          res.send();
        });
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
          message:'',
          followers:[],
          following:[],
          blockedBy:[],
          blockedUsers:[],
          allowLabel:false,
          allowPass:false,
          allowName:false,
          allowCareer:false,
          showPhotos:false,
          showDocs:false,
          showPubs:false,
          showAnswers:false,
          showAds:false,
          soundPubs:false,
          soundMsg:false,
          notMail:false,
          notLabel:false,
          notEvent:false,
          notAnswer:false,
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
      createImage(req.body.img1,docs._id,null,function(photoID){
       if(!photoID){
         res.send("500");
         return;
       }
       publicationsDB.insert({
         message:'',
         tagged:[],
         photos:[photoID],
         creator:docs._id,
         likes:[],
         comments:[],
         shared:[],
         type:"profileImage"
       },function(err,result1){
         usersDB.update(
            { _id: docs._id},
            { $push:{"publications":result1.insertedIds[0],"photos":photoID}, $set: { "profileImage":photoID}},
          function(err, result2){
            res.send({publication:result1.ops[0]._id,images:photoID});
            console.log("Foto subida.");
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
  app.post('/createChat', function(req, res){
    isLogged(req.cookies,res,function(ans){
      if(ans != false){
        createChat([req,ans],function(data){
          res.send(data);
        });
      }
    });
  });


  //Obtener usuarios por busqueda
  app.post('/searchUsers', function (req, res) {
    isLogged(req.cookies,res,function(ans){
      if(ans != false){
         searchUsers(req.body,function(data){
            res.send(data);
            console.log(data.length + " usuarios encontrados.");
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

  //Obtener chats desde IDs
  app.post('/getChats', function (req, res) {
    isLogged(req.cookies,res,function(ans){
      if(ans != false){
         getChatsFromID(req.body,function(data){
            res.send(data);
            console.log("Chats enviado");
        });
      }
    });
  });

  //Obtener chats desde IDs
  app.post('/getComments', function (req, res) {
    isLogged(req.cookies,res,function(ans){
      if(ans != false){
         getCommentsFromID(req.body,function(data){
            res.send(data);
            console.log("Comentarios enviado");
        });
      }
    });
  });

  //Obtener usuario de URL
  app.get('/users/*', function (req, res) {
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
    isLogged(req.cookies,res,function(docs){
      if(docs == false){
        res.sendFile("public/login.html", {root: __dirname });
      }
      else{
        res.redirect('/publications');
      }
    });
  });

  //Publication window
  app.get('/publications', function (req, res) {
    res.sendFile("public/menu.html", {root: __dirname });
  });


  //Users window
  app.get('/users', function (req, res) {
    res.sendFile("public/menu.html", {root: __dirname });
  });

  //Evento al obtener el dominio solo
  app.get('/', function (req, res) {
    isLogged(req.cookies,res,function(docs){
      if(docs != false){
        //res.redirect('/users/'+req.cookies.email.split("@")[0]);
        res.redirect('/publications');
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


  //Obtener comentarios desde id
  function getCommentsFromID(coms,callback){
    if(coms.lenght == 0){
      callback([]);
      return;
    }
    commentsDB.find({_id:{$in:toObjectID(coms)}}).toArray(function(err,docs){
      for(var doc in docs){
        docs[doc].time = ObjectID(docs[doc]._id).getTimestamp();
      }
      callback(docs);
    });
  }
  function createChat(pa,callback){
    var ids = pa[0].body;
    var us = pa[1];
    var nd = new Array();
    for(var id in ids){
      nd.push({'integrants':ObjectID(ids[id])});
    }
    chatsDB.find({$and:nd}).toArray(function(err,docs){
      if(docs.length == 0){
        chatsDB.insert({
          creator:us._id,
          name:null,
          integrants:ids,
          messages:[]
        },function(err,result){
          usersDB.update( { _id : { $in : toObjectID(result.ops[0].integrants) } },{ $push : { chats : result.ops[0]._id } },{multi: true}, function(err,reu){
            callback(result.ops[0]._id);
          });
        });
      }
      else{
        callback(false);
      }
    });
  }
/*
  function createImage(user,base64,extraData,callback){
    var fullImg = base64.replace(/^data:image\/png;base64,/, "");
    var fullPath = __dirname + '/tmp/' + shortid.generate() + ".png";
    fs.writeFile( fullPath, fullImg, 'base64', function(err) {
      imgur.upload( fullPath, function (err,resp1) {
        console.log(resp1);
        if(!resp1.hasOwnProperty('data')){
          callback(false,extraData);
          return;
        }
        fs.unlink(fullPath ,function(){
          photosDB.insert({
            url:resp1.data.link,
            uploader:user
          },function(err,result){
            assert.equal(err, null);
             callback(result.ops[0]._id,extraData);
          });
        });
      });
    });
  }
*/

  function createImage(data,user,extraData,callback){
    photosDB.insert({
      url:data.url,
      width:data.width,
      height:data.height,
      uploader:user
    },function(err,result){
      assert.equal(err, null);
       callback(result.ops[0]._id,extraData);
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

  //Obtener usuarios desde _id
  function getChatsFromID(chats,callback){
    if(chats.lenght == 0){
      callback([]);
      return;
    }
    else{
      chatsDB.find({_id:{$in:toObjectID(chats)}}).toArray(function(err,docs){
        callback(docs);
      });
    }
  }

  //Obtener usuarios por busqueda
  function searchUsers(params,callback){
    usersDB.find(params).toArray(function(err,docs){
      for(var usr in docs){
        delete docs[usr].pass;
        delete docs[usr].chats;
      }
      callback(docs);
    });
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
      try{
        ids[id] = ObjectID(ids[id]);
      }
      catch(err){

      }
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

  //Arroja 404 si el path es invalido
  app.get("*", function(req, res) {
    res.redirect("/404");
  });

  io.on('connection', function(socket){

    if(!socket.request.headers.cookie)return;
    isLogged({email:decodeURIComponent(socket.request.headers.cookie.split("mail=")[1].split(";")[0]),pass:decodeURIComponent(socket.request.headers.cookie.split("ass=")[1].split(";")[0])},socket,function(data){

    sockets[data._id] = socket.id;
    sockets[socket.id] = data._id;
    console.log('Nuevo usuario conectado');

    socket.on('disconnect', function(socket){
      delete sockets[sockets[socket.id]];
      delete sockets[socket.id];
      console.log('Usuario desconectado');
    });

    socket.on('deletePublication', function(msg){
      if(!("data" in msg)) return;
      if(!("id" in msg.data && "email" in msg && "pass" in msg)) return;

      isLogged({email:msg.email,pass:msg.pass},msg.data.id,function(data){
        usersDB.update({ _id: ObjectID(data._id)},{ $pull: { 'publications': ObjectID(msg.data.id)}},function(err,result){
          io.sockets.emit('deletePublication', {user:data._id,publication:msg.data.id});
        });
      });
    });

    socket.on('chatMessage', function(msg){
      if(!("data" in msg)) return;
      if(!("id" in msg.data && "text" in msg.data && "from" in msg.data && "seenBy" in msg.data && "files" in msg.data && "photos" in msg.data)) return;

      isLogged({email:msg.email,pass:msg.pass},msg.data,function(data){
        var sve = msg.data;
        sve.date = new Date();
        chatsDB.update({ _id: ObjectID(msg.data.id)},{ $push: { messages:sve }},function(err,result){
          chatsDB.find({ _id: ObjectID(msg.data.id)}).toArray(function(err,dat){
            for(var usr in dat[0].integrants){
              if(dat[0].integrants[usr] in sockets){
                io.to(sockets[dat[0].integrants[usr]]).emit('chatMessageArrived',sve);
              }
            }
          });
        });
      });
    });

    //Agrega o quita un megusta a una publicacion
    socket.on('likePublication', function (msg) {
      isLogged({email:msg.email,pass:msg.pass},msg.data,function(ans){
        if(ans != false){
           publicationsDB.find({_id:ObjectID(msg.data),likes:ObjectID(ans._id)}).toArray(function(err,docs){
             if(docs.length != 0){
               publicationsDB.update({'_id':ObjectID(msg.data)},{$pull:{'likes':ObjectID(ans._id)}},function(err,data){
                 io.sockets.emit('likePublication', {id:msg.data,userID:ans._id,add:false});
               });
             }
             else{
               publicationsDB.update({'_id':ObjectID(msg.data)},{$push:{'likes':ObjectID(ans._id)}},function(err,data){
                 io.sockets.emit('likePublication', {id:msg.data,userID:ans._id,add:true});
               });
             }
           });
        }
      });
    });



    //Nueva publicacion
    socket.on('newPublication', function (msg) {
      isLogged({email:msg.email,pass:msg.pass},msg.data,function(ans){
        if(ans != false){
          //FALTA AÑADIR RESTRICCION USUARIOS BLOQUEADOS
          var imagesLen = msg.data.images.length;
          var imagesOk = [];
          if(msg.data.url == 1){
            msg.data.url = msg.data.url[0];
          }
          if(imagesLen != 0){
            io.emit('loadingPublication', "80%");
            for(var img in msg.data.images){
              createImage(msg.data.images[img],ans._id,msg.data,function(photoID){
                imagesOk.push(photoID);
                io.emit('loadingPublication', String(parseInt((20/imagesLen)*imagesOk.length)+80)+"%");
                console.log("Foto " + imagesOk.length + " lista")
                if(imagesOk.length == imagesLen){
                  publicationsDB.insert({
                    message:msg.data.text,
                    tagged:[],
                    url:msg.data.url,
                    photos:imagesOk,
                    creator:ans._id,
                    likes:[],
                    comments:[],
                    shared:[],
                    type:"shared"
                  },function(err,docs){
                    usersDB.update({_id:ObjectID(msg.data.to)},{$push:{publications:docs.ops[0]._id}},function(err,a){
                      console.log("Publicacion creada correctamente con los siguientes datos:");
                      console.log({pid:docs.ops[0]._id,to:msg.data.to});
                      io.sockets.emit('newPublication', {pid:docs.ops[0]._id,to:msg.data.to});
                    })
                  });
                }
              });
            }
          }
          else{
            publicationsDB.insert({
              message:msg.data.text,
              tagged:[],
              photos:[],
              url:msg.data.url,
              creator:ans._id,
              likes:[],
              comments:[],
              shared:[],
              type:"shared"
            },function(err,docs){
              usersDB.update({_id:ObjectID(msg.data.to)},{$push:{publications:docs.ops[0]._id}},function(err,a){
                console.log("Publicacion creada correctamente con los siguientes datos:");
                console.log({pid:docs.ops[0]._id,to:msg.data.to});
                io.sockets.emit('newPublication', {pid:docs.ops[0]._id,to:msg.data.to});
              })
            });
          }
        }
      });
    });

    //Edita el texto de una publicación
    socket.on('editPublication', function (msg) {
      isLogged({email:msg.email,pass:msg.pass},msg.data,function(ans){
        if(ans != false){
         publicationsDB.update({_id:ObjectID(msg.data.id)},{$set:{message:msg.data.message}},function(err,data){
           io.sockets.emit('editPublication', {id:msg.data.id,message:msg.data.message});
         });
        }
      });
    });


    //Edita el texto de una publicación
    socket.on('newComment', function (msg) {
      isLogged({email:msg.email,pass:msg.pass},msg.data,function(ans){
        if(ans != false){
         commentsDB.insert({
           creator:ans._id,
           text:msg.data.text,
           publication:msg.data.pubId,
           subcomments:[],
           likes:[]
          },function(err,data){
            publicationsDB.update({_id:ObjectID(msg.data.pubId)},{$push:{comments:data.ops[0]._id}},function(err,data1){
              io.sockets.emit('newComment', {id:data.ops[0]._id,pubId:msg.data.pubId});
            });
        });
      }
    });
  });

  //Elimina un comentario
  socket.on('deleteComment', function (msg) {
    isLogged({email:msg.email,pass:msg.pass},msg.data,function(ans){
      if(ans != false){
       publicationsDB.update({_id:ObjectID(msg.data.pid)},{$pull:{comments:ObjectID(msg.data.id)}},function(err,data){
         commentsDB.deleteOne({_id:ObjectID(msg.data.id)},function(err,data){
           io.sockets.emit('deleteComment', {id:msg.data.id,pid:msg.data.pid});
         });
       });
      }
    });
  });

  //Parte de Jose: cambio de nombre
  socket.on('nameChange', function (msg) {
    isLogged({email:msg.email,pass:msg.pass},msg.data,function(ans){
      if(ans != false){
        //validar datos
       usersDB.update({_id:ObjectID(ans._id)},{$set:{fname:msg.data.fname,lname:msg.data.lname}},function(err,data){
           io.sockets.emit('nameChange', {id:ans._id, fname:msg.data.fname, lname:msg.data.lname});
           console.log('cambio nombre');
       });
      }
    });
  });

  //Parte de Jose: cambio de contraseña
  socket.on('passChange', function (msg) {
    isLogged({email:msg.email,pass:msg.pass},msg.data,function(ans){
      if(ans != false){
        //validar datos
       usersDB.update({_id:ObjectID(ans._id)},{$set:{pass:msg.data.pass}},function(err,data){
           io.sockets.emit('passChange', {id:ans._id, pass:msg.data.pass});
           console.log('cambio pass');
       });
      }
    });
  });

  //Parte de Jose: cambio de carrera
  socket.on('careerChange', function (msg) {
    isLogged({email:msg.email,pass:msg.pass},msg.data,function(ans){
      if(ans != false){
        //validar datos
       usersDB.update({_id:ObjectID(ans._id)},{$set:{career:msg.data.career}},function(err,data){
           io.sockets.emit('careerChange', {id:ans._id, career:msg.data.career});
           console.log('cambio carrera');
       });
      }
    });
  });

  //Parte de Jose: cambio de ciudad
  socket.on('cityChange', function (msg) {
    isLogged({email:msg.email,pass:msg.pass},msg.data,function(ans){
      if(ans != false){
        //validar datos
       usersDB.update({_id:ObjectID(ans._id)},{$set:{city:msg.data.city}},function(err,data){
           io.sockets.emit('cityChange', {id:ans._id, city:msg.data.city});
           console.log('cambio ciudad');
       });
      }
    });
  });

  //Parte de Jose: cambio de año de ingreso
  socket.on('yearInChange', function (msg) {
    isLogged({email:msg.email,pass:msg.pass},msg.data,function(ans){
      if(ans != false){
        //validar datos
       usersDB.update({_id:ObjectID(ans._id)},{$set:{yearIn:msg.data.yearIn}},function(err,data){
           io.sockets.emit('yearInChange', {id:ans._id, yearIn:msg.data.yearIn});
           console.log('cambio año de ingreso');
       });
      }
    });
  });

  //Parte de Jose: cambio de fecha de nacimiento
  socket.on('dateChange', function (msg) {
    isLogged({email:msg.email,pass:msg.pass},msg.data,function(ans){
      if(ans != false){
        //validar datos
       usersDB.update({_id:ObjectID(ans._id)},{$set:{birthdate:msg.data.birthdate}},function(err,data){
           io.sockets.emit('dateChange', {id:ans._id, birthdate:msg.data.birthdate});
           console.log('cambio fecha de nacimiento');
       });
      }
    });
  });

  //Parte de Jose de Privacidad: permitir o no etiquetar en fotos
  socket.on('allowLabel', function (msg) {
    isLogged({email:msg.email,pass:msg.pass},msg.data,function(ans){
      if(ans != false){
        //validar datos
       usersDB.update({_id:ObjectID(ans._id)},{$set:{allowLabel:msg.data.allowLabel}},function(err,data){
           io.sockets.emit('allowLabel', {id:ans._id, allowLabel:msg.data.allowLabel});
           console.log('cambio de etiquetado fotos');
       });
      }
    });
  });

  //Parte de Jose de Privacidad: mostrar o no fotos a los fraternos
  socket.on('showPhotos', function (msg) {
    isLogged({email:msg.email,pass:msg.pass},msg.data,function(ans){
      if(ans != false){
        //validar datos
       usersDB.update({_id:ObjectID(ans._id)},{$set:{showPhotos:msg.data.showPhotos}},function(err,data){
           io.sockets.emit('showPhotos', {id:ans._id, showPhotos:msg.data.showPhotos});
           console.log('cambio de mostrar fotos');
       });
      }
    });
  });

  //Parte de Jose de Privacidad: mostrar o no documentos a los fraternos
  socket.on('showDocs', function (msg) {
    isLogged({email:msg.email,pass:msg.pass},msg.data,function(ans){
      if(ans != false){
        //validar datos
       usersDB.update({_id:ObjectID(ans._id)},{$set:{showDocs:msg.data.showDocs}},function(err,data){
           io.sockets.emit('showDocs', {id:ans._id, showDocs:msg.data.showDocs});
           console.log('cambio de mostrar documentos');
       });
      }
    });
  });

  //Parte de Jose de Privacidad: mostrar o no publicaciones a los fraternos
  socket.on('showPubs', function (msg) {
    isLogged({email:msg.email,pass:msg.pass},msg.data,function(ans){
      if(ans != false){
        //validar datos
       usersDB.update({_id:ObjectID(ans._id)},{$set:{showPubs:msg.data.showPubs}},function(err,data){
           io.sockets.emit('showPubs', {id:ans._id, showPubs:msg.data.showPubs});
           console.log('cambio de mostrar publicaciones');
       });
      }
    });
  });

  //Parte de Jose de Notificaciones: mostrar o no sonidos al recibir publicaciones
  socket.on('soundPubs', function (msg) {
    isLogged({email:msg.email,pass:msg.pass},msg.data,function(ans){
      if(ans != false){
        //validar datos
       usersDB.update({_id:ObjectID(ans._id)},{$set:{soundPubs:msg.data.soundPubs}},function(err,data){
           io.sockets.emit('soundPubs', {id:ans._id, soundPubs:msg.data.soundPubs});
           console.log('cambio de sonidos en publicaciones');
       });
      }
    });
  });

  //Parte de Jose de Notificaciones: mostrar o no sonidos al recibir mensajes de chat
  socket.on('soundMsg', function (msg) {
    isLogged({email:msg.email,pass:msg.pass},msg.data,function(ans){
      if(ans != false){
        //validar datos
       usersDB.update({_id:ObjectID(ans._id)},{$set:{soundMsg:msg.data.soundMsg}},function(err,data){
           io.sockets.emit('soundMsg', {id:ans._id, soundMsg:msg.data.soundMsg});
           console.log('cambio de sonidos en mensajes');
       });
      }
    });
  });

  //Parte de Jose de Notificaciones: enviar o no notificaciones al correo electronico
  socket.on('notMail', function (msg) {
    isLogged({email:msg.email,pass:msg.pass},msg.data,function(ans){
      if(ans != false){
        //validar datos
       usersDB.update({_id:ObjectID(ans._id)},{$set:{notMail:msg.data.notMail}},function(err,data){
           io.sockets.emit('notMail', {id:ans._id, notMail:msg.data.notMail});
           console.log('cambio de uso de correo');
       });
      }
    });
  });

  //Parte de Jose de Notificaciones: mostrar o no notificaciones al ser etiquetado
  socket.on('notLabel', function (msg) {
    isLogged({email:msg.email,pass:msg.pass},msg.data,function(ans){
      if(ans != false){
        //validar datos
       usersDB.update({_id:ObjectID(ans._id)},{$set:{notLabel:msg.data.notLabel}},function(err,data){
           io.sockets.emit('notLabel', {id:ans._id, notLabel:msg.data.notLabel});
           console.log('cambio de uso de correo');
       });
      }
    });
  });

  //Parte de Jose de Notificaciones: mostrar o no notificaciones al ser etiquetado
  socket.on('notEvent', function (msg) {
    isLogged({email:msg.email,pass:msg.pass},msg.data,function(ans){
      if(ans != false){
        //validar datos
       usersDB.update({_id:ObjectID(ans._id)},{$set:{notEvent:msg.data.notEvent}},function(err,data){
           io.sockets.emit('notEvent', {id:ans._id, notEvent:msg.data.notEvent});
           console.log('cambio de notificacion de evento');
       });
      }
    });
  });

  //Parte de Jose de Notificaciones: mostrar o no notificaciones al ser respondida una pregunta
  socket.on('notAnswer', function (msg) {
    isLogged({email:msg.email,pass:msg.pass},msg.data,function(ans){
      if(ans != false){
        //validar datos
       usersDB.update({_id:ObjectID(ans._id)},{$set:{notAnswer:msg.data.notAnswer}},function(err,data){
           io.sockets.emit('notAnswer', {id:ans._id, notAnswer:msg.data.notAnswer});
           console.log('cambio de notificacion de pregunta');
       });
      }
    });
  });

  //Parte de Jose de Bloqueos: Son las personas que son bloqueadas
  socket.on('blockedUsers', function (msg) {
    isLogged({email:msg.email,pass:msg.pass},msg.data,function(ans){
      if(ans != false){
        //validar datos
       usersDB.update({email:ans.email,pass:ans.pass},{$push:{blockedUsers:{$each:msg.data.blockedUsers}}},function(err,data){
        //usersDB.update({_id:ObjectID(ans._id)},{$set:{blockedUsers:msg.data.blockedUsers}},function(err,data){
           io.sockets.emit('blockedUsers', {id:ans._id, blockedUsers:msg.data.blockedUsers});
           console.log('cambio de insercion de nuevo individuo bloqueado');
       });
      }
    });
  });


    });
  });
});
