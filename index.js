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


var request = require('sync-request');

//TODO: avoid using sync requests.
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

var e = function alexa_mock(urls, alexa_app_name, callback) {
    var app = new alexa.app(alexa_app_name);
    var operations = _.map(urls, getText);
    Q.all(operations).then(function(texts) {
        var intent = JSON.parse(texts[0])
        var slot = JSON.parse(texts[1])
        var utterances = texts[2]
        var responses = texts[3]
        var intent_json = build_intent_json(intent, utterances);
        var response_json = text_to_obj(responses)
        _.each(intent_json, function(value, intent) {
            app.intent(intent, value, function(request, response) {
                response.say(response_json[intent])
            })
        })
        callback(app)
    });
}

module.exports = e;