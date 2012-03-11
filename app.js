
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , io = require('socket.io');

var app = module.exports = express.createServer(),
    io = io.listen(app);

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes

app.get('/', routes.index);

// Functions

var midi = require('midi'),
    midiIn = new midi.input(),
    midiOut = new midi.output();

try {
  midiOut.openPort(0);
} catch(error) {
  midiOut.openVirtualPort('');
}

io.sockets.on('connection', function (socket) {

  // note
  socket.on('notedown',function(data){
    midiOut.sendMessage([144,data.message,100]);
    socket.broadcast.emit('playeddown',{'message':data.message});
  });

  // note stop
  socket.on('noteup',function(data){
    midiOut.sendMessage([128,data.message,100]);
    socket.broadcast.emit('playedup',{'message':data.message});
  });

  // controller
  socket.on('controller',function(data){
    var message = parseInt(data.message,10);
    midiOut.sendMessage([message,0,0]);
  });

});

// Stop

process.on("SIGTERM", function(){
  midiOut.closePort();
});

// Start

app.listen(3000);