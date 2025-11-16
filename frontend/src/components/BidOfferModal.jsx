import React, { useState } from 'react';
import { X, DollarSign, Package, MessageCircle, Send } from 'lucide-react';
import { listingsAPI } from '../utils/api';
import { formatCurrency, calculateTotalWithFee } from '../utils/helpers';
import toast from 'react-hot-toast';

const BidOfferModal = ({ listing, onClose, onSuccess }) => {
  const isSell = listing.type === 'sell';
  const [formData, setFormData] = useState({
    price: listing.price.toString(),
    quantity: listing.minLot.toString(),
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const totalAmount = calculateTotalWithFee(parseFloat(formData.price || 0)) * parseInt(formData.quantity || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const quantity = parseInt(formData.quantity);
    if (quantity < listing.minLot) {
      toast.error(`Minimum lot size is ${listing.minLot}`);
      return;
    }
    if (quantity > listing.quantity) {
      toast.error(`Maximum available quantity is ${listing.quantity}`);
      return;
    }

    setLoading(true);
    try {
      await listingsAPI.placeBid(listing._id, {
        price: parseFloat(formData.price),
        quantity: quantity,
        message: formData.message
      });
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to place bid/offer');
      setLoading(false);
    }
  };

  return (
    <>
      <div className="bottom-sheet-overlay" onClick={onClose} />
      <div className="bottom-sheet p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-dark-900">
            {isSell ? 'Place Bid' : 'Make Offer'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-dark-100 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Listing Info */}
        <div className="bg-dark-50 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center">
              <span className="text-primary-700 font-bold text-lg">
                {listing.companyName[0]}
              </span>
            </div>
            <div>
              <h4 className="font-semibold text-dark-900">{listing.companyName}</h4>
              <p className="text-sm text-dark-600">@{listing.username}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-dark-500">Listed Price</p>
              <p className="font-bold text-dark-900">{formatCurrency(listing.price)}</p>
            </div>
            <div>
              <p className="text-xs text-dark-500">Available</p>
              <p className="font-bold text-dark-900">{listing.quantity} shares</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Price */}
          <div>
            <label className="block text-sm font-semibold text-dark-700 mb-2">
              Your Price per Share <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" size={20} />
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="Enter your price"
                className="input-mobile pl-10"
                required
                min="1"
                step="0.01"
              />
            </div>
            {formData.price && parseFloat(formData.price) !== listing.price && (
              <p className={`text-xs mt-1 ${
                parseFloat(formData.price) > listing.price
                  ? 'text-green-600'
                  : 'text-orange-600'
              }`}>
                {parseFloat(formData.price) > listing.price
                  ? `+${formatCurrency(parseFloat(formData.price) - listing.price)} higher than listed`
                  : `${formatCurrency(listing.price - parseFloat(formData.price))} lower than listed`
                }
              </p>
            )}
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-semibold text-dark-700 mb-2">
              Quantity <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Package className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" size={20} />
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                placeholder="Number of shares"
                className="input-mobile pl-10"
                required
                min={listing.minLot}
                max={listing.quantity}
              />
            </div>
            <p className="text-xs text-dark-500 mt-1">
              Min: {listing.minLot} | Max: {listing.quantity} shares
            </p>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-semibold text-dark-700 mb-2">
              Message (Optional)
            </label>
            <div className="relative">
              <MessageCircle className="absolute left-3 top-3 text-dark-400" size={20} />
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Add a message for the seller..."
                className="input-mobile pl-10 min-h-20 resize-none"
                maxLength="200"
              />
            </div>
            <p className="text-xs text-dark-500 mt-1">
              {formData.message.length}/200 characters
            </p>
          </div>

          {/* Total Amount */}
          <div className="bg-primary-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-dark-600">Subtotal:</span>
              <span className="font-semibold text-dark-900">
                {formatCurrency((parseFloat(formData.price || 0) * parseInt(formData.quantity || 0)))}
              </span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-dark-600">Platform Fee (2%):</span>
              <span className="font-semibold text-dark-900">
                {formatCurrency((parseFloat(formData.price || 0) * parseInt(formData.quantity || 0) * 0.02))}
              </span>
            </div>
            <div className="border-t border-primary-200 pt-2 flex items-center justify-between">
              <span className="text-base font-semibold text-dark-900">Total Amount:</span>
              <span className="text-xl font-bold text-primary-700">
                {formatCurrency(totalAmount)}
              </span>
            </div>
          </div>

          {/* Info */}
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-xs text-blue-800">
              <strong>Note:</strong> This is a P2P marketplace. After acceptance, you'll exchange contact
              details and complete the transaction directly. Payment is external to the platform.
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-mobile btn-primary flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send size={20} />
                {isSell ? 'Place Bid' : 'Make Offer'}
              </>
            )}
          </button>
        </form>
      </div>
    </>
  );
};

export default BidOfferModal;