import { FaFacebookF, FaInstagram, FaGithub, FaYoutube, FaCcVisa, FaCcMastercard, FaCcAmex, FaCcPaypal } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-[#333333] text-[#F8F9FA] pt-16 pb-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12">
          {/* Logo/Description/Social */}
          <div className="md:col-span-1 flex flex-col justify-between">
            <div>
              <span className="inline-block text-3xl font-bold mb-2">
                <span className="text-white">danny</span>
                <span className="text-[#FFC300]">store</span>
              </span>
              <p className="mb-6 mt-2 max-w-xs text-[#F8F9FA]/80 text-sm leading-relaxed">
                Your destination for imaginative play. Quality toys delivered with care, sparking joy for every child in the US.
              </p>
            </div>
            <div className="flex space-x-4 mt-2 mb-6">
              <a href="#" aria-label="Facebook" className="text-[#42A5F5] hover:text-[#FFC300] transition-colors duration-200"><FaFacebookF className="h-5 w-5" /></a>
              <a href="#" aria-label="Instagram" className="text-[#42A5F5] hover:text-[#FFC300] transition-colors duration-200"><FaInstagram className="h-5 w-5" /></a>
              <a href="#" aria-label="GitHub" className="text-[#42A5F5] hover:text-[#FFC300] transition-colors duration-200"><FaGithub className="h-5 w-5" /></a>
              <a href="#" aria-label="YouTube" className="text-[#42A5F5] hover:text-[#FFC300] transition-colors duration-200"><FaYoutube className="h-5 w-5" /></a>
            </div>
          </div>

          {/* Customer Care */}
          <div>
            <h3 className="text-base font-bold mb-4 text-white">Customer Care</h3>
            <ul className="space-y-3 text-sm">
              <li><a href="/contact" className="text-[#F8F9FA]/80 hover:text-[#42A5F5] transition-colors duration-200">Contact Us</a></li>
              <li><a href="/faq" className="text-[#F8F9FA]/80 hover:text-[#42A5F5] transition-colors duration-200">FAQ</a></li>
              <li><a href="/shipping-policy" className="text-[#F8F9FA]/80 hover:text-[#42A5F5] transition-colors duration-200">Shipping Policy</a></li>
              <li><a href="/order-tracking" className="text-[#F8F9FA]/80 hover:text-[#42A5F5] transition-colors duration-200">Order Tracking</a></li>
              <li><a href="/gift-cards" className="text-[#F8F9FA]/80 hover:text-[#42A5F5] transition-colors duration-200">Gift Cards</a></li>
            </ul>
          </div>

          {/* Our Company */}
          <div>
            <h3 className="text-base font-bold mb-4 text-white">Our Company</h3>
            <ul className="space-y-3 text-sm">
              <li><a href="/about" className="text-[#F8F9FA]/80 hover:text-[#42A5F5] transition-colors duration-200">About Us</a></li>
              <li><a href="/blog" className="text-[#F8F9FA]/80 hover:text-[#42A5F5] transition-colors duration-200">Blog</a></li>
              <li><a href="/careers" className="text-[#F8F9FA]/80 hover:text-[#42A5F5] transition-colors duration-200">Careers</a></li>
            </ul>
          </div>

          {/* Shop With Us */}
          <div>
            <h3 className="text-base font-bold mb-4 text-white">Shop With Us</h3>
            <ul className="space-y-3 text-sm">
              <li><a href="/category/latest-arrivals" className="text-[#F8F9FA]/80 hover:text-[#42A5F5] transition-colors duration-200">New Arrivals</a></li>
              <li><a href="/category/best-sellers" className="text-[#F8F9FA]/80 hover:text-[#42A5F5] transition-colors duration-200">Bestsellers</a></li>
              <li><a href="/categories" className="text-[#F8F9FA]/80 hover:text-[#42A5F5] transition-colors duration-200">Shop All Categories</a></li>
            </ul>
          </div>

          {/* Legal & Info */}
          <div>
            <h3 className="text-base font-bold mb-4 text-white">Legal & Info</h3>
            <ul className="space-y-3 text-sm">
              <li><a href="/terms-of-service" className="text-[#F8F9FA]/80 hover:text-[#42A5F5] transition-colors duration-200">Terms of Service</a></li>
              <li><a href="/privacy-policy" className="text-[#F8F9FA]/80 hover:text-[#42A5F5] transition-colors duration-200">Privacy Policy</a></li>
              <li><a href="/accessibility" className="text-[#F8F9FA]/80 hover:text-[#42A5F5] transition-colors duration-200">Accessibility Statement</a></li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[#6c757d]/30 mt-12 mb-6" />

        {/* Copyright & Payment Methods */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-[#6c757d]">
            © {new Date().getFullYear()} dannystore. All rights reserved.
          </div>
          <div className="flex items-center space-x-4 mt-2 md:mt-0">
            <FaCcVisa className="h-7 w-7 text-[#F8F9FA]/70" aria-label="Visa" />
            <FaCcMastercard className="h-7 w-7 text-[#F8F9FA]/70" aria-label="Mastercard" />
            <FaCcAmex className="h-7 w-7 text-[#F8F9FA]/70" aria-label="Amex" />
            <FaCcPaypal className="h-7 w-7 text-[#F8F9FA]/70" aria-label="PayPal" />
          </div>
        </div>
      </div>
    </footer>
  );
} 