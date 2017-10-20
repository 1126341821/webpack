var express = require('express');
var app = express();
app.get('/tao/:id/:password', function(req, res) {  
    res.header("Access-Control-Allow-Origin", "*");   //设置跨域访问 
    const end=JSON.stringify({id:req.params.id, name: req.params.password})
    res.jsonp(end)
});  
app.use(express.static('build'));

//app.get('/tao', function(req, res) {
//	res.send('Hello World');
//})

var server = app.listen(8081, function() {

	var host = server.address().address
	var port = server.address().port

	console.log("应用实例，访问地址为 http://%s:%s", host, port)

})