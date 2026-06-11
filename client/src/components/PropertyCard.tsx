import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Property } from '../types';

interface PropertyCardProps {
  property: Property;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  const navigate = useNavigate();

  const typeColors: Record<string, string> = {
    apartment: 'bg-blue-50 text-blue-700',
    house: 'bg-green-50 text-green-700',
    studio: 'bg-purple-50 text-purple-700',
    villa: 'bg-amber-50 text-amber-700',
  };

  return (
    <div
      onClick={() => navigate(`/properties/${property.id}`)}
      className="group bg-white rounded-2xl overflow-hidden border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
    >
      {/* Image */}
      <div className="relative h-56 bg-slate-100 overflow-hidden">
        {property.images && property.images.length > 0 ? (
          <img
            src={property.images[0]}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
            <span className="text-6xl opacity-30">🏠</span>
          </div>
        )}
        {/* Type badge */}
        <div className="absolute top-3 left-3">
          <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${typeColors[property.type] || 'bg-slate-100 text-slate-700'}`}>
            {property.type}
          </span>
        </div>
        {/* Availability */}
        <div className="absolute top-3 right-3">
          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${property.is_available ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
            {property.is_available ? 'Available' : 'Booked'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex justify-between items-start gap-2 mb-2">
          <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">
            {property.title}
          </h3>
        </div>

        <div className="flex items-center gap-1 text-slate-500 text-sm mb-4">
          <span>📍</span>
          <span>{property.city}, {property.country}</span>
        </div>

        <div className="flex items-center gap-4 text-slate-500 text-sm mb-4">
          <span className="flex items-center gap-1">
            <span>🛏</span> {property.bedrooms} bed
          </span>
          <span className="flex items-center gap-1">
            <span>🚿</span> {property.bathrooms} bath
          </span>
          {property.area && (
            <span className="flex items-center gap-1">
              <span>📐</span> {property.area}m²
            </span>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div>
            <span className="text-2xl font-extrabold text-slate-900">${Number(property.price).toLocaleString()}</span>
            <span className="text-slate-400 text-sm font-normal"> / night</span>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors">
            View →
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;