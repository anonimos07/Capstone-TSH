import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BellIcon, LogOut, User } from "lucide-react";

export function UserNav({ userName, userEmail }) {
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    // Fetch notifications for the logged-in user
    const fetchNotifications = async () => {
      try {
        const res = await fetch(`/api/notifications/${userEmail}`);
        const data = await res.json();
        setNotifications(data);
      } catch (err) {
        console.error("Failed to fetch notifications", err);
      }
    };

    fetchNotifications();
  }, [userEmail]);

  return (
    <div className="flex items-center gap-4 relative">
      <div className="relative">
        <button
          className="relative p-2 rounded-full hover:bg-gray-100"
          onClick={() => setShowNotifications((prev) => !prev)}
        >
          <BellIcon className="h-5 w-5" />
          {notifications.length > 0 && (
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary"></span>
          )}
        </button>
        {showNotifications && (
          <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white border rounded-md shadow-lg z-50">
            <div className="p-2 border-b font-medium text-sm">
              Notifications
            </div>
            {notifications.length === 0 ? (
              <div className="p-2 text-sm text-gray-500">No notifications</div>
            ) : (
              notifications.map((notif, index) => (
                <div
                  key={index}
                  className="p-2 text-sm border-b hover:bg-gray-50"
                >
                  <p className="font-medium">{notif.message}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(notif.timestamp).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <div className="relative group">
        <button className="flex items-center gap-2 p-2 rounded-full hover:bg-gray-100">
          <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium">
            {initials}
          </div>
        </button>
        <div className="absolute right-0 mt-2 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 bg-white border rounded-md shadow-md z-50">
          <div className="p-2 border-b">
            <p className="text-sm font-medium">{userName}</p>
            <p className="text-xs text-gray-500">{userEmail}</p>
          </div>
          <div className="p-1">
            <Link
              to="/profile"
              className="flex items-center gap-2 p-2 text-sm hover:bg-gray-100 rounded-md"
            >
              <User className="h-4 w-4" />
              <span>Profile</span>
            </Link>
          </div>
          <div className="p-1 border-t">
            <Link
              to="/"
              onClick={() => {
                localStorage.clear();
              }}
              className="flex items-center gap-2 p-2 text-sm hover:bg-gray-100 rounded-md"
            >
              <LogOut className="h-4 w-4" />
              <span>Log out</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
