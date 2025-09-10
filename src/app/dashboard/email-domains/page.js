"use client";
import { useState, useEffect } from "react";
import {
  Plus, Edit, Trash2, Search, Mail, Info, Loader2
} from "lucide-react";
import { 
  fetchEmailDomains, 
  createEmailDomain, 
  updateEmailDomain, 
  deleteEmailDomain 
} from "@/lib/api";
import {useAuth} from "@/context/AuthContext";
export default function EmailDomainsPage() {
  const [domains, setDomains] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDomain, setEditingDomain] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    domain_name: "",
  });
  const {user,token,role} = useAuth();
  // Load data on component mount
  useEffect(() => {
    loadEmailDomains();
  }, []);

  const loadEmailDomains = async () => {
    try {
      setLoading(true);
      // const token = localStorage.getItem("token");
      if (!token) {
        setError("No authentication token found");
        return;
      }
      
      const data = await fetchEmailDomains(token);
      setDomains(data || []);
    } catch (err) {
      setError("Failed to load email domains: " + (err.message || "Unknown error"));
      console.error("Error loading email domains:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter domains
  const filteredDomains = domains.filter(domain => {
    const matchesSearch =
      (domain.domain_name || "").toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  // const role = localStorage.getItem("role");

  // Modal handlers
  const handleAddNew = () => {
    setEditingDomain(null);
    setFormData({
      domain_name: "",
    });
    setIsModalOpen(true);
    setError(null);
  };

  const handleEdit = (domain) => {
    setEditingDomain(domain);
    setFormData({
      domain_name: domain.domain_name,
    });
    setIsModalOpen(true);
    setError(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingDomain(null);
    setError(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveDomain = async () => {
    if (!formData.domain_name) {
      setError("Please fill in required field: Domain Name");
      return;
    }

    try {
      setSaving(true);
      // const token = localStorage.getItem("token");
      if (!token) {
        setError("No authentication token found");
        return;
      }

      if (editingDomain) {
        await updateEmailDomain(token, editingDomain.emaildomain_id, formData);
      } else {
        await createEmailDomain(token, formData);
      }

      await loadEmailDomains();
      handleCloseModal();
    } catch (err) {
      setError("Failed to save email domain: " + (err.message || "Unknown error"));
      console.error("Error saving email domain:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (emaildomain_id) => {
    if (window.confirm("Are you sure you want to delete this email domain? This action cannot be undone.")) {
      try {
        //  const token = localStorage.getItem("token");
        if (!token) {
          setError("No authentication token found");
          return;
        }

        await deleteEmailDomain(token, emaildomain_id);
        await loadEmailDomains();
      } catch (err) {
        setError("Failed to delete email domain: " + (err.message || "Unknown error"));
        console.error("Error deleting email domain:", err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="font-default text-2xl font-bold text-gray-800 flex items-center">
              <Mail className="mr-2" size={28} />
              Email Domains Management
            </h1>
            <p className="text-gray-600">Configure and manage allowed email domains for user registration</p>
          </div>
         
            <button
              onClick={handleAddNew}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus size={18} className="mr-2" />
              Add Domain
            </button>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg p-4 shadow-sm mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search domains by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
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
            <p className="text-gray-600">Loading email domains...</p>
          </div>
        ) : (
          /* Domains Table */
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="font-default px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Domain Name</th>
                    <th className="font-default px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                    <th className="font-default px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created By</th>
                    <th className="font-default px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Updated</th>
                    <th className="font-default px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Updated By</th>
                    <th className="font-default px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredDomains.length > 0 ? (
                    filteredDomains.map((domain) => (
                      <tr key={domain.emaildomain_id} className="hover:bg-gray-50">
                        <td className="font-default px-6 py-4 text-sm font-medium text-gray-900">{domain.domain_name}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{domain.created}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{domain.createdby || "N/A"}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{domain.updated}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{domain.updatedby || "N/A"}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEdit(domain)}
                              className="text-blue-600 hover:text-blue-800"
                              title="Edit"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(domain.emaildomain_id)}
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
                      <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                        {domains.length === 0 
                          ? "No email domains found. Add a new domain to get started." 
                          : "No domains found matching your criteria."}
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
              <h3 className="text-lg font-semibold text-blue-800 mb-2">Email Domains Guide</h3>
              <ul className="list-disc list-inside text-blue-700 space-y-1">
                <li>Email domains control which email addresses can register for accounts</li>
                <li>Only users with email addresses from allowed domains can sign up</li>
                <li>Use the search bar to find domains by name</li>
                <li>Click the "Add Domain" button to create new allowed domains</li>
                <li>Use the edit and delete icons to modify or remove domains</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Domain Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-800">
                {editingDomain ? "Edit Email Domain" : "Add New Email Domain"}
              </h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 gap-4">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="text-red-600 text-sm">{error}</div>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Domain Name *</label>
                <input
                  type="text"
                  name="domain_name"
                  value={formData.domain_name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="example.com"
                />
                <p className="text-xs text-gray-500 mt-1">Enter the domain name (e.g., example.com, company.org)</p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 p-6 border-t">
              <button
                onClick={handleCloseModal}
                disabled={saving}
                className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveDomain}
                disabled={saving || !formData.domain_name}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {editingDomain ? "Save Changes" : "Add Domain"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
