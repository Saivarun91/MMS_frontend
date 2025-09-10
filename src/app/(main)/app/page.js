// page.js (Home) - Complete Redesign with Enhanced UI
"use client";
import { useState, useEffect } from "react";
import { Search, Plus, Filter, Check, ChevronRight, X, MessageCircle, Package, BarChart3, Users, Bell, User, LogOut } from "lucide-react";

export default function Home() {
  const [searchByNumber, setSearchByNumber] = useState("");
  const [searchByDescription, setSearchByDescription] = useState("");
  const [numberResults, setNumberResults] = useState(null);
  const [descriptionResults, setDescriptionResults] = useState(null);
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [showNewMaterialModal, setShowNewMaterialModal] = useState(false);
  const [showNewGroupModal, setShowNewGroupModal] = useState(false);
  const [newMaterialComment, setNewMaterialComment] = useState("");
  const [newGroupComment, setNewGroupComment] = useState("");
  // const [userName, setUserName] = useState("");
  const [activeTab, setActiveTab] = useState("materials");

  // useEffect(() => {
  //   if (typeof window !== "undefined") {
  //     const name = localStorage.getItem("userName") || "User";
  //     setUserName(name);
  //   }
  // }, []);

  const handleLogout = () => {
    // if (typeof window !== "undefined") {
    //   localStorage.removeItem("isLoggedIn");
    //   localStorage.removeItem("userName");
    // }
    window.location.href = "/login";
  };

  // Sample data for demonstration
  const sampleMaterials = [
    { id: "MAT001", description: "Stainless Steel Bolt 10mm", group: "Fasteners", match: 95 },
    { id: "MAT002", description: "Stainless Steel Nut 10mm", group: "Fasteners", match: 87 },
    { id: "MAT005", description: "Steel Bolt 10mm Galvanized", group: "Fasteners", match: 78 },
    { id: "MAT008", description: "Stainless Steel Washer 10mm", group: "Fasteners", match: 72 },
    { id: "MAT012", description: "Stainless Steel Anchor Bolt", group: "Anchors", match: 65 },
  ];

  const sampleGroups = [
    { id: "GRP001", name: "Fasteners", description: "Nuts, bolts, screws and washers", relevance: 92 },
    { id: "GRP005", name: "Metal Components", description: "Various metal parts and components", relevance: 85 },
    { id: "GRP008", name: "Construction Hardware", description: "Hardware for construction purposes", relevance: 76 },
  ];

  const stats = [
    { label: "Total Materials", value: "1,248", icon: Package, change: "+12% this month" },
    { label: "Material Groups", value: "42", icon: BarChart3, change: "+3 new groups" },
    { label: "Active Users", value: "86", icon: Users, change: "+5 this week" },
  ];

  const handleSearchByNumber = () => {
    if (!searchByNumber.trim()) {
      showToast("Please enter a material number", "error");
      return;
    }

    // Simulate API call
    setTimeout(() => {
      // For demo purposes, let's assume MAT001 and MAT005 exist
      if (searchByNumber.toUpperCase() === "MAT001") {
        setNumberResults({
          found: true,
          material: { id: "MAT001", description: "Stainless Steel Bolt 10mm", group: "Fasteners" }
        });
      } else if (searchByNumber.toUpperCase() === "MAT005") {
        setNumberResults({
          found: true,
          material: { id: "MAT005", description: "Steel Bolt 10mm Galvanized", group: "Fasteners" }
        });
      } else {
        setNumberResults({ found: false });
      }
    }, 800);
  };

  const handleSearchByDescription = () => {
    if (!searchByDescription.trim()) {
      showToast("Please enter a material description", "error");
      return;
    }

    // Simulate API call
    setTimeout(() => {
      // Filter materials based on description for demo
      const filteredMaterials = sampleMaterials.filter(material =>
        material.description.toLowerCase().includes(searchByDescription.toLowerCase())
      );

      setDescriptionResults({
        materials: filteredMaterials,
        groups: sampleGroups
      });
    }, 800);
  };

  const addToIndent = (material) => {
    if (!selectedMaterials.some(item => item.id === material.id)) {
      setSelectedMaterials([...selectedMaterials, material]);
      showToast(`${material.id} added to indent`, "success");
    } else {
      showToast(`${material.id} is already in indent`, "info");
    }
  };

  const toggleMaterialSelection = (material) => {
    if (selectedMaterials.some(item => item.id === material.id)) {
      setSelectedMaterials(selectedMaterials.filter(item => item.id !== material.id));
    } else {
      setSelectedMaterials([...selectedMaterials, material]);
    }
  };

  const submitNewMaterialRequest = () => {
    // In a real app, this would call an API
    showToast("Material creation request submitted", "success");
    setShowNewMaterialModal(false);
    setNewMaterialComment("");
  };

  const submitNewGroupRequest = () => {
    // In a real app, this would call an API
    showToast("Material group creation request submitted", "success");
    setShowNewGroupModal(false);
    setNewGroupComment("");
  };

  const showToast = (message, type) => {
    const event = new CustomEvent('showToast', {
      detail: { message, type }
    });
    window.dispatchEvent(event);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 py-4 px-6 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-[#002147] to-[#7F56D9] p-2 rounded-lg mr-3">
              <Package className="text-white" size={24} />
            </div>
            <h1 className="font-default text-2xl font-bold bg-gradient-to-r from-[#002147] to-[#7F56D9] bg-clip-text text-transparent">
              Megha Materials Hub
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            <div className="relative group">
              <button className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-[#002147] to-[#7F56D9] rounded-full flex items-center justify-center">
                  <User size={16} className="text-white" />
                </div>
                {/* <span className="text-sm font-medium text-gray-700">{userName}</span> */}
              </button>

              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <button onClick={handleLogout} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">
                  <LogOut size={16} className="mr-2" />
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          {/* <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome back, {userName}!</h2> */}
          <p className="text-gray-600">Manage your materials and streamline procurement processes</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-default text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <p className="text-xs text-green-600 mt-1">{stat.change}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <stat.icon className="text-blue-600" size={24} />
                </div>
              </div>
            </div>
          ))}
        </div>


        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-8">
          {/* <div className="flex items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Material Search</h2>
            <div className="ml-auto flex bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab("materials")}
                className={`px-4 py-2 text-sm font-medium rounded-md ${activeTab === "materials" ? "bg-white shadow-sm" : "text-gray-500"}`}
              >
                Materials
              </button>
              <button
                onClick={() => setActiveTab("groups")}
                className={`px-4 py-2 text-sm font-medium rounded-md ${activeTab === "groups" ? "bg-white shadow-sm" : "text-gray-500"}`}
              >
                Groups
              </button>
            </div>
          </div> */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Search by Material Number */}
            <div className="bg-gray-50 rounded-xl p-5">
              <h3 className=" font-default text-lg font-medium text-gray-800 mb-4">Search by Material Number</h3>
              <div className="flex space-x-2 mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Enter Material Number (e.g. MAT001)"
                    value={searchByNumber}
                    onChange={(e) => setSearchByNumber(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={handleSearchByNumber}
                  className="bg-gradient-to-r from-[#002147] to-[#7F56D9] text-white px-4 py-3 rounded-lg font-medium hover:opacity-90 transition-all"
                >
                  Search
                </button>
              </div>

              {numberResults && (
                <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
                  {numberResults.found ? (
                    <div>
                      <h3 className="font-default font-medium text-green-700 mb-2">Material Found</h3>
                      <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                        <div>
                          <p className="font-mono text-blue-600 font-semibold">{numberResults.material.id}</p>
                          <p className="text-gray-700">{numberResults.material.description}</p>
                          <p className="text-sm text-gray-500">{numberResults.material.group}</p>
                        </div>
                        <button
                          onClick={() => addToIndent(numberResults.material)}
                          className="bg-green-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition"
                        >
                          Add to Indent
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h3 className="font-medium text-red-700 mb-2">Material Not Found</h3>
                      <p className="text-gray-700 mb-3">No material found with number {searchByNumber}</p>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSearchByDescription(searchByNumber);
                            setNumberResults(null);
                          }}
                          className="bg-blue-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition"
                        >
                          Search by Description
                        </button>
                        <button
                          onClick={() => setShowNewMaterialModal(true)}
                          className="bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-300 transition"
                        >
                          Request New Material
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Search by Material Description */}
            <div className="bg-gray-50 rounded-xl p-5">
              <h3 className="font-default text-lg font-medium text-gray-800 mb-4">Search by Material Description</h3>
              <div className="flex space-x-2 mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Enter Material Description"
                    value={searchByDescription}
                    onChange={(e) => setSearchByDescription(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={handleSearchByDescription}
                  className="bg-gradient-to-r from-[#002147] to-[#7F56D9] text-white px-4 py-3 rounded-lg font-medium hover:opacity-90 transition-all"
                >
                  Search
                </button>
              </div>

              {descriptionResults && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-4">
                    Found {descriptionResults.materials.length} materials matching your description
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Split Results Section */}
        {descriptionResults && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 divide-x divide-gray-200">
              {/* Left Section - Material Results */}
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-default text-lg font-semibold text-gray-800">Matching Materials</h3>
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-sm">
                    {descriptionResults.materials.length} results
                  </span>
                </div>

                <div className="space-y-3">
                  {descriptionResults.materials.map((material) => (
                    <div
                      key={material.id}
                      className={`font-default p-4 border rounded-lg flex justify-between items-center transition-all ${selectedMaterials.some(m => m.id === material.id) ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-gray-200 hover:shadow-sm'}`}
                    >
                      <div className="flex items-center">
                        <button
                          onClick={() => toggleMaterialSelection(material)}
                          className={`w-5 h-5 rounded border mr-3 flex items-center justify-center transition-colors ${selectedMaterials.some(m => m.id === material.id) ? 'bg-blue-500 border-blue-500' : 'border-gray-300 hover:border-blue-300'}`}
                        >
                          {selectedMaterials.some(m => m.id === material.id) && (
                            <Check size={14} className="text-white" />
                          )}
                        </button>
                        <div>
                          <p className="font-default text-blue-600 font-semibold">{material.id}</p>
                          <p className="text-gray-800">{material.description}</p>
                          <div className="flex items-center mt-1">
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{material.group}</span>
                            <span className="mx-2 text-gray-300">•</span>
                            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">{material.match}% match</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => addToIndent(material)}
                        className="bg-blue-500 text-white px-3 py-1 rounded text-sm font-medium hover:bg-blue-600 transition"
                      >
                        Add to Indent
                      </button>
                    </div>
                  ))}
                </div>

                {descriptionResults.materials.length === 0 && (
                  <div className="text-center py-8">
                    <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Package className="text-gray-400" size={24} />
                    </div>
                    <p className="font-default text-gray-600 mb-4">No materials found with this description</p>
                    <button
                      onClick={() => setShowNewMaterialModal(true)}
                      className="bg-gradient-to-r from-[#002147] to-[#7F56D9] text-white px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-all"
                    >
                      Request New Material
                    </button>
                  </div>
                )}
              </div>

              {/* Right Section - Material Groups */}
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-default text-lg font-semibold text-gray-800">Suggested Material Groups</h3>
                  <button className="text-blue-600 text-sm font-medium flex items-center hover:text-blue-700">
                    Search by Attributes <ChevronRight size={16} />
                  </button>
                </div>

                <div className="space-y-4">
                  {descriptionResults.groups.map((group) => (
                    <div key={group.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-default font-medium text-gray-800">{group.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">{group.description}</p>
                          <div className="flex items-center mt-2">
                            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">{group.relevance}% relevance</span>
                          </div>
                        </div>
                        <button className="text-blue-600 text-sm font-medium hover:text-blue-700">
                          Select
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setShowNewGroupModal(true)}
                    className="text-blue-600 text-sm font-medium flex items-center hover:text-blue-700"
                  >
                    <Plus size={16} className="mr-1" /> Request New Material Group
                  </button>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            {selectedMaterials.length > 0 && (
              <div className="bg-blue-50 px-6 py-4 border-t border-blue-100 flex justify-between items-center">
                <p className="text-gray-700">
                  {selectedMaterials.length} material{selectedMaterials.length !== 1 ? 's' : ''} selected
                </p>
                <button className="bg-gradient-to-r from-[#002147] to-[#7F56D9] text-white px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-all">
                  Add Selected to Indent
                </button>
              </div>
            )}
          </div>
        )}

        {/* New Material Modal */}
        {showNewMaterialModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Request New Material</h3>
                <button onClick={() => setShowNewMaterialModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={20} />
                </button>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Material Description</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchByDescription || searchByNumber}
                  readOnly
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Comments</label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newMaterialComment}
                  onChange={(e) => setNewMaterialComment(e.target.value)}
                  placeholder="Provide details about the material you need"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowNewMaterialModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={submitNewMaterialRequest}
                  className="bg-gradient-to-r from-[#002147] to-[#7F56D9] text-white px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-all"
                >
                  Submit Request
                </button>
              </div>
            </div>
          </div>
        )}

        {/* New Material Group Modal */}
        {showNewGroupModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Request New Material Group</h3>
                <button onClick={() => setShowNewGroupModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={20} />
                </button>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Group Description</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe the material group"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Comments</label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newGroupComment}
                  onChange={(e) => setNewGroupComment(e.target.value)}
                  placeholder="Explain why this new group is needed"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowNewGroupModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={submitNewGroupRequest}
                  className="bg-gradient-to-r from-[#002147] to-[#7F56D9] text-white px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-all"
                >
                  Submit Request
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}