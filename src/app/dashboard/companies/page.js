"use client";
import { useState, useEffect } from "react";
import {
  Plus, Edit, Trash2, Search, Building, Info, Loader2, X
} from "lucide-react";
import { 
  fetchCompanies, 
  createCompany, 
  updateCompany, 
  deleteCompany 
} from "@/lib/api";
import {useAuth} from "@/context/AuthContext";

export default function CompaniesPage() {
  const [companies, setCompanies] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const {user,token,role} = useAuth();
  const [formData, setFormData] = useState({
    company_name: "",
    contact: "",
  });

  // Load data on component mount
  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No authentication token found");
        return;
      }
      
      const data = await fetchCompanies(token);
      setCompanies(data || []);
    } catch (err) {
      setError("Failed to load companies: " + (err.response?.data?.message || err.message || "Unknown error"));
      console.error("Error loading companies:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter companies
  const filteredCompanies = companies.filter(company => {
    const matchesSearch =
      (company.company_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (company.contact || "").toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  // const role = localStorage.getItem("role");

  // Modal handlers
  const handleAddNew = () => {
    setEditingCompany(null);
    setFormData({
      company_name: "",
      contact: "",
    });
    setIsModalOpen(true);
    setError(null);
  };

  const handleEdit = (company) => {
    setEditingCompany(company);
    setFormData({
      company_name: company.company_name,
      contact: company.contact || "",
    });
    setIsModalOpen(true);
    setError(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCompany(null);
    setError(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveCompany = async () => {
    if (!formData.company_name.trim()) {
      setError("Please fill in required field: Company Name");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No authentication token found");
        return;
      }

      if (editingCompany) {
        await updateCompany(token, editingCompany.company_name, formData);
      } else {
        await createCompany(token, formData);
      }

      await loadCompanies();
      handleCloseModal();
    } catch (err) {
      setError("Failed to save company: " + (err.response?.data?.message || err.message || "Unknown error"));
      console.error("Error saving company:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (company_name) => {
    if (window.confirm("Are you sure you want to delete this company? This action cannot be undone.")) {
      try {
        setError(null);
        const token = localStorage.getItem("token");
        if (!token) {
          setError("No authentication token found");
          return;
        }

        await deleteCompany(token, company_name);
        await loadCompanies();
      } catch (err) {
        setError("Failed to delete company: " + (err.response?.data?.message || err.message || "Unknown error"));
        console.error("Error deleting company:", err);
      }
    }
  };
  console.log("role",role);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="font-default text-3xl font-bold text-gray-900 flex items-center mb-2">
              <div className="bg-blue-100 p-3 rounded-xl mr-4">
                <Building className="text-blue-600" size={32} />
              </div>
              Companies Management
            </h1>
            <p className="text-gray-600 text-lg">Manage company information and organizational structure</p>
          </div>
          {role === "Admin" && (
            <button
              onClick={handleAddNew}
              className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Plus size={20} className="mr-2" />
              Add Company
            </button>
          )}
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg p-4 shadow-sm mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search companies by name or contact..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
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
            <p className="text-gray-600">Loading companies...</p>
          </div>
        ) : (
          /* Companies Table */
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="font-default px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Company Name</th>
                    <th className="font-default px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Contact</th>
                    <th className="font-default px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Created</th>
                    <th className="font-default px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Updated</th>
                    <th className="font-default px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCompanies.length > 0 ? (
                    filteredCompanies.map((company) => (
                      <tr key={company.company_name} className="hover:bg-gray-50 transition-colors duration-200">
                        <td className="font-default px-6 py-4 text-sm font-medium text-gray-900">{company.company_name}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{company.contact || "N/A"}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{company.created ? new Date(company.created).toLocaleDateString() : "N/A"}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{company.updated ? new Date(company.updated).toLocaleDateString() : "N/A"}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEdit(company)}
                              className="text-blue-600 hover:text-blue-800 transition-colors duration-200 p-1 rounded hover:bg-blue-50"
                              title="Edit"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(company.company_name)}
                              className="text-red-600 hover:text-red-800 transition-colors duration-200 p-1 rounded hover:bg-red-50"
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
                      <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                        {companies.length === 0 
                          ? "No companies found. Add a new company to get started." 
                          : "No companies found matching your criteria."}
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
              <h3 className="text-lg font-semibold text-blue-800 mb-2">Companies Guide</h3>
              <ul className="list-disc list-inside text-blue-700 space-y-1">
                <li>Companies represent different organizations in the system</li>
                <li>Users are associated with companies for organizational structure</li>
                <li>Use the search bar to find companies by name</li>
                <li>Click the &quot;Add Company&quot; button to create new companies</li>
                <li>Use the edit and delete icons to modify or remove companies</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Company Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <Building className="mr-3 text-blue-600" size={24} />
                {editingCompany ? "Edit Company" : "Add New Company"}
              </h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-2 rounded-lg hover:bg-gray-100">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 gap-4">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="text-red-600 text-sm">{error}</div>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
                <input
                  type="text"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter company name"
                  maxLength={20}
                />
                <p className="text-xs text-gray-500 mt-1">Enter the full company name (max 20 characters)</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact</label>
                <input
                  type="text"
                  name="contact"
                  value={formData.contact}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter contact information"
                  maxLength={20}
                />
                <p className="text-xs text-gray-500 mt-1">Optional contact information (max 20 characters)</p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={handleCloseModal}
                disabled={saving}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCompany}
                disabled={saving || !formData.company_name.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {editingCompany ? "Save Changes" : "Add Company"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
