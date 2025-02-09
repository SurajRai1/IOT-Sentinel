import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Image from 'next/image';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            email_confirm: true,
          }
        },
      });

      if (error) throw error;

      // Show success message
      setError({
        isSuccess: true,
        message: "Account created successfully! You can now sign in."
      });
      
      // Redirect to login after a short delay
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
      
    } catch (error) {
      setError({
        isSuccess: false,
        message: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        }
      });

      if (error) throw error;
      
      // The redirect will be handled by the callback page
      // which will check for profile existence
      
    } catch (error) {
      setError({
        isSuccess: false,
        message: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0B14] text-white flex flex-col justify-center">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-[#1E293B]/30 via-transparent to-[#0F172A]/30"></div>
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#3B82F6]/20 rounded-full blur-[128px] -z-10"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#10B981]/20 rounded-full blur-[128px] -z-10"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-md mx-auto">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-12 h-12 bg-gradient-to-br from-[#3B82F6] to-[#10B981] rounded-xl flex items-center justify-center shadow-lg shadow-[#3B82F6]/25 transition-transform duration-300 group-hover:scale-105">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-[#3B82F6] to-[#10B981] text-transparent bg-clip-text">
                IoT Sentinel
              </span>
            </Link>
          </div>

          {/* Sign Up Form */}
          <div className="bg-[#1E293B]/50 backdrop-blur-xl rounded-2xl p-8 shadow-xl border border-[#3B82F6]/10">
            <h2 className="text-2xl font-bold text-center mb-2">Create Account</h2>
            <p className="text-slate-400 text-center mb-8">Join IoT Sentinel to secure your smart home</p>
            
            {error && (
              <div className={`${
                error.isSuccess ? 'bg-green-500/10 border-green-500/50 text-green-500' : 'bg-red-500/10 border-red-500/50 text-red-500'
              } rounded-lg p-4 mb-6 text-sm border`}>
                {error.message}
              </div>
            )}

            {/* Google Sign Up Button */}
            <button
              onClick={handleGoogleSignUp}
              disabled={loading}
              className="w-full bg-white text-gray-800 font-medium py-3 px-4 rounded-lg flex items-center justify-center space-x-3 hover:bg-gray-50 transition-all duration-300 mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[#1E293B] text-slate-400">Or continue with</span>
              </div>
            </div>

            <form onSubmit={handleSignUp} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-[#0A0B14] border border-[#3B82F6]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 focus:border-transparent transition-all duration-200"
                  placeholder="name@example.com"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-[#0A0B14] border border-[#3B82F6]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 focus:border-transparent transition-all duration-200"
                  placeholder="••••••••"
                  required
                />
                <p className="mt-2 text-sm text-slate-400">
                  Must be at least 8 characters long
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#3B82F6] to-[#10B981] hover:from-[#2563EB] hover:to-[#059669] py-3 rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:shadow-[#3B82F6]/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-slate-400">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-[#3B82F6] hover:text-[#2563EB] font-medium">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 