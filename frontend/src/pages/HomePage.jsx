import React from 'react';
import Layout from '../components/layout/Layout';
import HeroSection from '../components/home/HeroSection';
import PropertyInfo from '../components/home/PropertyInfo';
import PropertyGallery from '../components/home/PropertyGallery';
import AmenitiesSection from '../components/home/AmenitiesSection';
import PropertyLocation from '../components/home/PropertyLocation';
import RoomsSection from '../components/home/RoomsSection';
import BookingBanner from '../components/home/BookingBanner';
import { useProperty } from '../hooks/useProperty';

const DEFAULT_PROPERTY_ID = process.env.REACT_APP_PROPERTY_ID || 1;

export default function HomePage() {
  const { property, loading } = useProperty(DEFAULT_PROPERTY_ID);

  if (loading) return null;

  return (
    <Layout property={property}>
      <HeroSection property={property} />
      <PropertyInfo property={property} />
      <PropertyGallery property={property} />
      <AmenitiesSection property={property} />
      <PropertyLocation property={property} />
      <RoomsSection property={property} />
      <BookingBanner property={property} />
    </Layout>
  );
}
