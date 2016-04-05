//==========
//===EH LEE LA DOCUMENTACIÓN ACA=====
//==http://expressjs.com/guide/routing.html===
//==Para más detalles de la API MIRA ACA===
//==http://expressjs.com/4x/api.html
var express = require('express'),
    app = express(),
    querystring = require('querystring'),
    bodyParser = require('body-parser'),
    methodOverride = require("method-override"),
    _ = require('underscore'),
    request = require('request');

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
var docentesPendientes = [];
var idPregunta = 0;

app.post('/preguntas', function (req, res) {
    console.log("SERVER: PREGUNTA RECIBIDA: " + idPregunta + " - ALUMNO: " + req.body.port);
    req.body.id = idPregunta++;
    preguntas.push({pregunta: req.body});
    var alumnoExistente = _.findWhere(alumnos, req.body.port);
    if (!alumnoExistente) {
        alumnos.push(req.body.port);
    }

    var mensaje = {
                    pregunta: idPregunta,
                    alumno: req.body.port
                };
    
    alus = _.filter(alumnos, function(a){ return a!= req.body.port; });
    enviar(mensaje, docentes, broadcast);
    enviar(mensaje, alus, broadcast);
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
    
    console.log("SERVER: SUSCRIPCION " + tipo + " RECIBIDA: " + req.body.id);
    res.status(201).json(req.body);
});


app.post('/respuestas', function (req, res) {
    console.log("SERVER: RESPUESTA A PREGUNTA: " + req.body.pregunta + " RECIBIDA: " + req.body.respuesta + " - DOCENTE: " + req.body.port);
    preguntas[req.body.pregunta].respuesta = req.body.respuesta;
	
    var docenteExistente = _.findWhere(docentes, req.body.port);
    if (!docenteExistente) {
        docentes.push(req.body.port);
    }
    res.status(201).json(req.body);
});

app.get('/subscriptores', function (req, res) {
    var todos = {
        alumnos: alumnos,
        docentes: docentes
    };

    if (todos) {
        res.status(200).json(todos);
    } else {
        res.sendStatus(400);
    }
});

function enviar(mensaje, target, tipo){
    tipo(mensaje, target);
}

function broadcast(mensaje, lista){
    for(var i = 0, size = lista.length; i < size ; i++)            
        request.post({
            json: true,
            body:  mensaje,
            url: 'http://localhost:' + lista[i] + '/broadcast'
        });    
}

