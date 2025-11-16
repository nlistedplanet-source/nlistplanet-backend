import React, { useState, useEffect } from 'react';
import { Loader, Gift, Copy, Users, DollarSign, Check } from 'lucide-react';
import { referralsAPI, transactionsAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatDate, copyToClipboard, generateShareURL } from '../../utils/helpers';
import toast from 'react-hot-toast';

const ReferralsTab = () => {
  const { user } = useAuth();
  const [referrals, setReferrals] = useState([]);
  const [earnings, setEarnings] = useState([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [referralsRes, earningsRes] = await Promise.all([
        referralsAPI.getMyReferrals(),
        transactionsAPI.getMyEarnings()
      ]);
      setReferrals(referralsRes.data.data);
      setEarnings(earningsRes.data.data);
      setTotalEarnings(earningsRes.data.totalEarnings || 0);
    } catch (error) {
      toast.error('Failed to fetch referral data');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = async () => {
    const success = await copyToClipboard(user.referralCode);
    if (success) {
      setCopied(true);
      toast.success('Referral code copied!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyLink = async () => {
    const url = generateShareURL(user.referralCode);
    const success = await copyToClipboard(url);
    if (success) {
      toast.success('Referral link copied!');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader className="animate-spin text-primary-600 mb-3" size={40} />
        <p className="text-dark-600">Loading referral data...</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-bold text-dark-900 mb-4">Referrals & Earnings</h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl p-4 text-white">
          <Users size={24} className="mb-2" />
          <p className="text-sm opacity-90">Total Referrals</p>
          <p className="text-3xl font-bold">{referrals.length}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-2xl p-4 text-white">
          <DollarSign size={24} className="mb-2" />
          <p className="text-sm opacity-90">Total Earnings</p>
          <p className="text-3xl font-bold">{formatCurrency(totalEarnings)}</p>
        </div>
      </div>

      {/* Referral Code Card */}
      <div className="bg-gradient-to-br from-primary-50 to-blue-50 rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-primary-600 flex items-center justify-center">
            <Gift className="text-white" size={24} />
          </div>
          <div>
            <h3 className="font-bold text-dark-900">Your Referral Code</h3>
            <p className="text-sm text-dark-600">Share and earn 5% commission</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-3xl font-bold text-primary-600">{user.referralCode}</p>
            <button
              onClick={handleCopyCode}
              className="btn-mobile bg-primary-600 text-white px-4 py-2 flex items-center gap-2"
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        <button
          onClick={handleCopyLink}
          className="w-full btn-mobile btn-secondary text-sm"
        >
          Copy Full Referral Link
        </button>
      </div>

      {/* How It Works */}
      <div className="bg-blue-50 rounded-2xl p-4 mb-6">
        <h4 className="font-bold text-blue-900 mb-2">How Referrals Work</h4>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start gap-2">
            <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs flex-shrink-0 mt-0.5">1</div>
            <span>Share your referral code or link with friends</span>
          </li>
          <li className="flex items-start gap-2">
            <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs flex-shrink-0 mt-0.5">2</div>
            <span>They sign up using your code</span>
          </li>
          <li className="flex items-start gap-2">
            <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs flex-shrink-0 mt-0.5">3</div>
            <span>You earn 5% of platform fees from their trades</span>
          </li>
        </ul>
      </div>

      {/* Referred Users */}
      {referrals.length > 0 && (
        <div className="mb-6">
          <h3 className="font-bold text-dark-900 mb-3">Your Referrals ({referrals.length})</h3>
          <div className="space-y-2">
            {referrals.map((referral) => (
              <div key={referral._id} className="card-mobile flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                  {referral.avatar ? (
                    <img
                      src={referral.avatar}
                      alt={referral.username}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-primary-700 font-bold">
                      {referral.username[0].toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-dark-900">@{referral.username}</p>
                  <p className="text-xs text-dark-500">{referral.fullName}</p>
                </div>
                <p className="text-xs text-dark-500">
                  {formatDate(referral.createdAt)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Earnings History */}
      {earnings.length > 0 && (
        <div>
          <h3 className="font-bold text-dark-900 mb-3">Earnings History</h3>
          <div className="space-y-2">
            {earnings.map((earning) => (
              <div key={earning._id} className="card-mobile">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-dark-900">{earning.companyName}</span>
                  <span className="font-bold text-green-600">{formatCurrency(earning.amount)}</span>
                </div>
                <p className="text-xs text-dark-600 mb-1">{earning.description}</p>
                <p className="text-xs text-dark-500">{formatDate(earning.createdAt)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {referrals.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 bg-dark-50 rounded-2xl">
          <Users className="text-dark-300 mb-3" size={48} />
          <p className="text-dark-600 font-medium mb-2">No referrals yet</p>
          <p className="text-dark-500 text-sm text-center px-4">
            Start sharing your referral code to earn commissions!
          </p>
        </div>
      )}
    </div>
  );
};

export default ReferralsTab;