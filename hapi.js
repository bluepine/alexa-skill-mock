var alexa = require('alexa-app');
var app = new alexa.app('sample');
var Q = require('q')
var _ = require('lodash');

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

var request = require('sync-request');

function getText(url) {
	var resp = request('GET', url);
	var text = resp.getBody('utf8')
	return text
}

var urls = [
	'https://demo-project-swei-turner.c9.io/node.js/alexa-skill-mock/test/sample_data/intent.json',
	'https://demo-project-swei-turner.c9.io/node.js/alexa-skill-mock/test/sample_data/slot.json',
	'https://demo-project-swei-turner.c9.io/node.js/alexa-skill-mock/test/sample_data/utterance.txt',
	'https://demo-project-swei-turner.c9.io/node.js/alexa-skill-mock/test/sample_data/response.txt'
]

// Add the route
server.route({
	method: 'POST',
	path: '/sample',
	handler: function(req, res) {
		var operations = _.map(urls, getText);
		Q.all(operations).then(function(texts) {
			var intent = JSON.parse(texts[0])
			var slot = JSON.parse(texts[1])
			var utterances = texts[2]
			var responses = texts[3]
			console.log(intent)
			console.log(slot)
			console.log(utterances)
			console.log(responses)
			app.request(req.payload) // connect hapi to alexa-app
				.then(function(response) { // alexa-app returns a promise with the response
					res(response); // stream it to hapi' output
				});
		});
	}
});

server.start(function() {
	console.log('Server running at:', server.info.uri);
});
