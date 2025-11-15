const request = require('supertest');
let app;
const Listing = require('../models/Listing');

describe('Counter flow', () => {
  let sellerToken, buyerToken, listingId, bidId;

  beforeAll(async () => {
    app = require('../server');
    const sellerRes = await request(app)
      .post('/api/auth/signup')
      .send({ name: 'CounterSeller', email: 'cseller@example.com', password: 'password', mobile: '9999990101', userType: 'individual' });
    sellerToken = sellerRes.body.token;

    const buyerRes = await request(app)
      .post('/api/auth/signup')
      .send({ name: 'CounterBuyer', email: 'cbuyer@example.com', password: 'password', mobile: '9999990102', userType: 'individual' });
    buyerToken = buyerRes.body.token;

    const listRes = await request(app)
      .post('/api/listings/sell')
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({ company: 'CounterCo', isin: 'ISINCT1', price: 1000, shares: 10 });
    listingId = listRes.body.listing._id;
  });

  it('seller counters bid and buyer responds', async () => {
    const bidRes = await request(app)
      .post(`/api/listings/${listingId}/bid`)
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ price: 990, quantity: 2 });
    expect(bidRes.statusCode).toBe(200);
    bidId = bidRes.body.listing.bids[0]._id;

    // Seller counters
    const counterRes = await request(app)
      .post(`/api/listings/${listingId}/bid/${bidId}/counter`)
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({ counterPrice: 995, quantity: 2 });
    expect(counterRes.statusCode).toBe(200);
    expect(counterRes.body.listing.bids[0].counterPrice).toBe(995);
    expect(counterRes.body.listing.bids[0].counterHistory.length).toBeGreaterThanOrEqual(1);

    // Buyer responds to counter
    const respondRes = await request(app)
      .post(`/api/listings/${listingId}/bid/${bidId}/counter/respond`)
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ counterPrice: 993, quantity: 2 });
    expect(respondRes.statusCode).toBe(200);
    const updatedBid = respondRes.body.listing.bids[0];
    expect(updatedBid.counterPrice).toBe(993);
    expect(updatedBid.counterBy).toBe('buyer');
    expect(updatedBid.counterHistory.length).toBeGreaterThanOrEqual(2);
  });
});
