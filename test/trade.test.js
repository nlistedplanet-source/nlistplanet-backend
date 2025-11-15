const request = require('supertest');
let app;
const mongoose = require('mongoose');
const path = require('path');
const User = require('../models/User');
const Listing = require('../models/Listing');
const Trade = require('../models/Trade');

describe('Trade lifecycle', () => {
  let sellerToken, buyerToken, adminToken;
  let sellerId, buyerId, listingId, bidId, tradeId;

  beforeAll(async () => {
    app = require('../server');
    // Signup seller
    const sellerRes = await request(app)
      .post('/api/auth/signup')
      .send({ name: 'Seller', email: 'seller@example.com', password: 'password', mobile: '9999990001', userType: 'individual' });
    sellerToken = sellerRes.body.token;
    sellerId = sellerRes.body.user.id;

    // Signup buyer
    const buyerRes = await request(app)
      .post('/api/auth/signup')
      .send({ name: 'Buyer', email: 'buyer@example.com', password: 'password', mobile: '9999990002', userType: 'individual' });
    buyerToken = buyerRes.body.token;
    buyerId = buyerRes.body.user.id;

    // Signup admin
    const adminRes = await request(app)
      .post('/api/auth/signup')
      .send({ name: 'Admin', email: 'admin@example.com', password: 'password', mobile: '9999990003', userType: 'admin' });
    adminToken = adminRes.body.token;
  });

  it('creates listing, places bid, creates trade and verifies flow', async () => {
    // Seller creates sell listing
    const listRes = await request(app)
      .post('/api/listings/sell')
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({ company: 'Test Co', isin: 'ISIN123', price: 500, shares: 10 });
    expect(listRes.statusCode).toBe(201);
    listingId = listRes.body.listing._id;

    // Buyer places bid
    const bidRes = await request(app)
      .post(`/api/listings/${listingId}/bid`)
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ price: 505, quantity: 5 });
    expect(bidRes.statusCode).toBe(200);
    const listing = bidRes.body.listing;
    expect(listing.bids.length).toBeGreaterThan(0);
    bidId = listing.bids[0]._id;

    // Seller accepts and create trade (simulate both parts accepted by calling create-trade)
    const tradeRes = await request(app)
      .post(`/api/listings/${listingId}/create-trade`)
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({ bidId, buyerId, price: 505, quantity: 5 });
    expect(tradeRes.statusCode).toBe(200);
    const trade = tradeRes.body.trade;
    expect(trade).toBeDefined();
    expect(trade.sellerConfirmed).toBe(true);
    expect(trade.buyerConfirmed).toBe(false);
    expect(trade.status).toBe('pending_closure');
    tradeId = trade._id;

    // Buyer confirms trade
    const confirmRes = await request(app)
      .post(`/api/trades/${tradeId}/confirm`)
      .set('Authorization', `Bearer ${buyerToken}`);
    expect(confirmRes.statusCode).toBe(200);
    const confirmedTrade = confirmRes.body.trade;
    expect(confirmedTrade.buyerConfirmed).toBe(true);

    // Simulate seller & buyer proofs being uploaded by updating the DB directly (tests avoid multipart)
    await Trade.findByIdAndUpdate(tradeId, {
      $set: {
        'proofs.seller': {
          dpSlip: 'uploads/proofs/dpSlip-sample.png',
          transferConfirmation: 'uploads/proofs/transfer-sample.png',
          uploadedAt: new Date()
        }
      }
    });
    await Trade.findByIdAndUpdate(tradeId, {
      $set: {
        'proofs.buyer': {
          paymentScreenshot: 'uploads/proofs/payment-sample.png',
          utr: 'UTR123',
          uploadedAt: new Date()
        }
      }
    });

    // Admin verifies trade
    const verifyRes = await request(app)
      .post(`/api/trades/${tradeId}/verify`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(verifyRes.statusCode).toBe(200);
    expect(verifyRes.body.trade.status).toBe('complete');

    // Listing should be updated to complete
    const updatedListing = await Listing.findById(listingId);
    expect(updatedListing.status).toBe('complete');
  });

  it('forbids non-admin user from verifying trade', async () => {
    // Create a new listing and trade
    const listRes = await request(app)
      .post('/api/listings/sell')
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({ company: 'Test Co 3', isin: 'ISIN789', price: 300, shares: 5 });
    expect(listRes.statusCode).toBe(201);
    const listingId3 = listRes.body.listing._id;

    const bidRes = await request(app)
      .post(`/api/listings/${listingId3}/bid`)
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ price: 305, quantity: 2 });
    expect(bidRes.statusCode).toBe(200);
    const bidId3 = bidRes.body.listing.bids[0]._id;

    // Simulate both accepted (seller accepts then buyer accepts via accept endpoint)
    await request(app)
      .post(`/api/listings/${listingId3}/bid/${bidId3}/accept`)
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({ party: 'seller' });
    const acceptRes = await request(app)
      .post(`/api/listings/${listingId3}/bid/${bidId3}/accept`)
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ party: 'buyer' });
    expect(acceptRes.statusCode).toBe(200);
    const trade = acceptRes.body.trade;
    expect(trade).toBeDefined();

    // Non-admin (seller) tries to verify
    const badVerify = await request(app)
      .post(`/api/trades/${trade._id}/verify`)
      .set('Authorization', `Bearer ${sellerToken}`);
    expect(badVerify.statusCode).toBe(403);
  });

  it('forbids non-admin user from rejecting trade and allows admin to reject', async () => {
    // Create a new listing and trade
    const listRes = await request(app)
      .post('/api/listings/sell')
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({ company: 'Test Co 4', isin: 'ISIN012', price: 150, shares: 5 });
    expect(listRes.statusCode).toBe(201);
    const listingId4 = listRes.body.listing._id;

    const bidRes = await request(app)
      .post(`/api/listings/${listingId4}/bid`)
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ price: 155, quantity: 2 });
    expect(bidRes.statusCode).toBe(200);
    const bidId4 = bidRes.body.listing.bids[0]._id;

    // Simulate accept
    await request(app)
      .post(`/api/listings/${listingId4}/bid/${bidId4}/accept`)
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({ party: 'seller' });
    const acceptRes = await request(app)
      .post(`/api/listings/${listingId4}/bid/${bidId4}/accept`)
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ party: 'buyer' });
    expect(acceptRes.statusCode).toBe(200);
    const trade = acceptRes.body.trade;
    expect(trade).toBeDefined();

    // Non-admin tries to reject
    const badReject = await request(app)
      .post(`/api/trades/${trade._id}/reject`)
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({ reason: 'Invalid docs' });
    expect(badReject.statusCode).toBe(403);

    // Admin rejects
    const adminReject = await request(app)
      .post(`/api/trades/${trade._id}/reject`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ reason: 'Invalid transaction proof' });
    expect(adminReject.statusCode).toBe(200);
    expect(adminReject.body.trade.status).toBe('rejected');
  });

  it('creates trade when both parties accept via accept endpoint', async () => {
    // Seller creates new listing and buyer places bid
    const listRes = await request(app)
      .post('/api/listings/sell')
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({ company: 'Test Co 2', isin: 'ISIN456', price: 250, shares: 5 });
    expect(listRes.statusCode).toBe(201);
    const listingId2 = listRes.body.listing._id;

    const bidRes = await request(app)
      .post(`/api/listings/${listingId2}/bid`)
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ price: 251, quantity: 2 });
    expect(bidRes.statusCode).toBe(200);
    const bidId2 = bidRes.body.listing.bids[0]._id;

    // Seller accepts via endpoint
    const acceptRes1 = await request(app)
      .post(`/api/listings/${listingId2}/bid/${bidId2}/accept`)
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({ party: 'seller' });
    expect(acceptRes1.statusCode).toBe(200);

    // Buyer accepts - this should create the trade
    const acceptRes2 = await request(app)
      .post(`/api/listings/${listingId2}/bid/${bidId2}/accept`)
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ party: 'buyer' });
    expect(acceptRes2.statusCode).toBe(200);
    expect(acceptRes2.body.trade).toBeDefined();
    expect(acceptRes2.body.trade.status).toBe('pending_closure');
  });
});
