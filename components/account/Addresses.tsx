"use client";
import { useState, useEffect } from "react";
import useSWR, { mutate } from "swr";
import { fetchUserAddresses } from "@/lib/sanityUser";
import { FaMapMarkerAlt, FaPlus, FaRegEdit, FaRegTrashAlt } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

interface Address {
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  addedAt?: string;
  source?: 'order' | 'manual';
}

export default function Addresses({ userEmail }: { userEmail: string }) {
  const { data: addresses, error, isLoading, mutate } = useSWR(
    userEmail ? ["addresses", userEmail] : null,
    () => fetchUserAddresses(userEmail)
  );

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Address>({
    name: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'US'
  });

  useEffect(() => {
    if (addresses && addresses.length > 0 && !editingAddress) {
      setFormData(addresses[0]);
    }
  }, [addresses, editingAddress]);

  if (isLoading) return <div>Loading addresses...</div>;
  if (error) return <div className="text-red-500">Error loading addresses.</div>;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/save-address', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: formData }),
      });

      if (!response.ok) {
        throw new Error('Failed to save address');
      }

      await mutate();
      toast.success('Address saved successfully');
      setShowAddModal(false);
      setEditingAddress(null);
      setFormData({
        name: '',
        line1: '',
        line2: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'US'
      });
    } catch (error) {
      toast.error('Failed to save address');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (index: number) => {
    if (!confirm('Are you sure you want to delete this address?')) return;

    try {
      const response = await fetch('/api/delete-address', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ index }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete address');
      }

      await mutate();
      toast.success('Address deleted successfully');
    } catch (error) {
      toast.error('Failed to delete address');
    }
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setFormData(address);
    setShowAddModal(true);
  };

  const AddressForm = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <h3 className="text-xl font-bold mb-4">
          {editingAddress ? 'Edit Address' : 'Add New Address'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address Line 1
            </label>
            <input
              type="text"
              value={formData.line1}
              onChange={(e) => setFormData({ ...formData, line1: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address Line 2 (Optional)
            </label>
            <input
              type="text"
              value={formData.line2}
              onChange={(e) => setFormData({ ...formData, line2: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State
              </label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ZIP Code
            </label>
            <input
              type="text"
              value={formData.postalCode}
              onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>
          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={() => {
                setShowAddModal(false);
                setEditingAddress(null);
                setFormData({
                  name: '',
                  line1: '',
                  line2: '',
                  city: '',
                  state: '',
                  postalCode: '',
                  country: 'US'
                });
              }}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : (editingAddress ? 'Save Changes' : 'Add Address')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <FaMapMarkerAlt className="text-blue-500" /> Saved Addresses
      </h2>
      
      <button
        onClick={() => setShowAddModal(true)}
        className="mb-6 flex items-center gap-2 px-4 py-2 border border-blue-500 text-blue-500 rounded hover:bg-blue-50 transition"
      >
        <FaPlus /> Add New Address
      </button>

      {(!addresses || addresses.length === 0) ? (
        <div className="text-gray-500">No addresses found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {addresses?.map((address: Address, idx: number) => (
            <div
              key={idx}
              className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-6 flex flex-col gap-2 relative group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-lg text-gray-900">{address.name}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(address)}
                    className="p-1 rounded-full hover:bg-blue-50 transition-colors text-blue-600 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    title="Edit address"
                  >
                    <FaRegEdit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(idx)}
                    className="p-1 rounded-full hover:bg-red-50 transition-colors text-red-500 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-200"
                    title="Delete address"
                  >
                    <FaRegTrashAlt className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="text-gray-700 text-sm whitespace-pre-line">
                {address.line1}
                {address.line2 && <><br />{address.line2}</>}
                <br />{address.city}, {address.state} {address.postalCode}
                <br />{address.country}
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddModal && <AddressForm />}
    </div>
  );
} 