'use client';
import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Search, Folder, Info, Loader2 } from "lucide-react";
import { 
  fetchProjects, 
  createProject, 
  updateProject, 
  deleteProject 
} from "@/lib/api";
import {useAuth} from "@/context/AuthContext";


export default function ProjectsPage() {
    const [projects, setProjects] = useState([]);
    const [newProject, setNewProject] = useState({
        project_code: "",
        project_name: "",
    });
    const [editProject, setEditProject] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const {user,token,role} = useAuth();
    // Load data on component mount
    console.log("editProject",isEditing);
    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        try {
            setLoading(true);
            // console.log("token",token);
            const token = localStorage.getItem("token");
            if (!token) {
                setError("No authentication token found");
                return;
            }
            
            const data = await fetchProjects(token);
            setProjects(data || []);
        } catch (err) {
            setError("Failed to load projects: " + (err.message || "Unknown error"));
            console.error("Error loading projects:", err);
        } finally {
            setLoading(false);
        }
    };

    // ✅ Add Project
    const handleAdd = async () => {
        if (!newProject.project_code || !newProject.project_name) {
            setError("Please fill in required fields: Project Code and Project Name");
            return;
        }

        try {
            setSaving(true);
            // const token = localStorage.getItem("token");
            if (!token) {
                setError("No authentication token found");
                return;
            }

            await createProject(token, newProject);
            await loadProjects();
            setNewProject({ project_code: "", project_name: "" });
            setIsModalOpen(false);
        } catch (err) {
            setError("Failed to create project: " + (err.message || "Unknown error"));
            console.error("Error creating project:", err);
        } finally {
            setSaving(false);
        }
    };

    // ✅ Update Project
    const handleUpdate = async () => {
        console.log("hi",editProject);
        if (!editProject.project_name) {
            setError("Project name is required");
            return;
        }

        try {
            setSaving(true);
            // const token = localStorage.getItem("token");
            if (!token) {
                setError("No authentication token found");
                return;
            }

            await updateProject(token, editProject.project_code, { project_name: editProject.project_name });
            await loadProjects();
            setEditProject(null);
            setIsModalOpen(false);
            setIsEditing(false);
        } catch (err) {
            setError("Failed to update project: " + (err.message || "Unknown error"));
            console.error("Error updating project:", err);
        } finally {
            setSaving(false);
        }
    };

    // ✅ Delete Project with confirmation
    const handleDelete = async (id, name) => {
        if (window.confirm(`Are you sure you want to delete project "${name}"?`)) {
            try {
                //  const token = localStorage.getItem("token");
                if (!token) {
                    setError("No authentication token found");
                    return;
                }

                await deleteProject(token, id);
                await loadProjects();
            } catch (err) {
                setError("Failed to delete project: " + (err.message || "Unknown error"));
                console.error("Error deleting project:", err);
            }
        }
    };

    // ✅ Open Edit Modal
    const openEditModal = (project) => {
        setEditProject(project);
        setIsEditing(true);
        setIsModalOpen(true);
        setError(null);
    };

    // ✅ Open Add Modal
    const openAddModal = () => {
        setNewProject({ project_code: "", project_name: "" });
        setIsEditing(false);
        setIsModalOpen(true);
        setError(null);
    };

    // Filter projects based on search term
    const filteredProjects = projects.filter(project => 
        project.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.project_code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="font-default text-2xl font-bold text-gray-800 flex items-center">
                            <Folder className="mr-2" size={28} />
                            Project Management
                        </h1>
                        <p className="text-gray-600">Create and manage your projects</p>
                    </div>
                    <button
                        onClick={openAddModal}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
                    >
                        <Plus size={18} className="mr-2" />
                        Add Project
                    </button>
                </div>

                {/* Search Section */}
                <div className="bg-white rounded-lg p-4 shadow-sm mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search projects by name or code..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <div className="flex">
                            <div className="text-red-600 text-sm">{error}</div>
                            <button 
                                onClick={() => setError(null)}
                                className="ml-auto text-red-400 hover:text-red-600"
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                )}

                {/* Loading State */}
                {loading ? (
                    <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600 mb-4" />
                        <p className="text-gray-600">Loading projects...</p>
                    </div>
                ) : (
                    /* Projects Table */
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="font-default px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                                        <th className="font-default px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                        <th className="font-default px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                                        <th className="font-default px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created By</th>
                                        <th className="font-default px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Updated</th>
                                        <th className="font-default px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Updated By</th>
                                        <th className="font-default px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredProjects.length > 0 ? (
                                        filteredProjects.map((proj) => (
                                            <tr key={proj.id || proj.project_code} className="hover:bg-gray-50 transition duration-150">
                                                <td className="font-default px-6 py-4 text-sm font-medium text-gray-900">{proj.project_code}</td>
                                                <td className="px-6 py-4 text-sm text-gray-900">{proj.project_name}</td>
                                                <td className="px-6 py-4 text-sm text-gray-700">{proj.created}</td>
                                                <td className="px-6 py-4 text-sm text-gray-700">{proj.createdby || "N/A"}</td>
                                                <td className="px-6 py-4 text-sm text-gray-700">{proj.updated}</td>
                                                <td className="px-6 py-4 text-sm text-gray-700">{proj.updatedby || "N/A"}</td>
                                                <td className="px-6 py-4 text-sm text-gray-700">
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => openEditModal(proj)}
                                                            className="text-blue-600 hover:text-blue-800"
                                                            title="Edit"
                                                        >
                                                            <Edit size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(proj.id || proj.project_code, proj.project_name)}
                                                            className="text-red-600 hover:text-red-800"
                                                            title="Delete"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                                                {projects.length === 0 
                                                    ? "No projects found. Add a new project to get started." 
                                                    : "No projects match your search criteria."}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Info Section */}
                <div className="bg-blue-50 rounded-lg p-6 mt-6 border border-blue-200">
                    <div className="flex items-start">
                        <div className="bg-blue-100 p-3 rounded-lg mr-4">
                            <Info className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-blue-800 mb-2">Project Management Guide</h3>
                            <ul className="list-disc list-inside text-blue-700 space-y-1">
                                <li>Use the search bar to find projects by name or code</li>
                                <li>Click the "Add Project" button to create new projects</li>
                                <li>Use the edit and delete icons to modify or remove projects</li>
                                <li>Project codes must be unique for each project</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Project Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
                        <div className="flex justify-between items-center p-6 border-b">
                            <h2 className="text-xl font-semibold text-gray-800">
                                {isEditing ? "Edit Project" : "Add New Project"}
                            </h2>
                            <button 
                                onClick={() => setIsModalOpen(false)} 
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="p-6">
                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                                    <div className="text-red-600 text-sm">{error}</div>
                                </div>
                            )}
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Project Code {!isEditing && "*"}
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Enter unique project code"
                                        value={isEditing ? editProject.project_code : newProject.project_code}
                                        onChange={(e) =>
                                            isEditing
                                                ? setEditProject({ ...editProject, project_code: e.target.value })
                                                : setNewProject({ ...newProject, project_code: e.target.value })
                                        }
                                        disabled={isEditing}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    {isEditing && (
                                        <p className="text-xs text-gray-500 mt-1">Project code cannot be changed</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Project Name *</label>
                                    <input
                                        type="text"
                                        placeholder="Enter project name"
                                        value={isEditing ? editProject.project_name : newProject.project_name}
                                        onChange={(e) =>
                                            isEditing
                                                ? setEditProject({ ...editProject, project_name: e.target.value })
                                                : setNewProject({ ...newProject, project_name: e.target.value })
                                        }
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    disabled={saving}
                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={isEditing ? handleUpdate : handleAdd}
                                    disabled={saving || (isEditing ? !editProject.project_name : !newProject.project_code || !newProject.project_name)}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
                                >
                                    {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                                    {isEditing ? "Save Changes" : "Add Project"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}