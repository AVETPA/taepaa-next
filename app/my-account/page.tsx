"use client";

import { useState } from "react";
import ProfileInfo from "@/components/account/ProfileInfo";
import UserOrders from "@/components/account/UserOrders";
import UserBookings from "@/components/account/UserBookings";
import UserCourses from "@/components/account/UserCourses";
import UserInvoices from "@/components/account/UserInvoices";
import UserSubscriptions from "@/components/account/UserSubscriptions";
import UserMemberships from "@/components/account/UserMemberships";
import TrainerProfileLink from "@/components/TrainerProfileLink";
import PDTracker from "@/components/account/PDTracker";

const tabs = [
  { title: "Profile Info", component: <ProfileInfo /> },
  { title: "Orders", component: <UserOrders /> },
  { title: "Bookings", component: <UserBookings /> },
  { title: "Courses", component: <UserCourses /> },
  { title: "Invoices", component: <UserInvoices /> },
  { title: "Subscriptions", component: <UserSubscriptions /> },
  { title: "Memberships", component: <UserMemberships /> },
  { title: "Trainer Profile", component: <TrainerProfileLink /> },
  { title: "PD Tracker", component: <PDTracker /> },
];

export default function MyAccountLayout() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-teal-700 mb-6">My Account</h1>

      <div className="flex flex-wrap gap-2 border-b border-gray-200 mb-6">
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-all ${
              activeIndex === index
                ? "text-teal-700 border-teal-500 bg-white"
                : "text-gray-500 border-transparent hover:text-teal-600 hover:border-teal-400"
            }`}
          >
            {tab.title}
          </button>
        ))}
      </div>

      <div className="bg-white shadow-md p-6 rounded-lg">
        {tabs[activeIndex].component}
      </div>
    </div>
  );
}
