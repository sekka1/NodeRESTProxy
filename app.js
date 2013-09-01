var app = require('express')()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server)
  , http = require('http');

server.listen(80);

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

io.sockets.on('connection', function (socket) {

  //socket.on('my other event', function (data) {
  //  console.log(data);
  //});

  socket.on('client_data', function(data){
	process.stdout.write('the data: ' + data.authToken + ' - ' + data.method + ' ');
	
	// Save and remove the rest path from the data obj
	var restPath = data.algorithmPath;
	delete data.algorithmPath;

	// Call Algorithms.io REST API
	var querystring = require('querystring');
	
	// Put all passed in variables into the post data
	var postData = querystring.stringify(data);
				
	var options = {
  		host: 'api.algorithms.io',
  		port: 80,
  		path: restPath,
  		method: 'POST',
  		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Content-Length': postData.length
		}
	};	

	// Emit the response back to the client
	var req = http.request(options, function(res) {
				console.log('STATUS: ' + res.statusCode);
				console.log('HEADERS: ' + JSON.stringify(res.headers));
				res.setEncoding('utf8');
				res.on('data', function (chunk) {
						console.log('BODY: ' + chunk);
						socket.emit('algorithms_io_api', { data: chunk });
					});
				});
				
		req.write(postData);
		req.end();


  });

});


