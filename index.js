var alexa = require('alexa-app');
var Q = require('q')
var _ = require('lodash');

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
        if (utterances) {
            o[l] = {
                'slots': slot_json[l],
                'utterances': utterance_json[l]
            }
        }
        else {
            o[l] = {
                'slots': slot_json[l]
            }
        }
        return o
    }, {})

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

var request = require('request');

var httpGet = function(url) {
    var deferred = Q.defer();
    request(url, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            deferred.resolve(body)
        }
        else {
            deferred.resolve(null)
        }
    })
    return deferred.promise;
}

var e = function alexa_mock(urls, alexa_app_name, callback) {
    var app = new alexa.app(alexa_app_name);
    var operations = _.map(urls, httpGet)
    Q.all(operations).then(function(texts) {
        var intent = JSON.parse(texts[0])
        var slot = JSON.parse(texts[1])
        // var utterances = texts[2]
        var responses = texts[3]
        var intent_json = build_intent_json(intent, null);
        var response_json = text_to_obj(responses)
        _.each(intent_json, function(value, intent) {
            app.intent(intent, value, function(request, response) {
                response.say(response_json[intent])
                var card_response = "slot values: "
                var slots = intent_json[intent].slots
                for (var key in slots) {
                    card_response = card_response + " slot: "+ key + " value: "+ request.slot(key)
				}
				response.card('Slot values', card_response)
            })
        })
        callback(app)
    });
}

module.exports = e;