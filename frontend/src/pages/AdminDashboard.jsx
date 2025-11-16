import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Users, TrendingUp, DollarSign, Building2, Ban, CheckCircle, Plus, Loader } from 'lucide-react';
import { adminAPI } from '../utils/api';
import { formatCurrency, formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';
import TopBar from '../components/TopBar';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateCompanyModal, setShowCreateCompanyModal] = useState(false);
  const [companyData, setCompanyData] = useState({
    name: '',
    sector: '',
    logo: '',
    isin: '',
    pan: '',
    cin: ''
  });

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getUsers()
      ]);
      setStats(statsRes.data.data);
      setUsers(usersRes.data.data);
    } catch (error) {
      toast.error('Failed to fetch admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleBanUser = async (userId) => {
    try {
      await adminAPI.banUser(userId);
      toast.success('User banned successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to ban user');
    }
  };

  const handleUnbanUser = async (userId) => {
    try {
      await adminAPI.unbanUser(userId);
      toast.success('User unbanned successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to unban user');
    }
  };

  const handleCreateCompany = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.createCompany(companyData);
      toast.success('Company created successfully');
      setShowCreateCompanyModal(false);
      setCompanyData({
        name: '',
        sector: '',
        logo: '',
        isin: '',
        pan: '',
        cin: ''
      });
    } catch (error) {
      toast.error('Failed to create company');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="animate-spin text-primary-600" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-50">
      <TopBar />
      
      <div className="container mx-auto px-4 pt-20 pb-24">
        <h1 className="text-2xl font-bold text-dark-900 mb-6">Admin Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl p-4 text-white">
            <Users size={24} className="mb-2" />
            <p className="text-sm opacity-90">Total Users</p>
            <p className="text-3xl font-bold">{stats?.totalUsers || 0}</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-2xl p-4 text-white">
            <TrendingUp size={24} className="mb-2" />
            <p className="text-sm opacity-90">Active Listings</p>
            <p className="text-3xl font-bold">{stats?.activeListings || 0}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl p-4 text-white">
            <DollarSign size={24} className="mb-2" />
            <p className="text-sm opacity-90">Total Revenue</p>
            <p className="text-2xl font-bold">{formatCurrency(stats?.totalRevenue || 0)}</p>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-orange-700 rounded-2xl p-4 text-white">
            <Building2 size={24} className="mb-2" />
            <p className="text-sm opacity-90">Companies</p>
            <p className="text-3xl font-bold">{stats?.totalCompanies || 0}</p>
          </div>
        </div>

        {/* Create Company Button */}
        <button
          onClick={() => setShowCreateCompanyModal(true)}
          className="w-full btn-mobile btn-primary flex items-center justify-center gap-2 mb-6"
        >
          <Plus size={20} />
          Add New Company
        </button>

        {/* Users List */}
        <div>
          <h2 className="text-lg font-bold text-dark-900 mb-4">All Users</h2>
          <div className="space-y-3">
            {users.map((u) => (
              <div key={u._id} className="card-mobile">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                    {u.avatar ? (
                      <img
                        src={u.avatar}
                        alt={u.username}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-primary-700 font-bold text-lg">
                        {u.username[0].toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-dark-900">@{u.username}</p>
                      {u.role === 'admin' && (
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-semibold rounded">
                          ADMIN
                        </span>
                      )}
                      {u.isBanned && (
                        <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded">
                          BANNED
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-dark-600">{u.email}</p>
                    <p className="text-xs text-dark-500 mt-1">
                      {u.fullName} • {u.phone}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center mb-3">
                  <div className="p-2 bg-dark-50 rounded-lg">
                    <p className="text-xs text-dark-500">Listings</p>
                    <p className="font-bold text-dark-900">{u.listingsCount || 0}</p>
                  </div>
                  <div className="p-2 bg-dark-50 rounded-lg">
                    <p className="text-xs text-dark-500">Referrals</p>
                    <p className="font-bold text-dark-900">{u.totalReferrals || 0}</p>
                  </div>
                  <div className="p-2 bg-dark-50 rounded-lg">
                    <p className="text-xs text-dark-500">Earnings</p>
                    <p className="font-bold text-green-600">{formatCurrency(u.totalEarnings || 0)}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-xs text-dark-500">
                    Joined {formatDate(u.createdAt)}
                  </p>
                  {u.role !== 'admin' && (
                    <button
                      onClick={() => u.isBanned ? handleUnbanUser(u._id) : handleBanUser(u._id)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-semibold ${
                        u.isBanned
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {u.isBanned ? (
                        <>
                          <CheckCircle size={16} />
                          Unban
                        </>
                      ) : (
                        <>
                          <Ban size={16} />
                          Ban
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Create Company Modal */}
      {showCreateCompanyModal && (
        <>
          <div className="bottom-sheet-overlay" onClick={() => setShowCreateCompanyModal(false)} />
          <div className="bottom-sheet p-6">
            <h3 className="text-2xl font-bold text-dark-900 mb-6">Add New Company</h3>
            
            <form onSubmit={handleCreateCompany} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-dark-700 mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  value={companyData.name}
                  onChange={(e) => setCompanyData({ ...companyData, name: e.target.value })}
                  className="input-mobile"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-dark-700 mb-2">
                  Sector *
                </label>
                <input
                  type="text"
                  value={companyData.sector}
                  onChange={(e) => setCompanyData({ ...companyData, sector: e.target.value })}
                  className="input-mobile"
                  placeholder="e.g., Technology, Healthcare"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-dark-700 mb-2">
                  Logo URL
                </label>
                <input
                  type="url"
                  value={companyData.logo}
                  onChange={(e) => setCompanyData({ ...companyData, logo: e.target.value })}
                  className="input-mobile"
                  placeholder="https://example.com/logo.png"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-dark-700 mb-2">
                  ISIN
                </label>
                <input
                  type="text"
                  value={companyData.isin}
                  onChange={(e) => setCompanyData({ ...companyData, isin: e.target.value })}
                  className="input-mobile"
                  placeholder="INE123456789"
                  maxLength="12"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-dark-700 mb-2">
                  PAN
                </label>
                <input
                  type="text"
                  value={companyData.pan}
                  onChange={(e) => setCompanyData({ ...companyData, pan: e.target.value })}
                  className="input-mobile"
                  placeholder="AAAAA1234A"
                  maxLength="10"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-dark-700 mb-2">
                  CIN
                </label>
                <input
                  type="text"
                  value={companyData.cin}
                  onChange={(e) => setCompanyData({ ...companyData, cin: e.target.value })}
                  className="input-mobile"
                  placeholder="U12345KA2020PTC123456"
                  maxLength="21"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 btn-mobile btn-primary flex items-center justify-center gap-2"
                >
                  <Plus size={18} />
                  Create Company
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateCompanyModal(false)}
                  className="btn-mobile btn-secondary px-6"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
