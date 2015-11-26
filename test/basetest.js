/**
 * Created by stevezhang on 2015-11-26.
 */

//Mocha tries to find test files under test by default

var supertest       = require("supertest"),
    should          = require("should");

var server          = supertest.agent("http://localhost:5050");


// UNIT test begin
describe("SAMPLE unit test",function(){
   //#1 GET test
    it("GET home page",function(done){
        server
            .get("/")
            //.expect("Contect-type",/html/)
            .expect(200)
            .end(function(err,res){
                res.status.should.equal(200);
                done();
            });
    });

    /*
     https://codeforgeek.com/2015/07/unit-testing-nodejs-application-using-mocha/
     #2 POST test
    it("POST login",function(done){
       server
           .post('/')
    });
    */

    //#3 404 error
    it("Return 404",function(done){
       server
           .get("/random")
           .expect(404)
           .end(function(err,res){
               res.status.should.equal(404);
               done();
           });
    });

});