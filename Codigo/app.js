var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var port = 2000;

//Express

app.use(express.static(__dirname + '/public'));

app.get('/directorio', function (req, res) {
   res.send('Hello world!');
});

app.listen(port, function(){
  console.log('Escuchando en el puerto: ' + port);
});















//Sockets

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
