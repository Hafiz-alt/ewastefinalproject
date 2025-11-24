import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Recycle, 
  Users, 
  Wrench, 
  GraduationCap, 
  ArrowRight, 
  ChevronDown, 
  Truck, 
  ShoppingBag, 
  Award,
  CheckCircle,
  Menu,
  X
} from 'lucide-react';

const features = [
  {
    icon: <Users className="w-6 h-6" />,
    title: 'For Users',
    description: 'Easily schedule e-waste pickups and track your environmental impact',
  },
  {
    icon: <Recycle className="w-6 h-6" />,
    title: 'For Recyclers',
    description: 'Manage collections and process e-waste efficiently',
  },
  {
    icon: <Wrench className="w-6 h-6" />,
    title: 'For Technicians',
    description: 'Provide repair services and extend device lifecycles',
  },
  {
    icon: <GraduationCap className="w-6 h-6" />,
    title: 'For Educators',
    description: 'Share knowledge about sustainable e-waste management',
  },
];

const services = [
  {
    icon: <Truck className="w-8 h-8 text-teal-600" />,
    title: 'E-Waste Pickup',
    description: 'Schedule convenient pickups for your electronic waste',
    color: 'bg-teal-50 border-teal-200'
  },
  {
    icon: <Wrench className="w-8 h-8 text-blue-600" />,
    title: 'Device Repair',
    description: 'Expert technicians to fix and extend the life of your devices',
    color: 'bg-blue-50 border-blue-200'
  },
  {
    icon: <ShoppingBag className="w-8 h-8 text-purple-600" />,
    title: 'Marketplace',
    description: 'Buy and sell refurbished electronics at affordable prices',
    color: 'bg-purple-50 border-purple-200'
  },
  {
    icon: <GraduationCap className="w-8 h-8 text-amber-600" />,
    title: 'Education',
    description: 'Learn about sustainable e-waste management practices',
    color: 'bg-amber-50 border-amber-200'
  }
];

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Regular User',
    content: 'The pickup service is so convenient! I scheduled a collection for my old electronics and they were at my doorstep the next day.',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  },
  {
    name: 'Michael Chen',
    role: 'Technician',
    content: 'As a repair technician, this platform has connected me with clients who truly value extending the life of their devices rather than replacing them.',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  },
  {
    name: 'Priya Patel',
    role: 'Recycling Business Owner',
    content: 'The platform has streamlined our collection process and helped us connect with more environmentally conscious consumers.',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  }
];

const stats = [
  { value: '2,500+', label: 'Devices Recycled' },
  { value: '1,200+', label: 'Repairs Completed' },
  { value: '350+', label: 'Active Users' },
  { value: '4.8/5', label: 'User Rating' }
];

const partners = [
  'GreenTech Solutions',
  'EcoElectronics',
  'Sustainable Future',
  'TechRecycle Inc.',
  'CircuitBoard Recyclers'
];

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className={`fixed w-full z-10 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Recycle className={`h-8 w-8 ${isScrolled ? 'text-emerald-600' : 'text-emerald-500'}`} />
              <span className={`ml-2 text-xl font-bold ${isScrolled ? 'text-gray-900' : 'text-white'}`}>
                E-Waste Manager
              </span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#services" className={`${isScrolled ? 'text-gray-700' : 'text-white'} hover:text-emerald-500 transition-colors`}>
                Services
              </a>
              <a href="#impact" className={`${isScrolled ? 'text-gray-700' : 'text-white'} hover:text-emerald-500 transition-colors`}>
                Impact
              </a>
              <a href="#testimonials" className={`${isScrolled ? 'text-gray-700' : 'text-white'} hover:text-emerald-500 transition-colors`}>
                Testimonials
              </a>
              <Link to="/login" className={`${isScrolled ? 'text-gray-700' : 'text-white'} hover:text-emerald-500 transition-colors`}>
                Login
              </Link>
              <Link
                to="/register"
                className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 transition-colors"
              >
                Register
              </Link>
            </div>
            
            {/* Mobile menu button */}
            <div className="md:hidden">
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`${isScrolled ? 'text-gray-700' : 'text-white'} hover:text-emerald-500`}
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white shadow-lg">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <a 
                href="#services" 
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-emerald-500 hover:bg-gray-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                Services
              </a>
              <a 
                href="#impact" 
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-emerald-500 hover:bg-gray-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                Impact
              </a>
              <a 
                href="#testimonials" 
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-emerald-500 hover:bg-gray-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                Testimonials
              </a>
              <Link 
                to="/login" 
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-emerald-500 hover:bg-gray-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="block px-3 py-2 rounded-md text-base font-medium text-white bg-emerald-600 hover:bg-emerald-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                Register
              </Link>
            </div>
          </div>
        )}
      </nav>

      <main>
        {/* Hero Section with background image */}
        <div className="relative bg-gradient-to-r from-emerald-800 to-teal-700 text-white">
          <div className="absolute inset-0 bg-black opacity-40"></div>
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ 
              backgroundImage: "url('https://images.unsplash.com/photo-1550009158-9ebf69173e03?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')",
              backgroundBlendMode: 'overlay',
              opacity: 0.4
            }}
          ></div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 md:py-40 lg:py-48">
            <div className="md:w-2/3">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight">
                Sustainable E-Waste Management
                <span className="block text-emerald-300">for a Better Future</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-100 mb-8 max-w-2xl">
                Join our platform to contribute to responsible e-waste disposal, device repair,
                and environmental sustainability. Together, we can make a difference.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center px-6 py-3 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 transition-colors text-lg font-medium"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <a
                  href="#services"
                  className="inline-flex items-center justify-center px-6 py-3 border-2 border-white text-white rounded-md hover:bg-white hover:text-emerald-700 transition-colors text-lg font-medium"
                >
                  Learn More
                  <ChevronDown className="ml-2 h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
          
          {/* Curved bottom */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full h-auto">
              <path fill="#f9fafb" fillOpacity="1" d="M0,96L80,112C160,128,320,160,480,160C640,160,800,128,960,122.7C1120,117,1280,139,1360,149.3L1440,160L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"></path>
            </svg>
          </div>
        </div>

        {/* Impact Counter Section */}
        <div id="impact" className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Environmental Impact</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Join over 350 community members making a difference through responsible e-waste management.
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-4xl md:text-5xl font-bold text-emerald-600 mb-2">{stat.value}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
            
            <div className="mt-16 bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-8">
                <div className="flex flex-col md:flex-row items-center justify-between">
                  <div className="mb-6 md:mb-0 md:w-1/2">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Making a Measurable Difference</h3>
                    <p className="text-gray-600 mb-4">
                      Every device recycled or repaired through our platform contributes to reducing e-waste in landfills and conserving valuable resources.
                    </p>
                    <ul className="space-y-2">
                      {[
                        'Reduced CO2 emissions',
                        'Conservation of precious metals',
                        'Decreased landfill waste',
                        'Extended device lifecycles'
                      ].map((item, index) => (
                        <li key={index} className="flex items-center">
                          <CheckCircle className="h-5 w-5 text-emerald-500 mr-2" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="md:w-1/2">
                    <img 
                      src="https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                      alt="Environmental impact" 
                      className="rounded-lg shadow-md"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Services Section */}
        <div id="services" className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Services</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Comprehensive solutions for responsible e-waste management and device lifecycle extension.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {services.map((service, index) => (
                <div 
                  key={index} 
                  className={`${service.color} border rounded-xl p-6 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1`}
                >
                  <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mb-4 shadow-sm">
                    {service.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{service.title}</h3>
                  <p className="text-gray-600">{service.description}</p>
                </div>
              ))}
            </div>
            
            {/* User Journey */}
            <div className="mt-20">
              <h3 className="text-2xl font-bold text-gray-900 text-center mb-12">How It Works</h3>
              
              <div className="relative">
                {/* Connection line */}
                <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-emerald-200 -translate-y-1/2 z-0"></div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                  {[
                    {
                      step: '01',
                      title: 'Register',
                      description: 'Create an account and select your role in the e-waste ecosystem',
                      icon: <Users className="h-8 w-8 text-emerald-600" />
                    },
                    {
                      step: '02',
                      title: 'Connect',
                      description: 'Schedule pickups, request repairs, or browse the marketplace',
                      icon: <Recycle className="h-8 w-8 text-emerald-600" />
                    },
                    {
                      step: '03',
                      title: 'Contribute',
                      description: 'Make a positive environmental impact and earn rewards',
                      icon: <Award className="h-8 w-8 text-emerald-600" />
                    }
                  ].map((item, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center text-center">
                      <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                        {item.icon}
                      </div>
                      <div className="text-sm font-semibold text-emerald-600 mb-2">STEP {item.step}</div>
                      <h4 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h4>
                      <p className="text-gray-600">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* For Everyone Section */}
        <div className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">For Everyone in the Ecosystem</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Our platform connects all stakeholders in the e-waste management process,
                making it easier to contribute to a sustainable future.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 transform hover:-translate-y-1"
                >
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4 text-emerald-600">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Testimonials Section */}
        <div id="testimonials" className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Users Say</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Hear from the people who are making a difference with our platform.
              </p>
            </div>
            
            <div className="relative bg-emerald-50 rounded-2xl p-8 md:p-12 shadow-md overflow-hidden">
              {/* Background pattern */}
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-emerald-200 rounded-full opacity-50"></div>
              <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-32 h-32 bg-emerald-200 rounded-full opacity-50"></div>
              
              <div className="relative">
                <div className="flex flex-col md:flex-row items-center">
                  <div className="mb-6 md:mb-0 md:w-1/3 flex justify-center">
                    <img 
                      src={testimonials[activeTestimonial].image} 
                      alt={testimonials[activeTestimonial].name}
                      className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
                    />
                  </div>
                  <div className="md:w-2/3">
                    <div className="text-xl md:text-2xl text-gray-700 italic mb-6">
                      "{testimonials[activeTestimonial].content}"
                    </div>
                    <div className="font-semibold text-gray-900">{testimonials[activeTestimonial].name}</div>
                    <div className="text-emerald-600">{testimonials[activeTestimonial].role}</div>
                  </div>
                </div>
                
                <div className="flex justify-center mt-8">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveTestimonial(index)}
                      className={`w-3 h-3 rounded-full mx-1 ${
                        index === activeTestimonial ? 'bg-emerald-600' : 'bg-gray-300'
                      }`}
                      aria-label={`Go to testimonial ${index + 1}`}
                    ></button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Partners Section */}
        <div className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Trusted Partners</h2>
            </div>
            
            <div className="flex flex-wrap justify-center gap-8 items-center">
              {partners.map((partner, index) => (
                <div key={index} className="text-lg font-semibold text-gray-500">{partner}</div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-emerald-700 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Make a Difference?</h2>
            <p className="text-lg text-emerald-100 mb-8 max-w-2xl mx-auto">
              Join our community today and be part of the solution to electronic waste.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/register"
                className="px-8 py-3 bg-white text-emerald-700 rounded-md hover:bg-gray-100 transition-colors text-lg font-medium"
              >
                Get Started
              </Link>
              <Link
                to="/login"
                className="px-8 py-3 border-2 border-white text-white rounded-md hover:bg-emerald-600 transition-colors text-lg font-medium"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Recycle className="h-8 w-8 text-emerald-400" />
                <span className="ml-2 text-xl font-bold">E-Waste Manager</span>
              </div>
              <p className="text-gray-400">
                Sustainable e-waste management for a better future.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Services</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-emerald-400">E-Waste Pickup</a></li>
                <li><a href="#" className="hover:text-emerald-400">Device Repair</a></li>
                <li><a href="#" className="hover:text-emerald-400">Marketplace</a></li>
                <li><a href="#" className="hover:text-emerald-400">Education</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-emerald-400">About Us</a></li>
                <li><a href="#" className="hover:text-emerald-400">Our Team</a></li>
                <li><a href="#" className="hover:text-emerald-400">Careers</a></li>
                <li><a href="#" className="hover:text-emerald-400">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-emerald-400">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-emerald-400">Terms of Service</a></li>
                <li><a href="#" className="hover:text-emerald-400">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 E-Waste Manager. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}