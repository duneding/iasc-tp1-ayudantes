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
  }, startAsking);
});


app.get('/', function (req, res) {
	request.get({
		json: true,
		url: foroUrl + 'preguntas'
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
    });
}

function getPort(){
    return server.address().port;
}

function startAsking() {
    setInterval(function () {
        preguntar({
            alumno: getPort(),
            pregunta: 'whats going on?'
        });
    }, TIEMPO_PREGUNTA);
    
}

function subscribe(alumno, cont) {
    request.post({
        json: true,
        body:  alumno,
        url: foroUrl + 'subscribe'
    });
    cont();
}