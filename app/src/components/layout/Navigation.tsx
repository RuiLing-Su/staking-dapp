"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const navItems = [
  { href: "/dashboard", label: "仪表盘" },
  { href: "/stake", label: "质押" },
  { href: "/reward", label: "奖励" },
  { href: "/referral", label: "推荐" },
  { href: "/level", label: "等级" },
  { href: "/meme", label: "MEME" },
];

export default function Navigation() {
  const pathname = usePathname();
  return (
    // 移动端隐藏导航栏，仅在 md 屏及以上显示
    <nav className="hidden md:flex">
      <ul className="flex space-x-4">
        {navItems.map(({ href, label }) => {
          const isActive = pathname === href;
          return (
            <li key={href}>
              <Link href={href}>
                <motion.a
                  className={`px-3 py-2 rounded-md transition-colors duration-200 ${
                    isActive
                      ? "bg-gray-800 text-white"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {label}
                </motion.a>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}