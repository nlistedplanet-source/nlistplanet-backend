const request = require('supertest');
let app;
const User = require('../models/User');
const Listing = require('../models/Listing');
const Trade = require('../models/Trade');
const path = require('path');

describe('Sell flow E2E', () => {
  let sellerToken, buyerToken, adminToken;
  let listingId, bidId, tradeId;

  beforeAll(async () => {
    app = require('../server');

    const sellerRes = await request(app)
      .post('/api/auth/signup')
      .send({ name: 'E2ESeller', email: 'e2eseller@example.com', password: 'password', mobile: '9900000101', userType: 'individual' });
    sellerToken = sellerRes.body.token;

    const buyerRes = await request(app)
      .post('/api/auth/signup')
      .send({ name: 'E2EBuyer', email: 'e2ebuyer@example.com', password: 'password', mobile: '9900000102', userType: 'individual' });
    buyerToken = buyerRes.body.token;

    const adminRes = await request(app)
      .post('/api/auth/signup')
      .send({ name: 'E2EAdmin', email: 'e2eadmin@example.com', password: 'password', mobile: '9900000103', userType: 'admin' });
    adminToken = adminRes.body.token;
  });

  it('seller creates listing and buyer places a bid', async () => {
    const listRes = await request(app)
      .post('/api/listings/sell')
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({ company: 'E2ECo', isin: 'ISINE2E1', price: 100, shares: 20 });
    expect(listRes.statusCode).toBe(201);
    listingId = listRes.body.listing._id;

    const bidRes = await request(app)
      .post(`/api/listings/${listingId}/bid`)
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ price: 99, quantity: 5 });
    expect(bidRes.statusCode).toBe(200);
    bidId = bidRes.body.listing.bids[0]._id;
  });

  it('seller counters and buyer responds', async () => {
    const counterRes = await request(app)
      .post(`/api/listings/${listingId}/bid/${bidId}/counter`)
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({ counterPrice: 101, quantity: 5 });
    expect(counterRes.statusCode).toBe(200);
    const resp = await request(app)
      .post(`/api/listings/${listingId}/bid/${bidId}/counter/respond`)
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ counterPrice: 100, quantity: 5 });
    expect(resp.statusCode).toBe(200);
    const bid = resp.body.listing.bids.find(b => b._id === bidId || b._id === bidId);
    expect(bid.counterPrice).toBe(100);
  });

  it('seller and buyer accept to create trade', async () => {
    const accept1 = await request(app)
      .post(`/api/listings/${listingId}/bid/${bidId}/accept`)
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({ party: 'seller' });
    expect(accept1.statusCode).toBe(200);

    const accept2 = await request(app)
      .post(`/api/listings/${listingId}/bid/${bidId}/accept`)
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ party: 'buyer' });
    expect(accept2.statusCode).toBe(200);
    expect(accept2.body.trade).toBeDefined();
    tradeId = accept2.body.trade._id;
  });

  it('buyer confirms and proofs uploaded then admin verifies', async () => {
    // buyer confirm
    const confirm = await request(app)
      .post(`/api/trades/${tradeId}/confirm`)
      .set('Authorization', `Bearer ${buyerToken}`);
    expect(confirm.statusCode).toBe(200);

    // Upload seller proofs using multipart attachments
    const proofPath = path.resolve(__dirname, 'resources', 'sample-proof.png');
    const sellerProofRes = await request(app)
      .post(`/api/trades/${tradeId}/seller-proofs`)
      .set('Authorization', `Bearer ${sellerToken}`)
      .attach('dpSlip', proofPath)
      .attach('transferConfirmation', proofPath);
    expect(sellerProofRes.statusCode).toBe(200);

    // Upload buyer proofs (payment screenshot + utr)
    const buyerProofRes = await request(app)
      .post(`/api/trades/${tradeId}/buyer-proofs`)
      .set('Authorization', `Bearer ${buyerToken}`)
      .field('utr', 'UTR-E2E-001')
      .attach('paymentScreenshot', proofPath);
    expect(buyerProofRes.statusCode).toBe(200);

    const verify = await request(app)
      .post(`/api/trades/${tradeId}/verify`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(verify.statusCode).toBe(200);
    expect(verify.body.trade.status).toBe('complete');

    const updatedListing = await Listing.findById(listingId);
    expect(updatedListing.status).toBe('complete');
  });

  it('seller can boost and mark sold manually', async () => {
    const boostRes = await request(app)
      .post(`/api/listings/${listingId}/boost/pay`)
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({ simulate: true });
    expect(boostRes.statusCode).toBe(200);
    expect(boostRes.body.listing.boostTx.amount).toBe(100);

    const markRes = await request(app)
      .post(`/api/listings/${listingId}/mark-sold`)
      .set('Authorization', `Bearer ${sellerToken}`);
    expect(markRes.statusCode).toBe(200);
    expect(markRes.body.listing.status).toBe('closed');
  });
});
