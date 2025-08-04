import { useState, useEffect, useRef, createContext, useContext } from "react";

// Context to manage dropdown open/close state
const DropdownContext = createContext();

export const Dropdown = ({ children }) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <DropdownContext.Provider value={{ open, setOpen }}>
      <div ref={dropdownRef} className="relative inline-block text-left">
        {children}
      </div>
    </DropdownContext.Provider>
  );
};

export const DropdownButton = ({ children, className = "" }) => {
  const { setOpen, open } = useContext(DropdownContext);

  return (
    <button
      type="button" // ✅ Always specify type on buttons
      onClick={() => setOpen(!open)}
      className={`inline-flex justify-center items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition border border-teal-600 text-teal-700 bg-white hover:bg-teal-50 ${className}`}
    >
      {children}
    </button>
  );
};

export const DropdownMenu = ({ children, className = "", anchor = "bottom end" }) => {
  const { open } = useContext(DropdownContext);

  if (!open) return null;

  return (
    <div
      className={`absolute z-50 mt-2 min-w-[12rem] rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none ${
        anchor === "bottom end" ? "right-0" : anchor === "bottom start" ? "left-0" : ""
      } ${className}`}
    >
      <div className="py-1">{children}</div>
    </div>
  );
};

export const DropdownItem = ({ children, href, onClick, className = "" }) => {
  const Tag = href ? "a" : "div";

  return (
    <Tag
      href={href}
      onClick={onClick}
      className={`block px-4 py-2 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-800 cursor-pointer ${className}`}
    >
      {children}
    </Tag>
  );
};

export const DropdownLabel = ({ children }) => (
  <span className="ml-2 text-sm font-medium text-gray-800">
    {children}
  </span>
);

export const DropdownDivider = () => (
  <div className="my-1 border-t border-gray-200" role="separator" />
);
