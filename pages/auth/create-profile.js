import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabaseClient';

export default function CreateProfile() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    displayName: '',
    phoneNumber: '',
    organization: '',
    role: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/auth/login');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('No user found');

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email,
          first_name: profile.firstName,
          last_name: profile.lastName,
          display_name: profile.displayName || `${profile.firstName} ${profile.lastName}`,
          phone_number: profile.phoneNumber,
          organization: profile.organization,
          role: profile.role,
          timezone: profile.timezone,
          updated_at: new Date()
        });

      if (error) throw error;

      router.push('/dashboard');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-[#0A0B14] text-white flex flex-col justify-center">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-[#1E293B]/30 via-transparent to-[#0F172A]/30"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#3B82F6]/20 rounded-full blur-[128px] -z-10"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#10B981]/20 rounded-full blur-[128px] -z-10"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#3B82F6] to-[#10B981] rounded-xl flex items-center justify-center shadow-lg shadow-[#3B82F6]/25">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
            <h1 className="text-2xl font-bold mb-2">Complete Your Profile</h1>
            <p className="text-slate-400">Tell us a bit about yourself to get started</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 mb-6 text-red-500 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-[#1E293B]/50 backdrop-blur-xl rounded-2xl p-8 shadow-xl border border-[#3B82F6]/10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-slate-300 mb-2">
                  First Name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  value={profile.firstName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#0A0B14] border border-[#3B82F6]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 focus:border-transparent transition-all duration-200"
                  placeholder="John"
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-slate-300 mb-2">
                  Last Name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  value={profile.lastName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#0A0B14] border border-[#3B82F6]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 focus:border-transparent transition-all duration-200"
                  placeholder="Doe"
                />
              </div>

              <div>
                <label htmlFor="displayName" className="block text-sm font-medium text-slate-300 mb-2">
                  Display Name (optional)
                </label>
                <input
                  id="displayName"
                  name="displayName"
                  type="text"
                  value={profile.displayName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#0A0B14] border border-[#3B82F6]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 focus:border-transparent transition-all duration-200"
                  placeholder="johndoe"
                />
              </div>

              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-slate-300 mb-2">
                  Phone Number
                </label>
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  value={profile.phoneNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#0A0B14] border border-[#3B82F6]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 focus:border-transparent transition-all duration-200"
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              <div>
                <label htmlFor="organization" className="block text-sm font-medium text-slate-300 mb-2">
                  Organization (optional)
                </label>
                <input
                  id="organization"
                  name="organization"
                  type="text"
                  value={profile.organization}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#0A0B14] border border-[#3B82F6]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 focus:border-transparent transition-all duration-200"
                  placeholder="Company Name"
                />
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-slate-300 mb-2">
                  Role (optional)
                </label>
                <input
                  id="role"
                  name="role"
                  type="text"
                  value={profile.role}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#0A0B14] border border-[#3B82F6]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 focus:border-transparent transition-all duration-200"
                  placeholder="Network Administrator"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-8 bg-gradient-to-r from-[#3B82F6] to-[#10B981] hover:from-[#2563EB] hover:to-[#059669] py-3 rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:shadow-[#3B82F6]/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Profile...' : 'Complete Profile'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 