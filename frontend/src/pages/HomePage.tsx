import React from 'react';
import Hero from '../components/Hero';
import ServicesGrid from '../components/ServicesGrid';
import StatsBand from '../components/StatsBand';
import B2BSection from '../components/B2BSection';
import ProcessSection from '../components/ProcessSection';
import FaqSection from '../components/FaqSection';
import ContactSection from '../components/ContactSection';

const HomePage: React.FC = () => {
  return (
    <>
      <Hero />
      <ServicesGrid />
      <StatsBand />
      <B2BSection />
      <ProcessSection />
      <FaqSection />
      <ContactSection />
    </>
  );
};

export default HomePage;
