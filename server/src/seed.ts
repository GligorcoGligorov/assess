import { query } from './config/database';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const seedData = async () => {
  console.log('🌱 Seeding database...');

  // Create demo owner
  const hashedPassword = await bcrypt.hash('demo123', 12);
  
  const ownerResult = await query(
    `INSERT INTO users (email, password, full_name, role)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (email) DO UPDATE SET full_name = EXCLUDED.full_name
     RETURNING id`,
    ['demo@rentease.com', hashedPassword, 'Demo Owner', 'owner']
  );
  
  const ownerId = ownerResult.rows[0].id;
  console.log('✅ Demo owner created:', ownerId);

  // Seed properties
  const properties = [
    {
      title: 'Luxury Penthouse with Sea View',
      description: 'Stunning penthouse apartment with panoramic sea views, fully furnished with premium furniture and state-of-the-art appliances. Perfect for a romantic getaway or business trip.',
      price: 350,
      location: 'Waterfront Boulevard 12',
      city: 'Dubrovnik',
      country: 'Croatia',
      type: 'apartment',
      bedrooms: 3,
      bathrooms: 2,
      area: 120,
      images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop'],
      amenities: ['WiFi', 'Sea View', 'Pool', 'Parking', 'Air Conditioning', 'Gym'],
    },
    {
      title: 'Cozy Mountain Studio',
      description: 'A charming studio nestled in the mountains with breathtaking views. Ideal for nature lovers and hikers. Fully equipped kitchen, fireplace, and a private terrace.',
      price: 95,
      location: 'Alpine Road 7',
      city: 'Innsbruck',
      country: 'Austria',
      type: 'studio',
      bedrooms: 1,
      bathrooms: 1,
      area: 45,
      images: ['https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=800&auto=format&fit=crop'],
      amenities: ['WiFi', 'Fireplace', 'Mountain View', 'Terrace', 'Heating'],
    },
    {
      title: 'Modern Villa with Private Pool',
      description: 'Spectacular modern villa featuring a private infinity pool, landscaped gardens, and spacious open-plan living areas. The perfect luxury retreat for families or groups.',
      price: 650,
      location: 'Sunset Drive 3',
      city: 'Santorini',
      country: 'Greece',
      type: 'villa',
      bedrooms: 4,
      bathrooms: 3,
      area: 280,
      images: ['https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&auto=format&fit=crop'],
      amenities: ['WiFi', 'Private Pool', 'Sea View', 'BBQ', 'Parking', 'Air Conditioning', 'Garden'],
    },
    {
        title: 'Charming Parisian Apartment',
        description: 'Elegant apartment in the heart of Paris, steps away from the Eiffel Tower. Features classic Haussmann architecture, high ceilings, and a beautiful balcony overlooking the city.',
        price: 220,
        location: 'Rue de Rivoli 45',
        city: 'Paris',
        country: 'France',
        type: 'apartment',
        bedrooms: 2,
        bathrooms: 1,
        area: 85,
        images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop'],
        amenities: ['WiFi', 'Balcony', 'City View', 'Air Conditioning', 'Elevator'],
        },
        {
        title: 'Beachfront House in Maldives',
        description: 'Wake up to the sound of waves in this stunning beachfront house. Direct beach access, crystal clear water, and spectacular sunsets. A true paradise escape.',
        price: 480,
        location: 'Beach Road 1',
        city: 'Malé',
        country: 'Maldives',
        type: 'house',
        bedrooms: 3,
        bathrooms: 2,
        area: 160,
        images: ['https://images.unsplash.com/photo-1439130490301-25e322d88054?w=800&auto=format&fit=crop'],
        amenities: ['WiFi', 'Beach Access', 'Sea View', 'Pool', 'BBQ', 'Parking'],
        },
        {
        title: 'Historic Townhouse in Barcelona',
        description: 'Beautiful restored townhouse in the Gothic Quarter of Barcelona. Original architecture blended with modern comforts. Walking distance to Las Ramblas and the best restaurants.',
        price: 175,
        location: 'Carrer del Bisbe 8',
        city: 'Barcelona',
        country: 'Spain',
        type: 'house',
        bedrooms: 3,
        bathrooms: 2,
        area: 140,
        images: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop'],
        amenities: ['WiFi', 'Terrace', 'Air Conditioning', 'Washing Machine', 'City View'],
        },
  ];

  for (const property of properties) {
    await query(
      `INSERT INTO properties 
        (owner_id, title, description, price, location, city, country, type, bedrooms, bathrooms, area, images, amenities)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       ON CONFLICT DO NOTHING`,
      [
        ownerId,
        property.title,
        property.description,
        property.price,
        property.location,
        property.city,
        property.country,
        property.type,
        property.bedrooms,
        property.bathrooms,
        property.area,
        property.images,
        property.amenities,
      ]
    );
    console.log(`✅ Property created: ${property.title}`);
  }

  console.log('🎉 Seeding complete!');
  process.exit(0);
};

seedData().catch((err) => {
  console.error('❌ Seed error:', err);
  process.exit(1);
});