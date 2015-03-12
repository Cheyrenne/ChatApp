$(document).ready(function() {
  var socket = io.connect();
  
  var name = "";
  var text = $('#msg');
  var valid = false;

  /* Add new message to the content div */
  socket.on('message', function(data) {
    if(data.message) {
      var newhtml = createHtml(data)();
      $('#content').scrollTop($('#content')[0].scrollHeight);
    }
    else {
      console.log("There is a problem:" + data);
    }
  });
  
  socket.on('userJoin', function(data) {
    addUser(data.username);
  });
  
  socket.on('userDisconnect', function(data) {
    removeUser(data.user);
  });
  
  /* Retrieve list of all users from server */
  socket.on('allUsers', function(data) {
    for(var i = 0; i < data.users.length; i++) {
      addUser(data.users[i]);
    }
  });
  
  /* Send message to the server on clicking "send" */
  $('#btn').on('click', function() {
    console.log("HERE 4: "+valid);
    sendMessage(stateChanged);
    console.log("HERE 3: "+valid);
  });
  
  /* Send message on "Enter" keypress */
  $('#msg').keyup(function(e) {
    if(e.keyCode == 13) {
      console.log("HERE 5: "+valid);
      sendMessage(stateChanged); // send in callback
      console.log("HERE 1:"+ valid );
    }
    else {
      console.log("Here 2:"+valid);
      stateChanged();
    }
  });
  
  /* Get name for a new user */
  $('#nameBtn').on('click', function() {
    name = $('#name').val();   
    // name is not empty and with no spaces
    if( (name != "") && (name.match(/ /g)) === null) {
      $('#login').fadeOut();
      socket.emit('newUser', {username: name});
      addUser(name); // add name to top of list
    }
  });
  
  /* Check for state change from to trigger send animation */
  function stateChanged() {
    // if state IS valid and was FORMERLY invalid
    if( isValid( $('#msg').val() ) && valid === false) {
      valid = true; 
      animateSend("100%");
    } 
    // else reset to default state
    else if( !isValid($('#msg').val()) ) {
      valid = false;
      animateSend("0%");
    }
  }
  
  /* Send Button animation */
  function animateSend(value) {
    $('#left').animate({height:value}, 1000);
    $('#bottom').animate({width:value}, 1000);
    $('#right').animate({height:value}, 1000);
    $('#top').animate({width:value}, 1000);
    if(value == "100%")
      $('#btn').animate({color: "rgb(61, 210, 255)"}, 1000);
    else 
      $('#btn').animate({color: "rgb(255, 255, 255)"}, 1000);
  }
  
   /* Send message to the server */
  function sendMessage(callback) {
    var message = $('#msg').val();
    if(isValid(message)) {
      console.log("valid = true");
      console.log("Message: " + message);
      //valid = true;
      socket.emit('send', {message: message, username: name});
      text.val("");
      if (typeof callback === "function") //optional callback
        callback();
    }
    else {
      text.val("");
      alert("Enter message before transmitting");
      console.log("valid = false");
      console.log("message length:" +message.length);
    }
    
  } 
   
  /* Validate the message is not empty */
  function isValid(message) {
    if (message != "" && message !="\n")
      return true;
    else {
      return false;
    }
  }
  
  /* Add username to list of users */
  function addUser(name) {
    var list = $('#name-list');
    $('<li><p>'+name+'</p></li>').addClass('glass').prependTo(list);
  }
  
  /* Remove user from the User List after disconnect */
  function removeUser(name) {
     $('#name-list li').each(function(index) {
       if( $(this).text() == name) {
         $(this).animate({
           opacity: 0,
         }, 500, function() {
           $(this).remove();
         });
       }
     });
  }
  
  /* Add messages to the parent div*/
  function createHtml(data) {
    var html = '<div><p><b>' + data.username + '</b>:' +
          data.message + '</p></div';
    var className;
    var content = $('#content');
    if (data.username == name) {
      className = 'glass3'; // class for this socket user
    } 
    else {
      className = 'glass2'; // class for all other users
    }
    console.log("HTML: " + html);
    return (function() {
      $(html).addClass(className).appendTo(content);
    }); 
  }
  
});