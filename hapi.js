var alexa = require('alexa-app');
var app = new alexa.app('sample');

app.intent('number',
	   {
	       "slots":{"number":"NUMBER"}
	       ,"utterances":[ "say the number {1-100|number}" ]
	   },
	   function(request,response) {
	       var number = request.slot('number');
	       response.say("You asked for the number "+number);
	   }
	  );

var Hapi = require('hapi');

var server = new Hapi.Server();
server.connection({ port: 8080 });

// Add the route
server.route({
    method: 'POST',
    path:'/alexa', 
    handler: function(req,res) {
	app.request(req.body)        // connect hapi to alexa-app
	    .then(function(response) { // alexa-app returns a promise with the response
		res.json(response);      // stream it to hapi' output
	    });
    }
});

server.start(function () {
    console.log('Server running at:', server.info.uri);
});
