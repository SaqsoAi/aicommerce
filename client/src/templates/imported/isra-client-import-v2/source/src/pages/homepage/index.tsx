import Header from '../../components/ui/Header';
import HeroSection from './components/HeroSection';
import PersonalizationBanner from './components/PersonalizationBanner';
import TrendingCollections from './components/TrendingCollections';
import StyleDiscovery from './components/StyleDiscovery';
import SocialProofFeed from './components/SocialProofFeed';
import RecommendationEngine from './components/RecommendationEngine';
import SustainabilityCommitment from './components/SustainabilityCommitment';

const Homepage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        {/* Hero Section with Dynamic Campaign */}
        <HeroSection />
        
        {/* Personalization Banner for Returning Users */}
        <PersonalizationBanner />
        
        {/* Trending Collections Grid */}
        <TrendingCollections />
        
        {/* Style Discovery Tools */}
        <StyleDiscovery />
        
        {/* Social Proof Feed */}
        <SocialProofFeed />
        
        {/* Recommendation Engine */}
        <RecommendationEngine />
        
        {/* Sustainability Commitment */}
        <SustainabilityCommitment />
      </main>
      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-12 mt-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand Section */}
            <div className="md:col-span-1">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary-foreground rounded-lg flex items-center justify-center">
                  <svg
                    viewBox="0 0 24 24"
                    className="w-5 h-5 text-primary"
                    fill="currentColor"
                  >
                    <path d="M12 2L2 7v10c0 5.55 3.84 10 9 11 1.16.21 2.84.21 4 0 5.16-1 9-5.45 9-11V7l-10-5z"/>
                    <path d="M8 11l2 2 4-4" stroke="currentColor" strokeWidth="2" fill="none"/>
                  </svg>
                </div>
                <span className="text-xl font-semibold font-accent">StyleHub</span>
              </div>
              <p className="text-primary-foreground/80 text-sm leading-relaxed">
                Discover your style story with contemporary fashion that celebrates individuality and sustainability.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-4">Shop</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="/product-catalog" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">New Arrivals</a></li>
                <li><a href="/product-catalog" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Collections</a></li>
                <li><a href="/product-catalog" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Sustainable</a></li>
                <li><a href="/product-catalog" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Sale</a></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="/size-fit-center" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Size Guide</a></li>
                <li><a href="#" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Returns</a></li>
                <li><a href="#" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Shipping</a></li>
                <li><a href="#" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Contact</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">About Us</a></li>
                <li><a href="#" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Sustainability</a></li>
                <li><a href="#" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Careers</a></li>
                <li><a href="#" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Press</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-primary-foreground/20 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-primary-foreground/60 text-sm">
              © {new Date()?.getFullYear()} StyleHub Commerce. All rights reserved.
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <a href="#" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;