var express = require('express'),
    request = require('request'),
    _ = require('underscore'),
    app = express();

var serverURL = 'http://localhost:3000/';
var TIEMPO_RESPUESTA = 10000;
var TIEMPO_ESCRITURA = 6000;

app.use(require('body-parser').json());

var server = app.listen(process.argv[2], function () {
  var host = server.address().address;
  var port = getPort();

  console.log('Docente listening at http://%s:%s', host, port);
  subscribe({
    id: getPort(),
    alumno: false
  }, startReplying);
});

app.get('/', function (req, res) {
	request.get({
		json: true,
		url: serverURL + 'respuestas'
    }, function(error){
		if (error) {
			console.log('No se pudo obtener la lista de respuestas - Error: ' + error);
		}
	}).pipe(res);
});

app.post('/broadcast', function (req, res) {
    console.log("<DOCENTE> " + req.body.mensaje);
    res.sendStatus(200);
});

function broadcast(id, action){
    request.post({
        json: true,
        body: action(id),
        url: serverURL + 'broadcast'
    }, function(error, response, body){
        if(error) {
            console.error('No se pudo enviar un broadcast: ' + error);
		}
    });
}

function setInProcess(id){
    request({
        url:  serverURL + 'process/' + id,
        method: 'POST'
    }, function(error, response, body){
        if(error)
            console.error(error);
        broadcast(id, escribiendo);        
    });    
}

function getInProcess(id){
	request.get(serverURL + 'process/' + id)
	  .on('error', function (error) {
	  	console.error('No se pudo consultar si la pregunta: ' + id + ' estaba en proceso de responderse - Error: ' + error);
	  })
	  .on('response', function (response) {
		if (response.statusCode == 200) {
			console.log('La pregunta: ' + id + ' está en proceso de responderse');
		} else {
			responder(id, setInProcess);                      
		}
      });
}

function responder (id, setInProcess){
    setInProcess(id);
    
    setTimeout(function(){
        request.post({
            json: true,
            body: {
                    id: id, 
                    respuesta: "everythings gonna be alright", 
                    docente: getPort()
                },
            url: serverURL + 'responder'
        }, function(error, response, body){
			if (error) {
				console.log('No se pudo postear la respuesta a la pregunta: ' + id + ' - Error: ' + error);
			} else {
				console.log('Docente: ' + getPort() + ' respondió la pregunta: ' + id + ' - Info: ' + JSON.stringify(body));
			}
		});
    }, TIEMPO_ESCRITURA);
}

function buscarPreguntas(){
    request(serverURL+'preguntas', function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var pregunta = _.findWhere(JSON.parse(body), {pending: true});
            if (!_.isUndefined(pregunta)) {
                getInProcess(pregunta.id);
			}
	  	} else if (error) {
			console.error('Falló al obtener las preguntas: ' + error);
	  	} else {
			console.log('Error al obtener las preguntas, status: ' + response.statusCode);
		}
    });
}

function escribiendo(id){
    return {
            mensaje: "Docente " + getPort() + " esta escribiendo respuesta a pregunta " + id,
            id: getPort()
           };
}

function getPort(){
    return server.address().port;
}

function startReplying() {
	console.log('Docente: Start Replying');
    setInterval(function () {
        buscarPreguntas(responder);
    }, TIEMPO_RESPUESTA);
}

function subscribe(docente, cont) {
    request.post({
        json: true,
        body: docente,
        url: serverURL + 'subscribe'
    }, function(error, response, body){
		if (error) {
			console.log('No se pudo suscribir el docente: ' + docente.id + ' - Error: ' + error);
		} else {
			console.log('Docente: ' + docente.id + ' suscripto. Info: ' + JSON.stringify(body));
		}
	});
    cont();
}