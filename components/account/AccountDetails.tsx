"use client";
import { useState, useEffect, useRef } from "react";
import useSWR, { mutate } from "swr";
import { fetchUserProfile } from "@/lib/sanityUser";
import { FaUser, FaEnvelope, FaCheckCircle, FaTimesCircle, FaGoogle } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { signIn } from "next-auth/react";

export default function AccountDetails({ userEmail }: { userEmail: string }) {
  const { data, error, isLoading } = useSWR(
    userEmail ? ["profile", userEmail] : null,
    () => fetchUserProfile(userEmail)
  );

  const [name, setName] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (data?.name) setName(data.name);
    if (data?.image) setImage(data.image);
  }, [data?.name, data?.image]);

  if (isLoading) return <div>Loading profile...</div>;
  if (error) return <div className="text-red-500">Error loading profile.</div>;

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const response = await fetch('/api/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (!response.ok) throw new Error('Failed to update profile');
      await mutate(['profile', userEmail]);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('avatar', file);
    try {
      const res = await fetch('/api/upload-avatar', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Failed to upload image');
      const { imageUrl } = await res.json();
      setImage(imageUrl);
      await mutate(['profile', userEmail]);
      toast.success('Profile image updated!');
    } catch (err) {
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  // Linked accounts logic (assume data.linkedAccounts = ['email', 'google'] or similar)
  const linkedAccounts: string[] = data?.linkedAccounts || ['email'];
  const isGoogleLinked = linkedAccounts.includes('google');

  // Email verification status
  const isEmailVerified = !!data?.emailVerified;

  // Avatar fallback
  const initials = data?.name ? data.name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : (data?.email?.[0] || '').toUpperCase();

  return (
    <div className="max-w-lg mx-auto bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-8 mt-6 outline outline-1 outline-blue-50 focus-within:outline-blue-200">
      <div className="flex flex-col items-center mb-8">
        <div className="relative w-28 h-28 mb-3">
          {image ? (
            <img src={image} alt="Profile" className="w-28 h-28 rounded-full object-cover border-4 border-blue-100 shadow" />
          ) : (
            <div className="w-28 h-28 rounded-full bg-blue-100 flex items-center justify-center text-4xl font-bold text-blue-600 border-4 border-blue-100 shadow">{initials}</div>
          )}
          <button
            className="absolute bottom-2 right-2 bg-blue-600 text-white rounded-full p-2 shadow hover:bg-blue-700 transition"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            title="Change profile image"
          >
            <FaUser />
          </button>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleAvatarChange}
            disabled={uploading}
          />
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-lg font-semibold">{data?.name}</span>
          {isEmailVerified ? (
            <span className="flex items-center text-green-600 text-sm"><FaCheckCircle className="mr-1" /> Verified</span>
          ) : (
            <span className="flex items-center text-yellow-500 text-sm"><FaTimesCircle className="mr-1" /> Not Verified</span>
          )}
        </div>
        <span className="text-gray-500 text-sm">{data?.email}</span>
      </div>

      <form onSubmit={handleUpdateProfile} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
            <FaUser className="text-gray-400" /> Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
            <FaEnvelope className="text-gray-400" /> Email
          </label>
          <input
            type="email"
            value={data?.email}
            className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
            disabled
          />
        </div>
        <div className="flex gap-4 mt-4">
          <button
            type="submit"
            disabled={isUpdating}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
          >
            {isUpdating ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>

      {/* Linked Accounts Section */}
      <div className="mt-8 pt-8 border-t border-gray-200">
        <h3 className="text-lg font-bold mb-3 flex items-center gap-2"><FaUser className="text-blue-500" /> Linked Accounts</h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <FaEnvelope className="text-gray-400" />
            <span>Email</span>
            <span className="text-green-600 text-xs ml-1">Linked</span>
          </div>
          <div className="flex items-center gap-2">
            <FaGoogle className="text-red-500" />
            <span>Google</span>
            {isGoogleLinked ? (
              <span className="text-green-600 text-xs ml-1">Linked</span>
            ) : (
              <button
                className="ml-2 flex items-center gap-2 px-3 py-1 bg-white border border-gray-300 text-gray-700 rounded-lg shadow-sm hover:bg-blue-50 hover:border-blue-400 hover:text-blue-700 transition text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-200"
                onClick={() => signIn('google', { callbackUrl: '/account' })}
              >
                <FaGoogle className="w-4 h-4 text-red-500" />
                Link Google
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 