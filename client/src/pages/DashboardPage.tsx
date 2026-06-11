import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import type { Property, Booking } from '../types';
import api from '../services/api';
import { propertyService } from '../services/property.service';

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  });
};

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'bookings' | 'properties'>('bookings');

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user?.role === 'owner') {
          const [propsData, bookingsData] = await Promise.all([
            propertyService.getAll({ limit: 100 }),
            api.get('/bookings/my-properties'),
          ]);
          const myProperties = propsData.properties.filter(
            (p: Property) => p.owner_id === user.id
          );
          setProperties(myProperties);
          setBookings(bookingsData.data.bookings || []);
        } else {
          const data = await api.get('/bookings/my');
          setBookings(data.data.bookings);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleDeleteProperty = async (id: string) => {
    if (!confirm('Are you sure you want to delete this property?')) return;
    try {
      await propertyService.delete(id);
      setProperties(properties.filter((p) => p.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdateBookingStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/bookings/${id}/status`, { status });
      setBookings(bookings.map((b) => (b.id === id ? { ...b, status: status as any } : b)));
    } catch (error) {
      console.error(error);
    }
  };

  const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
    pending: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-400' },
    confirmed: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-400' },
    cancelled: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-400' },
    completed: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-400' },
  };

  const pendingCount = bookings.filter(b => b.status === 'pending').length;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <span className="text-2xl">🏡</span>
            <span className="text-xl font-bold text-slate-900">RentEase</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-100 rounded-full px-4 py-2">
              <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                {user?.full_name?.charAt(0)}
              </div>
              <span className="text-sm font-medium text-slate-700">{user?.full_name}</span>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold capitalize">{user?.role}</span>
            </div>
            <button
                onClick={() => navigate('/messages')}
                className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                >
                Messages
            </button>
            <button
              onClick={() => navigate('/')}
              className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              Browse
            </button>
            <button
              onClick={logout}
              className="px-4 py-2 text-sm font-semibold text-slate-500 hover:text-red-600 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </nav>

      <div className="pt-20 max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">
              Welcome back, {user?.full_name?.split(' ')[0]} 👋
            </h1>
            <p className="text-slate-500 mt-1">
              {user?.role === 'owner'
                ? 'Manage your properties and bookings'
                : 'Track your upcoming stays'}
            </p>
          </div>
          {user?.role === 'owner' && (
            <button
              onClick={() => navigate('/properties/create')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 flex items-center gap-2 shadow-sm"
            >
              <span>+</span> Add Property
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {user?.role === 'owner' ? (
            <>
            <div className="bg-white rounded-2xl p-5 border border-slate-100">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3 bg-blue-50 text-blue-600">🏠</div>
                <p className="text-2xl font-extrabold text-slate-900">{properties.length}</p>
                <p className="text-slate-500 text-sm mt-0.5">Properties</p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-slate-100">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3 bg-purple-50 text-purple-600">📅</div>
                <p className="text-2xl font-extrabold text-slate-900">{bookings.length}</p>
                <p className="text-slate-500 text-sm mt-0.5">Total Bookings</p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-slate-100">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3 bg-amber-50 text-amber-600">⏳</div>
                <p className="text-2xl font-extrabold text-slate-900">{pendingCount}</p>
                <p className="text-slate-500 text-sm mt-0.5">Pending</p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-slate-100">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3 bg-green-50 text-green-600">✅</div>
                <p className="text-2xl font-extrabold text-slate-900">{bookings.filter(b => b.status === 'confirmed').length}</p>
                <p className="text-slate-500 text-sm mt-0.5">Confirmed</p>
            </div>
            </>
        ) : (
            <>
            <div className="bg-white rounded-2xl p-5 border border-slate-100">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3 bg-blue-50 text-blue-600">🏠</div>
                <p className="text-2xl font-extrabold text-slate-900">{bookings.length}</p>
                <p className="text-slate-500 text-sm mt-0.5">Total Stays</p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-slate-100">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3 bg-green-50 text-green-600">📅</div>
                <p className="text-2xl font-extrabold text-slate-900">{bookings.filter(b => b.status === 'confirmed').length}</p>
                <p className="text-slate-500 text-sm mt-0.5">Upcoming</p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-slate-100">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3 bg-amber-50 text-amber-600">⏳</div>
                <p className="text-2xl font-extrabold text-slate-900">{pendingCount}</p>
                <p className="text-slate-500 text-sm mt-0.5">Pending</p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-slate-100">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3 bg-purple-50 text-purple-600">✅</div>
                <p className="text-2xl font-extrabold text-slate-900">{bookings.filter(b => b.status === 'completed').length}</p>
                <p className="text-slate-500 text-sm mt-0.5">Completed</p>
            </div>
            </>
        )}
        </div>

        {/* Tabs for owner */}
        {user?.role === 'owner' && (
          <div className="flex gap-1 mb-6 bg-slate-100 p-1 rounded-xl w-fit">
            {(['properties', 'bookings'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 capitalize ${
                  activeTab === tab
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab}
                {tab === 'bookings' && pendingCount > 0 && (
                  <span className="ml-2 bg-amber-500 text-white text-xs rounded-full px-1.5 py-0.5">
                    {pendingCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
          </div>
        ) : (
          <div className="space-y-4">

            {/* Renter bookings */}
            {user?.role === 'renter' && (
              bookings.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
                  <div className="text-5xl mb-4">🏠</div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">No bookings yet</h3>
                  <p className="text-slate-500 mb-6">Start exploring properties and book your next stay</p>
                  <button
                    onClick={() => navigate('/')}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
                  >
                    Browse properties
                  </button>
                </div>
              ) : (
                bookings.map((booking) => (
                  <div key={booking.id} className="bg-white rounded-2xl border border-slate-100 p-6 flex justify-between items-center gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">🏠</div>
                      <div>
                        <h3 className="font-bold text-slate-900">{booking.property_title}</h3>
                        <p className="text-slate-500 text-sm mt-0.5">
                          {formatDate(booking.check_in)} → {formatDate(booking.check_out)}
                        </p>
                        <p className="text-blue-600 font-bold mt-1">${Number(booking.total_price).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 ${statusConfig[booking.status]?.bg} ${statusConfig[booking.status]?.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusConfig[booking.status]?.dot}`} />
                        {booking.status}
                      </span>
                      {booking.status === 'pending' && (
                        <button
                          onClick={() => handleUpdateBookingStatus(booking.id, 'cancelled')}
                          className="text-xs font-semibold text-red-500 hover:text-red-700 transition-colors"
                        >
                          Cancel booking
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )
            )}

            {/* Owner properties */}
            {user?.role === 'owner' && activeTab === 'properties' && (
              properties.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
                  <div className="text-5xl mb-4">🏠</div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">No properties yet</h3>
                  <p className="text-slate-500 mb-6">Start listing your properties to get bookings</p>
                  <button
                    onClick={() => navigate('/properties/create')}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
                  >
                    Add your first property
                  </button>
                </div>
              ) : (
                properties.map((property) => (
                  <div key={property.id} className="bg-white rounded-2xl border border-slate-100 p-6 flex justify-between items-center gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">🏠</div>
                      <div>
                        <h3 className="font-bold text-slate-900">{property.title}</h3>
                        <p className="text-slate-500 text-sm">📍 {property.city}, {property.country}</p>
                        <p className="text-blue-600 font-bold mt-1">${Number(property.price).toLocaleString()}<span className="text-slate-400 font-normal text-xs">/night</span></p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${property.is_available ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {property.is_available ? 'Available' : 'Booked'}
                      </span>
                      <button
                        onClick={() => navigate(`/properties/${property.id}`)}
                        className="px-4 py-2 border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-colors"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleDeleteProperty(property.id)}
                        className="px-4 py-2 border border-red-100 text-red-500 text-sm font-semibold rounded-xl hover:bg-red-50 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )
            )}

            {/* Owner bookings */}
            {user?.role === 'owner' && activeTab === 'bookings' && (
              bookings.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
                  <div className="text-5xl mb-4">📅</div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">No bookings yet</h3>
                  <p className="text-slate-500">Bookings will appear here when guests reserve your properties</p>
                </div>
              ) : (
                bookings.map((booking) => (
                  <div key={booking.id} className="bg-white rounded-2xl border border-slate-100 p-6 flex justify-between items-center gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">📅</div>
                      <div>
                        <h3 className="font-bold text-slate-900">{booking.property_title}</h3>
                        <p className="text-slate-500 text-sm">
                          👤 {(booking as any).renter_name}
                        </p>
                        <p className="text-slate-500 text-sm mt-0.5">
                          {formatDate(booking.check_in)} → {formatDate(booking.check_out)}
                        </p>
                        <p className="text-blue-600 font-bold mt-1">${Number(booking.total_price).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 ${statusConfig[booking.status]?.bg} ${statusConfig[booking.status]?.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusConfig[booking.status]?.dot}`} />
                        {booking.status}
                      </span>
                      {booking.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUpdateBookingStatus(booking.id, 'confirmed')}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-xl transition-colors"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => handleUpdateBookingStatus(booking.id, 'cancelled')}
                            className="px-4 py-2 border border-red-200 text-red-500 hover:bg-red-50 text-xs font-bold rounded-xl transition-colors"
                          >
                            Decline
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;