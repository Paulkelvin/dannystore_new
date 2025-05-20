"use client";
import { useState, useEffect } from "react";
import OrderHistory from "./OrderHistory";
import Addresses from "./Addresses";
import AccountDetails from "./AccountDetails";

const NAV = [
  { key: "orders", label: "Order History" },
  { key: "addresses", label: "Addresses" },
  { key: "account", label: "Account Details" },
];

export default function DashboardLayout({ userEmail }: { userEmail: string }) {
  const [section, setSection] = useState("orders");
  const [displayedSection, setDisplayedSection] = useState(section);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    if (section !== displayedSection) {
      setFade(true);
      const timeout = setTimeout(() => {
        setDisplayedSection(section);
        setFade(false);
      }, 200); // match transition duration
      return () => clearTimeout(timeout);
    }
  }, [section, displayedSection]);

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <header className="bg-[#42A5F5] py-6 px-4">
        <h1 className="text-2xl font-bold text-white">My Account</h1>
      </header>
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row mt-8 bg-white rounded-lg shadow">
        <nav className="md:w-1/4 border-b md:border-b-0 md:border-r border-[#E5E7EB]">
          <ul className="flex md:flex-col">
            {NAV.map((item) => (
              <li key={item.key}>
                <button
                  className={`w-full text-left px-6 py-4 font-medium ${
                    section === item.key
                      ? "text-[#42A5F5] border-b-2 md:border-b-0 md:border-l-4 border-[#42A5F5] bg-[#F8F9FA]"
                      : "text-[#333333] hover:bg-[#F8F9FA]"
                  }`}
                  onClick={() => setSection(item.key)}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <main className="flex-1 p-6">
          <div className={`transition-all duration-300 ease-in-out ${fade ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}>
            {displayedSection === "orders" && <OrderHistory userEmail={userEmail} />}
            {displayedSection === "addresses" && <Addresses userEmail={userEmail} />}
            {displayedSection === "account" && <AccountDetails userEmail={userEmail} />}
          </div>
        </main>
      </div>
    </div>
  );
} 