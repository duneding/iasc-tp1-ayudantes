var express = require('express'),
    request = require('request'),
    _ = require('underscore'),
    app = express();

var serverURL = 'http://localhost:3000/';

app.use(require('body-parser').json());

var server = app.listen(process.argv[2], function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Docente listening at http://%s:%s', host, port);
});

subscribe({
    id: server.address().port,
    alumno: false
}, startReplying);

app.get('/', function (req, res) {
	request.get({
		json: true,
		url: serverURL + 'respuestas'
    }).pipe(res);
});

app.post('/broadcast', function (req, res) {
    console.log("<DOCENTE> " + req.body.mensaje);
    res.sendStatus(200);
});

function broadcast(mensaje){
    request.post({
        json: true,
        body: mensaje,
        url: serverURL + 'broadcast'
    })
}

function responder(){
    request(serverURL+'preguntas', function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var pregunta = _.findWhere(JSON.parse(body), {pending: true});

            if (!_.isUndefined(pregunta)){
                
                broadcast({
                        mensaje:"Docente " + server.address().port + " esta escribiendo respuesta a pregunta " + pregunta.id,
                        id: server.address().port});

                setTimeout(function(){
                    request.post({
                        json: true,
                        body: { 
                                id: pregunta.id, 
                                respuesta: "everythings gonna be alright", 
                                docente: server.address().port
                            },
                        url: serverURL + 'responder'
                    });
                }, 6000);  
            }          
          }
        });
}

function subscribe(alumno) {
    request.post({
        json: true,
        body: alumno,
        url: serverURL + 'subscribe'
    });
}

function startReplying() {
    setInterval(function () {
        responder();
    }, 5000);
}

function subscribe(alumno, cont) {
    request.post({
        json: true,
        body: alumno,
        url: serverURL + 'subscribe'
    });
    cont();
}