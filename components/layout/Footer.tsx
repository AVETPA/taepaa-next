'use client';

import Link from 'next/link';
import { FaFacebookF, FaInstagram, FaYoutube } from 'react-icons/fa';
import { SiTiktok } from 'react-icons/si';

export default function Footer() {
  return (
    <footer className="bg-white text-gray-700 mt-10">
      {/* Acknowledgement of Country */}
      <div className="px-6 py-8 border-t border-gray-200 text-center space-y-2">
        <p className="italic text-sm">
          TAEPAA acknowledges the Traditional Custodians of the land on which we work and learn, and pays respect to Elders past and present.
        </p>
        <p className="italic text-sm">
          We recognise the continuing connection to land, waters, and community. Always was, always will be, Aboriginal Land.
        </p>
      </div>

      {/* Bottom Bar */}
      <div className="bg-[#1F3A93] text-white text-sm px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          &copy; {new Date().getFullYear()} TAE Practitioners Association Australia (TAEPAA)
        </div>

        {/* Internal Links */}
        <div className="flex space-x-4">
          <Link href="/privacy" className="hover:underline hover:text-[#FF6F61] transition">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:underline hover:text-[#FF6F61] transition">
            Terms of Use
          </Link>
        </div>

        {/* Social Icons */}
        <div className="flex space-x-4">
          <a href="#" aria-label="Facebook" className="hover:text-[#FF6F61] transition">
            <FaFacebookF className="h-5 w-5" />
          </a>
          <a href="#" aria-label="TikTok" className="hover:text-[#FF6F61] transition">
            <SiTiktok className="h-5 w-5" />
          </a>
          <a href="#" aria-label="Instagram" className="hover:text-[#FF6F61] transition">
            <FaInstagram className="h-5 w-5" />
          </a>
          <a href="#" aria-label="YouTube" className="hover:text-[#FF6F61] transition">
            <FaYoutube className="h-5 w-5" />
          </a>
        </div>
      </div>
    </footer>
  );
}
