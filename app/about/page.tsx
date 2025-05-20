'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Link from 'next/link';

const fadeIn = {
  initial: { opacity: 0, y: 20, transition: { duration: 0.6 } },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const teamMembers = [
  {
    name: 'Sarah Johnson',
    role: 'Founder & CEO',
    image: '/team/sarah.jpg',
    bio: 'With over 15 years of experience in retail, Sarah founded our store with a vision to create a unique shopping experience.'
  },
  {
    name: 'Michael Chen',
    role: 'Head of Operations',
    image: '/team/michael.jpg',
    bio: 'Michael brings his expertise in supply chain management to ensure smooth operations and customer satisfaction.'
  },
  {
    name: 'Emma Rodriguez',
    role: 'Creative Director',
    image: '/team/emma.jpg',
    bio: 'Emma leads our creative team, curating the perfect blend of style and functionality in our product selection.'
  }
];

const values = [
  {
    title: 'Quality First',
    description: 'We never compromise on the quality of our products, ensuring every item meets our high standards.'
  },
  {
    title: 'Customer Focus',
    description: 'Your satisfaction is our priority. We go above and beyond to provide exceptional service.'
  },
  {
    title: 'Sustainability',
    description: 'We\'re committed to eco-friendly practices and sustainable sourcing in everything we do.'
  },
  {
    title: 'Innovation',
    description: 'Constantly evolving and adapting to bring you the latest trends and technologies.'
  }
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* Hero Section */}
      <section className="relative h-[60vh] bg-gradient-to-r from-[#42A5F5] to-[#1e88e5] text-white">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative container mx-auto px-4 h-full flex items-center">
          <motion.div 
            className="max-w-2xl"
            initial="initial"
            animate="animate"
            variants={fadeIn}
          >
            <h1 className="text-5xl font-bold mb-6">Our Story</h1>
            <p className="text-xl leading-relaxed text-white/90">
              Founded in 2020, we've grown from a small local store to a beloved destination for quality products and exceptional service. Our mission is to bring joy and convenience to our customers through carefully curated products and a seamless shopping experience.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.h2 
            className="text-4xl font-bold text-center mb-4 text-[#333333]"
            initial="initial"
            animate="animate"
            variants={fadeIn}
          >
            Our Values
          </motion.h2>
          <motion.p 
            className="text-center text-[#6c757d] text-lg mb-16 max-w-2xl mx-auto"
            initial="initial"
            animate="animate"
            variants={fadeIn}
          >
            These core principles guide everything we do, from product selection to customer service
          </motion.p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300"
                initial="initial"
                animate="animate"
                variants={fadeIn}
                transition={{ delay: index * 0.2 }}
              >
                <h3 className="text-xl font-semibold mb-4 text-[#42A5F5]">{value.title}</h3>
                <p className="text-[#6c757d] leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-[#F8F9FA]">
        <div className="container mx-auto px-4">
          <motion.h2 
            className="text-4xl font-bold text-center mb-4 text-[#333333]"
            initial="initial"
            animate="animate"
            variants={fadeIn}
          >
            Meet Our Team
          </motion.h2>
          <motion.p 
            className="text-center text-[#6c757d] text-lg mb-16 max-w-2xl mx-auto"
            initial="initial"
            animate="animate"
            variants={fadeIn}
          >
            The passionate individuals behind our success
          </motion.p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {teamMembers.map((member, index) => (
              <motion.div
                key={member.name}
                className="text-center bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300"
                initial="initial"
                animate="animate"
                variants={fadeIn}
                transition={{ delay: index * 0.2 }}
              >
                <div className="relative w-48 h-48 mx-auto mb-6 rounded-full overflow-hidden border-4 border-[#42A5F5]/10">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <h3 className="text-2xl font-semibold mb-2 text-[#333333]">{member.name}</h3>
                <p className="text-[#42A5F5] font-medium mb-4">{member.role}</p>
                <p className="text-[#6c757d] leading-relaxed">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-20 bg-gradient-to-r from-[#42A5F5] to-[#1e88e5] text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial="initial"
            animate="animate"
            variants={fadeIn}
            className="max-w-2xl mx-auto"
          >
            <h2 className="text-4xl font-bold mb-6">Get in Touch</h2>
            <p className="text-xl mb-8 text-white/90">
              Have questions or want to learn more about us? We'd love to hear from you!
            </p>
            <Link 
              href="/contact"
              className="inline-block bg-white text-[#42A5F5] px-8 py-4 rounded-lg font-semibold hover:bg-[#F8F9FA] transition-colors shadow-lg hover:shadow-xl"
            >
              Contact Us
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
} 