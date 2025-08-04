import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import AdminLayout from '../../components/layout/AdminLayout';

export default function AdminUserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsersWithProfiles = async () => {
      // Step 1: Fetch all users
      const { data: baseUsers, error: userError } = await supabase
        .from('users')
        .select('id, first_name, surname, email');

      if (userError) {
        console.error("User fetch error:", userError.message);
        setLoading(false);
        return;
      }

      // Step 2: Enrich each user with profile data
      const enrichedUsers = await Promise.all(
        baseUsers.map(async (user) => {
          const { count: taeCount } = await supabase
            .from('trainingProducts')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);

          const { count: pdCount } = await supabase
            .from('professionaldevelopment')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);

          return {
            ...user,
            taeCount: taeCount || 0,
            pdCount: pdCount || 0,
            profileComplete: (taeCount || 0) > 0 && (pdCount || 0) > 0,
          };
        })
      );

      setUsers(enrichedUsers);
      setLoading(false);
    };

    fetchUsersWithProfiles();
  }, []);

  if (loading) {
    return <div className="text-center mt-10 text-teal-600">Loading Users...</div>;
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto bg-white shadow-lg rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-[#044b4f] mb-6">User Management + Trainer Profiles</h1>

        <table className="min-w-full border border-gray-300 text-sm text-left">
          <thead className="bg-gray-100 text-gray-700 font-semibold">
            <tr>
              <th className="border px-3 py-2">Name</th>
              <th className="border px-3 py-2">Email</th>
              <th className="border px-3 py-2">TAE</th>
              <th className="border px-3 py-2">PD</th>
              <th className="border px-3 py-2">Complete</th>
              <th className="border px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className="odd:bg-white even:bg-gray-50">
                <td className="border px-3 py-2">{`${user.first_name || ''} ${user.surname || ''}`.trim() || '—'}</td>
                <td className="border px-3 py-2">{user.email || "❌ Not recorded"}</td>
                <td className="border px-3 py-2">{user.taeCount > 0 ? '✅' : '❌'}</td>
                <td className="border px-3 py-2">{user.pdCount}</td>
                <td className="border px-3 py-2">
                  {user.profileComplete ? (
                    <span className="text-green-600 font-semibold">✅ Yes</span>
                  ) : (
                    <span className="text-red-500 font-semibold">❌ No</span>
                  )}
                </td>
                <td className="border px-3 py-2">
                  <Link
                    to={`/trainerprofile/${user.id}`}
                    className="text-blue-600 underline hover:text-blue-800"
                  >
                    View Profile
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
