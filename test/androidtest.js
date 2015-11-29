/**
 * Created by stevezhang on 2015-11-26.
 */

/**
 * Created by stevezhang on 2015-11-26.
 */

//Mocha tries to find test files under test by default

var supertest       = require("supertest"),
    should          = require("should");

var server          = supertest.agent("http://localhost:5050");


// suite of tests begin
describe("Android mocked POST test",function(){

    it("Sign In",function(done){
        this.timeout(3000);
        var expuid = 70;
        var credential = {username:'marcoks',password:'marcoks'};
        server
            .post('/sign-in')
            .set('User-agent','android')
            .send(credential)
            .expect("Content-type",/json/)
            .expect(200)
            .end(function(err,res){
                res.body.authenticated.should.equal(expuid);
                //res.body.token.should.eql(null);
                done();
            });
    });

    it("Calender",function(done){
        // TODO, would need to change tosend in future, dump test for now
        var expjson = {"booked":true,"user":true,"timeslot":true,"doctorid":1};
        var tosend002 = {uid:70,date:'2015-11-03T05:00:00.000Z',timeslot_id:2};
        server
            .post('/calender')
            .set('User-agent','android')
            .send(tosend002)
            .expect("Content-type",/json/)
            .expect(200)
            .end(function(err,res){
                res.body.booked.should.equal(true);
                res.body.user.should.equal(true);
                res.body.timeslot.should.equal(true);
                res.body.doctorid.should.equal(1);
                done();
            });
    });

    it("Medical History",function(done){
        this.timeout(3000);
        var expjson = [{"history_id": 22, "staff_id": 5, "customer_id": 70, "staff_name": "john smith", "customer_name": "marcoks", "visit_date": "2015-11-28T21:23:00.000Z", "symptom": "insomnia", "resolution": "sleep more", "additional_note": "use health we"} ];
        server
            .post('/medhistry')
            .set('User-agent','android')
            .send({uid:70})
            .expect("Content-type",/json/)
            .expect(200)
            .end(function(err,res){
                res.body.success.should.equal(true);
                res.body.out.should.eql(expjson);
                done();
            });
    });

    it("UserInfo",function(done){
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

});