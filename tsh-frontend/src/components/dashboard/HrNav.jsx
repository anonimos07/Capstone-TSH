import { Link } from "react-router-dom";

export function HrNav({
  className,
  userType,
  ...props
}) {
  const hrLinks = [
    {
      href: "/HrDashboard",
      label: "Dashboard",
    },
    {
      href: "/hr/attendance",
      label: "Attendance",
    },
    {
      href: "/hr/leave",
      label: "Leave",
    },
    {
      href: "/hr/payslips",
      label: "Payslips",
    },
  ];

  const links = userType === "hr" ? hrLinks : employeeLinks;

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