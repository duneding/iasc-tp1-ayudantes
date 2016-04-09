var express = require('express'),
    request = require('request'),
    _ = require('underscore'),
    app = express();

var serverURL = 'http://localhost:3000/';
	  
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
    });
}

function setInProcess(id){
    request.post({
        url: serverURL + 'process/' + id
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

function responder(){
    request(serverURL+'preguntas', function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var pregunta = _.findWhere(JSON.parse(body), {pending: true});
            if (!_.isUndefined(pregunta)){    
     
                if (!getInProcess(pregunta.id)){
                    setInProcess(pregunta.id);
                    broadcast({
                        mensaje: escribiendo(pregunta.id),
                        id: getPort()});
            
                    setTimeout(function(){
                        request.post({
                            json: true,
                            body: { 
                                    id: pregunta.id, 
                                    respuesta: "everythings gonna be alright", 
                                    docente: getPort()
                                },
                            url: serverURL + 'responder'
                        });
                    }, 6000);
                }  
            }          
          }
        });
}

function escribiendo(id){
    return "Docente " + getPort() + " esta escribiendo respuesta a pregunta " + id;
}

function getPort(){
    return server.address().port;
}

function startReplying() {
	console.log('Docente: Start Replying');
    setInterval(function () {
        responder();
    }, 5000);
}

function subscribe(docente, cont) {
    request.post({
        json: true,
        body: docente,
        url: serverURL + 'subscribe'
    });
    cont();
}