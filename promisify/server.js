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

app.post('/preguntar', function (req, res) {
    console.log("<SERVER> PREGUNTA RECIBIDA: " + idPregunta + " / " + req.body.pregunta + " - ALUMNO: " + req.body.alumno);
    req.body.id = idPregunta++;
    
    var pregunta = {
        id: req.body.id,
        alumno: req.body.alumno,
        pregunta: req.body.pregunta,
        respuesta: "",
        pending: true
    };
    
    preguntas.push(pregunta);

    var mensaje = {
                    mensaje: "El alumno " + req.body.alumno + " publico la pregunta " + req.body.pregunta + " (" + req.body.id + ")",
                    pregunta: req.body.id + " / " + req.body.pregunta,
                    alumno: req.body.alumno
                };
    
    filtrados = _.filter(todos(), function(a){ return a!= req.body.alumno; });
    enviar(mensaje, filtrados, broadcast);

    res.status(201).json(req.body);
});

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

app.post('/responder', function (req, res) {
    console.log("<SERVER> RESPUESTA A PREGUNTA: " + req.body.id + " RECIBIDA: " + req.body.respuesta + " - DOCENTE: " + req.body.docente);
    preguntas[req.body.id].respuesta = req.body.respuesta;
	preguntas[req.body.id].pending = false;

    var mensaje = {
                    mensaje: "La pregunta " + req.body.id + " fue respondida por docente " + req.body.docente + ": " + req.body.respuesta,
                    pregunta: req.body.id,
                    respuesta: req.body.respuesta,
                    alumno: req.body.alumno,
                    docente: req.body.docente
                };
    
    filtrados = _.filter(todos(), function(a){ return a!= req.body.docente; });
    enviar(mensaje, filtrados, broadcast);    

    res.status(201).json(req.body);
});

app.post('/broadcast', function (req, res) {
    console.log("<SERVER> BROADCAST: " + req.body.mensaje);
    filtrados = _.filter(todos(), function(a){ return a!= req.body.id; });
    enviar(req.body, filtrados, broadcast);
    res.status(201).json(req.body);
});

app.post('/process/:id', function (req, res) {
    console.log("<SERVER> Pregunta en proceso: " + req.params.id);
    preguntasInProcess.push(req.params.id);
    res.sendStatus(200);
});

app.get('/process/:id', function (req, res) {  
    var pregunta = _.find(preguntasInProcess, function(id){ return id == req.params.id; });
    if (!_.isUndefined(pregunta)){
        console.log("<SERVER> Pregunta seteada en proceso: " + req.params.id);
        res.status(200);
    }else
        res.status(400);
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

function todos(){
    return docentes.concat(alumnos);
}

function enviar(mensaje, target, tipo){
    tipo(mensaje, target);
}

function broadcast(mensaje, lista){
    for(var i = 0, size = lista.length; i < size ; i++)            
        request.post({
            json: true,
            body: mensaje,
            url: 'http://localhost:' + lista[i] + '/broadcast'
        });    
}
