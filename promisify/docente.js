var express = require('../node_modules/express'),
    request = require('../node_modules/request'),
    _ = require('../node_modules/underscore'),
    app = express(),
    Q = require('../node_modules/q');

var serverURL = 'http://localhost:3000/';
var TIEMPO_RESPUESTA = 10000;

app.use(require('body-parser').json());

var server = app.listen(process.argv[2], function () {
  var host = server.address().address;
  var port = getPort();

    console.log('Docente listening at http://%s:%s', host, port);
});

subscribe({
    id: getPort(),
    alumno: false
  })
.then(startReplying);

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

function broadcast(id, action){
    request.post({
        json: true,
        body: action(id),
        url: serverURL + 'broadcast'
    });
}

function setInProcess(id){
    request({
        url:  serverURL + 'process/' + id,
        method: 'POST'
    }, function(error, response, body){
        if(error)
            console.log(error);
        broadcast(id, escribiendo);        
    });    
}

function getInProcess(id){
    request(serverURL + 'process/' + id, function (error, response, body) {
      if (!error && response.statusCode == 200)
        return true;
      else
        return false;
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
        });
    }, 6000);
}

function buscarPreguntas(){
    request(serverURL+'preguntas', function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var pregunta = _.findWhere(JSON.parse(body), {pending: true});
            if (!_.isUndefined(pregunta))    
                if (!getInProcess(pregunta.id))
                    responder(pregunta.id, setInProcess);                      
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

function subscribe(docente) {
    request.post({
        json: true,
        body: docente,
        url: serverURL + 'subscribe'
    });

    return Q();
}