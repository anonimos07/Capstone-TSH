import { Link } from "react-router-dom";

export function MainNav({
  className,
  userType,
  ...props
}) {
  const employeeLinks = [
    {
      href: "/EmployeeDashboard",
      label: "Dashboard",
    },
  ];

  const links = userType === "employee" ? employeeLinks : hrLinks;

  return (
    <nav
      className={`flex items-center space-x-4 lg:space-x-6 ${className || ""}`}
      {...props}
    >
      {links.map((link) => (
        <Link
          key={link.href}
          to={link.href}
          className="text-sm font-medium transition-colors hover:text-primary"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}