import React, { useEffect, useState } from 'react';
import Signup from './Signup'; // Your actual form component

export default function SignupPage() {
  const [mapsLoaded, setMapsLoaded] = useState(false);

  useEffect(() => {
    const initMap = async () => {
      if (!window.google || !window.google.maps) {
        try {
          await window.google.maps.importLibrary('places');
          setMapsLoaded(true);
        } catch (err) {
          console.error('Google Maps failed to load:', err);
        }
      } else {
        setMapsLoaded(true);
      }
    };

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyAnrjGI6uwbnGLU2XSngwGdtKzdgorAPz8&v=weekly&libraries=places`;
    script.async = true;
    script.onload = initMap;
    script.onerror = () => console.error('Google Maps script load failed');
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return mapsLoaded ? <Signup /> : <p className="text-center mt-10 text-gray-600">Loading Maps...</p>;
}
