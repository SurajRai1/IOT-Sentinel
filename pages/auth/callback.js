import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabaseClient';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const checkUserAndProfile = async () => {
      // Check if we have a session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // Check if user has a profile
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (error || !profile) {
          // No profile exists, redirect to profile creation
          router.push('/auth/create-profile');
        } else {
          // Profile exists, redirect to dashboard
          router.push('/dashboard');
        }
      } else {
        router.push('/auth/login');
      }
    };

    checkUserAndProfile();
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0B14] text-white flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[#3B82F6] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-400">Redirecting...</p>
      </div>
    </div>
  );
} 