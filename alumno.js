var express = require('express'),
    request = require('request'),
    _ = require('underscore'),
    app = express();

var foroUrl = 'http://localhost:3000/';

app.use(require('body-parser').json());

var server = app.listen(process.argv[2], function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Alumno listening at http://%s:%s', host, port);
});

subscribe({
    id: server.address().port,
    alumno: true
});

setInterval(function () {
    preguntar({
        alumno: server.address().port,
        pregunta: 'whats going on?'
    });
}, 5000);

app.get('/', function (req, res) {
	request.get({
		json: true,
		url: foroUrl + 'preguntas'
    }).pipe(res);
});

app.post('/', function (req, res) {
    console.log("ALUMNO: RECIBI " + JSON.stringify(req.body));
    res.sendStatus(200);
});

app.post('/broadcast', function (req, res) {
    console.log("ALUMNO: Publicaron pregunta: " + JSON.stringify(req.body));
    res.sendStatus(200);
});

function subscribe(alumno) {
    request.post({
        json: true,
        body:  alumno,
        url: foroUrl + 'subscribe'
    });
}

function preguntar(pregunta) {
    request.post({
        json: true,
        body: pregunta,
        url: foroUrl + 'preguntar'
    });
}
