import HeroSection from '../components/home/HeroSection';
import FeaturedProducts from '../components/home/FeaturedProducts';
import USPBar from '../components/home/USPBar';
import PerfectlySized from '../components/home/PerfectlySized';
import SeeItStyled from '../components/home/SeeItStyled';
import ReviewsCarousel from '../components/home/ReviewsCarousel';
import FAQAccordion from '../components/home/FAQAccordion';
import Newsletter from '../components/home/Newsletter';
import VideoShowcase from '../components/home/VideoShowcase';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <USPBar />
      <FeaturedProducts />
      {/* <VideoShowcase /> */}
      <PerfectlySized />
      <SeeItStyled />
      <ReviewsCarousel />
      <FAQAccordion />
      <Newsletter />
    </>
  );
}
