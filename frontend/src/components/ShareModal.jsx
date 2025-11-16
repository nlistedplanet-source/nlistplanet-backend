import React, { useState } from 'react';
import { X, Share2, Copy, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { generateShareURL, copyToClipboard } from '../utils/helpers';
import toast from 'react-hot-toast';

const ShareModal = ({ listing, onClose }) => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  
  const shareURL = user 
    ? generateShareURL(user.referralCode, listing._id)
    : `${window.location.origin}/marketplace?listing=${listing._id}`;

  const handleCopy = async () => {
    const success = await copyToClipboard(shareURL);
    if (success) {
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error('Failed to copy link');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${listing.companyName} - ${listing.type === 'sell' ? 'Sell Post' : 'Buy Request'}`,
          text: `Check out this ${listing.type === 'sell' ? 'sell post' : 'buy request'} for ${listing.companyName} shares on UnlistedHub USM`,
          url: shareURL
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Share failed:', error);
        }
      }
    } else {
      handleCopy();
    }
  };

  return (
    <>
      <div className="bottom-sheet-overlay" onClick={onClose} />
      <div className="bottom-sheet p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-dark-900">Share & Earn</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-dark-100 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Listing Preview */}
        <div className="bg-dark-50 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center">
              <span className="text-primary-700 font-bold text-lg">
                {listing.companyName[0]}
              </span>
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-dark-900">{listing.companyName}</h4>
              <p className="text-sm text-dark-600">
                {listing.type === 'sell' ? 'Sell Post' : 'Buy Request'}
              </p>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
              listing.type === 'sell' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
            }`}>
              {listing.type.toUpperCase()}
            </div>
          </div>
        </div>

        {user && (
          <>
            {/* Affiliate Info */}
            <div className="bg-gradient-to-br from-primary-50 to-blue-50 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center">
                  <Share2 className="text-white" size={20} />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-dark-900">Earn 5% Commission</h4>
                  <p className="text-sm text-dark-600">Share this listing and earn affiliate rewards!</p>
                </div>
              </div>
              <div className="bg-white rounded-lg p-3">
                <p className="text-xs text-dark-600 mb-2">
                  <strong>How it works:</strong>
                </p>
                <ul className="text-xs text-dark-600 space-y-1">
                  <li>• Share this listing with your unique referral link</li>
                  <li>• When someone signs up through your link</li>
                  <li>• You earn 5% of platform fees from their trades</li>
                </ul>
              </div>
            </div>

            {/* Your Referral Code */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-dark-700 mb-2">
                Your Referral Code
              </label>
              <div className="bg-dark-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-primary-600">{user.referralCode}</p>
                <p className="text-xs text-dark-500 mt-1">Share this code to earn rewards</p>
              </div>
            </div>
          </>
        )}

        {/* Share URL */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-dark-700 mb-2">
            Share Link
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={shareURL}
              readOnly
              className="flex-1 px-4 py-3 bg-dark-50 border border-dark-200 rounded-xl text-sm"
            />
            <button
              onClick={handleCopy}
              className="btn-mobile bg-primary-600 text-white px-4 flex items-center gap-2"
            >
              {copied ? <Check size={20} /> : <Copy size={20} />}
            </button>
          </div>
        </div>

        {/* Share Button */}
        <button
          onClick={handleShare}
          className="w-full btn-mobile btn-primary flex items-center justify-center gap-2"
        >
          <Share2 size={20} />
          {navigator.share ? 'Share Now' : 'Copy Link'}
        </button>

        {!user && (
          <div className="mt-4 bg-yellow-50 rounded-lg p-3">
            <p className="text-xs text-yellow-800">
              <strong>Login to earn:</strong> Sign in to get your unique referral link and earn 5% commission on referred trades!
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default ShareModal;