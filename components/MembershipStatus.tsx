import React, { useState, useEffect } from 'react';
import { auth, db } from '../utils/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Timestamp } from 'firebase/firestore';

export default function MembershipStatus() {
  const [membership, setMembership] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('Unknown');

  useEffect(() => {
    const fetchMembership = async () => {
      if (!auth.currentUser) return;

      try {
        const docRef = doc(db, 'memberships', auth.currentUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setMembership(data);

          const now = Timestamp.now();
          const isExpired = data.expiresAt.toMillis() < now.toMillis();
          setStatus(isExpired ? 'Expired' : 'Active');
        } else {
          setStatus('None');
        }
      } catch (error) {
        console.error('Failed to fetch membership:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMembership();
  }, []);

  if (loading) return <div>Loading Membership Status...</div>;

  if (!membership) {
    return (
      <div className="bg-yellow-100 text-yellow-800 p-4 rounded">
        No Membership Found. Please subscribe!
      </div>
    );
  }

  const remainingDays = Math.max(
    0,
    Math.ceil(
      (membership.expiresAt.toMillis() - Timestamp.now().toMillis()) / (1000 * 60 * 60 * 24)
    )
  );

  return (
    <div className="border p-4 rounded shadow bg-white">
      <h3 className="text-lg font-bold mb-2">Membership Status</h3>

      <p><strong>Plan:</strong> {membership.plan}</p>
      <p><strong>Status:</strong> {status}</p>
      {status === 'Active' && (
        <p><strong>Days Remaining:</strong> {remainingDays} days</p>
      )}
      {status === 'Expired' && (
        <p className="text-red-600 font-semibold mt-2">
          ❗ Your membership has expired. Please renew!
        </p>
      )}

      {/* 🔵 ADD THIS: Manage Subscription button */}
      {status !== 'None' && (
        <div className="mt-4">
          <button
            onClick={() => window.location.href = '/memberships'}
            className="w-full bg-[#00a0a3] text-white font-semibold py-2 px-4 rounded hover:bg-[#007a7c]"
          >
            Manage Subscription
          </button>
        </div>
      )}
    </div>
  );
}
