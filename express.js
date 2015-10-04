///////////alexa app
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

///////////express
var port = 3000
var express = require('express')();
var bodyParser = require('body-parser');

express.use(bodyParser.json()); // for parsing application/json
express.use(bodyParser.urlencoded({
	extended: true
})); // for parsing application/x-www-form-urlencoded


// Manually hook the handler function into express
express.post('/sample', function(req, res) {
	console.log(req.body)
	app.request(req.body) // connect express to alexa-app
		.then(function(response) { // alexa-app returns a promise with the response
			res.json(response); // stream it to express' output
		});
});

console.log("listening port "+port)
express.listen(3000);