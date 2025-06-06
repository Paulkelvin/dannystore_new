'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, Search, User, Menu, X, LogOut } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { useCart } from '@/context/CartContext';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { sanityClientPublic as client } from '@/lib/sanityClient';
import { urlFor } from '@/lib/sanityClient';

interface SearchResult {
  _id: string;
  name: string;
  price: number;
  slug: { current: string };
  mainImage: any;
  category: {
    _id: string;
    name: string;
  };
  tags?: string[];
  description?: string;
}

// Utility: Normalize and basic stemmer
function normalizeAndStem(str: string): string {
  if (!str) return '';
  // Lowercase, remove spaces, basic stemming (remove common suffixes)
  let s = str.toLowerCase().replace(/\s+/g, '');
  // Basic stemming: remove 'ing', 'ed', 's' at the end
  s = s.replace(/(ing|ed|s)$/g, '');
  return s;
}

function getInitials(nameOrEmail: string): string {
  if (!nameOrEmail) return '';
  
  // If it's an email, use the first two characters before the @
  if (nameOrEmail.includes('@')) {
    const username = nameOrEmail.split('@')[0];
    return username.slice(0, 2).toUpperCase();
  }
  
  // If it's a name, use the first letter of first and last name
  const parts = nameOrEmail.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  
  // If it's a single word, use first two letters
  return nameOrEmail.slice(0, 2).toUpperCase();
}

export default function Header() {
  const { data: session, status } = useSession();
  const { cart } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  const cartCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

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

  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const searchQuery = `*[_type == "product" && (
          name match $query || 
          description match $query || 
          category->name match $query || 
          tags[] match $query
        )] | order(_createdAt desc)[0...10] {
          _id,
          name,
          price,
          "slug": slug.current,
          mainImage,
          category-> {
            _id,
            name
          }
        }`;
        const results = await client.fetch<SearchResult[]>(searchQuery, { query: `*${query}*` } as any) || [];
        // Post-process for typo-tolerance and stemming
        const normQuery = normalizeAndStem(query);
        const filtered = results.filter(product => {
          const fields = [
            product.name,
            product.category?.name,
            product.price?.toString(),
            product._id,
            product.slug?.current,
            ...(product.tags || []),
            product.description || ''
          ];
          return fields.some(field => normalizeAndStem(field).includes(normQuery));
        });
        setSearchResults(filtered);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);
  };

  const handleResultClick = (slug: string) => {
    router.push(`/products/${slug}`);
    setIsSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
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
              ? 'bg-[#42A5F5] text-white shadow-md' 
              : 'bg-transparent text-white'
            : 'bg-[#42A5F5] text-white shadow-md'
        }`}
      >
        <div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-3">
            <button 
              onClick={toggleMobileMenu}
              className={`md:hidden p-2 rounded-lg transition-colors ${
                isHomePage && !isScrolled ? 'hover:bg-white/10' : 'hover:bg-white/20'
              }`}
              aria-label="Toggle menu"
            >
              <Menu className="w-6 h-6" />
            </button>
            <Link href="/" className={`flex items-center p-2 rounded-lg transition-all duration-300 ${
              isHomePage && !isScrolled ? '' : 'bg-white shadow-sm'
            }`}>
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
              <Link href="/" className={`hover:underline underline-offset-4 ${isHomePage && !isScrolled ? 'text-white' : 'text-white'}`}>Home</Link>
              <Link href="/products" className={`hover:underline underline-offset-4 ${isHomePage && !isScrolled ? 'text-white' : 'text-white'}`}>Shop All</Link>
              <Link href="/#categories" className={`hover:underline underline-offset-4 ${isHomePage && !isScrolled ? 'text-white' : 'text-white'}`}>Categories</Link>
              <Link href="/about" className={`hover:underline underline-offset-4 ${isHomePage && !isScrolled ? 'text-white' : 'text-white'}`}>About Us</Link>
              <Link href="/contact" className={`hover:underline underline-offset-4 ${isHomePage && !isScrolled ? 'text-white' : 'text-white'}`}>Contact</Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            {/* User Icon with Dropdown - Desktop Only */}
            <div className="hidden md:block relative" ref={userMenuRef}>
              <button
                onClick={handleUserMenuClick}
                className="flex items-center justify-center p-2 rounded-lg transition-colors hover:text-white/80"
                aria-label={status === 'authenticated' ? 'User menu' : 'Sign in'}
              >
                {status === 'authenticated' && session.user?.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name || 'User avatar'}
                    className="w-8 h-8 rounded-full object-cover border-2 border-white transition-transform duration-200 hover:scale-105"
                  />
                ) : status === 'authenticated' ? (
                  <div className="w-8 h-8 rounded-full bg-[#42A5F5] flex items-center justify-center text-white font-medium border-2 border-white transition-transform duration-200 hover:scale-105">
                    {getInitials(session.user?.name || session.user?.email || '')}
                  </div>
                ) : (
                  <User className="w-6 h-6" />
                )}
              </button>
              
              {/* User Dropdown Menu */}
              {isUserMenuOpen && status === 'authenticated' && (
                <div 
                  className="absolute right-0 mt-2 w-56 rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50 transform transition-all duration-200 ease-out origin-top-right"
                  style={{
                    opacity: isUserMenuOpen ? 1 : 0,
                    transform: isUserMenuOpen ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(-10px)',
                  }}
                >
                  <div className="p-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {session.user?.name || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {session.user?.email}
                    </p>
                  </div>
                  <div className="py-1">
                    <Link
                      href="/account"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <User className="w-4 h-4 mr-2" />
                      My Account
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
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
      </header>

      {/* Mobile Menu */}
      <div 
        className={`fixed inset-0 z-[100] md:hidden transition-all duration-300 ${
          isMobileMenuOpen 
            ? 'opacity-100 pointer-events-auto' 
            : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300"
          onClick={toggleMobileMenu}
        />
        
        {/* Menu Panel */}
        <div 
          className={`fixed inset-y-0 left-0 w-[280px] bg-white shadow-xl transform transition-transform duration-300 z-[101] ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Menu Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <Link 
              href="/" 
              className="flex items-center"
              onClick={toggleMobileMenu}
            >
              <Image
                src="/images/dannystore_logo.png"
                alt="DannyStore Logo"
                width={120}
                height={32}
                className="h-8 w-auto"
                priority
              />
            </Link>
            <button
              onClick={toggleMobileMenu}
              className="p-2 text-gray-500 hover:text-gray-700"
              aria-label="Close menu"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Menu Items */}
          <nav className="flex flex-col p-4">
            <Link 
              href="/" 
              className={`px-4 py-3 text-base font-medium rounded-lg ${
                pathname === '/' ? 'bg-[#42A5F5]/10 text-[#42A5F5]' : 'text-gray-700 hover:bg-gray-50'
              }`}
              onClick={toggleMobileMenu}
            >
              Home
            </Link>
            <Link 
              href="/products" 
              className={`px-4 py-3 text-base font-medium rounded-lg ${
                pathname === '/products' ? 'bg-[#42A5F5]/10 text-[#42A5F5]' : 'text-gray-700 hover:bg-gray-50'
              }`}
              onClick={toggleMobileMenu}
            >
              Shop All
            </Link>
            <Link 
              href="/#categories" 
              className="px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
              onClick={toggleMobileMenu}
            >
              Categories
            </Link>
            <Link 
              href="/about" 
              className={`px-4 py-3 text-base font-medium rounded-lg ${
                pathname === '/about' ? 'bg-[#42A5F5]/10 text-[#42A5F5]' : 'text-gray-700 hover:bg-gray-50'
              }`}
              onClick={toggleMobileMenu}
            >
              About Us
            </Link>
            <Link 
              href="/contact" 
              className={`px-4 py-3 text-base font-medium rounded-lg ${
                pathname === '/contact' ? 'bg-[#42A5F5]/10 text-[#42A5F5]' : 'text-gray-700 hover:bg-gray-50'
              }`}
              onClick={toggleMobileMenu}
            >
              Contact
            </Link>

            {/* Search Section */}
            <div className="mt-4 pt-4 border-t">
              <button
                onClick={() => {
                  toggleSearch();
                  toggleMobileMenu();
                }}
                className="w-full px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-lg flex items-center gap-2"
              >
                <Search className="w-5 h-5" />
                Search
              </button>
            </div>

            {/* User Account Section */}
            <div className="mt-4 pt-4 border-t">
              {status === 'authenticated' ? (
                <>
                  <div className="px-4 py-2">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {session.user?.name || session.user?.email}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {session.user?.email}
                    </p>
                  </div>
                  <Link
                    href="/account"
                    className="block px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
                    onClick={toggleMobileMenu}
                  >
                    My Account
                  </Link>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleSignOut(e);
                      toggleMobileMenu();
                    }}
                    className="w-full text-left px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-lg flex items-center gap-2"
                  >
                    <LogOut className="w-5 h-5" />
                    Sign out
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="block px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
                  onClick={toggleMobileMenu}
                >
                  Sign in
                </Link>
              )}
            </div>
          </nav>
        </div>
      </div>

      {/* Search Dropdown - Keep this outside the mobile menu */}
      <div 
        className={`fixed inset-0 z-[102] transition-all duration-200 ${
          isSearchOpen 
            ? 'opacity-100 pointer-events-auto' 
            : 'opacity-0 pointer-events-none'
        }`}
      >
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300"
          onClick={toggleSearch}
        />
        <div 
          className={`fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-xl transform transition-transform duration-300 ${
            isSearchOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-medium text-gray-900">Search</h2>
            <button
              onClick={toggleSearch}
              className="p-2 text-gray-500 hover:text-gray-700"
              aria-label="Close search"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search products..."
                className="w-full rounded-full border border-gray-300 py-2 pl-10 pr-4 text-gray-900 placeholder-gray-400 focus:border-[#42A5F5] focus:outline-none focus:ring-1 focus:ring-[#42A5F5]"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSearchResults([]);
                    if (searchInputRef.current) {
                      searchInputRef.current.focus();
                    }
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Search Results */}
            <div className="mt-4 max-h-[calc(100vh-200px)] overflow-y-auto">
              {isSearching ? (
                <div className="flex justify-center py-4">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#42A5F5] border-t-transparent"></div>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-2">
                  {searchResults.map((result) => (
                    <button
                      key={result._id}
                      onClick={() => {
                        handleResultClick(result.slug.current);
                        toggleSearch();
                      }}
                      className="w-full flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors text-left"
                    >
                      <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-md">
                        {result.mainImage && (
                          <Image
                            src={urlFor(result.mainImage)?.width(48).height(48).url() ?? '/images/placeholder.png'}
                            alt={result.name}
                            fill
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">{result.name}</h3>
                        <p className="text-sm text-gray-500 truncate">{result.category?.name}</p>
                        <p className="text-sm font-medium text-[#42A5F5]">${result.price?.toFixed(2)}</p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : searchQuery.length >= 2 ? (
                <p className="text-center text-gray-500 py-4">No products found</p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}