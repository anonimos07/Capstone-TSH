import { MainNav } from "../dashboard/MainNav";
import { UserNav } from "../dashboard/UserNav";

export function DashboardLayout({ children, userType, userName, userEmail }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-white">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-bold tracking-tight text-primary">TechStaffHub</h1>
            <MainNav userType={userType} />
          </div>
          <UserNav userName={userName} userEmail={userEmail} />
        </div>
      </header>
      <main className="flex-1">
        <div className="container py-6">
          {children}
        </div>
      </main>
      <footer className="border-t py-4">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} TechStaffHub. All rights reserved.
          </p>
          <p className="text-center text-sm text-gray-500">
            Developed by TechStaffHub
          </p>
        </div>
      </footer>
    </div>
  );
}