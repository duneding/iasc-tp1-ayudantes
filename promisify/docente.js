var express = require('../node_modules/express'),
    request = require('../node_modules/request'),
    _ = require('../node_modules/underscore'),
    app = express(),
    Q = require('../node_modules/q');

var serverURL = 'http://localhost:3000/';
var TIEMPO_RESPUESTA = 1000;
var answering = false;

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
    console.log("<DOCENTE> " +req.body.text);
    res.sendStatus(200);
});

function broadcast(mensaje){
    var deferred = Q.defer();
    request({
        json: true,
        body: mensaje,
        url: serverURL + 'broadcast',
        method: 'POST'
    }, function(error, response, body){
        if(error)
            deferred.reject(error);
        else
            deferred.resolve(); 
    });

    return deferred.promise;       
}

function setInProcess(id){
    var deferred = Q.defer();
    request({
        url:  serverURL + 'process/' + id,
        method: 'POST'
    }, function(error, response, body){        
        if(error)
            deferred.reject(error);
        else
            deferred.resolve(id); 
    }); 

    return deferred.promise;       
}

function alreadyInProcess(id){
    var deferred = Q.defer();

    request(serverURL + 'process/' + id, function (error, response, body) {
      if (!error && response.statusCode == 200)
        deferred.resolve(-1);
      else if(!error && response.statusCode == 400)
        deferred.resolve(id);
      else if(error)
        deferred.reject(error);      
    });
    return deferred.promise;
}

function responder (id){
    var deferred = Q.defer();
    
    setTimeout(function(){
        request({
            json: true,
            method: 'POST',
            body: { 
                    id: id, 
                    respuesta: "everythings gonna be alright", 
                    docente: getPort()
                },
            url: serverURL + 'responder'
        }, function(error, response, body){
            if(error)
                deferred.reject(error);
            else{
                deferred.resolve(response); 
                answering = false;
            }
        });
    }, 6000);

    return deferred.promise;
}

function buscarPreguntas(){
    var deferred = Q.defer();

    request(serverURL+'preguntas', function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var pregunta = _.findWhere(JSON.parse(body), {pending: true});
            if (!_.isUndefined(pregunta))
                alreadyInProcess(pregunta.id)
                    .then(function(res){
                        deferred.resolve(res);
                    })
                    .fail(function(error){
                        deferred.reject(error)    
                    });            
            else
                deferred.reject('no question yet!');
            
        }
    });

    return deferred.promise;
}

function escribiendo(id){
    return {
            text: "Docente " + getPort() + " esta escribiendo respuesta a pregunta " + id,
            id: getPort()
           };
}

function getPort(){
    return server.address().port;
}

function startReplying() {
	console.log('Docente: Start Replying');
    setInterval(function () {
        if(!answering) 
            buscarPreguntas()
                .then(function(id){
                    if (id>=0){
                        answering=true;
                        setInProcess(id)
                            .all([broadcast(escribiendo(id)), responder(id)])                                  
                            .fail(function(error){
                                console.log(error);
                            });
                    }
                })
                .fail(function(error){
                    console.log(error);
                });
        else
            console.log("Sos humano no podes responder otra!!!");    

    }, TIEMPO_RESPUESTA);
}

function subscribe(docente) {
    var deferred = Q.defer();

    request({
        json: true,
        body: docente,
        url: serverURL + 'subscribe',
        method: 'POST'
    }, function(error, response, body){
        if (error)
            deferred.reject(error);
        else
            deferred.resolve();

    });

    return deferred.promise;
}