'use client';

import { useState, useEffect } from 'react';
import { useStripe, useElements } from '@stripe/react-stripe-js';
import { useSession } from 'next-auth/react';
import useSWR from 'swr';
import { fetchUserProfile } from '@/lib/sanityUser';

interface ShippingFormData {
  email: string;
  fullName: string;
  streetAddress: string;
  apartment?: string;
  city: string;
  country: string;
  state: string;
  postalCode: string;
}

interface FormErrors {
  email?: string;
  fullName?: string;
  streetAddress?: string;
  city?: string;
  country?: string;
  state?: string;
  postalCode?: string;
}

type SubmissionStatus = 'idle' | 'success' | 'error';

export default function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const { data: session, status: sessionStatus } = useSession();
  const userEmail = session?.user?.email ?? '';
  const { data: userProfile, isLoading: isProfileLoading } = useSWR(
    userEmail ? ['profile', userEmail] : null,
    () => fetchUserProfile(userEmail as string)
  );
  
  const [formData, setFormData] = useState<ShippingFormData>({
    email: '',
    fullName: '',
    streetAddress: '',
    apartment: '',
    city: '',
    country: 'US', // Default to US
    state: '',
    postalCode: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus>('idle');
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  // Update form data when session or profile changes
  useEffect(() => {
    if (sessionStatus === 'authenticated' && userEmail) {
      setFormData(prev => ({
        ...prev,
        email: userEmail
      }));
      // Dispatch email update event
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('checkoutEmailUpdate', {
          detail: { email: userEmail }
        });
        window.dispatchEvent(event);
      }
    }
  }, [sessionStatus, userEmail]);

  // Update form data when user profile is loaded
  useEffect(() => {
    if (userProfile) {
      console.log('📝 Loading user profile data:', userProfile);
      const defaultAddress = userProfile.shippingAddresses?.[0];
      setFormData(prev => ({
        ...prev,
        fullName: userProfile.name || prev.fullName,
        email: userProfile.email || prev.email,
        streetAddress: defaultAddress?.line1 || prev.streetAddress,
        apartment: defaultAddress?.line2 || prev.apartment,
        city: defaultAddress?.city || prev.city,
        country: defaultAddress?.country || prev.country,
        state: defaultAddress?.state || prev.state,
        postalCode: defaultAddress?.postalCode || prev.postalCode,
      }));
    }
  }, [userProfile]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePostalCode = (postalCode: string, country: string): boolean => {
    // For US, just check if it's exactly 5 digits
    if (country === 'US') {
      return /^\d{5}$/.test(postalCode);
    }
    
    // For other countries, just check if it's not empty
    return postalCode.length > 0;
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Full Name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    // Street Address validation
    if (!formData.streetAddress.trim()) {
      newErrors.streetAddress = 'Street address is required';
    }

    // City validation
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    // Country validation
    if (!formData.country) {
      newErrors.country = 'Country is required';
    }

    // State validation
    if (!formData.state.trim()) {
      newErrors.state = 'State/Province is required';
    }

    // Postal Code validation - super simple
    if (!formData.postalCode.trim()) {
      newErrors.postalCode = 'Postal code is required';
    } else if (formData.country === 'US' && !/^\d{5}$/.test(formData.postalCode)) {
      newErrors.postalCode = 'Please enter a 5-digit ZIP code';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      email: '',
      fullName: '',
      streetAddress: '',
      apartment: '',
      city: '',
      country: 'US',
      state: '',
      postalCode: '',
    });
    setErrors({});
    setSubmissionStatus('idle');
    setSubmissionError(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error for the field being edited
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }

    // Clear submission status when user starts editing
    if (submissionStatus !== 'idle') {
      setSubmissionStatus('idle');
      setSubmissionError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    if (validateForm()) {
      try {
        setIsLoading(true);
        setSubmissionStatus('idle');
        setSubmissionError(null);

        // Update parent component with email
        if (typeof window !== 'undefined') {
          const event = new CustomEvent('checkoutEmailUpdate', {
            detail: { email: formData.email }
          });
          window.dispatchEvent(event);
        }
        
        // Confirm payment
        const { error: paymentError } = await stripe.confirmPayment({
          elements,
          confirmParams: {
            return_url: `${window.location.origin}/checkout/success`,
            payment_method_data: {
              billing_details: {
                name: formData.fullName,
                email: formData.email,
                address: {
                  line1: formData.streetAddress,
                  line2: formData.apartment,
                  city: formData.city,
                  state: formData.state,
                  postal_code: formData.postalCode,
                  country: formData.country,
                },
              },
            },
          },
        });

        if (paymentError) {
          throw new Error(paymentError.message);
        }

        setSubmissionStatus('success');
        resetForm();
      } catch (error) {
        console.error('Error submitting form:', error);
        setSubmissionStatus('error');
        setSubmissionError(error instanceof Error ? error.message : 'Failed to process payment. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const renderError = (fieldName: keyof FormErrors) => {
    return errors[fieldName] ? (
      <p className="mt-1 text-sm text-red-600">{errors[fieldName]}</p>
    ) : null;
  };

  const renderSubmissionStatus = () => {
    if (submissionStatus === 'success') {
      return (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                Shipping information submitted successfully!
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (submissionStatus === 'error') {
      return (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">
                {submissionError}
              </p>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {renderSubmissionStatus()}

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          disabled={sessionStatus === 'authenticated'}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
            sessionStatus === 'authenticated' ? 'bg-gray-100' : ''
          } ${errors.email ? 'border-red-300' : ''}`}
          placeholder="you@example.com"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email}</p>
        )}
        {sessionStatus === 'authenticated' && (
          <p className="mt-1 text-sm text-gray-500">
            Email cannot be changed while logged in
          </p>
        )}
      </div>

      {/* Full Name */}
      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
          Full Name
        </label>
        <input
          type="text"
          id="fullName"
          name="fullName"
          required
          value={formData.fullName}
          onChange={handleInputChange}
          className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
            errors.fullName ? 'border-red-300' : 'border-gray-300'
          }`}
        />
        {renderError('fullName')}
      </div>

      {/* Street Address */}
      <div>
        <label htmlFor="streetAddress" className="block text-sm font-medium text-gray-700">
          Street Address
        </label>
        <input
          type="text"
          id="streetAddress"
          name="streetAddress"
          required
          value={formData.streetAddress}
          onChange={handleInputChange}
          className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
            errors.streetAddress ? 'border-red-300' : 'border-gray-300'
          }`}
        />
        {renderError('streetAddress')}
      </div>

      {/* Apartment/Suite */}
      <div>
        <label htmlFor="apartment" className="block text-sm font-medium text-gray-700">
          Apartment, suite, etc. (optional)
        </label>
        <input
          type="text"
          id="apartment"
          name="apartment"
          value={formData.apartment}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      {/* City and Country */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700">
            City
          </label>
          <input
            type="text"
            id="city"
            name="city"
            required
            value={formData.city}
            onChange={handleInputChange}
            className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
              errors.city ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {renderError('city')}
        </div>
        <div>
          <label htmlFor="country" className="block text-sm font-medium text-gray-700">
            Country
          </label>
          <select
            id="country"
            name="country"
            required
            value={formData.country}
            onChange={handleInputChange}
            className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
              errors.country ? 'border-red-300' : 'border-gray-300'
            }`}
          >
            <option value="">Select a country</option>
            <option value="US">United States</option>
            <option value="CA">Canada</option>
            <option value="UK">United Kingdom</option>
          </select>
          {renderError('country')}
        </div>
      </div>

      {/* State and Postal Code */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="state" className="block text-sm font-medium text-gray-700">
            State / Province
          </label>
          <input
            type="text"
            id="state"
            name="state"
            required
            value={formData.state}
            onChange={handleInputChange}
            className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
              errors.state ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {renderError('state')}
        </div>
        <div>
          <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">
            Postal Code
          </label>
          <input
            type="text"
            id="postalCode"
            name="postalCode"
            required
            value={formData.postalCode}
            onChange={handleInputChange}
            className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
              errors.postalCode ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {renderError('postalCode')}
        </div>
      </div>

      {/* Submit Button */}
      <div className="mt-6">
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            isLoading
              ? 'bg-blue-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Processing...
            </div>
          ) : (
            'Continue to Payment'
          )}
        </button>
      </div>
    </form>
  );
} 