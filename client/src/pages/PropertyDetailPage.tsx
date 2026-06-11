import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { propertyService } from '../services/property.service';
import { useAuthStore } from '../store/auth.store';
import type { Property } from '../types';
import api from '../services/api';

const PropertyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [booking, setBooking] = useState({ check_in: '', check_out: '', message: '' });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState('');
  const [bookingError, setBookingError] = useState('');
  const [nights, setNights] = useState(0);
  const [reviews, setReviews] = useState<any[]>([]);
  const [avgRating, setAvgRating] = useState<number>(0);
  const [totalReviews, setTotalReviews] = useState<number>(0);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [reviewError, setReviewError] = useState('');

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const data = await propertyService.getById(id!);
        setProperty(data.property);
      } catch {
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  useEffect(() => {
    const fetchReviews = async () => {
            try {
            const data = await api.get(`/reviews/${id}`);
            setReviews(data.data.reviews || []);
            setAvgRating(data.data.average_rating || 0);
            setTotalReviews(data.data.total_reviews || 0);
            } catch (error) {
            console.error(error);
            }
        };
        if (id) fetchReviews();
    }, [id]);

  useEffect(() => {
    if (booking.check_in && booking.check_out) {
      const diff = new Date(booking.check_out).getTime() - new Date(booking.check_in).getTime();
      setNights(Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24))));
    } else {
      setNights(0);
    }
  }, [booking.check_in, booking.check_out]);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) { navigate('/login'); return; }
    setBookingLoading(true);
    setBookingError('');
    try {
      await api.post('/bookings', { property_id: id, ...booking });
      setBookingSuccess('Booking request sent successfully!');
    } catch (err: any) {
      setBookingError(err.response?.data?.message || 'Booking failed');
    } finally {
      setBookingLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!property) return null;

  const typeColors: Record<string, string> = {
    apartment: 'bg-blue-50 text-blue-700',
    house: 'bg-green-50 text-green-700',
    studio: 'bg-purple-50 text-purple-700',
    villa: 'bg-amber-50 text-amber-700',
  };

  const handleReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewLoading(true);
    setReviewError('');
    try {
        await api.post(`/reviews/${id}`, reviewForm);
        setReviewSuccess('Review submitted!');
        const data = await api.get(`/reviews/${id}`);
        setReviews(data.data.reviews || []);
        setAvgRating(data.data.average_rating || 0);
        setTotalReviews(data.data.total_reviews || 0);
    } catch (err: any) {
        setReviewError(err.response?.data?.message || 'Failed to submit review');
    } finally {
        setReviewLoading(false);
    }
  };

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
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            ← Back to listings
          </button>
        </div>
      </nav>

      <div className="pt-16">
        {/* Hero image */}
        <div className="relative h-96 bg-slate-200 overflow-hidden">
          {property.images && property.images.length > 0 ? (
            <img src={property.images[0]} alt={property.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-200 to-slate-300">
              <span className="text-8xl opacity-20">🏠</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6">
            <div className="flex items-end justify-between">
              <div>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize mb-3 inline-block ${typeColors[property.type] || 'bg-white/20 text-white'}`}>
                  {property.type}
                </span>
                <h1 className="text-3xl md:text-4xl font-extrabold text-white drop-shadow-lg">
                  {property.title}
                </h1>
                <p className="text-white/80 mt-1 flex items-center gap-1">
                  <span>📍</span> {property.location}, {property.city}, {property.country}
                </p>
              </div>
              <div className="text-right hidden md:block">
                <p className="text-4xl font-extrabold text-white drop-shadow-lg">${Number(property.price).toLocaleString()}</p>
                <p className="text-white/70 text-sm">per night</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Left — details */}
            <div className="lg:col-span-2 space-y-8">

              {/* Quick stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: '🛏', label: 'Bedrooms', value: property.bedrooms },
                  { icon: '🚿', label: 'Bathrooms', value: property.bathrooms },
                  { icon: '📐', label: 'Area', value: property.area ? `${property.area}m²` : '—' },
                  { icon: '🏠', label: 'Type', value: property.type },
                ].map(({ icon, label, value }) => (
                  <div key={label} className="bg-white rounded-2xl p-4 border border-slate-100 text-center">
                    <span className="text-2xl">{icon}</span>
                    <p className="text-slate-500 text-xs mt-2 font-medium">{label}</p>
                    <p className="text-slate-900 font-bold capitalize mt-0.5">{value}</p>
                  </div>
                ))}
              </div>

              {/* Description */}
              {property.description && (
                <div className="bg-white rounded-2xl p-6 border border-slate-100">
                  <h2 className="text-xl font-bold text-slate-900 mb-3">About this place</h2>
                  <p className="text-slate-600 leading-relaxed">{property.description}</p>
                </div>
              )}

              {/* Amenities */}
              {property.amenities && property.amenities.length > 0 && (
                <div className="bg-white rounded-2xl p-6 border border-slate-100">
                  <h2 className="text-xl font-bold text-slate-900 mb-4">Amenities</h2>
                  <div className="flex flex-wrap gap-2">
                    {property.amenities.map((amenity) => (
                      <span key={amenity} className="bg-slate-50 border border-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-medium">
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Reviews */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">Reviews</h2>
                {totalReviews > 0 && (
                <div className="flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-xl">
                    <span className="text-amber-500 text-lg">★</span>
                    <span className="font-bold text-slate-900">{avgRating}</span>
                    <span className="text-slate-500 text-sm">({totalReviews})</span>
                </div>
                )}
            </div>
            {reviews.length === 0 ? (
                <div className="text-center py-8">
                <div className="text-4xl mb-2">⭐</div>
                <p className="text-slate-500 text-sm">No reviews yet</p>
                </div>
            ) : (
                <div className="space-y-4">
                {reviews.map((review) => (
                    <div key={review.id} className="border-b border-slate-100 pb-4 last:border-0">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                            {review.reviewer_name?.charAt(0)}
                        </div>
                        <span className="font-semibold text-slate-900 text-sm">{review.reviewer_name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                            <span key={i} className={`text-sm ${i < review.rating ? 'text-amber-400' : 'text-slate-200'}`}>★</span>
                        ))}
                        </div>
                    </div>
                    {review.comment && <p className="text-slate-600 text-sm ml-10">{review.comment}</p>}
                    </div>
                ))}
               </div>
            )}

            {isAuthenticated && !reviewSuccess && (
              <form onSubmit={handleReview} className="mt-6 pt-6 border-t border-slate-100 space-y-4">
                <h3 className="font-bold text-slate-900">Leave a review</h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-600 font-medium">Rating:</span>
                  {[1,2,3,4,5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                      className={`text-2xl transition-colors ${star <= reviewForm.rating ? 'text-amber-400' : 'text-slate-200'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <textarea
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  placeholder="Share your experience..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none h-24 text-sm"
                />
                {reviewError && (
                  <p className="text-red-500 text-sm">{reviewError}</p>
                )}
                <button
                  type="submit"
                  disabled={reviewLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors disabled:opacity-60"
                >
                  {reviewLoading ? 'Submitting...' : 'Submit review'}
                </button>
              </form>
            )}
            {reviewSuccess && (
              <p className="mt-4 text-green-600 text-sm font-semibold">✅ {reviewSuccess}</p>
            )}
            </div>

              {/* Owner */}
             <div className="bg-white rounded-2xl p-6 border border-slate-100">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Hosted by</h2>
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold">
                    {property.owner_name?.charAt(0)}
                    </div>
                    <div>
                    <p className="font-bold text-slate-900 text-lg">{property.owner_name}</p>
                    <p className="text-slate-500 text-sm">{property.owner_email}</p>
                    </div>
                </div>
                {isAuthenticated && (
                    <button
                    onClick={async () => {
                        try {
                        await api.post('/messages', {
                            receiver_id: property.owner_id,
                            property_id: property.id,
                            content: `Hi, I'm interested in "${property.title}". Is it available?`,
                        });
                        navigate('/messages');
                        } catch (error) {
                        console.error(error);
                        }
                    }}
                    className="w-full border border-slate-200 text-slate-700 font-semibold py-3 rounded-xl hover:bg-slate-50 transition-colors text-sm flex items-center justify-center gap-2"
                    >
                    💬 Message owner
                    </button>
                )}
                </div>
            </div>{/* затвора lg:col-span-2 */}

            {/* Right — booking */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-slate-100 p-6 sticky top-24 shadow-lg">
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-3xl font-extrabold text-slate-900">${Number(property.price).toLocaleString()}</span>
                  <span className="text-slate-500 text-sm">/ night</span>
                </div>

                {bookingSuccess ? (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-4 rounded-xl text-sm text-center">
                    <div className="text-3xl mb-2">✅</div>
                    <p className="font-semibold">Booking request sent!</p>
                    <p className="text-green-600 text-xs mt-1">The owner will confirm shortly.</p>
                  </div>
                ) : (
                  <form onSubmit={handleBooking} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">Check in</label>
                        <input
                          type="date"
                          value={booking.check_in}
                          onChange={(e) => setBooking({ ...booking, check_in: e.target.value })}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">Check out</label>
                        <input
                          type="date"
                          value={booking.check_out}
                          onChange={(e) => setBooking({ ...booking, check_out: e.target.value })}
                          min={booking.check_in || new Date().toISOString().split('T')[0]}
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                    </div>

                    {nights > 0 && (
                      <div className="bg-blue-50 rounded-xl p-4 space-y-2">
                        <div className="flex justify-between text-sm text-slate-600">
                          <span>${Number(property.price).toLocaleString()} × {nights} nights</span>
                          <span>${(Number(property.price) * nights).toLocaleString()}</span>
                        </div>
                        <div className="border-t border-blue-100 pt-2 flex justify-between font-bold text-slate-900">
                          <span>Total</span>
                          <span>${(Number(property.price) * nights).toLocaleString()}</span>
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">Message (optional)</label>
                      <textarea
                        value={booking.message}
                        onChange={(e) => setBooking({ ...booking, message: e.target.value })}
                        placeholder="Tell the owner about yourself..."
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none h-20"
                      />
                    </div>

                    {bookingError && (
                      <div className="bg-red-50 border border-red-100 text-red-600 px-3 py-2.5 rounded-xl text-sm flex items-center gap-2">
                        <span>⚠️</span> {bookingError}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={bookingLoading}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all duration-200 disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                      {bookingLoading ? (
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                        </svg>
                      ) : null}
                      {isAuthenticated ? 'Request booking' : 'Sign in to book'}
                    </button>
                    <p className="text-center text-xs text-slate-400">You won't be charged yet</p>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailPage;