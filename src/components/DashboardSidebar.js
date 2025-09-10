"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    Home,
    Building2,
    Users,
    LogOut,
    User,
    ShieldCheck,
    ChevronUp,
    ChevronDown,
    Menu,
    X,
    Building,
    Mail,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useAuth } from "../context/AuthContext"; // ✅ use AuthContext

export default function DashboardSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, role, logout } = useAuth(); // ✅ pull from context
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [showScrollBottom, setShowScrollBottom] = useState(false);
    const [activeHover, setActiveHover] = useState(null);
    const navRef = useRef(null);

    // Scroll indicators
    useEffect(() => {
        const element = navRef.current;
        const checkScroll = () => {
            if (element) {
                const { scrollTop, scrollHeight, clientHeight } = element;
                setShowScrollTop(scrollTop > 20);
                setShowScrollBottom(scrollTop < scrollHeight - clientHeight - 20);
            }
        };

        if (element) {
            element.addEventListener("scroll", checkScroll);
            checkScroll();
        }

        return () => {
            if (element) {
                element.removeEventListener("scroll", checkScroll);
            }
        };
    }, []);

    const scrollToTop = () => {
        if (navRef.current) {
            navRef.current.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    const scrollToBottom = () => {
        if (navRef.current) {
            navRef.current.scrollTo({
                top: navRef.current.scrollHeight,
                behavior: "smooth",
            });
        }
    };

    const navItems = [
        { name: "Overview", href: "/dashboard", icon: Home },
        { name: "Employees/Users", href: "/dashboard/employees", icon: Users },
        { name: "Companies", href: "/dashboard/companies", icon: Building },
        { name: "Projects", href: "/dashboard/projects", icon: Building2 },
        { name: "Approvals", href: "/dashboard/approvals", icon: ShieldCheck },
        { name: "Permissions", href: "/dashboard/permissions", icon: ShieldCheck },
        { name: "Roles", href: "/dashboard/roles", icon: ShieldCheck },
        { name: "Email Domains", href: "/dashboard/email-domains", icon: Mail },
        { name: "User Dashboard", href: "/app", icon: Home },
    ];

    return (
        <>
            {/* Mobile Toggle Button */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="lg:hidden fixed top-4 left-4 z-50 bg-gradient-to-r from-violet-600 to-purple-700 text-white p-2 rounded-md shadow-lg transition-all hover:scale-105 hover:shadow-xl"
            >
                {isCollapsed ? <X size={24} /> : <Menu size={24} />}
            </button>

            <aside
                className={`w-64 h-screen bg-gradient-to-b from-violet-800 via-purple-800 to-violet-900 flex flex-col fixed left-0 top-0 shadow-2xl z-40 transition-all duration-500 ${isCollapsed ? "-translate-x-full lg:translate-x-0" : "translate-x-0"
                    }`}
            >
                {/* Sidebar Header */}
                <div className="text-center py-6 border-b border-violet-600/30 shrink-0 relative">
                    <div className="absolute top-4 right-4 lg:hidden">
                        <button
                            onClick={() => setIsCollapsed(true)}
                            className="text-white/70 hover:text-white transition-all hover:rotate-90"
                        >
                            <X size={20} />
                        </button>
                    </div>
                    <Image
                        src="https://meil.in/sites/default/files/meil_logo_old_update_24.png"
                        alt="MEIL Logo"
                        className="bg-white w-3/4 mx-6 p-3 rounded-md"
                        width={800}
                        height={500}
                    />
                </div>

                {/* User Card */}
                {user && (
                    <div className="px-4 py-3 mt-4 mx-4 bg-violet-700/40 rounded-xl flex items-center gap-3 shrink-0 backdrop-blur-sm border border-violet-500/30 shadow-md transition-all hover:bg-violet-700/60 hover:shadow-lg">
                        <div className="bg-gradient-to-r from-violet-600 to-purple-600 p-2 rounded-full shadow-md transition-all hover:scale-110">
                            <User size={16} className="text-white" />
                        </div>
                        <div className="text-white text-sm">
                            <p className="font-medium">{user.emp_name || user.email}</p>
                            <p className="text-xs opacity-80">Role: {role || "N/A"}</p>
                        </div>
                    </div>
                )}

                {/* Top Gradient Overlay */}
                {showScrollTop && (
                    <div className="absolute top-28 left-0 right-0 h-8 bg-gradient-to-b from-violet-800 to-transparent pointer-events-none z-10" />
                )}

                {/* Navigation */}
                <nav
                    ref={navRef}
                    className="flex-1 mt-4 overflow-y-auto scroll-smooth scrollbar-thin scrollbar-thumb-violet-600 scrollbar-track-violet-900/30 relative"
                >
                    <ul className="space-y-2 px-4 pb-2">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;

                            return (
                                <li key={item.name}>
                                    <Link
                                        href={item.href}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 group relative overflow-hidden ${isActive
                                            ? "bg-gradient-to-r from-purple-600 to-violet-700 text-white shadow-lg shadow-violet-700/50"
                                            : "text-violet-100 hover:bg-violet-700/40 hover:text-white"
                                            }`}
                                        onMouseEnter={() => setActiveHover(item.name)}
                                        onMouseLeave={() => setActiveHover(null)}
                                    >
                                        <Icon
                                            size={20}
                                            className={`transition-all duration-300 ${isActive
                                                ? "text-white animate-pulse"
                                                : activeHover === item.name
                                                    ? "text-white scale-110"
                                                    : "text-violet-200"
                                                }`}
                                        />
                                        <span className="transition-all duration-300">
                                            {item.name}
                                        </span>
                                        {isActive && (
                                            <span className="absolute right-3 w-2 h-2 bg-white rounded-full animate-ping"></span>
                                        )}
                                    </Link>
                                </li>
                            );
                        })}

                        {/* Logout Button */}
                        {user && (
                            <li className="sticky bottom-2 bg-gradient-to-t from-violet-800 to-transparent pt-4 pb-2 backdrop-blur-sm rounded-xl mt-4">
                                <button
                                    onClick={logout}
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 w-full text-left text-violet-100 hover:bg-violet-700/40 hover:text-white border border-violet-600/30 hover:border-violet-500/50 hover:shadow-lg"
                                >
                                    <LogOut
                                        size={20}
                                        className="transition-transform duration-300 group-hover:translate-x-1"
                                    />
                                    <span className="transition-all duration-300">Logout</span>
                                </button>
                            </li>
                        )}
                    </ul>
                </nav>

                {/* Bottom Gradient Overlay */}
                {showScrollBottom && (
                    <div className="absolute bottom-16 left-0 right-0 h-8 bg-gradient-to-t from-violet-800 to-transparent pointer-events-none z-10" />
                )}

                {/* Scroll buttons */}
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex flex-col gap-2 z-20">
                    {showScrollTop && (
                        <button
                            onClick={scrollToTop}
                            className="bg-violet-700/60 p-1 rounded-full hover:bg-violet-600 transition-all duration-300 backdrop-blur-sm hover:scale-110 border border-violet-500/30"
                            aria-label="Scroll to top"
                        >
                            <ChevronUp size={16} className="text-white" />
                        </button>
                    )}
                    {showScrollBottom && (
                        <button
                            onClick={scrollToBottom}
                            className="bg-violet-700/60 p-1 rounded-full hover:bg-violet-600 transition-all duration-300 backdrop-blur-sm hover:scale-110 border border-violet-500/30"
                            aria-label="Scroll to bottom"
                        >
                            <ChevronDown size={16} className="text-white" />
                        </button>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-violet-600/30 text-xs text-violet-300 shrink-0 bg-violet-800/30 backdrop-blur-sm transition-all hover:bg-violet-800/40">
                    <div className="flex justify-between items-center">
                        <span>© {new Date().getFullYear()} Admin Dashboard</span>
                        <span className="bg-purple-600/30 text-purple-200 px-2 py-1 rounded-md text-[10px] transition-all hover:bg-purple-600/40">
                            v2.0
                        </span>
                    </div>
                    <p className="mt-1 text-[10px] opacity-70 transition-all hover:opacity-100">
                        Enhanced with smooth scrolling
                    </p>
                </div>
            </aside>

            {/* Overlay for mobile */}
            {!isCollapsed && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm transition-all duration-500"
                    onClick={() => setIsCollapsed(true)}
                />
            )}
        </>
    );
}
