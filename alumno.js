var express = require('express'),
    request = require('request'),
    _ = require('underscore'),
    app = express();

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
  }, startAsking);
});


app.get('/', function (req, res) {
	request.get({
		json: true,
		url: foroUrl + 'preguntas'
    }, function(error){
		if (error) {
			console.log('No se pudo obtener la lista de preguntas - Error: ' + error);
		} 
	}).pipe(res);
});

app.post('/broadcast', function (req, res) {
    console.log("<ALUMNO> " + req.body.mensaje);
    res.sendStatus(200);
});

function preguntar(pregunta) {
    request.post({
        json: true,
        body: pregunta,
        url: foroUrl + 'preguntar'
    }, function(error, response, body){
		if (error) {
			console.log('No se pudo realizar la pregunta ' + pregunta.pregunta + ' - Error: ' + error);
		} else {
			console.log('Alumno: ' + pregunta.alumno + ' preguntó: ' + pregunta.pregunta + ' - Info: ' + JSON.stringify(body));
		}
	});
}

function getPort(){
    return server.address().port;
}

function startAsking() {
    setInterval(function () {
        preguntar({
            alumno: getPort(),
            pregunta: 'what\'s going on?'
        });
    }, TIEMPO_PREGUNTA);
    
}

function subscribe(alumno, cont) {
    request.post({
        json: true,
        body:  alumno,
        url: foroUrl + 'subscribe'
    }, function(error, response, body){
		if (error) {
			console.log('No se pudo suscribir el alumno: ' + alumno.id + ' - Error: ' + error);
		} else {
			console.log('Alumno: ' + alumno.id + ' suscripto. Info: ' + JSON.stringify(body));
			cont();
		}
	});
}
