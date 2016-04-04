var express = require('express'),
    request = require('request'),
    app = express();

app.use(require('body-parser').json());

var server = app.listen(process.argv[2], function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Alumno listening at http://%s:%s', host, port);
});

setInterval(function () {
    preguntar({
        port: server.address().port,
        pregunta: 'whats going on?'
    });
}, 1000);

app.post('/', function (req, res) {
    console.log("ALUMNO: RECIBI " + JSON.stringify(req.body));
    res.sendStatus(200);
});


function preguntar(pregunta) {
    request.post({
        json: true,
        body: pregunta,
        url: 'http://localhost:3000/preguntas'
    });
}

