import React, { useState, useEffect } from 'react';
import { Loader, TrendingUp, CheckCircle, XCircle, MessageCircle } from 'lucide-react';
import { listingsAPI } from '../../utils/api';
import { formatCurrency, formatDate, getStatusColor } from '../../utils/helpers';
import toast from 'react-hot-toast';

const BidsTab = () => {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBids();
  }, []);

  const fetchBids = async () => {
    try {
      setLoading(true);
      const response = await listingsAPI.getMy({ type: 'sell' });
      // Extract all bids from sell listings
      const allBids = [];
      response.data.data.forEach(listing => {
        listing.bids?.forEach(bid => {
          allBids.push({
            ...bid,
            listing: {
              _id: listing._id,
              companyName: listing.companyName,
              price: listing.price,
              quantity: listing.quantity
            }
          });
        });
      });
      setBids(allBids.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (error) {
      toast.error('Failed to fetch bids');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader className="animate-spin text-primary-600 mb-3" size={40} />
        <p className="text-dark-600">Loading bids...</p>
      </div>
    );
  }

  if (bids.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 bg-dark-50 rounded-2xl">
        <TrendingUp className="text-dark-300 mb-3" size={48} />
        <p className="text-dark-600 font-medium mb-2">No bids received yet</p>
        <p className="text-dark-500 text-sm text-center">
          Bids will appear here when someone places a bid on your sell posts
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-bold text-dark-900 mb-4">Bids Received ({bids.length})</h2>
      
      <div className="space-y-3">
        {bids.map((bid, index) => (
          <div key={index} className="card-mobile">
            {/* Listing Info */}
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-semibold text-dark-900">{bid.listing.companyName}</h4>
                <p className="text-xs text-dark-500">Your listed price: {formatCurrency(bid.listing.price)}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(bid.status)}`}>
                {bid.status}
              </span>
            </div>

            {/* Bid Details */}
            <div className="bg-dark-50 rounded-lg p-3 mb-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-dark-600">Bidder:</span>
                <span className="font-semibold text-dark-900">@{bid.username}</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-dark-600">Bid Price:</span>
                <span className="font-bold text-primary-700">{formatCurrency(bid.price)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-dark-600">Quantity:</span>
                <span className="font-semibold text-dark-900">{bid.quantity} shares</span>
              </div>
            </div>

            {/* Message */}
            {bid.message && (
              <div className="bg-blue-50 rounded-lg p-3 mb-3">
                <div className="flex items-start gap-2">
                  <MessageCircle size={16} className="text-blue-600 mt-0.5" />
                  <p className="text-sm text-blue-900">{bid.message}</p>
                </div>
              </div>
            )}

            {/* Counter History */}
            {bid.counterHistory && bid.counterHistory.length > 0 && (
              <div className="mb-3">
                <p className="text-xs font-semibold text-dark-600 mb-2">Counter Offer History:</p>
                <div className="space-y-2">
                  {bid.counterHistory.map((counter, idx) => (
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
            <p className="text-xs text-dark-500">{formatDate(bid.createdAt)}</p>

            {/* Actions */}
            {bid.status === 'pending' && (
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

export default BidsTab;