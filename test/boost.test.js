const request = require('supertest');
let app;

describe('Boost payment simulation', () => {
  let sellerToken, listingId;

  beforeAll(async () => {
    app = require('../server');
    const sellerRes = await request(app)
      .post('/api/auth/signup')
      .send({ name: 'BoostSeller', email: 'boostseller@example.com', password: 'password', mobile: '9999990201', userType: 'individual' });
    sellerToken = sellerRes.body.token;

    const listRes = await request(app)
      .post('/api/listings/sell')
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({ company: 'BoostCo', isin: 'ISINB1', price: 200, shares: 2 });
    listingId = listRes.body.listing._id;
  });

  it('simulates boost payment', async () => {
    const res = await request(app)
      .post(`/api/listings/${listingId}/boost/pay`)
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({ simulate: true });

    expect(res.statusCode).toBe(200);
    expect(res.body.listing.boosted).toBe(true);
    expect(res.body.listing.boostTx).toBeDefined();
    expect(res.body.listing.boostTx.amount).toBe(100);
  });
});
