import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function UserBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getUser();
        if (sessionError || !sessionData?.user) {
          console.error("Not authenticated:", sessionError);
          return;
        }

        const userId = sessionData.user.id;

        const { data, error } = await supabase
          .from("bookings")
          .select("*")
          .eq("userId", userId)
          .order("date", { ascending: true });

        if (error) {
          console.error("Error fetching bookings:", error);
          return;
        }

        setBookings(data || []);
      } catch (err) {
        console.error("Unexpected error fetching bookings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  if (loading) return <p>Loading your bookings...</p>;
  if (bookings.length === 0) return <p>No bookings found.</p>;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Your Bookings</h2>
      <ul className="space-y-4">
        {bookings.map((booking) => (
          <li key={booking.id} className="border rounded p-4 shadow-sm">
            <p><strong>Title:</strong> {booking.title || "N/A"}</p>
            <p><strong>Date:</strong> {booking.date || "N/A"}</p>
            <p><strong>Status:</strong> {booking.status || "Pending"}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
