import Hero from '../component/Hero';
import Categories from '../component/Categories';
import BestSellers from '../component/BestSellers';
import Services from '../component/Services';
import BrandStory from '../component/BrandStory';
import BlogPosts from '../component/BlogPosts';
import CustomerFeedback from '../component/CustomerFeedback';

export default function Home() {
  return (
    <>
      <Hero />
      <Categories />
      <BestSellers />
      <Services />
      <BrandStory />
      <BlogPosts />
      <CustomerFeedback />
    </>
  );
}
