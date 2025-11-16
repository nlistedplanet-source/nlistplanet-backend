import React, { useState, useEffect } from 'react';
import { Plus, Loader, TrendingUp, Package } from 'lucide-react';
import { listingsAPI } from '../../utils/api';
import ListingCard from '../ListingCard';
import CreateListingModal from '../CreateListingModal';
import ShareModal from '../ShareModal';
import toast from 'react-hot-toast';

const MyPostsTab = () => {
  const [subTab, setSubTab] = useState('sell');
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);

  useEffect(() => {
    fetchListings();
  }, [subTab]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const response = await listingsAPI.getMy({ type: subTab });
      setListings(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch listings');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = (listing) => {
    setSelectedListing(listing);
    setShowShareModal(true);
  };

  const handleBoost = async (listingId) => {
    try {
      await listingsAPI.boost(listingId);
      toast.success('Listing boosted for 24 hours!');
      fetchListings();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to boost listing');
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-dark-900">My Listings</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-mobile btn-primary text-sm py-2 flex items-center gap-2"
        >
          <Plus size={18} />
          New Listing
        </button>
      </div>

      {/* Sub Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setSubTab('sell')}
          className={`flex-1 py-2.5 rounded-xl font-semibold transition-all ${
            subTab === 'sell'
              ? 'bg-green-100 text-green-700'
              : 'bg-dark-100 text-dark-600'
          }`}
        >
          <TrendingUp className="inline mr-2" size={18} />
          SELL Posts
        </button>
        <button
          onClick={() => setSubTab('buy')}
          className={`flex-1 py-2.5 rounded-xl font-semibold transition-all ${
            subTab === 'buy'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-dark-100 text-dark-600'
          }`}
        >
          <Package className="inline mr-2" size={18} />
          BUY Requests
        </button>
      </div>

      {/* Listings */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader className="animate-spin text-primary-600 mb-3" size={40} />
          <p className="text-dark-600">Loading your listings...</p>
        </div>
      ) : listings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 bg-dark-50 rounded-2xl">
          <Package className="text-dark-300 mb-3" size={48} />
          <p className="text-dark-600 font-medium mb-2">No listings yet</p>
          <p className="text-dark-500 text-sm mb-4">
            Create your first {subTab === 'sell' ? 'sell post' : 'buy request'}
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-mobile btn-primary text-sm"
          >
            <Plus className="inline mr-2" size={18} />
            Create Listing
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {listings.map((listing) => (
            <ListingCard
              key={listing._id}
              listing={listing}
              onShare={handleShare}
              onBoost={handleBoost}
              isOwner={true}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreateListingModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchListings();
          }}
        />
      )}

      {showShareModal && selectedListing && (
        <ShareModal
          listing={selectedListing}
          onClose={() => {
            setShowShareModal(false);
            setSelectedListing(null);
          }}
        />
      )}
    </div>
  );
};

export default MyPostsTab;