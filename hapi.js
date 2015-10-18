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
	if (url) {
		var resp = request('GET', url);
		var text = resp.getBody('utf8')
		return text
	}
	else {
		return null;
	}
}

function log(text) {
	console.log(text)
}

function build_intent_json(intent, utterances) {
	var utterance_json
	if (utterances) {
		utterance_json = text_to_obj(utterances)
	}
	var intents = []
	var slot_json = _.reduce(intent.intents, function(o, l) {
		intents.push(l.intent)
		o[l.intent] = _.reduce(l.slots, function(o, l) {
			o[l.name] = l.type
			return o
		}, {})
		return o
	}, {})
	
	var intent_json = _.reduce(intents, function(o, l) {
		if(utterances) {
			o[l] = {'slots': slot_json[l], 'utterances' : utterance_json[l]}
		} else {
			o[l] = {'slots': slot_json[l]}
		}
	    return o
	},{})
	
	return intent_json
}

function text_to_obj(responses) {
	// log(responses)
	var lines = _.filter(_.map(responses.split(/\r?\n/), _.trim), function(line) {
		if (line) {
			return !_.startsWith(line, '#')
		}
		else {
			return false
		}
	})
	return _.reduce(lines, function add_to_obj(o, l) {
		var i = l.indexOf(' ')
		var intent = _.trim(l.substring(0, i))
		var text = _.trim(l.substring(i + 1))
		o[intent] = text
		return o
	}, {})
}

var urls = [
	'https://demo-project-swei-turner.c9.io/node.js/alexa-skill-mock/test/sample_data/intent.json',
	'https://demo-project-swei-turner.c9.io/node.js/alexa-skill-mock/test/sample_data/slot.json',
	'https://demo-project-swei-turner.c9.io/node.js/alexa-skill-mock/test/sample_data/utterance.txt',
	'https://demo-project-swei-turner.c9.io/node.js/alexa-skill-mock/test/sample_data/response.txt'
]

// var urls = [
// 	'https://demo-project-swei-turner.c9.io/node.js/alexa-skill-mock/test/sample_data/intent.json',
// 	'https://demo-project-swei-turner.c9.io/node.js/alexa-skill-mock/test/sample_data/slot.json',
// 	null,
// 	'https://demo-project-swei-turner.c9.io/node.js/alexa-skill-mock/test/sample_data/response.txt'
// ]

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
			// log(intent)
			// log(slot)
			// log(utterances)
			// log(responses)
			var intent_json = build_intent_json(intent, utterances);
			var response_json = text_to_obj(responses)
			_.each(intent_json, function(value, intent){
				// log(intent)
				// log(value)
				app.intent(intent, value, function(request, response) {
				    response.say(response_json[intent])
				})
			})
			// log(app)
			app.request(req.payload) // connect hapi to alexa-app
				.then(function(response) { // alexa-app returns a promise with the response
					res(response); // stream it to hapi' output
				});
		});
	}
});

server.start(function() {
	log('Server running at:' + server.info.uri);
});
