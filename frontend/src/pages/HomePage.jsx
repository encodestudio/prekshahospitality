import React from 'react';
import Layout from '../components/layout/Layout';
import HeroSection from '../components/home/HeroSection';
import PropertyInfo from '../components/home/PropertyInfo';
import AmenitiesSection from '../components/home/AmenitiesSection';
import RoomsSection from '../components/home/RoomsSection';
import BookingBanner from '../components/home/BookingBanner';
import LoadingScreen from '../components/common/LoadingScreen';
import { useProperty } from '../hooks/useProperty';

const DEFAULT_PROPERTY_ID = process.env.REACT_APP_PROPERTY_ID || 1;

export default function HomePage() {
  const { property, loading } = useProperty(DEFAULT_PROPERTY_ID);

  if (loading) return <LoadingScreen message="Loading property details..." />;

  return (
    <Layout property={property}>
      <HeroSection property={property} />
      <PropertyInfo property={property} />
      <AmenitiesSection property={property} />
      <RoomsSection property={property} />
      <BookingBanner property={property} />
    </Layout>
  );
}
