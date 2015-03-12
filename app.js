var express = require("express");
var app = express();
//var port = 3000;
var MongoClient = require('mongodb').MongoClient,
    messages;

/* TOdO : Keep list of previous messages */

/* TOdO : Implement private chat rooms */


/* Tells express where to serve everythiing under public folder */
app.use(express.static('public'));

/* Serve index file on a GET request to "/" */
app.get("/", function(req, res){
  res.sendFile(__dirname + '/public/index.html');
});

 
/* Start server and listen */
var io = require('socket.io').listen(app.listen(process.env.PORT || 3000));

io.sockets.on('connection', function(socket) {
  // send message to the connecting socket
  socket.emit('message', {message: "Welcome to the chat", username: "Server"});
  
 /* get list of all users */
 MongoClient.connect("mongodb://master:#valor73@ds051851.mongolab.com:51851/chatabase", function(err, db) {
    if(!err) {
      console.log("Connected to database");                   
      db.collection('userCollection').find().toArray(function(err,docs) {
        if (!err) {
          var count = docs.length;
          var list = [];
          for(var i = 0; i < count; i++) {
            list.push(docs[i].user);
          }           
          socket.emit('allUsers', {users: list});
        } else { console.log("Error finding user list"); }
      });
    } else { console.log("Could not connect to database"); }
  });
  
  // handle a 'send' event from the socket
  socket.on('send', function(data) {
    io.sockets.emit('message', data);
  });
  
  /* Handle newUser event */
  socket.on('newUser', function(data) {
    // Send new user's name to all sockets
    socket.name = data.username; 
    socket.broadcast.emit('userJoin', data);
    console.log("Socket name: " + socket.name);
    //io.sockets.emit('userJoin', data); 
    
    // Insert new user into db
    MongoClient.connect("mongodb://master:#valor73@ds051851.mongolab.com:51851/chatabase", function(err, db) {
      if(!err) {
        db.collection('userCollection').insert(
        {
          user: data.username
        },
        function(err, numInserted) {
          if(err) {console.log("Error inserting user");}
          else {
            console.log("Insert successful");
          }
        });
      } else {console.log("Error connecting to user Collection");}
    }); 
  });
  
  socket.on('disconnect', function() {
    MongoClient.connect("mongodb://master:#valor73@ds051851.mongolab.com:51851/chatabase", function(err, db) {
      if(!err) {
        db.collection('userCollection').remove( 
          {user: socket.name}, function(err, numRemoved){
            console.log("Number removed: " + numRemoved);
          });
      }
    }); 
    io.sockets.emit('userDisconnect',{user:socket.name});
  });

console.log("Listening on port " + (process.env.PORT || 3000));
});