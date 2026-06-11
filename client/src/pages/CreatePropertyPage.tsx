import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { propertyService } from '../services/property.service';

const CreatePropertyPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
    city: '',
    country: '',
    type: 'apartment',
    bedrooms: '1',
    bathrooms: '1',
    area: '',
    amenities: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await propertyService.create({
        ...form,
        price: Number(form.price),
        bedrooms: Number(form.bedrooms),
        bathrooms: Number(form.bathrooms),
        area: form.area ? Number(form.area) : undefined,
        amenities: form.amenities ? form.amenities.split(',').map((a) => a.trim()) : [],
      } as any);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create property');
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm bg-white";
  const labelClass = "block text-sm font-semibold text-slate-700 mb-1.5";

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <span className="text-2xl">🏡</span>
            <span className="text-xl font-bold text-slate-900">RentEase</span>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            ← Back to Dashboard
          </button>
        </div>
      </nav>

      <div className="pt-20 max-w-3xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900">List your property</h1>
          <p className="text-slate-500 mt-1">Fill in the details to start receiving bookings</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2">
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Basic info */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-5">
            <h2 className="text-lg font-bold text-slate-900">Basic Information</h2>
            <div>
              <label className={labelClass}>Property title</label>
              <input
                type="text"
                placeholder="Beautiful apartment in city center"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Describe your property, what makes it special..."
                className={`${inputClass} resize-none h-28`}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Price per night ($)</label>
                <input
                  type="number"
                  placeholder="100"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Property type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className={inputClass}
                >
                  <option value="apartment">🏢 Apartment</option>
                  <option value="house">🏡 House</option>
                  <option value="studio">🏠 Studio</option>
                  <option value="villa">🏰 Villa</option>
                </select>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-5">
            <h2 className="text-lg font-bold text-slate-900">Location</h2>
            <div>
              <label className={labelClass}>Street address</label>
              <input
                type="text"
                placeholder="123 Main Street"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                required
                className={inputClass}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>City</label>
                <input
                  type="text"
                  placeholder="Skopje"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Country</label>
                <input
                  type="text"
                  placeholder="North Macedonia"
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                  required
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-5">
            <h2 className="text-lg font-bold text-slate-900">Property Details</h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Bedrooms</label>
                <input
                  type="number"
                  min="1"
                  value={form.bedrooms}
                  onChange={(e) => setForm({ ...form, bedrooms: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Bathrooms</label>
                <input
                  type="number"
                  min="1"
                  value={form.bathrooms}
                  onChange={(e) => setForm({ ...form, bathrooms: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Area (m²)</label>
                <input
                  type="number"
                  placeholder="75"
                  value={form.area}
                  onChange={(e) => setForm({ ...form, area: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>Amenities <span className="text-slate-400 font-normal">(comma separated)</span></label>
              <input
                type="text"
                placeholder="WiFi, Parking, Pool, Air Conditioning"
                value={form.amenities}
                onChange={(e) => setForm({ ...form, amenities: e.target.value })}
                className={inputClass}
              />
              {form.amenities && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {form.amenities.split(',').map((a) => a.trim()).filter(Boolean).map((a) => (
                    <span key={a} className="bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">
                      {a}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition-all duration-200 disabled:opacity-60 flex items-center justify-center gap-2 text-base shadow-sm"
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
            ) : '🏠'}
            {isLoading ? 'Creating...' : 'List my property'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreatePropertyPage;