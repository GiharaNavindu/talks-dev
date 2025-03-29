const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../index'); // Your Express app
const expect = chai.expect;

chai.use(chaiHttp);

describe('Messages API', () => {
  it('should return messages for a user', (done) => {
    chai.request(app)
      .get('/messages/someUserId')
      .set('Cookie', 'token=validToken') // Mock token
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('array');
        done();
      });
  });
});