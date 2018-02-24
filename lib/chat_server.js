var socketio = require('socket.io');
var io;
var guestNumber = 1;
var nickNames = {};
var namesUsed = [];
var currentRoom = {};

exports.listen = function (server) {
	io = socketio.listen(server);
	io.set('log level', 1);

	io.sockets.on('connect', function(socket) {
		// As user coonect, assign the name and room
		guestNumber = assignGuestName(socket, guestNumber, nickNames, namesUsed);
		joinRoom(socket, 'Lobby');

		// Handle messaging, change name, change room
		handleMessageBroadcasting(socket, nickNames);
		handleNameChangeAttempts(socket, nickNames, namesUsed);
		handleRoomjoining(socket);

		// Provide room list
		socket.on('rooms', function() {
			socket.emit('rooms', io.sockets.manager.rooms);
		});

		// Handle discconection 
		handleClientDisconnection(socket, nickNames, namesUsed);
	});
};

