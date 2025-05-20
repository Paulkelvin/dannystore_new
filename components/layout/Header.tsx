'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, Search, User, Menu, X, LogOut } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { useCart } from '@/context/CartContext';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';

export default function Header() {
  const { data: session, status } = useSession();
  const { cart } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const userMenuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  const cartCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    // Prevent body scroll when menu is open
    document.body.style.overflow = !isMobileMenuOpen ? 'hidden' : 'unset';
  };

  const handleUserMenuClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (status === 'authenticated') {
      setIsUserMenuOpen(!isUserMenuOpen);
    } else {
      router.push('/login');
    }
  };

  const handleSignOut = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsUserMenuOpen(false);
    await signOut({ callbackUrl: '/' });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    if (!isSearchOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  };

  return (
    <>
      <header 
        className={`fixed top-0 z-50 w-full transition-all duration-300 ${
          isHomePage 
            ? isScrolled 
              ? 'bg-white text-[#333333] shadow-md' 
              : 'bg-transparent text-white'
            : 'bg-white text-[#333333] shadow-md'
        }`}
      >
        <div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-3">
            <button 
              onClick={toggleMobileMenu}
              className={`md:hidden p-2 rounded-lg transition-colors ${
                isHomePage && !isScrolled ? 'hover:bg-white/10' : 'hover:bg-gray-100'
              }`}
              aria-label="Toggle menu"
            >
              <Menu className="w-6 h-6" />
            </button>
            <Link href="/" className="flex items-center">
              <Image
                src="/images/dannystore_logo.png"
                alt="DannyStore Logo"
                width={150}
                height={40}
                className="h-10 w-auto"
                priority
              />
            </Link>
            <nav className="hidden md:flex gap-6 ml-8 text-base font-medium">
              <Link href="/" className={`hover:underline underline-offset-4 ${isHomePage && !isScrolled ? 'text-white' : 'text-[#333333]'}`}>Home</Link>
              <Link href="/products" className={`hover:underline underline-offset-4 ${isHomePage && !isScrolled ? 'text-white' : 'text-[#333333]'}`}>Shop All</Link>
              <Link href="/#categories" className={`hover:underline underline-offset-4 ${isHomePage && !isScrolled ? 'text-white' : 'text-[#333333]'}`}>Categories</Link>
              <Link href="/about" className={`hover:underline underline-offset-4 ${isHomePage && !isScrolled ? 'text-white' : 'text-[#333333]'}`}>About Us</Link>
              <Link href="/contact" className={`hover:underline underline-offset-4 ${isHomePage && !isScrolled ? 'text-white' : 'text-[#333333]'}`}>Contact</Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleSearch}
              className={`transition-colors ${
                isSearchOpen 
                  ? 'text-[#42A5F5]' 
                  : isHomePage && !isScrolled 
                    ? 'text-white hover:text-white/80' 
                    : 'text-[#333333] hover:text-[#42A5F5]'
              }`}
              aria-label="Search"
            >
              <Search className="w-6 h-6" />
            </button>
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={handleUserMenuClick}
                className={`transition-colors p-1 rounded-full ${
                  isHomePage && !isScrolled 
                    ? 'hover:bg-white/10' 
                    : 'hover:bg-white/20'
                }`}
                aria-label={status === 'authenticated' ? 'Open user menu' : 'Sign in'}
              >
                <User className="w-6 h-6" />
              </button>
              <div
                className={`absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50 transition-all duration-200 ease-out
                  ${isUserMenuOpen && status === 'authenticated'
                    ? 'opacity-100 translate-y-0 pointer-events-auto'
                    : 'opacity-0 -translate-y-2 pointer-events-none'
                  }`}
                style={{ willChange: 'opacity, transform' }}
              >
                {isUserMenuOpen && status === 'authenticated' && (
                  <>
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {session.user?.name || session.user?.email}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {session.user?.email}
                      </p>
                    </div>
                    <Link
                      href="/account"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      My Account
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign out
                    </button>
                  </>
                )}
              </div>
            </div>
            <Link href="/cart" className="relative transition-colors hover:text-white/80">
              <ShoppingBag className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#FFC300] text-[#333333] text-xs font-bold rounded-full px-1.5 py-0.5 min-w-[20px] text-center border-2 border-white">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Search Overlay */}
        <div 
          className={`fixed inset-0 bg-white z-50 transition-all duration-300 ${
            isSearchOpen 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 -translate-y-full pointer-events-none'
          }`}
        >
          <div className="container mx-auto px-4 h-full flex flex-col">
            <div className="flex items-center justify-between h-16">
              <h2 className="text-xl font-semibold text-gray-900">Search</h2>
              <button 
                onClick={toggleSearch}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close search"
              >
                <X className="w-6 h-6 text-gray-900" />
              </button>
            </div>
            <form onSubmit={handleSearch} className="flex-1 flex flex-col">
              <div className="relative flex-1 flex items-center">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for products..."
                  className="w-full h-16 text-xl px-4 border-b-2 border-gray-200 focus:border-[#42A5F5] focus:outline-none"
                  aria-label="Search input"
                />
                <button
                  type="submit"
                  className="absolute right-4 p-2 text-gray-500 hover:text-[#42A5F5] transition-colors"
                  aria-label="Submit search"
                >
                  <Search className="w-6 h-6" />
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-50 md:hidden"
            onClick={toggleMobileMenu}
            aria-hidden="true"
          />
        )}

        {/* Mobile Menu Panel */}
        <div 
          className={`fixed top-0 left-0 h-full w-[280px] bg-white text-gray-900 transform transition-transform duration-300 ease-in-out z-50 md:hidden ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">Menu</h2>
            <button 
              onClick={toggleMobileMenu}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close menu"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <nav className="flex flex-col p-4">
            <Link 
              href="/" 
              className="py-3 px-4 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={toggleMobileMenu}
            >
              Home
            </Link>
            <Link 
              href="/products" 
              className="py-3 px-4 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={toggleMobileMenu}
            >
              Shop All
            </Link>
            <Link 
              href="/#categories" 
              className="py-3 px-4 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={toggleMobileMenu}
            >
              Categories
            </Link>
            <Link 
              href="/about" 
              className="py-3 px-4 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={toggleMobileMenu}
            >
              About Us
            </Link>
            <Link 
              href="/contact" 
              className="py-3 px-4 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={toggleMobileMenu}
            >
              Contact
            </Link>
          </nav>
        </div>
      </header>
    </>
  );
} 