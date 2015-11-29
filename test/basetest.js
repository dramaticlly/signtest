/**
 * Created by stevezhang on 2015-11-26.
 */

//Mocha tries to find test files under test by default

var supertest       = require("supertest"),
    should          = require("should");

var server          = supertest.agent("http://localhost:5050");


// suite of tests begin
describe("SAMPLE unit test",function(){
   //#1 GET test
    it("GET home page",function(done){
        server
            .get("/")
            //.expect("Contect-type",/html/)
            .expect(200,done);
    });


    // https://codeforgeek.com/2015/07/unit-testing-nodejs-application-using-mocha/
    // #2 POST test
    it("POST medical history",function(done){
       this.timeout(3000);
       var expjson = [{"history_id": 22, "staff_id": 5, "customer_id": 70, "staff_name": "john smith", "customer_name": "marcoks", "visit_date": "2015-11-28T21:23:00.000Z", "symptom": "insomnia", "resolution": "sleep more", "additional_note": "use health we"} ];
       server
           .post('/medhistry')
           .send({uid:70})
           .expect("Content-type",/json/)
           .expect(200)
           .end(function(err,res){
              res.body.success.should.equal(true);
              res.body.out.should.eql(expjson);
              done();
           });

    });

    it("POST UserInfo",function(done){
        this.timeout(3000);
        var expjson = {"success":true,"name":"marcoks","subscription":true,"email":"marcoks@gmail.com","invoiceDate":"2015-11-14T06:49:23.000Z"};
        server
            .post('/userinfo')
            .set('User-agent','android')
            .send({uid:70})
            .expect("Content-type",/json/)
            .expect(200)
            .end(function(err,res){
                res.body.success.should.equal(true);
                res.body.should.eql(expjson);
                done();
            });
    });

    //#3 404 error
    it("Return 404",function(done){
       server
           .get("/random")
           .expect(404,done);
    });

});