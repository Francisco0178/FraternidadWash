var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var port = 2000;

//Express

app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
   res.send('Hello GET');
})

app.post('/', function (req, res) {
   res.send('Hello POST');
})

app.delete('/del_user', function (req, res) {
   res.send('Hello DELETE');
})

app.get('/prohibido', function (req, res) {
   res.send('<img src="http://hdporntime.com/wp-content/uploads/2015/12/Zafira-young-porn-star-sex-pictures-08.jpg"></img>');
})


http.listen(port, function(){
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
