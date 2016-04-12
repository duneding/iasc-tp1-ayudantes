var express = require('../node_modules/express'),
    request = require('../node_modules/request'),
    _ = require('../node_modules/underscore'),
    app = express(),
    Q = require('../node_modules/q');

var foroUrl = 'http://localhost:3000/';
var TIEMPO_PREGUNTA = 2000;

app.use(require('body-parser').json());

var server = app.listen(process.argv[2], function () {
  var host = server.address().address;
  var port = getPort();

  console.log('Alumno listening at http://%s:%s', host, port);
  subscribe({
	id: getPort(),
	alumno: true
  }).then(startAsking)
  	.fail(defaultError);
});

app.get('/', function (req, res) {
	request.get({
		json: true,
		url: foroUrl + 'preguntas'
    }, function(error){
		if (error) {
			defaultError('No se pudo obtener la lista de preguntas - Error: ' + error);
		} 
	}).pipe(res);
});

app.post('/broadcast', function (req, res) {
    console.log("<ALUMNO> " + req.body.mensaje);
    res.sendStatus(200);
});

function preguntar(pregunta) {
	var deferred = Q.defer();
    request.post({
        json: true,
        body: pregunta,
        url: foroUrl + 'preguntar'
    }, function(error, response, body) {
		if(error) {
			deferred.reject('<ALUMNO> No pudo preguntar: ' + error);
		} else {
			deferred.resolve(response);			
		}
	});
	return deferred.promise;
}

function getPort(){
    return server.address().port;
}

function startAsking() {
    setInterval(function () {
        preguntar({
            alumno: getPort(),
            pregunta: 'whats going on?'
        })
		.fail(defaultError);
    }, TIEMPO_PREGUNTA);
    
}

function subscribe(alumno) {
	var deferred = Q.defer();
	
    request.post({
        json: true,
        body:  alumno,
        url: foroUrl + 'subscribe'
    }, function(error, response, body) {
		if(error) {
			deferred.reject(error);
		} else {
			deferred.resolve(response);			
		}
	});
	
	return deferred.promise;
}

function defaultError(error){
  console.error(error);
}
