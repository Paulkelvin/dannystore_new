'use client';

import { useState } from 'react';
import { Truck, CreditCard, Shield, Headphones } from 'lucide-react';
import Link from 'next/link';

interface Pillar {
  icon: React.ReactNode;
  title: string;
  description: string;
  linkUrl?: string;
}

const pillars: Pillar[] = [
  {
    icon: <Truck className="h-8 w-8" />,
    title: "Speedy Delivery",
    description: "Get your order quickly with our reliable delivery service.",
    linkUrl: "/shipping-policy"
  },
  {
    icon: <CreditCard className="h-8 w-8" />,
    title: "Pay Your Way, Securely",
    description: "Secure online payment & Pay on Delivery options.",
    linkUrl: "/payment-options"
  },
  {
    icon: <Shield className="h-8 w-8" />,
    title: "Premium Quality",
    description: "Top-notch quality, supporting local artisans.",
    linkUrl: "/quality-commitment"
  },
  {
    icon: <Headphones className="h-8 w-8" />,
    title: "Easy Returns & Support",
    description: "Hassle-free returns and friendly customer service.",
    linkUrl: "/returns-policy"
  }
];

export default function BrandPillarsSection() {
  const [hoveredPillar, setHoveredPillar] = useState<number | null>(null);

  return (
    <section className="py-24 bg-[#F8F9FA]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-[#333333] sm:text-4xl">
            Why Choose Us?
          </h2>
        </div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map((pillar, index) => (
            <div
              key={index}
              className="relative group"
              onMouseEnter={() => setHoveredPillar(index)}
              onMouseLeave={() => setHoveredPillar(null)}
            >
              <div className={`
                h-full p-8 bg-white rounded-xl border border-[#DEE2E6]
                transition-all duration-300 ease-in-out
                ${hoveredPillar === index ? 'transform -translate-y-2 shadow-lg' : ''}
              `}>
                {/* Icon */}
                <div className={`
                  w-16 h-16 rounded-full flex items-center justify-center mb-4
                  transition-colors duration-300
                  ${hoveredPillar === index ? 'bg-[#42A5F5]/20' : 'bg-[#42A5F5]/12'}
                `}>
                  <div className={`
                    transition-colors duration-300
                    text-[#42A5F5]
                  `}>
                    {pillar.icon}
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-[#333333] mb-2">
                  {pillar.title}
                </h3>

                {/* Description */}
                <p className="text-[#6c757d] leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 