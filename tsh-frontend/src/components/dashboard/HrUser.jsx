import { Link } from "react-router-dom";
import { BellIcon, LogOut, Settings, User } from 'lucide-react';

export function HrUser({ userName, userEmail }) {
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="flex items-center gap-4">
      <button className="relative p-2 rounded-full hover:bg-gray-100">
        <BellIcon className="h-5 w-5" />
        <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary"></span>
      </button>
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
            <Link to="/profile" className="flex items-center gap-2 p-2 text-sm hover:bg-gray-100 rounded-md">
              <User className="h-4 w-4" />
              <span>Profile</span>
            </Link>
            <Link to="/settings" className="flex items-center gap-2 p-2 text-sm hover:bg-gray-100 rounded-md">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </Link>
          </div>
          <div className="p-1 border-t">
            <Link to="/LogoutHr" className="flex items-center gap-2 p-2 text-sm hover:bg-gray-100 rounded-md">
              <LogOut className="h-4 w-4" />
              <span>Log out</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}