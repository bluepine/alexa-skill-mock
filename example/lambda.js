//Please note that the default entry file for Amazon lambda is index.js, so rename this file accordingly.

var urls = [
    'https://demo-project-swei-turner.c9.io/node.js/alexa-skill-mock/example/sample_data/intent.json',
    'https://demo-project-swei-turner.c9.io/node.js/alexa-skill-mock/example/sample_data/slot.json',
    'https://demo-project-swei-turner.c9.io/node.js/alexa-skill-mock/example/sample_data/utterance.txt',
    'https://demo-project-swei-turner.c9.io/node.js/alexa-skill-mock/example/sample_data/response.txt'
]


var alexa_mock = require('alexa-skill-mock');

exports.handler = function(event, context) {
	alexa_mock(urls, "mock_app", function(app) {
	    app.lambda()(event, context)
	})
}
