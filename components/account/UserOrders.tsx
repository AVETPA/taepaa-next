import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function UserOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError || !userData?.user) {
          console.error("Not authenticated:", userError);
          return;
        }

        const { id: userId } = userData.user;

        const { data, error } = await supabase
          .from("orders")
          .select("*")
          .eq("userId", userId)
          .order("created_at", { ascending: false });

        if (error) throw error;

        setOrders(data || []);
      } catch (err) {
        console.error("Error fetching orders:", err.message || err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) return <p>Loading your orders...</p>;
  if (orders.length === 0) return <p>No orders found.</p>;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Your Orders</h2>
      <ul className="space-y-4">
        {orders.map((order) => (
          <li key={order.id} className="border rounded p-4 shadow-sm">
            <p><strong>Item:</strong> {order.planName || "N/A"}</p>
            <p><strong>Amount:</strong> ${order.amount || "0.00"}</p>
            <p><strong>Status:</strong> {order.status || "Pending"}</p>
            {order.invoiceUrl && (
              <div className="mt-2">
                <p className="text-sm text-gray-600">Invoice:</p>
                <a
                  href={order.invoiceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 underline"
                >
                  {order.invoiceUrl.split("/").pop()}
                </a>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
