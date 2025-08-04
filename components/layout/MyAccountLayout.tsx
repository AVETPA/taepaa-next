import { useState } from "react";
import { useLocation } from "react-router-dom";
import ProfileInfo from "../account/ProfileInfo";
import UserOrders from "../account/UserOrders";
import UserBookings from "../account/UserBookings";
import UserCourses from "../account/UserCourses";

const tabs = [
  { name: "Profile Info", component: <ProfileInfo /> },
  { name: "Orders", component: <UserOrders /> },
  { name: "Bookings", component: <UserBookings /> },
  { name: "Courses", component: <UserCourses /> },
];

export default function MyAccountLayout({ children }) {
  const [selectedTab, setSelectedTab] = useState(tabs[0].name);
  const location = useLocation();
  const isDashboard = location.pathname === "/dashboard";

  return (
    <div className="flex min-h-screen bg-[#f5fbfb] font-sans">
      {/* Sidebar */}
      <aside className="w-40 bg-gray-100 border-r px-3 py-6 text-sm">
        <h2 className="text-lg font-semibold mb-4">My Account</h2>
        <ul className="space-y-1">
          {tabs.map((tab) => (
            <li
              key={tab.name}
              className={`cursor-pointer px-3 py-2 rounded hover:bg-teal-100 transition ${
                selectedTab === tab.name ? "bg-teal-200 font-medium text-teal-800" : ""
              }`}
              onClick={() => setSelectedTab(tab.name)}
            >
              {tab.name}
            </li>
          ))}
        </ul>
      </aside>

      {/* Main content */}
      <main className="flex-1 px-8 py-6">
        {isDashboard
          ? children
          : tabs.find((t) => t.name === selectedTab)?.component}
      </main>
    </div>
  );
}
