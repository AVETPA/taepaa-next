'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();

  const [form, setForm] = useState({ email: '', password: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });

    if (error) {
      alert('Login failed: ' + error.message);
    } else {
      router.push('/dashboard');
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'azure') => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${location.origin}/dashboard` },
    });

    if (error) alert(`${provider} login failed: ${error.message}`);
  };

  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <img className="mx-auto h-12 w-auto" src="/img/logo.png" alt="TAEPAA" />
        <h2 className="mt-8 text-center text-2xl font-bold tracking-tight text-gray-900">
          Sign in to your account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          {['email', 'password'].map((field) => (
            <div key={field} className="flex items-center space-x-4">
              <label
                htmlFor={field}
                className="w-28 text-right text-sm font-medium text-gray-700 capitalize"
              >
                {field}
              </label>
              <input
                id={field}
                name={field}
                type={field === 'password' ? 'password' : 'text'}
                required
                autoComplete={field}
                value={form[field as keyof typeof form]}
                onChange={handleChange}
                className="flex-1 rounded-md bg-white px-3 py-2 text-base text-gray-900 border border-gray-300 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm"
                placeholder={`Enter your ${field}`}
              />
            </div>
          ))}

          <div className="pt-4">
            <button
              type="submit"
              className="w-full rounded-md bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-500 focus:ring-2 focus:ring-indigo-600"
            >
              Sign In
            </button>
          </div>
        </form>

        <div className="my-6 flex items-center">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="mx-4 text-gray-500 text-sm">or continue with</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => handleOAuthLogin('google')}
            type="button"
            className="flex items-center justify-center w-full gap-2 rounded-md bg-white border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            <img src="/img/google-icon.png" alt="Google" className="h-5 w-5" />
            Sign in with Google
          </button>

          <button
            onClick={() => handleOAuthLogin('azure')}
            type="button"
            className="flex items-center justify-center w-full gap-2 rounded-md bg-white border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            <img src="/img/microsoft-icon.png" alt="Microsoft" className="h-5 w-5" />
            Sign in with Microsoft
          </button>
        </div>

        <p className="mt-8 text-center text-sm text-gray-500">
          <Link href="/" className="font-semibold text-indigo-600 hover:text-indigo-500">
            ← Cancel and return to Home
          </Link>
        </p>
      </div>
    </div>
  );
}
