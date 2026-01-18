import { Link, type LinkProps } from "@tanstack/react-router";

import { ModeToggle } from "./mode-toggle";
import UserMenu from "./user-menu";

const links: { label: string; linkProps: LinkProps }[] = [
  {
    label: "Dashboard",
    linkProps: {
      to: "/dashboard",
    },
  },
  {
    label: "Categories",
    linkProps: {
      to: "/categories",
    },
  },
  {
    label: "Foods",
    linkProps: {
      to: "/foods",
    },
  },
  {
    label: "Orders",
    linkProps: {
      to: "/orders",
    },
  },
];

export default function Header() {
  return (
    <div>
      <div className="flex flex-row items-center justify-between px-2 py-1">
        <nav className="flex gap-4 text-lg">
          {links.map(({ linkProps, label }) => {
            return (
              <Link key={linkProps.to} {...linkProps}>
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          <ModeToggle />
          <UserMenu />
        </div>
      </div>
      <hr />
    </div>
  );
}
