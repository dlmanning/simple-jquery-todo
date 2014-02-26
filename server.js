var url  = require('url');
var path = require('path');
var fs   = require('fs');
var http = require('http');

var mime = require('mime');
var Encoder = require('node-html-encoder').Encoder;

var encoder = new Encoder('entity');

var server = http.createServer(router).listen(7357);

function router (req, res) {
  var pathname = url.parse(req.url, true).pathname;
  if (pathname.slice(0, 4) === '/api') {
    apiHandler(req, res);
  } else {
    if (pathname[pathname.length - 1] === '/') 
      pathname += 'index.html';
    staticFileHandler(pathname, res);
  }
}

function staticFileHandler (pathname, res) {
  fs.readFile(__dirname + '/public_html' + pathname, function (err, data) {
    if (err) return errHandler(err, res);
    console.log('[200]: ' + pathname);
    res.setHeader('Content-Type', mime.lookup(path.extname(pathname)));
    res.end(data);
  });
}

function errHandler (err, res) {
  if (err.code === 'ENOENT') {
    res.statusCode = 404;
    res.end('File not found!');
    console.log('[404]: File not found: ' + err.path);
  } else {
    console.error(err);
  }
}

function apiHandler (req, res) {
  if (req.method === 'GET') {
    var pathname = url.parse(req.url).pathname
    if (pathname === '/api/data') {
      fs.readFile('data/data.json', {encoding: 'utf8'}, function (err, data) {
        if (err) return errHandler(err, res);
        try {
          data = JSON.stringify(JSON.parse(data));
        } catch (err) {
          data = "{}";
        }
        res.setHeader('Content-Type', mime.lookup('json'));
        res.end(data);
      });
    } else {
      res.statusCode = 404;
      res.end();
    }
  } else if (req.method === 'POST') {
    var data = '';

    req.on('data', function (chunk) {
      data += chunk.toString();
    });

    req.on('end', function () {
      try {
        data = JSON.parse(data);
        data.forEach(function (datum) {
           datum.description = encoder.htmlEncode(datum.description);
         });
        data = JSON.stringify(data);
      } catch (err) {
        console.error(err);
        data = '[]';
      }

      if (!data) return res.end();

      fs.writeFile('data/data.json', data, { encoding: 'utf8' }, function (err) {
        if (err) {
          console.error(err);
          res.end();
        } else {
          res.setHeader('Content-Type', mime.lookup('json'));
          res.end(data);
        }
      });
    });
  }
}