/**
 * Created by stevezhang on 2015-11-26.
 */

//Mocha tries to find test files under test by default

var supertest       = require("supertest"),
    should          = require("should");

var server          = supertest.agent("http://localhost:5050");


// suite of tests begin
describe("static GET test",function(){
   //#1 GET test
    it("Home page",function(done){
        server
            .get("/")
            .expect("Content-type",/html/)
            .expect(200,done);
    });

    it("SignIn page",function(done){
        server
            .get("/sign-in")
            .expect("Content-type",/html/)
            .expect(200,done);
    });

    it("SignUp page",function(done){
        server
            .get("/sign-up")
            .expect("Content-type",/html/)
            .expect(200,done);
    });

    it("Forget PWD",function(done){
        server
            .get("/forget")
            .expect("Content-type",/html/)
            .expect(200,done);
    });

    it("Logout",function(done){
        server
            .get("/logout")
            .expect("Content-type",/html/)
            .expect(200,done);
    });

    //TODO: for signup testing, need to delete same user everytime

    it("Return 404",function(done){
       server
           .get("/random")
           .expect(404,done);
    });

});