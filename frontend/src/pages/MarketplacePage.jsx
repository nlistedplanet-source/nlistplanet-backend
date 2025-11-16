import React, { useState, useEffect } from 'react';
import { Search, Filter, TrendingUp, Plus, Loader } from 'lucide-react';
import { listingsAPI, companiesAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import ListingCard from '../components/ListingCard';
import CreateListingModal from '../components/CreateListingModal';
import BidOfferModal from '../components/BidOfferModal';
import ShareModal from '../components/ShareModal';
import toast from 'react-hot-toast';

const MarketplacePage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('sell');
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('-createdAt');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBidModal, setShowBidModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);

  useEffect(() => {
    fetchListings();
  }, [activeTab, sortBy]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const response = await listingsAPI.getAll({
        type: activeTab,
        sort: sortBy,
        search: search || undefined
      });
      setListings(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch listings');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchListings();
  };

  const handleBidOffer = (listing) => {
    if (!user) {
      toast.error('Please login to place bid/offer');
      return;
    }
    setSelectedListing(listing);
    setShowBidModal(true);
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
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="sticky top-16 bg-white border-b border-dark-200 z-20">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold text-dark-900">Marketplace</h1>
            {user && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-mobile btn-primary flex items-center gap-2 text-sm py-2"
              >
                <Plus size={18} />
                Create Listing
              </button>
            )}
          </div>

          {/* Search Bar */}
          <div className="flex gap-2 mb-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" size={20} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search company..."
                className="w-full pl-10 pr-4 py-2.5 bg-dark-50 border border-dark-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <button
              onClick={handleSearch}
              className="btn-mobile bg-primary-600 text-white px-4"
            >
              <Search size={20} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('sell')}
              className={`flex-1 py-2.5 rounded-xl font-semibold transition-all ${
                activeTab === 'sell'
                  ? 'bg-primary-600 text-white'
                  : 'bg-dark-100 text-dark-600'
              }`}
            >
              SELL Posts
            </button>
            <button
              onClick={() => setActiveTab('buy')}
              className={`flex-1 py-2.5 rounded-xl font-semibold transition-all ${
                activeTab === 'buy'
                  ? 'bg-primary-600 text-white'
                  : 'bg-dark-100 text-dark-600'
              }`}
            >
              BUY Requests
            </button>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2 mt-3">
            <Filter size={18} className="text-dark-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="flex-1 px-3 py-2 bg-dark-50 border border-dark-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="-createdAt">Latest First</option>
              <option value="createdAt">Oldest First</option>
              <option value="price">Price: Low to High</option>
              <option value="-price">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Listings */}
      <div className="px-4 py-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader className="animate-spin text-primary-600 mb-3" size={40} />
            <p className="text-dark-600">Loading listings...</p>
          </div>
        ) : listings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <TrendingUp className="text-dark-300 mb-3" size={48} />
            <p className="text-dark-600 font-medium">No listings found</p>
            <p className="text-dark-400 text-sm mt-1">
              {activeTab === 'sell' ? 'No sell posts available' : 'No buy requests available'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {listings.map((listing) => (
              <ListingCard
                key={listing._id}
                listing={listing}
                onBidOffer={handleBidOffer}
                onShare={handleShare}
                onBoost={handleBoost}
                isOwner={user?._id === listing.userId?._id}
              />
            ))}
          </div>
        )}
      </div>

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

      {showBidModal && selectedListing && (
        <BidOfferModal
          listing={selectedListing}
          onClose={() => {
            setShowBidModal(false);
            setSelectedListing(null);
          }}
          onSuccess={() => {
            setShowBidModal(false);
            setSelectedListing(null);
            toast.success('Bid/Offer placed successfully!');
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

export default MarketplacePage;
