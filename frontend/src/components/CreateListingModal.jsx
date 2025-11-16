import React, { useState, useEffect } from 'react';
import { X, Search, TrendingUp, DollarSign, Package, FileText } from 'lucide-react';
import { companiesAPI, listingsAPI } from '../utils/api';
import toast from 'react-hot-toast';

const CreateListingModal = ({ onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [type, setType] = useState('sell');
  const [companies, setCompanies] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    companyId: '',
    companyName: '',
    price: '',
    quantity: '',
    minLot: '1',
    description: ''
  });

  useEffect(() => {
    fetchCompanies();
  }, [searchTerm]);

  const fetchCompanies = async () => {
    try {
      const response = await companiesAPI.getAll({ search: searchTerm, limit: 10 });
      setCompanies(response.data.data);
    } catch (error) {
      console.error('Failed to fetch companies:', error);
    }
  };

  const handleCompanySelect = (company) => {
    setFormData({
      ...formData,
      companyId: company._id,
      companyName: company.name
    });
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.companyId || !formData.price || !formData.quantity) {
      toast.error('Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      await listingsAPI.create({
        type,
        companyId: formData.companyId,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity),
        minLot: parseInt(formData.minLot),
        description: formData.description
      });
      toast.success(`${type === 'sell' ? 'Sell post' : 'Buy request'} created successfully!`);
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="bottom-sheet-overlay" onClick={onClose} />
      <div className="bottom-sheet p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-dark-900">Create Listing</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-dark-100 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {step === 1 && (
          <div className="space-y-4">
            {/* Type Selection */}
            <div>
              <label className="block text-sm font-semibold text-dark-700 mb-2">
                Listing Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setType('sell')}
                  className={`py-4 px-6 rounded-xl border-2 font-semibold transition-all ${
                    type === 'sell'
                      ? 'border-primary-600 bg-primary-50 text-primary-700'
                      : 'border-dark-200 bg-white text-dark-600'
                  }`}
                >
                  <TrendingUp className="mx-auto mb-2" size={24} />
                  SELL Post
                </button>
                <button
                  onClick={() => setType('buy')}
                  className={`py-4 px-6 rounded-xl border-2 font-semibold transition-all ${
                    type === 'buy'
                      ? 'border-primary-600 bg-primary-50 text-primary-700'
                      : 'border-dark-200 bg-white text-dark-600'
                  }`}
                >
                  <Package className="mx-auto mb-2" size={24} />
                  BUY Request
                </button>
              </div>
            </div>

            {/* Company Search */}
            <div>
              <label className="block text-sm font-semibold text-dark-700 mb-2">
                Select Company
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" size={20} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search company..."
                  className="input-mobile pl-10"
                />
              </div>
            </div>

            {/* Company List */}
            <div className="max-h-64 overflow-y-auto space-y-2">
              {companies.map((company) => (
                <button
                  key={company._id}
                  onClick={() => handleCompanySelect(company)}
                  className="w-full flex items-center gap-3 p-3 bg-dark-50 hover:bg-dark-100 rounded-xl transition-all text-left touch-feedback"
                >
                  {company.logo ? (
                    <img
                      src={company.logo}
                      alt={company.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center">
                      <span className="text-primary-700 font-bold text-lg">
                        {company.name[0]}
                      </span>
                    </div>
                  )}
                  <div className="flex-1">
                    <h4 className="font-semibold text-dark-900">{company.name}</h4>
                    <p className="text-sm text-dark-500">{company.sector}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Selected Company */}
            <div className="bg-primary-50 rounded-xl p-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center">
                <span className="text-primary-700 font-bold text-lg">
                  {formData.companyName[0]}
                </span>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-dark-900">{formData.companyName}</h4>
                <p className="text-sm text-dark-600">{type === 'sell' ? 'Selling shares' : 'Buying shares'}</p>
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-primary-600 text-sm font-semibold"
              >
                Change
              </button>
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-semibold text-dark-700 mb-2">
                Price per Share <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" size={20} />
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="Enter price"
                  className="input-mobile pl-10"
                  required
                  min="1"
                  step="0.01"
                />
              </div>
              <p className="text-xs text-dark-500 mt-1">
                Platform fee (2%) will be added automatically
              </p>
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
                  min="1"
                />
              </div>
            </div>

            {/* Min Lot */}
            <div>
              <label className="block text-sm font-semibold text-dark-700 mb-2">
                Minimum Lot Size
              </label>
              <input
                type="number"
                value={formData.minLot}
                onChange={(e) => setFormData({ ...formData, minLot: e.target.value })}
                placeholder="Minimum shares per transaction"
                className="input-mobile"
                min="1"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-dark-700 mb-2">
                Description (Optional)
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 text-dark-400" size={20} />
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Add any additional details..."
                  className="input-mobile pl-10 min-h-24 resize-none"
                  maxLength="500"
                />
              </div>
              <p className="text-xs text-dark-500 mt-1">
                {formData.description.length}/500 characters
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
                  Creating...
                </>
              ) : (
                <>
                  <TrendingUp size={20} />
                  Create {type === 'sell' ? 'Sell Post' : 'Buy Request'}
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </>
  );
};

export default CreateListingModal;