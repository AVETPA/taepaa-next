import { useNavigate, useLocation } from "react-router-dom";
import { useParams, useMatch } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import { Navbar, NavbarItem, NavbarDivider, NavbarLabel, NavbarSection, NavbarSpacer } from "../components/navbar";
import { Dropdown, DropdownButton, DropdownDivider, DropdownItem, DropdownLabel, DropdownMenu } from "../components/Dropdown";
import useAuth from "../hooks/useAuth";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../utils/firebase"; // adjust if needed
import { ArrowRightStartOnRectangleIcon, ChevronDownIcon, Cog8ToothIcon, PlusIcon, UserIcon } from "@heroicons/react/20/solid";
import { MagnifyingGlassIcon, InboxIcon } from "@heroicons/react/24/outline";
import { adminEmails } from "../config/admin"; // adjust path as needed

const Header = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const auth = getAuth();

const isAdminUser = user && adminEmails.includes(user.email);
 

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };
const match = useMatch("/trainerprofile/:userId");
const { userId } = useParams();
const isAdminMode = match && userId;
const [viewedUserName, setViewedUserName] = useState("");

useEffect(() => {
  const fetchUserName = async () => {
    if (isAdminMode && userId) {
      const ref = doc(db, "users", userId);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setViewedUserName(data.name || data.email || "");
      } else {
        setViewedUserName("(unknown user)");
      }
    }
  };

  fetchUserName();
}, [isAdminMode, userId]);
{isAdminUser && (
  <div className="bg-teal-100 border-l-4 border-teal-500 text-teal-800 px-4 py-2 text-sm flex justify-between items-center">
    <span>
      <strong>Welcome Admin:</strong> You have elevated access.
    </span>
    <a
      href="/admindashboard"
      className="text-blue-700 hover:underline text-sm"
    >
      🛠 Access Admin Dashboard
    </a>
  </div>
)}

  return (
<>
  {isAdminMode && (
  <div className="bg-yellow-100 text-yellow-800 border-l-4 border-yellow-500 px-4 py-2 text-sm flex justify-between items-center">
    <span>
      <strong>Admin Mode:</strong> Viewing profile for&nbsp;
      <strong className="text-teal-700">{viewedUserName}</strong>
      &nbsp;(<code className="bg-yellow-50 px-1 py-0.5 rounded text-xs">{userId}</code>)
    </span>
    <a
      href="/admin/userlist"
      className="text-blue-700 hover:underline text-sm"
    >
      ⬅ Return to Admin
    </a>
  </div>
)}
    <Navbar>
      {/* Logo */}
      <NavbarItem href="/">
        <img src="/img/logo.png" alt="TAEPAA" className="h-10 w-auto" />
      </NavbarItem>

      <NavbarDivider className="max-lg:hidden" />

      {/* Center Navigation */}
      <NavbarSection className="max-lg:hidden">
        <NavbarItem href="/" current={location.pathname === "/"}>
          Home
        </NavbarItem>
        <NavbarItem href="/resources" current={location.pathname === "/resources"}>
          Resources Hub
        </NavbarItem>
        <NavbarItem href="/membership" current={location.pathname === "/membership"}>
          Join TAEPAA
        </NavbarItem>
      </NavbarSection>

      <NavbarSpacer />

      {/* Right Side */}
      <NavbarSection>
        {user && (
          <>
            <NavbarItem href="/search" aria-label="Search">
              <MagnifyingGlassIcon className="h-6 w-6" />
            </NavbarItem>
            <NavbarItem href="/inbox" aria-label="Inbox">
              <InboxIcon className="h-6 w-6" />
            </NavbarItem>

            {/* Avatar Dropdown */}
            <Dropdown>
              <DropdownButton>
                <img
                  src={user?.avatarUrl || "/img/user-avatar.png"}
                  alt="User Avatar"
                  className="h-10 w-10 rounded-full border-2 border-teal-600 object-cover"
                />
              </DropdownButton>

              <DropdownMenu className="min-w-64 text-sm text-right" anchor="bottom end">
                <DropdownItem href="/myaccount">
                  <DropdownLabel>My Account</DropdownLabel>
                </DropdownItem>
                <DropdownItem href="/mysubscription">
                  <DropdownLabel>My Subscription</DropdownLabel>
                </DropdownItem>

                <DropdownDivider />

                <DropdownItem href="/trainerprofile">
                  <DropdownLabel>Trainer Profile</DropdownLabel>
                </DropdownItem>
                <DropdownItem href="/events">
                  <DropdownLabel>My Events</DropdownLabel>
                </DropdownItem>

                <DropdownDivider />

                <DropdownItem onClick={handleLogout}>
                  <DropdownLabel>Sign out</DropdownLabel>
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </>
        )}
      </NavbarSection>
    </Navbar>
    </>
  );
};

export default Header;