import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/router';

export default function ProfileTab() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('No user found');

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setUpdating(true);
      setError(null);

      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: profile.first_name,
          last_name: profile.last_name,
          display_name: profile.display_name,
          phone_number: profile.phone_number,
          organization: profile.organization,
          role: profile.role,
          updated_at: new Date()
        })
        .eq('id', profile.id);

      if (error) throw error;

      setError({ isSuccess: true, message: 'Profile updated successfully!' });
    } catch (error) {
      setError({ isSuccess: false, message: error.message });
    } finally {
      setUpdating(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Redirect to homepage after successful sign out
      router.push('/');
    } catch (error) {
      setError({
        isSuccess: false,
        message: 'Error signing out: ' + error.message
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-[#3B82F6] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-[#1E293B] to-[#0F172A] rounded-xl p-6 shadow-xl border border-slate-800">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gradient-to-br from-[#3B82F6] to-[#10B981] rounded-xl flex items-center justify-center text-2xl font-bold text-white">
            {profile?.first_name?.[0]}{profile?.last_name?.[0]}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">
              {profile?.first_name} {profile?.last_name}
            </h1>
            <p className="text-slate-400">{profile?.email}</p>
          </div>
        </div>
      </div>

      {/* Profile Settings Form */}
      <div className="bg-gradient-to-r from-[#1E293B] to-[#0F172A] rounded-xl shadow-xl border border-slate-800">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-xl font-bold text-white">Profile Settings</h2>
          <p className="mt-1 text-sm text-slate-400">Update your personal information</p>
        </div>

        {error && (
          <div className={`mx-6 mt-6 ${
            error.isSuccess ? 'bg-green-500/10 border-green-500/50 text-green-500' : 'bg-red-500/10 border-red-500/50 text-red-500'
          } rounded-lg p-4 text-sm border`}>
            {error.message}
          </div>
        )}

        <form onSubmit={handleUpdate} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="first_name" className="block text-sm font-medium text-slate-300 mb-2">
                First Name
              </label>
              <input
                id="first_name"
                name="first_name"
                type="text"
                required
                value={profile?.first_name || ''}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#0A0B14] border border-[#3B82F6]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 focus:border-transparent transition-all duration-200 text-white placeholder-slate-500"
                placeholder="Enter your first name"
              />
            </div>

            <div>
              <label htmlFor="last_name" className="block text-sm font-medium text-slate-300 mb-2">
                Last Name
              </label>
              <input
                id="last_name"
                name="last_name"
                type="text"
                required
                value={profile?.last_name || ''}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#0A0B14] border border-[#3B82F6]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 focus:border-transparent transition-all duration-200 text-white placeholder-slate-500"
                placeholder="Enter your last name"
              />
            </div>

            <div>
              <label htmlFor="display_name" className="block text-sm font-medium text-slate-300 mb-2">
                Display Name
              </label>
              <input
                id="display_name"
                name="display_name"
                type="text"
                value={profile?.display_name || ''}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#0A0B14] border border-[#3B82F6]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 focus:border-transparent transition-all duration-200 text-white placeholder-slate-500"
                placeholder="Choose a display name"
              />
            </div>

            <div>
              <label htmlFor="phone_number" className="block text-sm font-medium text-slate-300 mb-2">
                Phone Number
              </label>
              <input
                id="phone_number"
                name="phone_number"
                type="tel"
                value={profile?.phone_number || ''}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#0A0B14] border border-[#3B82F6]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 focus:border-transparent transition-all duration-200 text-white placeholder-slate-500"
                placeholder="+1 (555) 000-0000"
              />
            </div>

            <div>
              <label htmlFor="organization" className="block text-sm font-medium text-slate-300 mb-2">
                Organization
              </label>
              <input
                id="organization"
                name="organization"
                type="text"
                value={profile?.organization || ''}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#0A0B14] border border-[#3B82F6]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 focus:border-transparent transition-all duration-200 text-white placeholder-slate-500"
                placeholder="Enter your organization"
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-slate-300 mb-2">
                Role
              </label>
              <input
                id="role"
                name="role"
                type="text"
                value={profile?.role || ''}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#0A0B14] border border-[#3B82F6]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 focus:border-transparent transition-all duration-200 text-white placeholder-slate-500"
                placeholder="Enter your role"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={updating}
              className="bg-gradient-to-r from-[#3B82F6] to-[#10B981] hover:from-[#2563EB] hover:to-[#059669] px-6 py-2 rounded-lg text-sm font-medium text-white transition-all duration-300 hover:shadow-lg hover:shadow-[#3B82F6]/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {updating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Update Profile</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Account Settings */}
      <div className="bg-gradient-to-r from-[#1E293B] to-[#0F172A] rounded-xl shadow-xl border border-slate-800">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-xl font-bold text-white">Account Settings</h2>
          <p className="mt-1 text-sm text-slate-400">Manage your account preferences</p>
        </div>
        <div className="p-6">
          <button
            onClick={handleSignOut}
            className="bg-red-500/10 hover:bg-red-500/20 text-red-500 px-6 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
} 