var alexa = require('alexa-app');
var app = new alexa.app('sample');

app.intent('number', {
		"slots": {
			"number": "NUMBER"
		},
		"utterances": ["say the number {1-100|number}"]
	},
	function(request, response) {
		var number = request.slot('number');
		response.say("You asked for the number " + number);
	}
);

var Hapi = require('hapi');

var port_num = 3000
var server = new Hapi.Server();
server.connection({
	port: port_num
});

var bodyParser = require('body-parser');

// server.use(bodyParser.json()); // for parsing application/json
// server.use(bodyParser.urlencoded({
// 	extended: true
// })); // for parsing application/x-www-form-urlencoded

// Add the route
server.route({
	method: 'POST',
	path: '/sample',
	handler: function(req, res) {
		app.request(req.payload) // connect hapi to alexa-app
			.then(function(response) { // alexa-app returns a promise with the response
				res(response); // stream it to hapi' output
			});
	}
});

server.start(function() {
	console.log('Server running at:', server.info.uri);
});
