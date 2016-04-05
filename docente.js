var express = require('express'),
    request = require('request'),
    app = express();

var foroUrl = 'http://localhost:3000/';

app.use(require('body-parser').json());

var server = app.listen(process.argv[2], function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Alumno listening at http://%s:%s', host, port);
});

app.get('/', function (req, res) {
	request.get({
		json: true,
		url: foroUrl + 'respuestas'
    }).pipe(res);
});

app.post('/', function (req, res) {
    console.log("DOCENTE: RECIBI " + JSON.stringify(req.body));
    res.sendStatus(200);
});

subscribe({
    id: server.address().port,
    alumno: false
});

app.post('/broadcast', function (req, res) {
    console.log("DOCENTE: Publicaron pregunta: " + JSON.stringify(req.body));
    res.sendStatus(200);
});

function responder(idPregunta, respuesta) {
    request.post({
        json: true,
        body: {idPregunta: idPregunta, respuesta: respuesta},
        url: foroUrl + 'respuestas'
    });
}

function subscribe(alumno) {
    request.post({
        json: true,
        body: alumno,
        url: foroUrl + 'subscribe'
    });
}

