import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { propertyService } from '../services/property.service';
import { useAuthStore } from '../store/auth.store';
import type { Property, Pagination } from '../types';
import PropertyCard from '../components/PropertyCard';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [properties, setProperties] = useState<Property[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [filters, setFilters] = useState({
    city: '',
    type: '',
    minPrice: '',
    maxPrice: '',
    page: 1,
  });

  const fetchProperties = async () => {
    setIsLoading(true);
    try {
      const data = await propertyService.getAll({
        city: filters.city || undefined,
        type: filters.type || undefined,
        minPrice: filters.minPrice ? Number(filters.minPrice) : undefined,
        maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined,
        page: filters.page,
        limit: 9,
      });
      setProperties(data.properties);
      setPagination(data.pagination);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [filters.page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ ...filters, page: 1 });
    fetchProperties();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <span className="text-2xl">🏡</span>
            <span className="text-xl font-bold text-slate-900 tracking-tight">RentEase</span>
          </div>
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-2 bg-slate-100 rounded-full px-4 py-2">
                  <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                    {user?.full_name?.charAt(0)}
                  </div>
                  <span className="text-sm font-medium text-slate-700">{user?.full_name}</span>
                </div>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors"
                >
                  Dashboard
                </button>
                <button
                  onClick={logout}
                  className="px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors"
                >
                  Sign in
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-sm"
                >
                  Get started
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="relative pt-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-800" />
        <div className="absolute inset-0 opacity-10"
          style={{backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0)', backgroundSize: '40px 40px'}} />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-50 to-transparent" />

        <div className="relative max-w-5xl mx-auto px-6 py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 rounded-full px-4 py-2 text-white text-sm font-medium mb-8">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            10,000+ properties available now
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6 leading-tight tracking-tight">
            Find your perfect<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              place to stay
            </span>
          </h1>
          <p className="text-blue-100 text-xl mb-12 max-w-2xl mx-auto leading-relaxed">
            Browse curated rental properties across the world. Book instantly, live comfortably.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="bg-white rounded-2xl p-2 flex flex-wrap md:flex-nowrap gap-2 shadow-2xl max-w-3xl mx-auto">
            <div className="flex-1 min-w-40 flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-slate-50 transition-colors">
              <span className="text-slate-400">📍</span>
              <input
                type="text"
                placeholder="Where are you going?"
                value={filters.city}
                onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                className="w-full text-sm text-slate-800 placeholder-slate-400 outline-none bg-transparent"
              />
            </div>
            <div className="w-px bg-slate-200 self-stretch hidden md:block" />
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-slate-50 transition-colors">
              <span className="text-slate-400">🏠</span>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="text-sm text-slate-800 outline-none bg-transparent cursor-pointer"
              >
                <option value="">All types</option>
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="studio">Studio</option>
                <option value="villa">Villa</option>
              </select>
            </div>
            <div className="w-px bg-slate-200 self-stretch hidden md:block" />
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-slate-50 transition-colors">
              <span className="text-slate-400">💰</span>
              <input
                type="number"
                placeholder="Min $"
                value={filters.minPrice}
                onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                className="w-20 text-sm text-slate-800 placeholder-slate-400 outline-none bg-transparent"
              />
              <span className="text-slate-300">—</span>
              <input
                type="number"
                placeholder="Max $"
                value={filters.maxPrice}
                onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                className="w-20 text-sm text-slate-800 placeholder-slate-400 outline-none bg-transparent"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 text-sm whitespace-nowrap shadow-sm"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Stats bar */}
      <div className="max-w-5xl mx-auto px-6 -mt-4 mb-12 relative z-10">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 grid grid-cols-3 divide-x divide-slate-100">
          {[
            { num: '10K+', label: 'Properties listed' },
            { num: '50+', label: 'Cities covered' },
            { num: '4.9★', label: 'Average rating' },
          ].map(({ num, label }) => (
            <div key={label} className="py-5 text-center">
              <p className="text-2xl font-bold text-slate-900">{num}</p>
              <p className="text-xs text-slate-500 mt-1 font-medium">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Properties */}
      <div className="max-w-7xl mx-auto px-6 pb-20">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Available properties</h2>
            {pagination && (
              <p className="text-slate-500 text-sm mt-1">{pagination.total} properties found</p>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden border border-slate-100">
                <div className="h-56 bg-slate-200 animate-pulse" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-slate-200 rounded animate-pulse w-3/4" />
                  <div className="h-3 bg-slate-100 rounded animate-pulse w-1/2" />
                  <div className="h-3 bg-slate-100 rounded animate-pulse w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No properties found</h3>
            <p className="text-slate-500">Try adjusting your search filters</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>

            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-3 mt-12">
                <button
                  disabled={!pagination.hasPrev}
                  onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  ← Previous
                </button>
                <span className="px-4 py-2 text-sm text-slate-500 font-medium">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  disabled={!pagination.hasNext}
                  onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏡</span>
            <span className="text-white font-bold text-lg">RentEase</span>
          </div>
          <p className="text-sm">© 2026 RentEase. All rights reserved.</p>
          <div className="flex gap-6 text-sm">
            <span className="hover:text-white cursor-pointer transition-colors">Privacy</span>
            <span className="hover:text-white cursor-pointer transition-colors">Terms</span>
            <span className="hover:text-white cursor-pointer transition-colors">Support</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;