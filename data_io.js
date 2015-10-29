//This is another Node Js app that handles the data upload and data download 
var express = require("express");
var app = new express();

/* * * * * * * * * * * * * *
*      App Config          * 
* * * * * * * * * * * * * ** 
*/
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));//parse POST request 
app.set("port",5051);

//DB 

/* * * * * * * * * * * * *
*      Route             *
* * * * * * * * * * * * **
*/

//This route is used to retrieve user data in JSON format
app.get("/data/:id",function(req,res){
	var userid = req.params.id;
	//Retrieve from DB
	//Return Status
});

//This route is used to upload file in JSON format
app.post("/data",function(req,res){
	var userid = req.body.id;
	var data = req.body.id;
	//Load into DB
	//Return Status
});

/* * * * * * * * * * * * *
*      Deployment        *
* * * * * * * * * * * * **
*/

app.listen(app.get('port'),function(){
	console.log("The server is opened at port 5051. It is deployed on Steve's server");
});