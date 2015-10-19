//////////////////////config starts

var port_num = 3000
var urls = [
	'https://demo-project-swei-turner.c9.io/node.js/alexa-skill-mock/example/sample_data/intent.json',
	'https://demo-project-swei-turner.c9.io/node.js/alexa-skill-mock/example/sample_data/slot.json',
	'https://demo-project-swei-turner.c9.io/node.js/alexa-skill-mock/example/sample_data/utterance.txt',
	'https://demo-project-swei-turner.c9.io/node.js/alexa-skill-mock/example/sample_data/response.txt'
]

//////////////////////config ends

var alexa_mock = require('../index.js');

var Hapi = require('hapi');


var server = new Hapi.Server();
server.connection({
	port: port_num
});

var bodyParser = require('body-parser');

function log(text) {
	console.log(text)
}

// Add the route
server.route({
	method: 'POST',
	path: '/sample',
	handler: function(req, res){
		alexa_mock(urls, "mock_app", function(app) {
			app.request(req.payload) // connect hapi to alexa-app
				.then(function(response) { // alexa-app returns a promise with the response
					res(response); // stream it to hapi' output
				});
		})
	}
})

server.start(function() {
	log('Server running at:' + server.info.uri);
});
