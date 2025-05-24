import Link from 'next/link';
import { Facebook, Instagram, Youtube, Twitter } from 'lucide-react';
import { FaCcVisa, FaCcMastercard, FaCcPaypal } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-[#232323] text-white pt-12 pb-6 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-8">
        {/* Branding and description */}
        <div className="md:col-span-1 flex flex-col gap-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-block w-10 h-10 rounded-full bg-white flex items-center justify-center">
              <span className="font-bold text-lg text-[#FFC300]">ds</span>
            </span>
            <span className="font-bold text-2xl">
              danny<span className="text-[#FFC300]">store</span>
            </span>
          </div>
          <p className="text-sm text-gray-300 mb-4">
            Your destination for imaginative play. Quality toys delivered with care, sparking joy for every child in the US.
          </p>
          <div className="flex gap-3 text-[#42A5F5]">
            <a href="#" aria-label="Facebook" className="hover:text-[#FFC300]"><Facebook size={20} /></a>
            <a href="#" aria-label="Instagram" className="hover:text-[#FFC300]"><Instagram size={20} /></a>
            <a href="#" aria-label="Twitter" className="hover:text-[#FFC300]"><Twitter size={20} /></a>
            <a href="#" aria-label="YouTube" className="hover:text-[#FFC300]"><Youtube size={20} /></a>
          </div>
        </div>
        {/* Customer Care */}
        <div>
          <h3 className="font-bold mb-4">Customer Care</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li><Link href="/contact" className="hover:text-[#FFC300]">Contact Us</Link></li>
            <li><Link href="/shipping-policy" className="hover:text-[#FFC300]">Shipping Policy</Link></li>
            <li><Link href="/order-tracking" className="hover:text-[#FFC300]">Order Tracking</Link></li>
            <li><Link href="/gift-cards" className="hover:text-[#FFC300]">Gift Cards</Link></li>
          </ul>
        </div>
        {/* Our Company */}
          <div>
          <h3 className="font-bold mb-4">Our Company</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li><Link href="/about" className="hover:text-[#FFC300]">About Us</Link></li>
            {/* <li><Link href="/blog" className="hover:text-[#FFC300]">Blog</Link></li> */}
            <li><Link href="/careers" className="hover:text-[#FFC300]">Careers</Link></li>
            </ul>
          </div>
        {/* Shop With Us */}
          <div>
            <h3 className="font-bold mb-4">Shop With Us</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link href="/category/latest-arrivals" className="hover:text-[#FFC300]">New Arrivals</Link></li>
              <li><Link href="/category/best-sellers" className="hover:text-[#FFC300]">Bestsellers</Link></li>
              <li><Link href="/#categories" className="hover:text-[#FFC300]">Shop All Categories</Link></li>
            </ul>
          </div>
        {/* Legal & Info */}
        <div>
          <h3 className="font-bold mb-4">Legal & Info</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li><Link href="/terms" className="hover:text-[#FFC300]">Terms of Service</Link></li>
            <li><Link href="/privacy" className="hover:text-[#FFC300]">Privacy Policy</Link></li>
            <li><Link href="/accessibility" className="hover:text-[#FFC300]">Accessibility Statement</Link></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-10 pt-8 border-t border-gray-700 flex flex-col md:flex-row items-center justify-between text-xs text-gray-400">
        <div className="mb-2 md:mb-0">© {new Date().getFullYear()} dannystore. All rights reserved.</div>
        <div className="flex gap-4 items-center">
          <FaCcVisa className="h-6 w-6 text-gray-400" aria-label="Visa" />
          <FaCcMastercard className="h-6 w-6 text-gray-400" aria-label="Mastercard" />
          <FaCcPaypal className="h-6 w-6 text-gray-400" aria-label="PayPal" />
        </div>
      </div>
    </footer>
  );
} 