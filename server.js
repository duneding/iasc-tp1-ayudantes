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
var idPregunta = 0;

app.post('/preguntar', function (req, res) {
    console.log("SERVER: PREGUNTA RECIBIDA: " + idPregunta + " / " + req.body.pregunta + " - ALUMNO: " + req.body.alumno);
    req.body.id = idPregunta++;
    
    var pregunta = {
        id: req.body.id,
        alumno: req.body.alumno,
        pregunta: req.body.pregunta,
        respuesta: ""
    };
    
    preguntas.push(pregunta);

    var mensaje = {
                    pregunta: req.body.id + " / " + req.body.pregunta,
                    alumno: req.body.alumno
                };
    
    alumnosFiltrados = _.filter(alumnos, function(a){ return a!= req.body.alumno; });
    enviar(mensaje, docentes, broadcast);
    enviar(mensaje, alumnosFiltrados, broadcast);

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

app.post('/responder', function (req, res) {
    console.log("SERVER: RESPUESTA A PREGUNTA: " + req.body.id + " RECIBIDA: " + req.body.respuesta + " - DOCENTE: " + req.body.docente);
    preguntas[req.body.id].respuesta = req.body.respuesta;
	
    var mensaje = {
                    pregunta: req.body.id,
                    respuesta: req.body.respuesta,
                    alumno: req.body.alumno,
                    docente: req.body.docente
                };
    
    docentesFiltrados = _.filter(docentes, function(a){ return a!= req.body.docente; });
    enviar(mensaje, docentesFiltrados, broadcast);
    enviar(mensaje, alumnos, broadcast);

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

app.get('/preguntas', function (req, res) {
    if (preguntas) {
        res.status(200).json(preguntas);
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

