//==========
//===EH LEE LA DOCUMENTACIÓN ACA=====
//==http://expressjs.com/guide/routing.html===
//==Para más detalles de la API MIRA ACA===
//==http://expressjs.com/4x/api.html
var express = require('../node_modules/express'),
    app = express(),
    bodyParser = require('../node_modules/body-parser'),
    methodOverride = require("../node_modules/method-override"),
    _ = require('../node_modules/underscore'),
    request = require('../node_modules/request'),
    Q = require('../node_modules/q');

app.use(bodyParser.urlencoded({ extended: false }));  
app.use(bodyParser.json());  
app.use(methodOverride());

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Server listening at http://%s:%s', host, port);
});

var preguntas = [];
var alumnos = [];
var docentes = [];
var preguntasInProcess = [];
var idPregunta = 0;

app.post('/subscribe', function (req, res) {    
    var tipo = '';
    if (req.body.alumno){        
        alumnos.push(req.body.id);
        tipo = 'ALUMNO';
    }else{
        docentes.push(req.body.id);
        tipo = 'DOCENTE';
    }
    
    console.log("<SERVER> SUSCRIPCION " + tipo + " RECIBIDA: " + req.body.id);
    res.status(201).json(req.body);
});

app.post('/preguntar', function (req, res) {
    console.log("<SERVER> PREGUNTA RECIBIDA: " + idPregunta + " / " + req.body.pregunta + " - ALUMNO: " + req.body.alumno);
    req.body.id = idPregunta++;
    
    saveQuestion(req.body)
        .then(broadcast)
        .done();    
    
    res.status(201).json(req.body);
});

app.post('/responder', function (req, res) {
    console.log("<SERVER> RESPUESTA A PREGUNTA: " + req.body.id + " RECIBIDA: " + req.body.respuesta + " - DOCENTE: " + req.body.docente);

    answerQuestion(req.body)
        .then(broadcast)
        .done();

    res.status(201).json(req.body);
});

app.post('/broadcast', function (req, res) {
    console.log("<SERVER> BROADCAST: " + req.body.text);
    filtrados = _.filter(todos(), function(a){ return a!= req.body.id; });
    
    var message = {
        target: filtrados,
        text: req.body.text
    }

    broadcast(message);

    res.status(201).json(req.body);
});

app.post('/process/:id', function (req, res) {
    console.log("<SERVER> Pregunta seteada en proceso: " + req.params.id);
    
    if(_.contains(preguntasInProcess, req.params.id))
        res.sendStatus(406);
    else{
        preguntasInProcess.push(req.params.id);
        res.sendStatus(200);
    }    
});

app.get('/process/:id', function (req, res) { 
 
    var pregunta = _.find(preguntasInProcess, function(id){ return id == req.params.id; });
    if (!_.isUndefined(pregunta)){
        console.log("<SERVER> Pregunta en proceso: " + req.params.id);
        res.sendStatus(200);
    }else
        res.sendStatus(400);
});

app.get('/participantes', function (req, res) {
    var todos = todos();

    if (todos)
        res.status(200).json(todos);
    else
        res.sendStatus(400);
});

app.get('/preguntas', function (req, res) {
    if (preguntas) {
        res.status(200).json(preguntas);
    } else {
        res.sendStatus(400);
    }
});

function saveQuestion(q){
    var pregunta = {
        id: q.id,
        alumno: q.alumno,
        pregunta: q.pregunta,
        respuesta: "",
        pending: true
    };
    
    preguntas.push(pregunta);

    filtrados = _.filter(todos(), function(a){ return a!= q.alumno; });
    var message = {
        target: filtrados,
        text: "El alumno " + q.alumno + " publico la pregunta " + q.pregunta + " (" + q.id + ")",
        pregunta: q.id + " / " + q.pregunta,
        alumno: q.alumno        
    }

    return Q(message);
}

function answerQuestion(q){
    preguntas[q.id].respuesta = q.respuesta;
    preguntas[q.id].pending = false;

    filtrados = _.filter(todos(), function(a){ return a!= q.docente; });
    var message = {
                    text: "La pregunta " + q.id + " fue respondida por docente " + q.docente + ": " + q.respuesta,
                    pregunta: q.id,
                    respuesta: q.respuesta,
                    alumno: q.alumno,
                    docente: q.docente,
                    target: filtrados
                };
    
    return Q(message);
}

function todos(){
    return docentes.concat(alumnos);
}

function broadcast(message){
    var status = {
        fail:[],
        success:[]
    };

    var target = message.target;
    var deferred = Q.defer();

    for(var i = 0, size = target.length; i < size ; i++)            
        request({
            json: true,
            body: message,
            url: 'http://localhost:' + target[i] + '/broadcast',
            method: 'POST'
        }, function(error, response, body){
            if (error)
                status.fail.push(target[i]);
            else
                status.success.push(target[i]);
        });    

    deferred.resolve(status);
    return deferred.promise;
}
