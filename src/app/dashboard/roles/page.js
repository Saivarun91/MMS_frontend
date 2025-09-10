"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    MoreHorizontal,
    Plus,
    ChevronDown,
    ChevronRight,
    Eye,
    Edit,
    Trash2,
    Shield,
    X,
    Search,
    Check,
    Copy,
    FilePlus2,
    Filter,
    Key,
    UserCog,
    Save,
    Lock
} from "lucide-react";
import {
    fetchPermissions,
    fetchRolesWithPermissions,
    fetchRoles,
    createRole,
    updateRole,
    deleteRole,
    updateRolePermissions,
    assignRolePermissions,
    removeRolePermission
} from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function RolesPage() {
    const { token, loading } = useAuth();

    // ---- Server state ----
    const [roles, setRoles] = useState([]);
    const [availablePermissions, setAvailablePermissions] = useState([]);

    // ---- UI state ----
    const [expandedRoleId, setExpandedRoleId] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [toast, setToast] = useState({ show: false, message: "", type: "success" });
    const [openMenuFor, setOpenMenuFor] = useState(null);
    const menuRef = useRef(null);

    // Modals
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [roleModalMode, setRoleModalMode] = useState("add");
    const [editingRole, setEditingRole] = useState(null);
    const [showTemplateModal, setShowTemplateModal] = useState(false);

    const [unassignedPermissions, setUnassignedPermissions] = useState([]);
    const [roleForm, setRoleForm] = useState({ role_name: "", role_priority: "" });

    // Staged permission assignments
    const [stagedAssignments, setStagedAssignments] = useState([]);

    // For template copy flow
    const [selectedTemplate, setSelectedTemplate] = useState("");
    const [templatePermissionIds, setTemplatePermissionIds] = useState([]);
    const [templateSelection, setTemplateSelection] = useState({});

    // ------- Helpers -------
    const showToast = (message, type = "success") => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: "", type: "success" }), 2600);
    };

    const closeMenusOnOutsideClick = (e) => {
        if (!e.target.closest?.(".dropdown")) setOpenMenuFor(null);
    };

    useEffect(() => {
        document.addEventListener("mousedown", closeMenusOnOutsideClick);
        return () => document.removeEventListener("mousedown", closeMenusOnOutsideClick);
    }, []);

    // ------- Load server data -------
    useEffect(() => {
        if (loading || !token) return;

        (async () => {
            try {
                const perms = await fetchPermissions(token);
                const normalized = (perms || []).map((p) => {
                    let templates = [];

                    if (p.template_roles && typeof p.template_roles === "object") {
                        templates = Object.keys(p.template_roles).filter(
                            (t) => p.template_roles[t]?.enabled === true
                        );
                    }

                    return {
                        permission_id: p.permission_id,
                        name: p.permission_name,
                        description: p.permission_description || "",
                        templateRoles: templates,
                    };
                });
                setAvailablePermissions(normalized);
            } catch (err) {
                console.error(err);
                showToast("Failed to load permissions", "error");
            }
        })();
    }, [loading, token]);

    const loadRoles = async () => {
        const data = await fetchRolesWithPermissions(token);
        const mapped = (data?.roles || []).map((r) => ({
            id: r.id,
            role_name: r.role_name,
            role_priority: r.role_priority ?? "",
            permissions: (r.permissions || []).reduce((acc, p) => {
                acc[p.permission_id] = {
                    name: p.permission_name,
                    can_create: !!p.can_create,
                    can_update: !!p.can_update,
                    can_delete: !!p.can_delete,
                    can_export: !!p.can_export,
                };
                return acc;
            }, {}),
        }));
        setRoles(mapped);
    };

    useEffect(() => {
        if (loading || !token) return;
        loadRoles().catch((e) => {
            console.error(e);
            showToast("Failed to load roles", "error");
        });
    }, [loading, token]);

    const filteredRoles = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return roles;
        return roles.filter((r) =>
            (r.role_name || "").toLowerCase().includes(q) ||
            (r.role_priority + "").toLowerCase().includes(q)
        );
    }, [roles, searchQuery]);

    // ------- CRUD: Roles -------
    const openAddRole = () => {
        setRoleModalMode("add");
        setEditingRole(null);
        setRoleForm({ role_name: "", role_priority: "" });
        setStagedAssignments([]);
        setShowRoleModal(true);
    };

    const openEditRole = (role) => {
        setRoleModalMode("edit");
        setEditingRole(role);
        setRoleForm({
            role_name: role.role_name || "",
            role_priority: role.role_priority || "",
        });
        setStagedAssignments([]);

        const assignedIds = Object.keys(role.permissions || {}).map((id) => Number(id));
        const unassigned = availablePermissions.filter(
            (p) => !assignedIds.includes(p.permission_id)
        );

        setUnassignedPermissions(unassigned);
        setShowRoleModal(true);
    };

    const saveRole = async (e) => {
        e.preventDefault();
        if (!token) return showToast("Not authenticated", "error");

        try {
            if (roleModalMode === "add") {
                const res = await createRole(token, {
                    role_name: roleForm.role_name?.trim(),
                    role_priority: roleForm.role_priority ? Number(roleForm.role_priority) : null,
                });
                showToast(res?.message || "Role created");

                if (stagedAssignments.length) {
                    await assignRolePermissions(token, {
                        role_name: roleForm.role_name?.trim(),
                        assignments: stagedAssignments,
                    });
                }
            } else if (roleModalMode === "edit" && editingRole) {
                const res = await updateRole(token, editingRole.id, {
                    role_name: roleForm.role_name?.trim(),
                    role_priority: roleForm.role_priority ? Number(roleForm.role_priority) : null,
                });
                showToast(res?.message || "Role updated");

                if (stagedAssignments.length) {
                    await assignRolePermissions(token, {
                        role_name: roleForm.role_name?.trim(),
                        assignments: stagedAssignments,
                    });
                }
            }

            await loadRoles();
            closeRoleModal();
        } catch (err) {
            console.error(err);
            const msg = err?.response?.data?.error || err?.message || "Operation failed";
            showToast(msg, "error");
        }
    };

    const deleteRoleAction = async (roleId) => {
        try {
            const res = await deleteRole(token, roleId);
            showToast(res?.message || "Role deleted");
            await loadRoles();
        } catch (err) {
            console.error(err);
            const msg = err?.response?.data?.error || err?.message || "Delete failed";
            showToast(msg, "error");
        }
    };

    const closeRoleModal = () => {
        setShowRoleModal(false);
        setEditingRole(null);
        setRoleForm({ role_name: "", role_priority: "" });
        setStagedAssignments([]);
    };

    // ------- Permission toggles -------
    const toggleAssigned = async (role, permission_id, field) => {
        const current = role.permissions?.[permission_id]?.[field] || false;
        setRoles((prev) =>
            prev.map((r) => {
                if (r.id !== role.id) return r;
                return {
                    ...r,
                    permissions: {
                        ...r.permissions,
                        [permission_id]: {
                            ...r.permissions[permission_id],
                            [field]: !current,
                        },
                    },
                };
            })
        );

        try {
            await updateRolePermissions(token, {
                role_name: role.role_name,
                updates: [{ permission_id, [field]: !current }],
            });
            showToast("Permission updated");
        } catch (err) {
            console.error(err);
            showToast("Failed to update permission", "error");
            setRoles((prev) =>
                prev.map((r) => {
                    if (r.id !== role.id) return r;
                    return {
                        ...r,
                        permissions: {
                            ...r.permissions,
                            [permission_id]: {
                                ...r.permissions[permission_id],
                                [field]: current,
                            },
                        },
                    };
                })
            );
        }
    };

    // ------- Template copy flow -------
    const allTemplateNames = useMemo(() => {
        const set = new Set();
        availablePermissions.forEach((p) => (p.templateRoles || []).forEach((t) => set.add(t)));
        return Array.from(set).sort();
    }, [availablePermissions]);

    const openTemplateModal = (role) => {
        if (role) setEditingRole(role);
        setSelectedTemplate("");
        setTemplatePermissionIds([]);
        setTemplateSelection({});
        setShowTemplateModal(true);
    };

    const pickTemplate = (tpl) => {
        setSelectedTemplate(tpl);
        const ids = availablePermissions
            .filter((p) => (p.templateRoles || []).includes(tpl))
            .map((p) => p.permission_id);
        setTemplatePermissionIds(ids);
        const sel = {};
        ids.forEach((id) => (sel[id] = true));
        setTemplateSelection(sel);
    };

    const applyTemplateToRole = async () => {
        if (!editingRole && roleForm.role_name.trim() === "") {
            return showToast("Choose or create a role first", "error");
        }

        const selectedIds = templatePermissionIds.filter((id) => templateSelection[id]);
        if (!selectedIds.length) return showToast("Select at least one permission", "error");

        const assignments = selectedIds.map((permission_id) => ({
            permission_id,
            can_create: false,
            can_update: false,
            can_delete: false,
            can_export: false,
        }));

        try {
            const role_name = editingRole ? editingRole.role_name : roleForm.role_name?.trim();
            await assignRolePermissions(token, { role_name, assignments });
            showToast(`${assignments.length} permission(s) added from template`);
            setShowTemplateModal(false);
            await loadRoles();
        } catch (err) {
            console.error(err);
            showToast("Failed to apply template", "error");
        }
    };

    // Toggle permission selection in add role modal
    const togglePermissionSelection = (permission_id) => {
        setStagedAssignments(prev => {
            const existingIndex = prev.findIndex(a => a.permission_id === permission_id);

            if (existingIndex >= 0) {
                // Remove if exists
                return prev.filter(a => a.permission_id !== permission_id);
            } else {
                // Add with default false values
                return [...prev, {
                    permission_id,
                    can_create: false,
                    can_update: false,
                    can_delete: false,
                    can_export: false
                }];
            }
        });
    };

    // Update permission flags in add role modal
    const updatePermissionFlag = (permission_id, field, value) => {
        setStagedAssignments(prev =>
            prev.map(a =>
                a.permission_id === permission_id
                    ? { ...a, [field]: value }
                    : a
            )
        );
    };

    return (
        <div className="p-6 text-gray-800 bg-gray-50 min-h-screen">
            {/* Toast */}
            {toast.show && (
                <div
                    className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg transition-all duration-300 ${toast.type === "error" ? "bg-red-100 text-red-800 border border-red-200" : "bg-green-100 text-green-800 border border-green-200"
                        }`}
                >
                    <div className="flex items-center gap-2">
                        {toast.type === "error" ? <X size={18} /> : <Check size={18} />}
                        <span>{toast.message}</span>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-indigo-900 flex items-center gap-2">
                        <UserCog className="text-indigo-600" /> User Roles
                    </h1>
                    <p className="text-sm text-gray-600 mt-1">Create roles and manage their permissions</p>
                </div>
                <div className="flex items-center gap-3">

                    <button
                        onClick={openAddRole}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow flex items-center gap-2 hover:bg-indigo-700 transition-colors"
                    >
                        <Plus size={16} /> Add Role
                    </button>
                </div>
            </div>

            {/* Search */}
            <div className="mb-6">
                <div className="relative max-w-md">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                        placeholder="Search by role name or priority"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Roles table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-indigo-50 text-indigo-900">
                        <tr>
                            <th className="w-10 px-4 py-3"></th>
                            <th className="px-4 py-3 text-left">Role Name</th>
                            <th className="px-4 py-3 text-left">Priority</th>
                            <th className="px-4 py-3 text-left">Permissions</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredRoles.map((role) => {
                            const permCount = Object.keys(role.permissions || {}).length;
                            return (
                                <React.Fragment key={role.id}>
                                    <tr
                                        className="border-b border-gray-100 hover:bg-indigo-50/40 transition-colors group"
                                        onClick={() => setExpandedRoleId(expandedRoleId === role.id ? null : role.id)}
                                    >
                                        <td className="px-4 py-3">
                                            {expandedRoleId === role.id ? (
                                                <ChevronDown size={16} className="text-indigo-600" />
                                            ) : (
                                                <ChevronRight size={16} className="text-gray-400 group-hover:text-indigo-500" />
                                            )}
                                        </td>
                                        <td className="px-4 py-3 font-medium flex items-center gap-2">
                                            <span className="p-1.5 bg-indigo-100 rounded-full"><Shield size={16} className="text-indigo-600" /></span>
                                            {role.role_name}
                                        </td>
                                        <td className="px-4 py-3">
                                            {role.role_priority === "" || role.role_priority == null
                                                ? <span className="text-gray-400">—</span>
                                                : <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">{role.role_priority}</span>
                                            }
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1">
                                                <Key size={14} className="text-gray-400" />
                                                <span>{permCount} permission{permCount !== 1 ? 's' : ''}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex justify-end gap-1">
                                                <button
                                                    className="p-2 rounded hover:bg-indigo-100 text-gray-600 hover:text-indigo-700"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        openEditRole(role);
                                                    }}
                                                    title="Edit role"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    className="p-2 rounded hover:bg-indigo-100 text-gray-600 hover:text-indigo-700"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        openTemplateModal(role);
                                                    }}
                                                    title="Copy template"
                                                >
                                                    <Copy size={16} />
                                                </button>
                                                <button
                                                    className="p-2 rounded hover:bg-red-100 text-gray-600 hover:text-red-700"
                                                    onClick={async (e) => {
                                                        e.stopPropagation();
                                                        if (confirm(`Are you sure you want to delete "${role.role_name}"?`)) {
                                                            await deleteRoleAction(role.id);
                                                        }
                                                    }}
                                                    title="Delete role"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>

                                    {/* Expanded row: permissions with toggles */}
                                    {expandedRoleId === role.id && (
                                        <tr>
                                            <td colSpan={5} className="px-4 py-4 bg-indigo-50/20">
                                                <div className="flex flex-col md:flex-row gap-6">
                                                    {/* Permissions list */}
                                                    <div className="flex-1">
                                                        <h3 className="font-medium text-indigo-800 mb-3 flex items-center gap-2">
                                                            <Lock size={16} /> Assigned Permissions
                                                        </h3>

                                                        {Object.keys(role.permissions || {}).length === 0 ? (
                                                            <div className="text-sm text-gray-500 p-4 bg-gray-50 rounded-lg text-center">
                                                                No permissions assigned yet.
                                                            </div>
                                                        ) : (
                                                            <div className="grid gap-3">
                                                                {Object.entries(role.permissions).map(([pid, access]) => (
                                                                    <div key={pid} className="bg-white border flex border-gray-200 rounded-lg p-3 shadow-sm">
                                                                        <div className=" items-center justify-between mb-3 w-1/2">
                                                                            <div className="font-medium text-indigo-700">{access.name}</div>
                                                                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">ID: {pid}</span>
                                                                        </div>
                                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                                                            {["can_create", "can_update", "can_delete", "can_export"].map((field) => (
                                                                                <label key={field} className="flex items-center gap-2 text-sm p-2 rounded  hover:bg-indigo-50/50 transition-colors cursor-pointer">
                                                                                    <input
                                                                                        type="checkbox"
                                                                                        checked={!!access[field]}
                                                                                        onChange={() => toggleAssigned(role, Number(pid), field)}
                                                                                        className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                                                                                    />
                                                                                    <span className="capitalize">{field.replace("can_", "")}</span>
                                                                                </label>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>


                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </tbody>
                </table>

                {filteredRoles.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                        {searchQuery ? "No roles match your search" : "No roles found. Create your first role to get started."}
                    </div>
                )}
            </div>

            {/* Add / Edit role modal */}
            {showRoleModal && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-indigo-900 flex items-center gap-2">
                                {roleModalMode === "add" ? <Plus size={18} /> : <Edit size={18} />}
                                {roleModalMode === "add" ? "Add Role" : "Edit Role"}
                            </h2>
                            <button onClick={closeRoleModal} className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={saveRole} className="space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Role Name *</label>
                                    <input
                                        value={roleForm.role_name}
                                        onChange={(e) => setRoleForm((s) => ({ ...s, role_name: e.target.value }))}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        required
                                        placeholder="e.g., Administrator"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={roleForm.role_priority}
                                        onChange={(e) => setRoleForm((s) => ({ ...s, role_priority: e.target.value }))}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="Optional priority number"
                                    />
                                </div>
                            </div>

                            {/* Permissions selection integrated into the modal */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-sm font-medium text-gray-700">Permissions</h3>
                                    <span className="text-xs text-gray-500">
                                        {stagedAssignments.length} permission(s) selected
                                    </span>
                                </div>

                                <div className="border border-gray-200 rounded-lg divide-y divide-gray-200 max-h-64 overflow-y-auto">
                                    {/* Permissions selection integrated into the modal */}
                                    <div>


                                        <div className="border border-gray-200 rounded-lg divide-y divide-gray-200 max-h-64 overflow-y-auto">
                                            {roleModalMode === "edit" ? (
                                                <div>
                                                    {/* ---- Assigned permissions ---- */}
                                                    <div className="mb-4">
                                                        <h4 className="text-sm font-semibold text-indigo-700 mb-2">Already Assigned</h4>
                                                        {Object.entries(editingRole?.permissions || {}).length === 0 ? (
                                                            <div className="p-3 text-gray-500 text-sm bg-gray-50 rounded">
                                                                No permissions assigned yet.
                                                            </div>
                                                        ) : (
                                                            Object.entries(editingRole.permissions).map(([pid, access]) => (
                                                                <div
                                                                    key={pid}
                                                                    className="p-3 border rounded-lg mb-2 flex flex-col gap-2 bg-white"
                                                                >
                                                                    <div className="flex justify-between items-center">
                                                                        <div>
                                                                            <div className="font-medium">{access.name}</div>
                                                                            <span className="text-xs text-gray-500">ID: {pid}</span>
                                                                        </div>
                                                                        <button
                                                                            className="text-red-500 hover:text-red-700"
                                                                            onClick={async (e) => {
                                                                                e.stopPropagation();
                                                                                if (
                                                                                    confirm(
                                                                                        `Remove permission "${access.name}" from ${editingRole.role_name}?`
                                                                                    )
                                                                                ) {
                                                                                    try {
                                                                                        await removeRolePermission(
                                                                                            token,
                                                                                            editingRole.role_name,
                                                                                            Number(pid)
                                                                                        );
                                                                                        showToast("Permission removed");
                                                                                        await loadRoles();
                                                                                    } catch (err) {
                                                                                        console.error(err);
                                                                                        showToast("Failed to remove permission", "error");
                                                                                    }
                                                                                }
                                                                            }}
                                                                        >
                                                                            <Trash2 size={14} />
                                                                        </button>
                                                                    </div>

                                                                    {/* Permission flags */}
                                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                                                        {["can_create", "can_update", "can_delete", "can_export"].map(
                                                                            (field) => (
                                                                                <label
                                                                                    key={field}
                                                                                    className="flex items-center gap-2 text-xs"
                                                                                >
                                                                                    <input
                                                                                        type="checkbox"
                                                                                        checked={!!access[field]}
                                                                                        onChange={() =>
                                                                                            toggleAssigned(editingRole, Number(pid), field)
                                                                                        }
                                                                                        className="w-3.5 h-3.5 text-indigo-600 rounded focus:ring-indigo-500"
                                                                                    />
                                                                                    <span className="capitalize">
                                                                                        {field.replace("can_", "")}
                                                                                    </span>
                                                                                </label>
                                                                            )
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ))
                                                        )}
                                                    </div>

                                                    {/* ---- Unassigned permissions ---- */}
                                                    <div>
                                                        <h4 className="text-sm font-semibold text-gray-700 mb-2">
                                                            Add More Permissions
                                                        </h4>
                                                        {unassignedPermissions.length === 0 ? (
                                                            <div className="p-4 text-center text-gray-500">
                                                                All permissions are already assigned to this role.
                                                            </div>
                                                        ) : (
                                                            unassignedPermissions.map((p) => {
                                                                const isSelected = stagedAssignments.some(
                                                                    (a) => a.permission_id === p.permission_id
                                                                );
                                                                const assignment =
                                                                    stagedAssignments.find(
                                                                        (a) => a.permission_id === p.permission_id
                                                                    ) || {};

                                                                return (
                                                                    <div
                                                                        key={p.permission_id}
                                                                        className="p-3 hover:bg-indigo-50/30 transition-colors"
                                                                    >
                                                                        <label className="flex items-start gap-3 cursor-pointer">
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={isSelected}
                                                                                onChange={() => togglePermissionSelection(p.permission_id)}
                                                                                className="mt-1 w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                                                                            />
                                                                            <div className="flex-1">
                                                                                <div className="font-medium">{p.name}</div>
                                                                                {p.description && (
                                                                                    <div className="text-xs text-gray-500 mt-1">
                                                                                        {p.description}
                                                                                    </div>
                                                                                )}

                                                                                {/* Permission flags */}
                                                                                {isSelected && (
                                                                                    <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
                                                                                        {["can_create", "can_update", "can_delete", "can_export"].map(
                                                                                            (field) => (
                                                                                                <label
                                                                                                    key={field}
                                                                                                    className="flex items-center gap-2 text-xs"
                                                                                                >
                                                                                                    <input
                                                                                                        type="checkbox"
                                                                                                        checked={!!assignment[field]}
                                                                                                        onChange={(e) =>
                                                                                                            updatePermissionFlag(
                                                                                                                p.permission_id,
                                                                                                                field,
                                                                                                                e.target.checked
                                                                                                            )
                                                                                                        }
                                                                                                        className="w-3.5 h-3.5 text-indigo-600 rounded focus:ring-indigo-500"
                                                                                                    />
                                                                                                    <span className="capitalize">
                                                                                                        {field.replace("can_", "")}
                                                                                                    </span>
                                                                                                </label>
                                                                                            )
                                                                                        )}
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </label>
                                                                    </div>
                                                                );
                                                            })
                                                        )}
                                                    </div>
                                                </div>
                                            ) : (
                                                // -------- ADD MODE --------
                                                availablePermissions.length === 0 ? (
                                                    <div className="p-4 text-center text-gray-500">
                                                        Loading permissions...
                                                    </div>
                                                ) : (
                                                    availablePermissions.map((p) => {
                                                        const isSelected = stagedAssignments.some(
                                                            (a) => a.permission_id === p.permission_id
                                                        );
                                                        const assignment =
                                                            stagedAssignments.find(
                                                                (a) => a.permission_id === p.permission_id
                                                            ) || {};

                                                        return (
                                                            <div
                                                                key={p.permission_id}
                                                                className="p-3 hover:bg-indigo-50/30 transition-colors"
                                                            >
                                                                <label className="flex items-start gap-3 cursor-pointer">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={isSelected}
                                                                        onChange={() => togglePermissionSelection(p.permission_id)}
                                                                        className="mt-1 w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                                                                    />
                                                                    <div className="flex-1">
                                                                        <div className="font-medium">{p.name}</div>
                                                                        {p.description && (
                                                                            <div className="text-xs text-gray-500 mt-1">
                                                                                {p.description}
                                                                            </div>
                                                                        )}

                                                                        {/* Permission flags */}
                                                                        {isSelected && (
                                                                            <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
                                                                                {["can_create", "can_update", "can_delete", "can_export"].map(
                                                                                    (field) => (
                                                                                        <label
                                                                                            key={field}
                                                                                            className="flex items-center gap-2 text-xs"
                                                                                        >
                                                                                            <input
                                                                                                type="checkbox"
                                                                                                checked={!!assignment[field]}
                                                                                                onChange={(e) =>
                                                                                                    updatePermissionFlag(
                                                                                                        p.permission_id,
                                                                                                        field,
                                                                                                        e.target.checked
                                                                                                    )
                                                                                                }
                                                                                                className="w-3.5 h-3.5 text-indigo-600 rounded focus:ring-indigo-500"
                                                                                            />
                                                                                            <span className="capitalize">
                                                                                                {field.replace("can_", "")}
                                                                                            </span>
                                                                                        </label>
                                                                                    )
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </label>
                                                            </div>
                                                        );
                                                    })
                                                )
                                            )}
                                        </div>
                                    </div>

                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={closeRoleModal}
                                    className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors flex items-center gap-2"
                                >
                                    <Save size={16} /> Save Role
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Template modal */}
            {showTemplateModal && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-indigo-900 flex items-center gap-2">
                                <Copy size={18} /> Copy from Template
                            </h3>
                            <button onClick={() => setShowTemplateModal(false)} className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="mb-5">
                            <div className="text-sm font-medium text-gray-700 mb-2">Select a template role:</div>
                            <div className="flex flex-wrap gap-2">
                                {allTemplateNames.length === 0 && (
                                    <span className="text-sm text-gray-500">No template roles found in permissions</span>
                                )}
                                {allTemplateNames.map((t) => (
                                    <button
                                        key={t}
                                        onClick={() => pickTemplate(t)}
                                        className={`px-4 py-2 rounded-full text-sm border transition-colors ${selectedTemplate === t
                                            ? "bg-indigo-600 text-white border-indigo-600"
                                            : "bg-white text-gray-700 border-gray-300 hover:bg-indigo-50 hover:border-indigo-300"
                                            }`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {selectedTemplate && (
                            <div className="mt-5 pt-5 border-t border-gray-200">
                                <div className="text-sm font-medium text-gray-700 mb-3">
                                    Permissions in template <span className="text-indigo-600">&quot;{selectedTemplate}&quot;</span>
                                </div>
                                <div className="grid md:grid-cols-2 gap-3 max-h-64 overflow-y-auto p-1">
                                    {templatePermissionIds.map((id) => {
                                        const p = availablePermissions.find((x) => x.permission_id === id);
                                        return (
                                            <div key={id} className="border border-gray-200 rounded-lg p-3 hover:bg-indigo-50/30 transition-colors">
                                                <label className="flex items-start gap-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={!!templateSelection[id]}
                                                        onChange={(e) => setTemplateSelection((s) => ({ ...s, [id]: e.target.checked }))}
                                                        className="mt-1 w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                                                    />
                                                    <div>
                                                        <div className="font-medium">{p?.name || id}</div>
                                                        {p?.description && (
                                                            <div className="text-xs text-gray-500 mt-1">{p.description}</div>
                                                        )}
                                                    </div>
                                                </label>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="flex justify-end gap-3 mt-5 pt-4 border-t border-gray-200">
                                    <button
                                        className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                                        onClick={() => setShowTemplateModal(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        className="px-5 py-2.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors flex items-center gap-2"
                                        onClick={applyTemplateToRole}
                                    >
                                        <Copy size={16} /> Apply to Role
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
