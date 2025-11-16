import React, { useState, useEffect } from 'react';
import { Loader, TrendingDown, CheckCircle, XCircle, MessageCircle } from 'lucide-react';
import { listingsAPI } from '../../utils/api';
import { formatCurrency, formatDate, getStatusColor } from '../../utils/helpers';
import toast from 'react-hot-toast';

const OffersTab = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const response = await listingsAPI.getMy({ type: 'buy' });
      // Extract all offers from buy listings
      const allOffers = [];
      response.data.data.forEach(listing => {
        listing.offers?.forEach(offer => {
          allOffers.push({
            ...offer,
            listing: {
              _id: listing._id,
              companyName: listing.companyName,
              price: listing.price,
              quantity: listing.quantity
            }
          });
        });
      });
      setOffers(allOffers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (error) {
      toast.error('Failed to fetch offers');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader className="animate-spin text-primary-600 mb-3" size={40} />
        <p className="text-dark-600">Loading offers...</p>
      </div>
    );
  }

  if (offers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 bg-dark-50 rounded-2xl">
        <TrendingDown className="text-dark-300 mb-3" size={48} />
        <p className="text-dark-600 font-medium mb-2">No offers received yet</p>
        <p className="text-dark-500 text-sm text-center">
          Offers will appear here when someone makes an offer on your buy requests
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-bold text-dark-900 mb-4">Offers Received ({offers.length})</h2>
      
      <div className="space-y-3">
        {offers.map((offer, index) => (
          <div key={index} className="card-mobile">
            {/* Listing Info */}
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-semibold text-dark-900">{offer.listing.companyName}</h4>
                <p className="text-xs text-dark-500">Your requested price: {formatCurrency(offer.listing.price)}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(offer.status)}`}>
                {offer.status}
              </span>
            </div>

            {/* Offer Details */}
            <div className="bg-dark-50 rounded-lg p-3 mb-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-dark-600">Seller:</span>
                <span className="font-semibold text-dark-900">@{offer.username}</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-dark-600">Offer Price:</span>
                <span className="font-bold text-primary-700">{formatCurrency(offer.price)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-dark-600">Quantity:</span>
                <span className="font-semibold text-dark-900">{offer.quantity} shares</span>
              </div>
            </div>

            {/* Message */}
            {offer.message && (
              <div className="bg-blue-50 rounded-lg p-3 mb-3">
                <div className="flex items-start gap-2">
                  <MessageCircle size={16} className="text-blue-600 mt-0.5" />
                  <p className="text-sm text-blue-900">{offer.message}</p>
                </div>
              </div>
            )}

            {/* Counter History */}
            {offer.counterHistory && offer.counterHistory.length > 0 && (
              <div className="mb-3">
                <p className="text-xs font-semibold text-dark-600 mb-2">Counter Offer History:</p>
                <div className="space-y-2">
                  {offer.counterHistory.map((counter, idx) => (
                    <div key={idx} className="bg-dark-50 rounded-lg p-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">Round {counter.round} ({counter.by}):</span>
                        <span className="text-primary-600 font-bold">{formatCurrency(counter.price)}</span>
                      </div>
                      {counter.message && <p className="text-dark-600 mt-1">{counter.message}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Timestamp */}
            <p className="text-xs text-dark-500">{formatDate(offer.createdAt)}</p>

            {/* Actions */}
            {offer.status === 'pending' && (
              <div className="flex gap-2 mt-3">
                <button className="flex-1 btn-mobile bg-green-600 text-white text-sm py-2 flex items-center justify-center gap-2">
                  <CheckCircle size={18} />
                  Accept
                </button>
                <button className="flex-1 btn-mobile bg-red-600 text-white text-sm py-2 flex items-center justify-center gap-2">
                  <XCircle size={18} />
                  Reject
                </button>
                <button className="btn-mobile btn-secondary text-sm py-2 px-4">
                  Counter
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default OffersTab;