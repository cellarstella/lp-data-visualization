var http = require('http')
var url = require('url')
var fs = require('fs')
var baseDirectory = __dirname   // or whatever base directory you want

http.createServer(function (request, response) {
   var requestUrl = url.parse(request.url)
   var fsPath = baseDirectory+requestUrl.pathname

   fs.exists(fsPath, function(exists) {
     try {
       if(exists) {
         response.writeHead(200)
         fs.createReadStream(fsPath).pipe(response) // do NOT use fs's sync methods (e.g readFileSync) ANYWHERE on production
       } else {
         response.writeHead(500)
       }
     } finally {
        response.end() // inside finally so errors don't make browsers hang
     } 
   })
}).listen(3000)