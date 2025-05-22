'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react';
import { toast } from 'react-hot-toast';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 }
};

const contactInfo = [
  {
    icon: <Phone className="h-6 w-6" />,
    title: 'Phone',
    details: ['+1 (555) 123-4567', '+1 (555) 987-6543'],
    link: 'tel:+15551234567'
  },
  {
    icon: <Mail className="h-6 w-6" />,
    title: 'Email',
    details: ['support@dannystore.com', 'sales@dannystore.com'],
    link: 'mailto:support@dannystore.com'
  },
  {
    icon: <MapPin className="h-6 w-6" />,
    title: 'Location',
    details: ['123 Shopping Street', 'New York, NY 10001', 'United States'],
    link: 'https://maps.google.com/?q=123+Shopping+Street+New+York+NY+10001'
  },
  {
    icon: <Clock className="h-6 w-6" />,
    title: 'Business Hours',
    details: ['Monday - Friday: 9:00 AM - 8:00 PM', 'Saturday: 10:00 AM - 6:00 PM', 'Sunday: 11:00 AM - 5:00 PM'],
    link: null
  }
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success('Message sent successfully!');
    setFormData({ name: '', email: '', subject: '', message: '' });
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* Hero Section */}
      <section className="relative py-28 md:py-36 bg-[#42A5F5] text-white shadow-lg rounded-b-3xl">
        <div className="absolute inset-0 bg-black/10 rounded-b-3xl" />
        <div className="relative container mx-auto px-4">
          <motion.div
            initial="initial"
            animate="animate"
            variants={fadeIn}
            transition={{ duration: 0.6 }}
            className="max-w-2xl mx-auto text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-8 mt-4 drop-shadow-lg">Get in Touch</h1>
            <p className="text-xl text-white/90 mb-2 md:mb-4">
              We're here to help and answer any questions you might have. We look forward to hearing from you.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-16 -mt-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {contactInfo.map((info, index) => (
              <motion.div
                key={info.title}
                initial="initial"
                animate="animate"
                variants={fadeIn}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300"
              >
                <div className="text-[#42A5F5] mb-4">{info.icon}</div>
                <h3 className="text-lg font-semibold mb-3 text-[#333333]">{info.title}</h3>
                {info.details.map((detail, i) => (
                  <p key={i} className="text-[#6c757d] mb-1">
                    {info.link && i === 0 ? (
                      <a href={info.link} className="hover:text-[#42A5F5] transition-colors">
                        {detail}
                      </a>
                    ) : (
                      detail
                    )}
                  </p>
                ))}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form and Map Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div
              initial="initial"
              animate="animate"
              variants={fadeIn}
              transition={{ duration: 0.6 }}
              className="bg-white p-8 rounded-xl shadow-lg border border-gray-100"
            >
              <h2 className="text-2xl font-bold mb-6 text-[#333333]">Send Us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-[#6c757d] mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#42A5F5] focus:ring-2 focus:ring-[#42A5F5]/20 transition-all"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-[#6c757d] mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#42A5F5] focus:ring-2 focus:ring-[#42A5F5]/20 transition-all"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-[#6c757d] mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#42A5F5] focus:ring-2 focus:ring-[#42A5F5]/20 transition-all"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-[#6c757d] mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={5}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#42A5F5] focus:ring-2 focus:ring-[#42A5F5]/20 transition-all resize-none"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#42A5F5] text-white py-4 rounded-lg font-semibold hover:bg-[#1e88e5] transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  <Send className="h-5 w-5" />
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </motion.div>

            {/* Map Section */}
            <motion.div
              initial="initial"
              animate="animate"
              variants={fadeIn}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                <h2 className="text-2xl font-bold mb-6 text-[#333333]">Visit Our Store</h2>
                <div className="aspect-[4/3] rounded-lg overflow-hidden">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.9663095343008!2d-74.00425878428698!3d40.74076994379132!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c259bf5c1654f3%3A0xc80f9cfce5383d5d!2sGoogle!5e0!3m2!1sen!2sus!4v1586000412513!5m2!1sen!2sus"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Our Store Location"
                    className="rounded-lg"
                  />
                </div>
                <div className="mt-6 space-y-2">
                  <p className="text-[#6c757d]">
                    <strong className="text-[#333333]">Address:</strong> 123 Shopping Street, New York, NY 10001
                  </p>
                  <p className="text-[#6c757d]">
                    <strong className="text-[#333333]">Parking:</strong> Available in the building's parking garage
                  </p>
                  <p className="text-[#6c757d]">
                    <strong className="text-[#333333]">Public Transport:</strong> 5-minute walk from Times Square Station
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
} 