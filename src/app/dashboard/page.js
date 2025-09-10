// app/dashboard/page.js
"use client";
import { ClipboardList, Users, Building2, Package, TrendingUp, Calendar, AlertCircle } from "lucide-react";
import { useState } from "react";

export default function DashboardHome() {
    const [stats, setStats] = useState([
        { name: "Requests", value: 42, icon: ClipboardList, color: "bg-blue-500", change: "+12%", trend: "up" },
        { name: "Employees", value: 15, icon: Users, color: "bg-green-500", change: "+5%", trend: "up" },
        { name: "Companies", value: 8, icon: Building2, color: "bg-purple-500", change: "+2", trend: "up" },
        { name: "Items", value: 120, icon: Package, color: "bg-orange-500", change: "-3%", trend: "down" },
    ]);

    const [recentActivity, setRecentActivity] = useState([
        { id: 1, type: "Request", user: "Alice", action: "created", item: "Laptop Request", time: "2 hours ago" },
        { id: 2, type: "Employee", user: "Admin", action: "added", item: "New team member", time: "5 hours ago" },
        { id: 3, type: "Item", user: "Bob", action: "updated", item: "Office Chair", time: "Yesterday" },
        { id: 4, type: "Company", user: "Admin", action: "registered", item: "TechSolutions Inc.", time: "2 days ago" },
    ]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="font-default text-2xl font-bold text-gray-800">Dashboard Overview</h1>
                <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-sm">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Today: {new Date().toLocaleDateString()}</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <div
                        key={stat.name}
                        className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="font-default text-gray-500 text-sm font-medium">{stat.name}</p>
                                <h2 className="text-3xl font-bold text-gray-800 mt-1">{stat.value}</h2>
                                <div className={`flex items-center mt-2 ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                                    <TrendingUp className={`w-4 h-4 ${stat.trend === 'down' ? 'rotate-180' : ''}`} />
                                    <span className="text-sm ml-1">{stat.change}</span>
                                </div>
                            </div>
                            <div
                                className={`w-12 h-12 rounded-lg flex items-center justify-center text-white ${stat.color}`}
                            >
                                <stat.icon className="w-6 h-6" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="font-default text-lg font-semibold text-gray-800">Recent Activity</h2>
                        <button className="text-sm text-blue-600 hover:text-blue-800">View All</button>
                    </div>
                    <div className="space-y-4">
                        {recentActivity.map((activity) => (
                            <div key={activity.id} className="flex items-start">
                                <div className="flex-shrink-0">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                        <AlertCircle className="w-5 h-5 text-blue-600" />
                                    </div>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-900">
                                        {activity.user} <span className="font-normal">{activity.action}</span> {activity.item}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="font-default text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <button className="flex flex-col items-center justify-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                            <ClipboardList className="w-8 h-8 text-blue-600 mb-2" />
                            <span className="text-sm font-medium text-gray-800">New Request</span>
                        </button>
                        <button className="flex flex-col items-center justify-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                            <Users className="w-8 h-8 text-green-600 mb-2" />
                            <span className="text-sm font-medium text-gray-800">Add Employee</span>
                        </button>
                        <button className="flex flex-col items-center justify-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                            <Building2 className="w-8 h-8 text-purple-600 mb-2" />
                            <span className="text-sm font-medium text-gray-800">Register Company</span>
                        </button>
                        <button className="flex flex-col items-center justify-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
                            <Package className="w-8 h-8 text-orange-600 mb-2" />
                            <span className="text-sm font-medium text-gray-800">Add Item</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}