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
    _ = require('underscore');

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
    preguntas.push(req.body);
    var alumnoExistente = _.findWhere(alumnos, req.body.port);
    if (!alumnoExistente) {
        alumnos.push(req.body.port);
    }
    res.status(201).json(req.body);
});

app.post('/subscribe', function (req, res) {
    console.log("SERVER: SUSCRIPCION RECIBIDA: " + req.body.id);
    var existente = false;

    if (req.body.alumno){
        existente = _.findWhere(alumnos, req.body.id);
        if (!existente)
            alumnos.push(req.body.id);
    }else{
        existente = _.findWhere(docentes, req.body.id);
        if (!existente)
            docentes.push(req.body.id);
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
