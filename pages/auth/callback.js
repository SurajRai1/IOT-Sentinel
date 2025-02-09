import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabaseClient';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const checkUserAndProfile = async () => {
      try {
        // Check if we have a session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;
        
        if (!session) {
          console.log('No session found, redirecting to login');
          router.push('/auth/login');
          return;
        }

        // Check if user has a profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          throw profileError;
        }

        if (!profile) {
          console.log('No profile found, redirecting to profile creation');
          router.push('/auth/create-profile');
        } else {
          console.log('Profile found, redirecting to dashboard');
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('Error in auth callback:', error);
        router.push('/auth/login');
      }
    };

    // Add a small delay to ensure Supabase has time to process the authentication
    const timer = setTimeout(() => {
      checkUserAndProfile();
    }, 1000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0A0B14] text-white flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[#3B82F6] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-400">Setting up your account...</p>
      </div>
    </div>
  );
} 