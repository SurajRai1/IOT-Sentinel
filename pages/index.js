import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0B14] text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-[#1E293B]/30 via-transparent to-[#0F172A]/30"></div>
        {/* Animated Circles */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#3B82F6]/10 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#10B981]/10 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
      </div>

      {/* Sticky Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-[#0A0B14]/80 backdrop-blur-lg border-b border-[#1E293B]' : 'bg-transparent'
      }`}>
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#3B82F6] to-[#10B981] rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-[#3B82F6] to-[#10B981] text-transparent bg-clip-text">IoT Sentinel</span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-8">
              <Link href="#features" className="text-slate-300 hover:text-white transition-colors">Features</Link>
              <Link href="#security" className="text-slate-300 hover:text-white transition-colors">Security</Link>
              <Link href="#pricing" className="text-slate-300 hover:text-white transition-colors">Pricing</Link>
            </div>
            
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/auth/login" className="text-slate-300 hover:text-white transition-colors">Login</Link>
              <Link 
                href="/auth/signup"
                className="bg-gradient-to-r from-[#3B82F6] to-[#10B981] hover:from-[#2563EB] hover:to-[#059669] px-6 py-2 rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:shadow-[#3B82F6]/25"
              >
                Get Started
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-slate-800/50 transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <svg
                className="w-6 h-6 text-slate-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Menu */}
          <div className={`md:hidden transition-all duration-300 ${isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
            <div className="pt-4 pb-3 space-y-3">
              <Link href="#features" className="block px-3 py-2 text-slate-300 hover:text-white transition-colors">Features</Link>
              <Link href="#security" className="block px-3 py-2 text-slate-300 hover:text-white transition-colors">Security</Link>
              <Link href="#pricing" className="block px-3 py-2 text-slate-300 hover:text-white transition-colors">Pricing</Link>
              <Link href="/auth/login" className="block px-3 py-2 text-slate-300 hover:text-white transition-colors">Login</Link>
              <Link 
                href="/auth/signup"
                className="block px-3 py-2 bg-gradient-to-r from-[#3B82F6] to-[#10B981] hover:from-[#2563EB] hover:to-[#059669] rounded-lg font-medium text-center transition-all duration-300"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-20 md:pt-28 md:pb-32">
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-block mb-4 px-4 py-1 bg-gradient-to-r from-[#3B82F6]/10 to-[#10B981]/10 rounded-full border border-[#3B82F6]/20">
              <span className="text-sm font-medium bg-gradient-to-r from-[#3B82F6] to-[#10B981] text-transparent bg-clip-text">
                Advanced IoT Security Platform
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
              Secure Your Smart Home
              <span className="block mt-2 bg-gradient-to-r from-[#3B82F6] to-[#10B981] text-transparent bg-clip-text">
                With Real-Time Protection
              </span>
            </h1>
            <p className="text-xl text-slate-300 mb-12 max-w-3xl mx-auto">
              Monitor and secure your IoT devices with our advanced AI-powered platform. 
              Get instant alerts, vulnerability detection, and automated protection for your entire smart home ecosystem.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link 
                href="/auth/signup"
                className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-medium bg-gradient-to-r from-[#3B82F6] to-[#10B981] hover:from-[#2563EB] hover:to-[#059669] rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-[#3B82F6]/25"
              >
                Start Protecting Now
                <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="#demo"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium border border-[#3B82F6]/30 rounded-xl hover:bg-[#3B82F6]/10 transition-all duration-300 hover:scale-105"
              >
                Watch Demo
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
              <div className="p-6 rounded-2xl bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-[#3B82F6]/10 hover:border-[#10B981]/30 transition-all duration-300">
                <div className="text-3xl font-bold bg-gradient-to-r from-[#3B82F6] to-[#10B981] text-transparent bg-clip-text mb-2">
                  10k+
                </div>
                <div className="text-slate-300">Protected Networks</div>
              </div>
              <div className="p-6 rounded-2xl bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-[#3B82F6]/10 hover:border-[#10B981]/30 transition-all duration-300">
                <div className="text-3xl font-bold bg-gradient-to-r from-[#3B82F6] to-[#10B981] text-transparent bg-clip-text mb-2">
                  50k+
                </div>
                <div className="text-slate-300">Devices Monitored</div>
              </div>
              <div className="p-6 rounded-2xl bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-[#3B82F6]/10 hover:border-[#10B981]/30 transition-all duration-300">
                <div className="text-3xl font-bold bg-gradient-to-r from-[#3B82F6] to-[#10B981] text-transparent bg-clip-text mb-2">
                  99.9%
                </div>
                <div className="text-slate-300">Uptime</div>
              </div>
              <div className="p-6 rounded-2xl bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-[#3B82F6]/10 hover:border-[#10B981]/30 transition-all duration-300">
                <div className="text-3xl font-bold bg-gradient-to-r from-[#3B82F6] to-[#10B981] text-transparent bg-clip-text mb-2">
                  24/7
                </div>
                <div className="text-slate-300">Threat Monitoring</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 relative">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
              Enterprise-Grade Security for Your Smart Home
            </h2>
            <p className="text-gray-400 text-lg">
              Comprehensive protection features designed for the modern IoT ecosystem
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature Cards */}
            <div className="group p-8 rounded-2xl bg-gradient-to-br from-blue-500/5 to-purple-500/5 border border-blue-500/10 hover:border-purple-500/30 transition-all duration-300">
              <div className="w-14 h-14 mb-6 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 p-0.5">
                <div className="w-full h-full rounded-xl bg-[#0A0F1E] flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">
                Real-time Monitoring
              </h3>
              <p className="text-gray-400 mb-6">
                24/7 surveillance with instant alerts for suspicious activities and unauthorized access attempts.
              </p>
              <ul className="space-y-3 text-gray-400">
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-blue-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Instant Threat Detection
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-blue-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Behavioral Analysis
                </li>
              </ul>
            </div>

            <div className="group p-8 rounded-2xl bg-gradient-to-br from-blue-500/5 to-purple-500/5 border border-blue-500/10 hover:border-purple-500/30 transition-all duration-300">
              <div className="w-14 h-14 mb-6 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 p-0.5">
                <div className="w-full h-full rounded-xl bg-[#0A0F1E] flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">
                AI-Powered Protection
              </h3>
              <p className="text-gray-400 mb-6">
                Advanced machine learning algorithms that adapt to new threats and vulnerabilities.
              </p>
              <ul className="space-y-3 text-gray-400">
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-purple-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Predictive Analysis
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-purple-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Automated Response
                </li>
              </ul>
            </div>

            <div className="group p-8 rounded-2xl bg-gradient-to-br from-blue-500/5 to-purple-500/5 border border-blue-500/10 hover:border-purple-500/30 transition-all duration-300">
              <div className="w-14 h-14 mb-6 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 p-0.5">
                <div className="w-full h-full rounded-xl bg-[#0A0F1E] flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">
                Unified Dashboard
              </h3>
              <p className="text-gray-400 mb-6">
                Complete visibility and control over all your IoT devices from a single interface.
              </p>
              <ul className="space-y-3 text-gray-400">
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-blue-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Device Management
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-blue-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Remote Access
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-8 bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
              Start Protecting Your Smart Home Today
            </h2>
            <p className="text-xl text-gray-400 mb-10">
              Join thousands of smart home owners who trust IoT Sentinel for their security needs.
            </p>
            <Link
              href="/auth/signup"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium bg-gradient-to-r from-[#6D28D9] to-[#7C3AED] hover:from-[#5B21B6] hover:to-[#6D28D9] rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-[#7C3AED]/25"
            >
              Get Started Now
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800">
        <div className="container mx-auto px-6 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
                  IoT Sentinel
                </span>
              </div>
              <p className="text-gray-400">
                Securing the future of smart homes with advanced IoT protection.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="#security" className="hover:text-white transition-colors">Security</Link></li>
                <li><Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#about" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="#blog" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="#careers" className="hover:text-white transition-colors">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#privacy" className="hover:text-white transition-colors">Privacy</Link></li>
                <li><Link href="#terms" className="hover:text-white transition-colors">Terms</Link></li>
                <li><Link href="#security" className="hover:text-white transition-colors">Security</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>© 2024 IoT Sentinel. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 