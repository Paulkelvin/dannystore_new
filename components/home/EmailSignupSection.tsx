import { ShieldCheck, Lightbulb } from 'lucide-react';

export default function EmailSignupSection() {
  return (
    <section className="relative isolate overflow-hidden bg-[#42A5F5] py-24 px-4 sm:px-8 mb-16">
      <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left: Main Text Content */}
        <div>
          <h2 className="text-5xl font-extrabold text-white mb-6 drop-shadow-sm">Join the Playtime Club!</h2>
          <p className="text-lg font-medium text-white/90 mb-10 max-w-xl leading-relaxed">
            Sign up for playful inspiration, exclusive discounts, and early access to our newest toys. Be the first to know about special sales, creative play ideas, and fun family activities—delivered right to your inbox!
          </p>
          <form className="flex flex-col sm:flex-row gap-4 max-w-md">
            <input
              type="email"
              required
              placeholder="Enter your email"
              autoComplete="email"
              className="flex-1 rounded-md bg-white border border-[#DEE2E6] px-5 py-3.5 text-base text-[#333333] placeholder-[#6c757d] focus:border-[#FFC300] focus:outline-none focus:ring-2 focus:ring-[#FFC300] transition-colors"
            />
            <button
              type="submit"
              className="rounded-md bg-[#FFC300] px-6 py-3.5 text-base font-bold text-[#333333] shadow hover:bg-[#F0B300] focus:bg-[#F0B300] focus:outline-none focus:ring-2 focus:ring-[#FFC300] focus:ring-offset-2 transition-all"
            >
              Subscribe
            </button>
          </form>
        </div>
        {/* Right: Benefit Columns */}
        <dl className="grid grid-cols-1 gap-y-12 sm:grid-cols-2 lg:pt-2">
          <div className="flex flex-col items-start">
            <div className="rounded-md bg-[#FFC300] p-3.5 mb-5 flex items-center justify-center">
              <Lightbulb className="h-8 w-8 text-white" />
            </div>
            <dt className="text-xl font-semibold text-white mb-3">Weekly Play Ideas</dt>
            <dd className="text-white/90 text-base leading-relaxed">
              Get creative play tips, activity guides, and inspiration for fun family moments—sent every week!
            </dd>
          </div>
          <div className="flex flex-col items-start">
            <div className="rounded-md bg-[#FFC300] p-3.5 mb-5 flex items-center justify-center">
              <ShieldCheck className="h-8 w-8 text-white" />
            </div>
            <dt className="text-xl font-semibold text-white mb-3">No Spam, Ever</dt>
            <dd className="text-white/90 text-base leading-relaxed">
              We respect your inbox. Only the best deals, new arrivals, and play inspiration—no junk, just joy!
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
} 