"use client";
import { Package, Layers, ClipboardList, Tags, BarChart3, Database, Users, CheckSquare, Mail, Grid, Settings } from "lucide-react";
import { useRouter } from "next/navigation";

const sections = [
  {
    key: "materials",
    title: "Item Masters",
    description: "Manage material items and inventory",
    icon: Package,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    btn: "Manage Items",
    path: "/materials"
  },
  {
    key: "materialGroups",
    title: "Material Groups",
    description: "Organize materials into categories",
    icon: Layers,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    btn: "Manage Material Groups",
    path: "/material_groups"
  },
  {
    key: "Projects",
    title: "Projects",
    description: "Manage projects and their details",
    icon: Tags,
    color: "text-violet-600",
    bgColor: "bg-violet-50",
    btn: "Manage Projects",
    path: "/projects"
  },
  // {
  //   key: "indents",
  //   title: "Indents",
  //   description: "Review and manage material requests",
  //   icon: ClipboardList,
  //   color: "text-amber-600",
  //   bgColor: "bg-amber-50",
  //   btn: "Manage Indents",
  //   path: "/indent"
  // },
//   {
//     key: "companies",
//     title: "Companies",
//     description: "Manage companies and their details",
//     icon: Database,
//     color: "text-cyan-600",
//     bgColor: "bg-cyan-50",
//     btn: "Manage Companies",
//     path: "/companies"
//   },
//   {
//     key: "reports",
//     title: "Reports",
//     description: "View system analytics and reports",
//     icon: BarChart3,
//     color: "text-rose-600",
//     bgColor: "bg-rose-50",
//     btn: "Manage Reports",
//     path: "/reports"
//   },
{
    key: "materialTypes",
    title: "Material Types",
    description: "Classify materials into different types",
    icon: Grid,
    color: "text-cyan-600",
    btn: "Manage Material Types",
    path: "/material_types",
  },
  // {
  //   key: "emailDomains",
  //   title: "Email Domains",
  //   description: "Configure and manage allowed email domains",
  //   icon: Mail,
  //   color: "text-pink-500",
  //   btn: "Manage Email Domains",
  //   path: "/email-domains",
  // },
  {
    key: "supergroups",
    title: "Supergroups",
    description: "Define and manage user supergroups",
    icon: Users,
    color: "text-indigo-500",
    btn: "Manage Supergroups",
    path: "/supergroups",
  },
  {
    key: "validationLists",
    title: "Validation Lists",
    description: "Maintain lists for validation and compliance",
    icon: CheckSquare,
    color: "text-gray-700",
    bgColor: "bg-gray-50",
    btn: "Manage Validation Lists",
    path: "/validation-lists",
  },
  {
    key: "materialAttributes",
    title: "Material Attributes",
    description: "Configure attributes for material groups",
    icon: Settings,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    btn: "Manage Material Attributes",
    path: "/material-attributes",
  },
];

export default function GovernancePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-10 text-center">
          <h1 className="font-default text-3xl font-bold text-gray-900 mb-2">Governance Dashboard</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Centralized management for your material data and system configuration
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sections.map((sec) => (
            <div
              key={sec.key}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="p-6">
                {/* Icon Container */}
                <div className={`inline-flex items-center justify-center p-3 rounded-lg ${sec.bgColor} mb-4`}>
                  <sec.icon size={24} className={sec.color} />
                </div>

                {/* Title */}
                <h2 className="font-default text-xl font-semibold text-gray-800 mb-2">{sec.title}</h2>

                {/* Description */}
                <p className="text-gray-600 mb-6">{sec.description}</p>

                {/* Button */}
                <button
                  onClick={() => router.push(sec.path)}
                  className="w-full bg-gray-900 text-white px-4 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors duration-200 flex items-center justify-center"
                >
                  {sec.btn}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Note */}
        <div className="mt-12 text-center text-sm text-gray-500">
          <p>Select a section to manage your system configurations</p>
        </div>
      </div>
    </div>
  );
}