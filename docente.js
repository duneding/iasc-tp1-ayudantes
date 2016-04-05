var express = require('express'),
    request = require('request'),
    _ = require('underscore'),
    app = express();

var foroUrl = 'http://localhost:3000/';

app.use(require('body-parser').json());

var server = app.listen(process.argv[2], function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Docente listening at http://%s:%s', host, port);
});

subscribe({
    id: server.address().port,
    alumno: false
});

setInterval(function () {
    responder();
}, 5000);

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

app.post('/broadcast', function (req, res) {
    console.log("DOCENTE: Publicaron pregunta: " + JSON.stringify(req.body));
    res.sendStatus(200);
});

function responder(){

    request(foroUrl+'preguntas', function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var pregunta = _.findWhere(JSON.parse(body), {respuesta: ""});

            if (pregunta!=null)
                request.post({
                        json: true,
                        body: { 
                                id: pregunta["id"], 
                                respuesta: "everythings gonna be alright", 
                                docente: server.address().port},
                        url: foroUrl + 'responder'
                });
          }
        })
}

function subscribe(alumno) {
    request.post({
        json: true,
        body: alumno,
        url: foroUrl + 'subscribe'
    });
}

