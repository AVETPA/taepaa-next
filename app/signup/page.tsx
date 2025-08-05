"use client";

import Signup from '@/components/auth/Signup';

export default function SignupPage() {
  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-teal-700 mb-6">Create an Account</h1>
      <Signup />
    </div>
  );
}
