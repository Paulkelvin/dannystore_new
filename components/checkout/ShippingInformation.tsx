'use client';

import { useState, useEffect } from 'react';
import { FaTruck } from 'react-icons/fa';
import { useSession } from 'next-auth/react';
import { fetchUserProfile } from '@/lib/sanityUser';
import useSWR from 'swr';

interface ShippingInformationProps {
  onComplete: (data: ShippingData) => void;
  initialData?: ShippingData;
}

export interface ShippingData {
  email: string;
  fullName: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zipCode: string;
  phone?: string;
}

interface ShippingAddress {
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  lastUsed?: Date;
}

const US_STATES = [
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' },
  { value: 'DC', label: 'District of Columbia' },
  { value: 'AS', label: 'American Samoa' },
  { value: 'GU', label: 'Guam' },
  { value: 'MP', label: 'Northern Mariana Islands' },
  { value: 'PR', label: 'Puerto Rico' },
  { value: 'VI', label: 'U.S. Virgin Islands' }
];

// Helper function to clean ZIP code
const cleanZipCode = (zip: string): string => {
  // Remove all non-digit characters and invisible Unicode characters
  return zip.replace(/[^\d]/g, '').slice(0, 5);
};

export default function ShippingInformation({ onComplete, initialData }: ShippingInformationProps) {
  const { data: session } = useSession();
  const { data: userProfile, mutate: mutateProfile } = useSWR(
    session?.user?.email ? ['profile', session.user.email] : null,
    () => fetchUserProfile(session!.user!.email!)
  );
  const [saveAddress, setSaveAddress] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [sameAsBilling, setSameAsBilling] = useState(false);
  const [addresses, setAddresses] = useState<ShippingAddress[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<ShippingAddress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add a dropdown for saved addresses if logged in and addresses exist
  const [useNewAddress, setUseNewAddress] = useState(false);

  const [formData, setFormData] = useState<ShippingData>(() => {
    // If we have initialData, use that
    if (initialData) {
      return {
        ...initialData,
        zipCode: cleanZipCode(initialData.zipCode)
      };
    }
    
    // If we have user profile data, use that
    if (userProfile) {
      const defaultAddress = userProfile.shippingAddresses?.[0];
      if (defaultAddress) {
        return {
          email: session?.user?.email || '',
          fullName: defaultAddress.name || '',
          address1: defaultAddress.line1 || '',
          address2: defaultAddress.line2 || '',
          city: defaultAddress.city || '',
          state: defaultAddress.state || '',
          zipCode: cleanZipCode(defaultAddress.postalCode || ''),
          phone: '',
        };
      }
    }
    
    // Otherwise use empty form
    return {
      email: session?.user?.email || '',
      fullName: '',
      address1: '',
      address2: '',
      city: '',
      state: '',
      zipCode: '',
      phone: '',
    };
  });

  // Update form data when user profile loads
  useEffect(() => {
    if (userProfile && !initialData) {
      const defaultAddress = userProfile.shippingAddresses?.[0];
      if (defaultAddress) {
        setFormData(prev => ({
          ...prev,
          email: session?.user?.email || prev.email,
          fullName: defaultAddress.name || prev.fullName,
          address1: defaultAddress.line1 || prev.address1,
          address2: defaultAddress.line2 || prev.address2,
          city: defaultAddress.city || prev.city,
          state: defaultAddress.state || prev.state,
          zipCode: cleanZipCode(defaultAddress.postalCode || prev.zipCode),
        }));
      }
    }
  }, [userProfile, session?.user?.email, initialData]);

  // After saving a new address, update the form to use the new address
  useEffect(() => {
    if (userProfile?.shippingAddresses && userProfile.shippingAddresses.length > 0) {
      const latest = userProfile.shippingAddresses[0];
      setFormData(prev => ({
        ...prev,
        fullName: latest.name || prev.fullName,
        address1: latest.line1 || prev.address1,
        address2: latest.line2 || prev.address2,
        city: latest.city || prev.city,
        state: latest.state || prev.state,
        zipCode: latest.postalCode || prev.zipCode,
      }));
    }
  }, [userProfile?.shippingAddresses]);

  // Fetch user's addresses on component mount
  useEffect(() => {
    const fetchAddresses = async () => {
      if (!session?.user?.email) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/get-addresses?userId=${session.user.email}`);
        if (!response.ok) throw new Error('Failed to fetch addresses');
        
        const data = await response.json();
        const sortedAddresses = data.addresses.sort((a: ShippingAddress, b: ShippingAddress) => {
          // Sort by lastUsed timestamp, most recent first
          const dateA = a.lastUsed ? new Date(a.lastUsed).getTime() : 0;
          const dateB = b.lastUsed ? new Date(b.lastUsed).getTime() : 0;
          return dateB - dateA;
        });
        
        setAddresses(sortedAddresses);
        
        // If there's an initial address, find it in the list
        if (initialData) {
          const existingAddress = sortedAddresses.find(addr => 
            addr.line1 === initialData.address1 &&
            addr.city === initialData.city &&
            addr.state === initialData.state &&
            addr.postalCode === initialData.zipCode &&
            addr.country === 'US'
          );
          
          if (existingAddress) {
            setSelectedAddress(existingAddress);
          } else {
            // If initial address doesn't exist in the list, use it as is
            setSelectedAddress(initialData);
          }
        } else if (sortedAddresses.length > 0) {
          // If no initial address, use the most recently used address
          setSelectedAddress(sortedAddresses[0]);
        }
      } catch (err) {
        console.error('Error fetching addresses:', err);
        setError('Failed to load saved addresses');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAddresses();
  }, [session?.user?.email, initialData]);

  const handleAddressSelect = (address: ShippingAddress) => {
    setSelectedAddress(address);
    setFormData(prev => ({
      ...prev,
      fullName: address.name,
      address1: address.line1,
      address2: address.line2,
      city: address.city,
      state: address.state,
      zipCode: address.postalCode,
    }));
  };

  const handleNewAddress = (address: ShippingAddress) => {
    // Add the new address to the list and select it
    const newAddress = { ...address, lastUsed: new Date() };
    setAddresses(prev => [newAddress, ...prev]);
    setSelectedAddress(newAddress);
    setFormData(prev => ({
      ...prev,
      fullName: newAddress.name,
      address1: newAddress.line1,
      address2: newAddress.line2,
      city: newAddress.city,
      state: newAddress.state,
      zipCode: newAddress.postalCode,
    }));
  };

  const [errors, setErrors] = useState<Partial<Record<keyof ShippingData, string>>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ShippingData, string>> = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.fullName) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.address1) {
      newErrors.address1 = 'Address is required';
    }

    if (!formData.city) {
      newErrors.city = 'City is required';
    }

    if (!formData.state) {
      newErrors.state = 'State is required';
    }

    if (!formData.zipCode) {
      newErrors.zipCode = 'ZIP code is required';
    } else {
      const cleanedZip = cleanZipCode(formData.zipCode);
      if (cleanedZip.length !== 5) {
        newErrors.zipCode = 'Please enter a 5-digit ZIP code';
      }
    }

    if (formData.phone && !/^\+?1?\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      // If user is logged in and wants to save the address
      if (session && saveAddress) {
        setIsSaving(true);
        try {
          const address = {
            name: formData.fullName,
            line1: formData.address1,
            line2: formData.address2,
            city: formData.city,
            state: formData.state,
            postalCode: formData.zipCode,
            country: 'US', // Default to US for now
          };

          const response = await fetch('/api/save-address', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address }),
          });

          if (!response.ok) {
            throw new Error('Failed to save address');
          }

          // Refresh user profile to get updated addresses
          await mutateProfile();
        } catch (error) {
          console.error('Error saving address:', error);
          // Continue with checkout even if saving address fails
        } finally {
          setIsSaving(false);
        }
      }

      onComplete(formData);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Clean ZIP code input
    if (name === 'zipCode') {
      const cleanedValue = cleanZipCode(value);
      setFormData(prev => ({ ...prev, [name]: cleanedValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    // Clear error when user starts typing
    if (errors[name as keyof ShippingData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  // Add a dropdown for saved addresses if logged in and addresses exist
  const handleDropdownChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === 'new') {
      setUseNewAddress(true);
      setSelectedAddress(null);
      setFormData({
        email: session?.user?.email || '',
        fullName: '',
        address1: '',
        address2: '',
        city: '',
        state: '',
        zipCode: '',
        phone: '',
      });
    } else {
      setUseNewAddress(false);
      const addr = addresses.find(a => a.line1 === value);
      if (addr) handleAddressSelect(addr);
    }
  };

  if (isLoading) {
    return <div className="animate-pulse">Loading addresses...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center mb-6">
        <FaTruck className="text-2xl text-[#42A5F5] mr-3" />
        <h2 className="text-3xl font-extrabold text-[#333333] tracking-tight">Shipping Address</h2>
      </div>
      <div className="border-b border-[#DEE2E6] mb-6" />

      {/* Dropdown for saved addresses */}
      {session && addresses.length > 0 && (
        <div className="mb-4">
          <label htmlFor="addressDropdown" className="block text-sm font-medium text-[#6c757d] mb-1">
            Choose a saved address
          </label>
          <select
            id="addressDropdown"
            className="w-full px-4 py-3 rounded-lg border border-[#DEE2E6] focus:outline-none focus:ring-2 focus:ring-[#42A5F5] focus:border-transparent transition-all"
            value={useNewAddress ? 'new' : selectedAddress?.line1 || ''}
            onChange={handleDropdownChange}
          >
            {addresses.map((addr, idx) => (
              <option key={idx} value={addr.line1}>
                {addr.name}, {addr.line1}, {addr.city}, {addr.state} {addr.postalCode}
              </option>
            ))}
            <option value="new">+ Add New Address</option>
          </select>
        </div>
      )}

      {/* Email - Disabled if logged in */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-[#6c757d] mb-1">
          Email address
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          disabled={!!session}
          className={`w-full px-4 py-3 rounded-lg border ${
            errors.email ? 'border-red-500' : 'border-[#DEE2E6]'
          } focus:outline-none focus:ring-2 focus:ring-[#42A5F5] focus:border-transparent transition-all ${
            session ? 'bg-gray-100' : ''
          }`}
          placeholder="you@example.com"
        />
        {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
      </div>

      {/* Full Name */}
      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-[#6c757d] mb-1">
          Full Name
        </label>
        <input
          type="text"
          id="fullName"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          className={`w-full px-4 py-3 rounded-lg border ${
            errors.fullName ? 'border-red-500' : 'border-[#DEE2E6]'
          } focus:outline-none focus:ring-2 focus:ring-[#42A5F5] focus:border-transparent transition-all`}
          placeholder="John Doe"
        />
        {errors.fullName && <p className="mt-1 text-sm text-red-500">{errors.fullName}</p>}
      </div>

      {/* Address Line 1 */}
      <div>
        <label htmlFor="address1" className="block text-sm font-medium text-[#6c757d] mb-1">
          Street Address
        </label>
        <input
          type="text"
          id="address1"
          name="address1"
          value={formData.address1}
          onChange={handleChange}
          className={`w-full px-4 py-3 rounded-lg border ${
            errors.address1 ? 'border-red-500' : 'border-[#DEE2E6]'
          } focus:outline-none focus:ring-2 focus:ring-[#42A5F5] focus:border-transparent transition-all`}
          placeholder="123 Main St"
        />
        {errors.address1 && <p className="mt-1 text-sm text-red-500">{errors.address1}</p>}
      </div>

      {/* Address Line 2 */}
      <div>
        <label htmlFor="address2" className="block text-sm font-medium text-[#6c757d] mb-1">
          Apartment, suite, etc. (Optional)
        </label>
        <input
          type="text"
          id="address2"
          name="address2"
          value={formData.address2}
          onChange={handleChange}
          className="w-full px-4 py-3 rounded-lg border border-[#DEE2E6] focus:outline-none focus:ring-2 focus:ring-[#42A5F5] focus:border-transparent transition-all"
          placeholder="Apt 123"
        />
      </div>

      {/* City, State, ZIP */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <label htmlFor="city" className="block text-sm font-medium text-[#6c757d] mb-1">
            City
          </label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            className={`w-full px-4 py-3 rounded-lg border ${
              errors.city ? 'border-red-500' : 'border-[#DEE2E6]'
            } focus:outline-none focus:ring-2 focus:ring-[#42A5F5] focus:border-transparent transition-all`}
            placeholder="City"
          />
          {errors.city && <p className="mt-1 text-sm text-red-500">{errors.city}</p>}
        </div>

        <div>
          <label htmlFor="state" className="block text-sm font-medium text-[#6c757d] mb-1">
            State
          </label>
          <select
            id="state"
            name="state"
            value={formData.state}
            onChange={handleChange}
            className={`w-full px-4 py-3 rounded-lg border ${
              errors.state ? 'border-red-500' : 'border-[#DEE2E6]'
            } focus:outline-none focus:ring-2 focus:ring-[#42A5F5] focus:border-transparent transition-all bg-white`}
          >
            <option value="">Select State</option>
            {US_STATES.map(state => (
              <option key={state.value} value={state.value}>
                {state.label}
              </option>
            ))}
          </select>
          {errors.state && <p className="mt-1 text-sm text-red-500">{errors.state}</p>}
        </div>

        {/* ZIP Code input */}
        <div>
          <label htmlFor="zipCode" className="block text-sm font-medium text-[#6c757d] mb-1">
            ZIP Code
          </label>
          <input
            type="text"
            id="zipCode"
            name="zipCode"
            value={formData.zipCode}
            onChange={handleChange}
            className={`w-full px-4 py-3 rounded-lg border ${
              errors.zipCode ? 'border-red-500' : 'border-[#DEE2E6]'
            } focus:outline-none focus:ring-2 focus:ring-[#42A5F5] focus:border-transparent transition-all`}
            placeholder="12345"
            maxLength={5}
            pattern="\d*"
            inputMode="numeric"
          />
          {errors.zipCode && (
            <p className="mt-1 text-sm text-red-500">
              {errors.zipCode}
            </p>
          )}
        </div>
      </div>

      {/* Phone (Optional) */}
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-[#6c757d] mb-1">
          Phone Number (Optional - for delivery updates)
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className={`w-full px-4 py-3 rounded-lg border ${
            errors.phone ? 'border-red-500' : 'border-[#DEE2E6]'
          } focus:outline-none focus:ring-2 focus:ring-[#42A5F5] focus:border-transparent transition-all`}
          placeholder="(123) 456-7890"
        />
        {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
      </div>

      {/* Add a checkbox to save address if logged in */}
      {session && (
        <div className="mt-6">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={saveAddress}
              onChange={(e) => setSaveAddress(e.target.checked)}
              className="h-4 w-4 border-[#DEE2E6] text-[#42A5F5] focus:ring-[#42A5F5] rounded"
            />
            <span className="text-sm text-[#6c757d]">
              Save this address to my account
            </span>
          </label>
        </div>
      )}

      <button
        type="submit"
        disabled={isSaving}
        className="mt-8 w-full bg-[#FFC300] text-[#333333] text-lg font-bold py-4 rounded-xl shadow-lg hover:bg-[#FFD740] transition-all focus:outline-none focus:ring-2 focus:ring-[#42A5F5]/40 disabled:bg-[#DEE2E6] disabled:text-[#6c757d] disabled:cursor-not-allowed"
      >
        {isSaving ? 'Saving...' : 'Continue to Shipping Method'}
      </button>
    </form>
  );
} 