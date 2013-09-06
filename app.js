
/**
 * Module dependencies.
 */

var ipaddress = process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1";
var port      = process.env.OPENSHIFT_NODEJS_PORT || 3000;

var express = require('express');
var routes = require('./routes');
var job = require('./routes/job');
var http = require('http');
var path = require('path');
var engine = require("ejs-locals");

var app = express();
app.engine("ejs",engine);

// all environments
app.set('port', port);
app.set('ipaddress',ipaddress);

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/jobs/new',job.new);
app.post('/jobs/new',job.save);

http.createServer(app).listen(app.get('port'),app.get('ipaddress') ,  function(){
  console.log('Express server listening on '+app.get('ipaddress')+ ':'+ app.get('port'));
});
