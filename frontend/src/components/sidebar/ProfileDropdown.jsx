import { Fragment, useEffect, useState } from "react";
import { Popover, PopoverButton, PopoverPanel, Transition } from "@headlessui/react";
import { FaSignOutAlt, FaUser } from "react-icons/fa";
import { X } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComments } from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import useLogout from "../../hooks/useLogout";

export default function ProfileDropdown({ children }) {
  const [user, setUser] = useState(null);
  const [chatLink, setChatLink] = useState("");
  const { logout, loading } = useLogout();

  /* ===============================
     LOAD USER FROM LOCAL STORAGE
  =============================== */
  useEffect(() => {
    const userData = localStorage.getItem("chat-user");
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (err) {
        console.error("Error parsing user:", err);
      }
    }
  }, []);

  /* ===============================
     GENERATE SHAREABLE CHAT LINK
  =============================== */
  const handleGenerateChatLink = () => {
    if (!user?._id) return;

    const baseUrl =
      typeof window !== "undefined"
        ? window.location.origin
        : "";

    const link = `${baseUrl}/chat/${user._id}`;
    setChatLink(link);
    toast.success("Shareable chat link generated!");
  };

  const copyToClipboard = async () => {
    if (!chatLink) return;

    try {
      await navigator.clipboard.writeText(chatLink);
      toast.success("Chat link copied!");
    } catch {
      toast.error("Failed to copy link.");
    }
  };

  return (
    <Popover className="relative">
      {({ close }) => (
        <>
          {/* ===============================
              PROFILE BUTTON
          =============================== */}
          <PopoverButton className="flex items-center focus:outline-none transition-transform hover:scale-105">
            {children ? (
              children
            ) : user?.profileImage ? (
              <img
                src={user.profileImage}
                alt="User"
                className="w-10 h-10 rounded-full border border-white/20 hover:ring-2 hover:ring-indigo-500 transition"
              />
            ) : (
              <div className="w-10 h-10 flex items-center justify-center rounded-full 
                              bg-gradient-to-br from-indigo-500 to-purple-600
                              text-white font-semibold">
                {(user?.username?.charAt(0) ?? "U").toUpperCase()}
              </div>
            )}
          </PopoverButton>

          {/* ===============================
              DROPDOWN PANEL
          =============================== */}
          <Transition
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-2 scale-95"
            enterTo="opacity-100 translate-y-0 scale-100"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0 scale-100"
            leaveTo="opacity-0 translate-y-2 scale-95"
          >
            <PopoverPanel className="absolute right-0 top-14 z-50 w-72">
              <div className="relative rounded-2xl p-5
                              bg-gradient-to-br from-slate-900/95 to-slate-800/95
                              backdrop-blur-2xl
                              border border-white/10
                              shadow-[0_25px_60px_rgba(0,0,0,0.6)]
                              text-gray-200">

                {/* Close Button */}
                <button
                  onClick={() => close()}
                  className="absolute top-3 right-3 p-2 rounded-full
                             text-gray-400 hover:text-white
                             hover:bg-white/10 transition"
                >
                  <X size={16} />
                </button>

                {/* ===============================
                    USER INFO
                =============================== */}
                <div className="mb-4 pb-4 border-b border-white/10">
                  <p className="text-sm font-semibold text-white">
                    {user?.username ?? "User"}
                  </p>
                  <p className="text-xs text-gray-400">
                    {user?.email ?? ""}
                  </p>
                </div>

                {/* ===============================
                    PROFILE LINK
                =============================== */}
                <Link
                  to="/profile"
                  onClick={() => close()}
                  className="flex items-center gap-3 rounded-xl px-3 py-2
                             text-sm text-gray-300
                             hover:bg-white/10 hover:text-white transition"
                >
                  <FaUser className="text-gray-400" />
                  Profile
                </Link>

                {/* ===============================
                    GENERATE CHAT LINK
                =============================== */}
                <button
                  onClick={handleGenerateChatLink}
                  className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2
                             text-sm text-gray-300
                             hover:bg-white/10 hover:text-white transition"
                >
                  <FontAwesomeIcon icon={faComments} className="text-gray-400 w-4 h-4" />
                  Generate Chat Link
                </button>

                {/* ===============================
                    SHOW GENERATED LINK
                =============================== */}
                {chatLink && (
                  <div className="mt-3 p-3 rounded-xl
                                  bg-white/5 border border-white/10
                                  flex items-center justify-between gap-2">
                    <span className="text-xs break-all text-gray-300">
                      {chatLink}
                    </span>
                    <button
                      onClick={copyToClipboard}
                      className="px-3 py-1 text-xs rounded-lg
                                 bg-indigo-600 hover:bg-indigo-500
                                 text-white transition"
                    >
                      Copy
                    </button>
                  </div>
                )}

                {/* ===============================
                    LOGOUT
                =============================== */}
                <button
                  onClick={() => {
                    close();
                    logout();
                  }}
                  disabled={loading}
                  className={`mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-2
                              text-sm text-red-400
                              hover:bg-red-500/10 hover:text-red-300
                              transition ${
                                loading ? "opacity-50 cursor-not-allowed" : ""
                              }`}
                >
                  <FaSignOutAlt />
                  {loading ? "Signing Out..." : "Sign Out"}
                </button>
              </div>
            </PopoverPanel>
          </Transition>
        </>
      )}
    </Popover>
  );
}