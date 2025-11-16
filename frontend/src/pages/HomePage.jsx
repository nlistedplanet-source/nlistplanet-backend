import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);
  const words = useMemo(() => ['Buy', 'Sell'], []);
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    const currentWord = words[wordIndex];
    const typingSpeed = isDeleting ? 100 : 150;

    const timer = setTimeout(() => {
      if (!isDeleting && charIndex < currentWord.length) {
        setDisplayText(currentWord.substring(0, charIndex + 1));
        setCharIndex(charIndex + 1);
      } else if (isDeleting && charIndex > 0) {
        setDisplayText(currentWord.substring(0, charIndex - 1));
        setCharIndex(charIndex - 1);
      } else if (!isDeleting && charIndex === currentWord.length) {
        setTimeout(() => setIsDeleting(true), 1500);
      } else if (isDeleting && charIndex === 0) {
        setIsDeleting(false);
        setWordIndex((wordIndex + 1) % words.length);
      }
    }, typingSpeed);

    return () => clearTimeout(timer);
  }, [charIndex, isDeleting, wordIndex, words]);

  return (
    <div className="pb-20">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-teal-50 via-cyan-50 to-emerald-50 pt-6 md:pt-8 pb-12 px-8 min-h-screen flex flex-col justify-between relative overflow-hidden">
        <div className="absolute top-20 right-10 w-64 h-64 bg-emerald-200 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-teal-200 rounded-full opacity-20 blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center relative z-10 flex-grow">
          <div className="text-left space-y-8">
            <h1 className="text-7xl font-bold leading-tight">
              <span className="text-gray-900 inline-block w-[150px]">
                {displayText}
              </span>
              <span className="text-emerald-500">Unlisted</span>
              <br />
              <span className="text-emerald-500">Shares Online</span>
            </h1>
            
            <div className="space-y-3">
              <p className="text-2xl text-gray-700 font-medium">
                Buy and Sell Unlisted Shares at the Price You Choose.
              </p>
              <p className="text-xl text-gray-600">
                Own a Stake in India's Fastest-Growing Companies.
              </p>
            </div>

            <div className="flex gap-8 pt-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-600">500+</div>
                <div className="text-sm text-gray-600">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-600">₹50Cr+</div>
                <div className="text-sm text-gray-600">Trading Volume</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-600">100+</div>
                <div className="text-sm text-gray-600">Companies</div>
              </div>
            </div>
          </div>

          <div className="relative flex items-center justify-center pt-16">
            <div className="relative w-full max-w-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-3xl transform rotate-3 opacity-10 z-0 translate-y-8"></div>
              
              <img 
                src="/images/logos/herolaptop.png" 
                alt="Hero Laptop" 
                className="relative z-10 w-full h-auto object-contain drop-shadow-2xl transform hover:scale-105 transition-transform duration-500"
                style={{ maxHeight: '500px', objectPosition: 'center bottom' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Company Logos Section */}
      <div className="bg-gray-50 py-16 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Featured Unlisted Companies</h2>
          
          <div className="relative">
            <div className="flex gap-8 animate-scroll items-center">
              <div className="bg-white px-6 py-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 whitespace-nowrap flex items-center gap-3 min-w-fit">
                <img src="https://logo.clearbit.com/nseindia.com" alt="NSE" className="h-10 w-10 object-contain" />
                <span className="text-sm font-semibold text-gray-700">NSE India Limited</span>
              </div>
              <div className="bg-white px-6 py-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 whitespace-nowrap flex items-center gap-3 min-w-fit">
                <img src="https://logo.clearbit.com/hdfcsec.com" alt="HDFC" className="h-10 w-10 object-contain" />
                <span className="text-sm font-semibold text-gray-700">HDFC Securities</span>
              </div>
              <div className="bg-white px-6 py-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 whitespace-nowrap flex items-center gap-3 min-w-fit">
                <img src="https://logo.clearbit.com/sbimf.com" alt="SBI" className="h-10 w-10 object-contain" />
                <span className="text-sm font-semibold text-gray-700">SBI Funds Management</span>
              </div>
              <div className="bg-white px-6 py-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 whitespace-nowrap flex items-center gap-3 min-w-fit">
                <img src="https://logo.clearbit.com/capgemini.com" alt="Capgemini" className="h-10 w-10 object-contain" />
                <span className="text-sm font-semibold text-gray-700">Capgemini Technology</span>
              </div>
              <div className="bg-white px-6 py-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 whitespace-nowrap flex items-center gap-3 min-w-fit">
                <img src="https://logo.clearbit.com/herofincorp.com" alt="Hero" className="h-10 w-10 object-contain" />
                <span className="text-sm font-semibold text-gray-700">Hero Fincorp</span>
              </div>
              <div className="bg-white px-6 py-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 whitespace-nowrap flex items-center gap-3 min-w-fit">
                <img src="https://logo.clearbit.com/bira91.com" alt="Bira" className="h-10 w-10 object-contain" />
                <span className="text-sm font-semibold text-gray-700">Bira 91</span>
              </div>
              <div className="bg-white px-6 py-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 whitespace-nowrap flex items-center gap-3 min-w-fit">
                <img src="https://logo.clearbit.com/ncdex.com" alt="NCDEX" className="h-10 w-10 object-contain" />
                <span className="text-sm font-semibold text-gray-700">NCDEX</span>
              </div>
              <div className="bg-white px-6 py-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 whitespace-nowrap flex items-center gap-3 min-w-fit">
                <img src="https://logo.clearbit.com/apollohospitals.com" alt="Apollo" className="h-10 w-10 object-contain" />
                <span className="text-sm font-semibold text-gray-700">Apollo Hospitals</span>
              </div>
              <div className="bg-white px-6 py-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 whitespace-nowrap flex items-center gap-3 min-w-fit">
                <img src="https://logo.clearbit.com/oyorooms.com" alt="OYO" className="h-10 w-10 object-contain" />
                <span className="text-sm font-semibold text-gray-700">OYO</span>
              </div>
              <div className="bg-white px-6 py-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 whitespace-nowrap flex items-center gap-3 min-w-fit">
                <img src="https://logo.clearbit.com/swiggy.com" alt="Swiggy" className="h-10 w-10 object-contain" />
                <span className="text-sm font-semibold text-gray-700">Swiggy</span>
              </div>
              <div className="bg-white px-6 py-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 whitespace-nowrap flex items-center gap-3 min-w-fit">
                <img src="https://logo.clearbit.com/zomato.com" alt="Zomato" className="h-10 w-10 object-contain" />
                <span className="text-sm font-semibold text-gray-700">Zomato</span>
              </div>
              <div className="bg-white px-6 py-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 whitespace-nowrap flex items-center gap-3 min-w-fit">
                <img src="https://logo.clearbit.com/byjus.com" alt="Byju's" className="h-10 w-10 object-contain" />
                <span className="text-sm font-semibold text-gray-700">Byju's</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How to Buy Section */}
      <div id="features-section" className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-800 mb-4">
              How to <span className="text-emerald-500">Buy Shares</span>
            </h2>
            <p className="text-xl text-gray-600">Simple steps to start investing in unlisted companies</p>
          </div>

          <div className="max-w-6xl mx-auto mb-16">
            <div className="flex justify-between items-start gap-8">
              <div className="flex-1 text-center">
                <div className="w-24 h-24 rounded-full flex items-center justify-center shadow-2xl mx-auto mb-6" style={{background: 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)'}}>
                  <span className="text-3xl font-bold text-white">1</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">Sign Up</h3>
                <p className="text-base text-gray-600">Create your free account in minutes</p>
              </div>

              <div className="flex-1 text-center">
                <div className="w-24 h-24 rounded-full flex items-center justify-center shadow-2xl mx-auto mb-6" style={{background: 'linear-gradient(135deg, #A855F7 0%, #EC4899 100%)'}}>
                  <span className="text-3xl font-bold text-white">2</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">Browse Shares</h3>
                <p className="text-base text-gray-600">Explore available unlisted companies</p>
              </div>

              <div className="flex-1 text-center">
                <div className="w-24 h-24 rounded-full flex items-center justify-center shadow-2xl mx-auto mb-6" style={{background: 'linear-gradient(135deg, #EF4444 0%, #F97316 100%)'}}>
                  <span className="text-3xl font-bold text-white">3</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">Place Bid</h3>
                <p className="text-base text-gray-600">Submit your bid at your desired price</p>
              </div>

              <div className="flex-1 text-center">
                <div className="w-24 h-24 rounded-full flex items-center justify-center shadow-2xl mx-auto mb-6" style={{background: 'linear-gradient(135deg, #3B82F6 0%, #14B8A6 100%)'}}>
                  <span className="text-3xl font-bold text-white">4</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">Complete Trade</h3>
                <p className="text-base text-gray-600">Secure transaction & ownership transfer</p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <button 
              onClick={() => navigate('/marketplace')}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-10 py-4 rounded-full font-bold text-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              Explore Now 
            </button>
          </div>
        </div>
      </div>

      {/* How to Sell Section */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-800 mb-4">
              How to <span className="text-purple-600">Sell Shares</span>
            </h2>
            <p className="text-xl text-gray-600 mb-8">List your unlisted shares and reach thousands of buyers</p>
            
            <div className="flex justify-center items-center gap-6 flex-wrap">
              <div className="bg-white rounded-2xl px-6 py-4 shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-3">
                <div className="text-3xl">💰</div>
                <div className="text-left">
                  <h4 className="text-sm font-bold text-gray-800">Best Prices</h4>
                  <p className="text-xs text-gray-600">Set your own price and get competitive bids</p>
                </div>
              </div>
              <div className="bg-white rounded-2xl px-6 py-4 shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-3">
                <div className="text-3xl">⚡</div>
                <div className="text-left">
                  <h4 className="text-sm font-bold text-gray-800">Quick Listing</h4>
                  <p className="text-xs text-gray-600">List your shares in less than 5 minutes</p>
                </div>
              </div>
              <div className="bg-white rounded-2xl px-6 py-4 shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-3">
                <div className="text-3xl">🔒</div>
                <div className="text-left">
                  <h4 className="text-sm font-bold text-gray-800">Secure Transfer</h4>
                  <p className="text-xs text-gray-600">Safe and verified ownership transfer process</p>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto mb-16">
            <div className="grid grid-cols-4 gap-6">
              <div className="bg-gray-50 rounded-3xl p-8 shadow-lg hover:shadow-xl hover:bg-white transition-all duration-300 group">
                <div className="flex items-start gap-4 mb-6">
                  <span className="text-6xl font-bold text-blue-100 group-hover:text-blue-300 transition-colors duration-300">1</span>
                  <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center shadow-md">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">Create Account</h3>
                <p className="text-sm text-gray-600">Register as a seller on our platform</p>
              </div>

              <div className="bg-gray-50 rounded-3xl p-8 shadow-lg hover:shadow-xl hover:bg-white transition-all duration-300 group">
                <div className="flex items-start gap-4 mb-6">
                  <span className="text-6xl font-bold text-cyan-100 group-hover:text-cyan-300 transition-colors duration-300">2</span>
                  <div className="w-16 h-16 bg-cyan-500 rounded-2xl flex items-center justify-center shadow-md">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">List Your Shares</h3>
                <p className="text-sm text-gray-600">Add share details, quantity & your price</p>
              </div>

              <div className="bg-gray-50 rounded-3xl p-8 shadow-lg hover:shadow-xl hover:bg-white transition-all duration-300 group">
                <div className="flex items-start gap-4 mb-6">
                  <span className="text-6xl font-bold text-green-100 group-hover:text-green-300 transition-colors duration-300">3</span>
                  <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center shadow-md">
                    <span className="text-3xl font-bold text-white">₹</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">Get Bids</h3>
                <p className="text-sm text-gray-600">Receive bids from interested buyers</p>
              </div>

              <div className="bg-gray-50 rounded-3xl p-8 shadow-lg hover:shadow-xl hover:bg-white transition-all duration-300 group">
                <div className="flex items-start gap-4 mb-6">
                  <span className="text-6xl font-bold text-purple-100 group-hover:text-purple-300 transition-colors duration-300">4</span>
                  <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center shadow-md">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">Accept & Sell</h3>
                <p className="text-sm text-gray-600">Accept best bid & complete sale</p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <button 
              onClick={() => navigate('/marketplace')}
              className="bg-gradient-to-r from-purple-600 to-violet-700 text-white px-10 py-4 rounded-full font-bold text-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              Start Selling
            </button>
          </div>
        </div>
      </div>

      {/* About Us Section */}
      <div className="bg-gradient-to-br from-gray-50 via-blue-50 to-teal-50 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-800 mb-4 flex items-center justify-center">
              Why Choose 
              <img 
                src="/images/logos/new_logo.png" 
                alt="Nlist Planet Logo" 
                className="h-28 w-28 inline-block object-contain -mx-5"
              />
              <span className="text-emerald-500">Nlist Planet</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              India's most trusted platform for unlisted shares trading with transparency, security, and innovation
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Secure Transaction</h3>
              <p className="text-gray-600">Our team ensures both buyer and seller receive their assets securely.</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Large Network</h3>
              <p className="text-gray-600">Connect with thousands of verified buyers and sellers across India</p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Expert Support</h3>
              <p className="text-gray-600">Connect to our expert team for exclusive deals.</p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-red-50 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Transparent Pricing</h3>
              <p className="text-gray-600">No hidden charges. Clear pricing for every transaction</p>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-amber-50 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Competitive Rates</h3>
              <p className="text-gray-600">Get the best market rates for your unlisted shares</p>
            </div>

            <div className="bg-gradient-to-br from-teal-50 to-cyan-50 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Market Insights</h3>
              <p className="text-gray-600">Access to detailed company information and market trends</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <footer className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <img 
                  src="/images/logos/new_logo.png" 
                  alt="Nlist Planet Logo" 
                  className="h-12 w-12 object-contain"
                />
                <h3 className="text-2xl font-bold">
                  <span className="text-white">Nlist</span>
                  <span className="text-emerald-400"> Planet</span>
                </h3>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                India's most trusted platform for buying and selling unlisted shares with complete transparency and security.
              </p>
              <div className="flex gap-4 mt-6">
                <a href="https://www.facebook.com/nlistplanet" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-700 hover:bg-emerald-500 rounded-full flex items-center justify-center transition-all duration-300">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="https://twitter.com/nlistplanet" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-700 hover:bg-emerald-500 rounded-full flex items-center justify-center transition-all duration-300">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
                <a href="https://www.linkedin.com/company/nlistplanet" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-700 hover:bg-emerald-500 rounded-full flex items-center justify-center transition-all duration-300">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                <a href="https://www.instagram.com/nlistplanet" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-700 hover:bg-emerald-500 rounded-full flex items-center justify-center transition-all duration-300">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
                  </svg>
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-4 text-emerald-400">Quick Links</h4>
              <ul className="space-y-3">
                <li>
                  <button type="button" onClick={() => navigate('/')} className="text-gray-400 hover:text-emerald-400 transition-colors duration-300 text-sm">Home</button>
                </li>
                <li>
                  <button type="button" onClick={() => navigate('/marketplace')} className="text-gray-400 hover:text-emerald-400 transition-colors duration-300 text-sm">Marketplace</button>
                </li>
                <li>
                  <button type="button" onClick={() => navigate('/login')} className="text-gray-400 hover:text-emerald-400 transition-colors duration-300 text-sm">Login</button>
                </li>
                <li>
                  <button type="button" onClick={() => navigate('/register')} className="text-gray-400 hover:text-emerald-400 transition-colors duration-300 text-sm">Register</button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-4 text-emerald-400">Resources</h4>
              <ul className="space-y-3">
                <li>
                  <a href="https://nlistplanet.com/how-it-works" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-emerald-400 transition-colors duration-300 text-sm">How It Works</a>
                </li>
                <li>
                  <a href="https://nlistplanet.com/faqs" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-emerald-400 transition-colors duration-300 text-sm">FAQs</a>
                </li>
                <li>
                  <a href="https://nlistplanet.com/blog" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-emerald-400 transition-colors duration-300 text-sm">Blog</a>
                </li>
                <li>
                  <a href="https://nlistplanet.com/terms" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-emerald-400 transition-colors duration-300 text-sm">Terms & Conditions</a>
                </li>
                <li>
                  <a href="https://nlistplanet.com/privacy" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-emerald-400 transition-colors duration-300 text-sm">Privacy Policy</a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-4 text-emerald-400">Contact Us</h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-emerald-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-gray-400 text-sm">support@nlistplanet.com</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-emerald-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="text-gray-400 text-sm">+91 9580118412</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-emerald-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-gray-400 text-sm">Mumbai, Maharashtra, India</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-8 mt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-400 text-sm">
                © 2025 Nlist Planet. All rights reserved.
              </p>
              <div className="flex gap-6 items-center">
                <a href="https://nlistplanet.com/privacy" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-emerald-400 transition-colors duration-300 text-sm">Privacy Policy</a>
                <a href="https://nlistplanet.com/terms" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-emerald-400 transition-colors duration-300 text-sm">Terms of Service</a>
                <a href="https://nlistplanet.com/cookies" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-emerald-400 transition-colors duration-300 text-sm">Cookie Policy</a>
                <button onClick={() => navigate(user ? '/dashboard' : '/login')} className="bg-gradient-to-r from-purple-600 to-emerald-600 text-white px-6 py-2 rounded-full font-bold hover:shadow-lg hover:scale-105 transition-all duration-300">
                  🔑 {user ? 'Dashboard' : 'Login / Sign Up'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
