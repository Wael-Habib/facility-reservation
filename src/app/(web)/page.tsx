import FeaturedFacility from '@/components/FeaturedFacility/FeaturedFacility';
import Gallery from '@/components/Gallery/Gallery';
import HeroSection from '@/components/HeroSection/HeroSection';
import NewsLetter from '@/components/NewsLetter/NewsLetter';
import PageSearch from '@/components/PageSearch/PageSearch';
import { getFeaturedFacility } from '@/libs/apis';

const Home = async () => {
  const featuredFacility = await getFeaturedFacility();
  
  return (
    <>
      <HeroSection />
      <PageSearch />
      {<FeaturedFacility featuredFacility={featuredFacility} /> }
      <Gallery />
      <NewsLetter />
    </>
  );
};

export default Home;
