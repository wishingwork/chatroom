var http = require('http');
var fs = require('fs');
var path = require('path');
var mime = require('mime');
var cache = {};

function send404(response) {
	response.writeHead(404, {'Content-Type': 'text/plain'});
	response.write('Error 404: resource not found.');
	response.end();
}

//Write httphead and then send to the file
function sendFile(response, filePath, fileContents) {
	response.writeHead(
		200,
		{"Content-Type": mime.lookup(path.basename(filePath))}
	);
	response.end(fileContents);
}

//Read static files
function serveStatic(response, cache, absPath) {
	//Read file from cache
	if (cache[absPath]) {
		sendFile(response, absPath, cache[absPath]);
	} else {
		// Read file from hard disk
		fs.exists(absPath, function(exists){
			if (exists) {
				fs.readFile(absPath, function (err, data) {
					if (err) {
						send404(response);
					} else {
						cache[absPath] = data;
						sendFile(response, absPath, data);
					}
				});
			} else {
				send404(response);
			}
		});
	}
}

// Create a server to read static files
var server = http.createServer(function(request, response) {
	var filePath = false;

	if(request.url == '/') {
		filePath = 'public/index.html';
	} else {
		filePath = 'public' + request.url;
	}
	var absPath = './' + filePath;
	serveStatic(response, cache, absPath);
});

server.listen(3000, function () {
	console.log("Server listening on port 3000.");
});

// Start Socket.is server (websocket) use the same http port 
var chatServer = require('./lib/chat_server');
chatServer.listen(server);

