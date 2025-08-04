import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export default function Signup() {
  const [form, setForm] = useState({
    firstName: '',
    surname: '',
    email: '',
    password: '',
    address: '',
    suburb: '',
    state: '',
    postcode: ''
  });

  const addressRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const planParam = new URLSearchParams(location.search).get('plan');

  useEffect(() => {
    const initAutocomplete = async () => {
      const { Autocomplete } = await window.google.maps.importLibrary('places');
      const ac = new Autocomplete(addressRef.current, {
        fields: ['address_components', 'formatted_address'],
        componentRestrictions: { country: 'au' },
        types: ['address']
      });
      ac.addListener('place_changed', () => {
        const place = ac.getPlace();
        const components = place.address_components || [];

        const getComponent = (type) =>
          components.find((c) => c.types.includes(type))?.long_name || '';

        const suburb = getComponent('locality') || getComponent('sublocality') || '';
        const postcode = getComponent('postal_code');
        const state = getComponent('administrative_area_level_1');

        setForm((prev) => ({
          ...prev,
          address: place.formatted_address,
          suburb,
          state,
          postcode
        }));
      });
    };

    if (window.google?.maps?.importLibrary) {
      initAutocomplete();
    }
  }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const redirectAfterSignup = () => {
    if (planParam) navigate(`/checkout?plan=${planParam}`);
    else navigate('/dashboard');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password, ...profile } = form;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: profile // store profile data in user_metadata
      }
    });

    if (error) {
      console.error(error);
      alert('Signup failed. Please try again.');
    } else {
      // optional: insert into your users table if you have one
      if (data.user) {
        const { error: insertError } = await supabase
          .from('users')
          .insert([{ id: data.user.id, ...profile }]);

        if (insertError) console.error('DB insert error:', insertError);
      }

      alert('Signup successful');
      redirectAfterSignup();
    }
  };

  const handlePopupSignup = async (provider) => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: provider === 'google' ? 'google' : 'azure'
    });

    if (error) {
      console.error(error);
      alert(`${provider === 'google' ? 'Google' : 'Microsoft'} signup failed.`);
    }
  };

  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <img className="mx-auto h-12 w-auto" src="/img/logo.png" alt="Your Company" />
        <h2 className="mt-6 text-center text-2xl font-bold tracking-tight text-gray-900">
          Create your account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          {['firstName', 'surname', 'email', 'password'].map(name => (
            <div key={name} className="flex items-center space-x-4">
              <label htmlFor={name} className="w-28 text-right text-sm font-medium text-gray-700">
                {name === 'firstName' ? 'First Name' : name.charAt(0).toUpperCase() + name.slice(1)}
              </label>
              <input
                id={name}
                name={name}
                type={name === 'password' ? 'password' : 'text'}
                required
                value={form[name]}
                onChange={handleChange}
                className="flex-1 rounded-md bg-white px-3 py-2 border border-gray-300 text-base focus:ring-2 focus:ring-indigo-600 sm:text-sm"
              />
            </div>
          ))}

          <div className="flex items-center space-x-4">
            <label htmlFor="address" className="w-28 text-right text-sm font-medium text-gray-700">Address</label>
            <input
              id="address"
              name="address"
              type="text"
              ref={addressRef}
              value={form.address}
              onChange={handleChange}
              placeholder="Start typing your address"
              className="flex-1 rounded-md px-3 py-2 border border-gray-300"
            />
          </div>

          {['suburb', 'postcode'].map(name => (
            <div key={name} className="flex items-center space-x-4">
              <label htmlFor={name} className="w-28 text-right text-sm font-medium text-gray-700">
                {name.charAt(0).toUpperCase() + name.slice(1)}
              </label>
              <input
                id={name}
                name={name}
                type="text"
                required
                value={form[name]}
                onChange={handleChange}
                className="flex-1 rounded-md bg-white px-3 py-2 border border-gray-300 text-base focus:ring-2 focus:ring-indigo-600 sm:text-sm"
              />
            </div>
          ))}

          <div className="flex items-center space-x-4">
            <label htmlFor="state" className="w-28 text-right text-sm font-medium text-gray-700">State</label>
            <select
              id="state"
              name="state"
              required
              value={form.state}
              onChange={handleChange}
              className="flex-1 rounded-md bg-white px-3 py-2 border border-gray-300 text-base focus:ring-2 focus:ring-indigo-600 sm:text-sm"
            >
              <option value="">Select your state</option>
              {['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'].map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
            >Sign Up</button>
          </div>
        </form>

        <div className="mt-8 space-y-3">
          <button
            onClick={() => handlePopupSignup('google')}
            className="flex items-center justify-center w-full rounded-md bg-white border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            <img src="/img/google-icon.png" alt="Google" className="h-5 w-5 mr-2" />
            Sign up with Google
          </button>

          <button
            onClick={() => handlePopupSignup('microsoft')}
            className="flex items-center justify-center w-full rounded-md bg-white border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            <img src="/img/microsoft-icon.png" alt="Microsoft" className="h-5 w-5 mr-2" />
            Sign up with Microsoft
          </button>
        </div>

        <p className="mt-8 text-center text-sm text-gray-500">
          <Link to="/" className="font-semibold text-indigo-600 hover:text-indigo-500">← Cancel and return to Home</Link>
        </p>
      </div>
    </div>
  );
}
