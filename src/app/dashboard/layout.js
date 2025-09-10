import "../globals.css";
import DashboardSidebar from "@/components/DashboardSidebar";
import Protected from "@/components/Protected";

export const metadata = {
    title: "Dashboard - MDM Portal",
    description: "Admin dashboard for managing companies, employees, items, and requests",
};

export default function DashboardLayout({ children }) {
    return (
        <Protected allowedRoles={["Admin","MDGT"
        ]}>

            <div className="flex min-h-screen bg-gray-100">
                {/* Admin Sidebar */}
                <DashboardSidebar />

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto p-6 md:p-8 ml-0 lg:ml-64 transition-all duration-300">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </Protected>
    );
}
