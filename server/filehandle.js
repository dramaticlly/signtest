/**
 * Created by stevezhang on 2015-11-04.
 */


//node formidable

var formidable = require('formidable'),
    util 	   = require('util'),
    express    = require('express'),
    path       = require('path'),
    logger     = require('morgan'),
    fs         = require('fs');

var app = new express();
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));//parse POST request
app.set("port",8090);
app.use(logger('dev'));
// options

app.use(express.static(__dirname + '/'));

/**
* API to upload the file
* @Param : post contain data=formData,                  // var formData = new FormData();
 * require post to use enctype =  "multipart/form-data"
 * require individual file variable as 'fileToUpload'   //formData.append("fileToUpload", $singlefile);
 * require fileToUpload has 'path' and 'name' property
 * require 'name' property dont contain any space, prefix with uid
**/
app.post('/upload',function(req,res){
    var form = new formidable.IncomingForm();
    /* * * * * * * * * * * * *
     *      form             *
     * * * * * * * * * * * * **
     */
    form.encoding = 'utf-8';
// default to os.tmpDir()
    form.uploadDir = "/tmp/sleepdata";
    form.keepExtensions = true;         //the files argument will contain arrays of files for inputs which submit multiple files using the HTML5 multiple attribute.
    form.type = 'multipart';
    form.multipart = true;
    form.maxFieldSize = 50*1024*1024;   //50Mb memory allocated

    console.log(" ########## POST /upload form ####### "+ form.uploadDir);
    if (typeof req.body.fileToUpload !== 'undefined'){
        console.log("req.body.paramter"+req.body.fileToUpload.name);
    }
    console.log('empty');
    form.parse(req, function(err,fields,files){
       if(files.fileToUpload){
           console.log('File:'+files.fileToUpload.name);
           // In post request, data: formData (array of files to upload)
           // formData.append("fileToUpload", $scope.fileid);
           // need to remove all space in file names (ask stephen)
           /*** Async, fs.readFile(filename[, options], callback) ***/
           fs.readFile(files.fileToUpload.path,function(err,data){
                fs.writeFile(path.join(form.uploadDir,files.fileToUpload.name),data,'utf8',function(err){
                   if (err){
                       res.status(200).json({result:false,mmessage:'unable to write'});
                   }
                    else{
                       res.status(200).json({result:true,message:"File saved",data:{location:files.fileToUpload.name}});
                   }
                });//end of write file
               if(err){
                   res.status(200).json({result:false,mmessage:'unable to read'});
               }
           });
       }//end of file in queue
        else{
           res.status(200).json({result:false,mmessage:'no file received'});
       }
       //res.status(200).send("received upload:\n\n"+util.inspect({fields:fields, files:files}));
    });

});

app.listen(app.get('port'),function(){
    console.log("The server is opened at port 8090. It is deployed on Steve's server");
});