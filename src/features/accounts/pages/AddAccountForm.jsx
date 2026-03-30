import React, { useState, useMemo, useEffect } from 'react';
import { 
  FiUser, 
  FiMail, 
  FiLock, 
  FiEye, 
  FiEyeOff, 
  FiCheck, 
  FiChevronDown,
  FiX,
  FiSave,
  FiUserPlus,
  FiLoader,
  FiCheckCircle,
  FiUsers,
  FiList,
  FiSearch,
  FiShield,
  FiCamera,
  FiUpload,
  FiEdit,
  FiTrash2,
} from 'react-icons/fi';
import { accountService } from '../../../core/services/accountService';

export default function AddAccountForm({ onCancel, onSave }) {
  const [activeTab, setActiveTab] = useState('add'); // 'add' or 'view'
  const [accounts, setAccounts] = useState([]);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('All');

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'Teacher',
    isActive: true,
    imageFile: null,
    imagePreviewUrl: '',
  });

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [editFormData, setEditFormData] = useState({
    username: '',
    role: 'Teacher',
    isActive: true,
    imageFile: null,
    imagePreviewUrl: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  // Fetch accounts when switching to 'view' tab
  useEffect(() => {
    if (activeTab === 'view') {
      fetchAccounts();
    }
  }, [activeTab]);

  const fetchAccounts = async () => {
    setIsLoadingAccounts(true);
    try {
      const data = await accountService.getAllAccounts();
      setAccounts(data);
    } catch (error) {
      console.error('Error fetching accounts:', error);
    } finally {
      setIsLoadingAccounts(false);
    }
  };

  const filteredAccounts = useMemo(() => {
    return accounts.filter(acc => {
      const matchesSearch = 
        acc.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        acc.email?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = filterRole === 'All' || acc.role === filterRole;
      return matchesSearch && matchesRole;
    });
  }, [accounts, searchQuery, filterRole]);

  const passwordValidation = useMemo(() => ({
    length: formData.password.length >= 8,
    number: /\d/.test(formData.password),
    special: /[!@#$%^&*]/.test(formData.password),
  }), [formData.password]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleActive = () => {
    setFormData(prev => ({ ...prev, isActive: !prev.isActive }));
  };

  const handleImageChange = (e, isEdit = false) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (isEdit) {
          setEditFormData(prev => ({ 
            ...prev, 
            imageFile: file, 
            imagePreviewUrl: reader.result 
          }));
        } else {
          setFormData(prev => ({ 
            ...prev, 
            imageFile: file, 
            imagePreviewUrl: reader.result 
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    
    // Final validation check before submitting
    if (!passwordValidation.length || !passwordValidation.number || !passwordValidation.special) {
      setErrorMessage('Please fulfill all password requirements.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await accountService.createAccount({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        isActive: formData.isActive,
        imageFile: formData.imageFile,
      });
      if (result.success) {
        setShowSuccess(true);
        setFormData({
          username: '',
          email: '',
          password: '',
          role: 'Teacher',
          isActive: true,
          imageFile: null,
          imagePreviewUrl: '',
        });
        
        // Hide success message after 3 seconds
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (error) {
      setErrorMessage(error.message || 'Failed to create account. Please try again.');
      console.error('Submit error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (acc) => {
    setEditingAccount(acc);
    setEditFormData({
      username: acc.username || '',
      role: acc.role || 'Teacher',
      isActive: acc.isActive !== false,
      imageFile: null,
      imagePreviewUrl: acc.imageUrl || '',
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateAccount = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await accountService.updateAccount(editingAccount.uid || editingAccount.id, {
        username: editFormData.username,
        role: editFormData.role,
        isActive: editFormData.isActive,
        imageFile: editFormData.imageFile,
      });
      
      setIsEditModalOpen(false);
      fetchAccounts(); // Refresh the list
    } catch (error) {
      console.error('Update error:', error);
      alert('Failed to update account');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAccount = async (uid) => {
    if (!window.confirm('Are you sure you want to delete this account? This action cannot be undone.')) {
      return;
    }

    try {
      await accountService.deleteAccount(uid);
      fetchAccounts(); // Refresh the list
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete account');
    }
  };

  const ValidationItem = ({ fulfilled, label }) => (
    <div className="flex items-center gap-2 text-xs transition-colors duration-200">
      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${fulfilled ? 'bg-[#4A8058] text-white' : 'bg-slate-100 text-slate-300'}`}>
        <FiCheck className="w-2.5 h-2.5" />
      </div>
      <span className={fulfilled ? 'text-[#4A8058] font-medium' : 'text-slate-400'}>{label}</span>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col items-center justify-start p-6 bg-[#f5f5f0] overflow-y-auto w-full">
      {/* Centered Container */}
      <div className="w-full max-w-[900px] flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 bg-white/50 p-1.5 rounded-2xl border border-[#e0e0d8] self-start shadow-sm">
          <button
            onClick={() => setActiveTab('add')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'add' 
                ? 'bg-white text-[#d4a017] shadow-sm border border-[#e0e0d8]' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <FiUserPlus className="w-4 h-4" />
            Create Account
          </button>
          <button
            onClick={() => setActiveTab('view')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'view' 
                ? 'bg-white text-[#d4a017] shadow-sm border border-[#e0e0d8]' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <FiUsers className="w-4 h-4" />
            View Accounts
          </button>
        </div>

        {activeTab === 'add' ? (
          <div className="w-full bg-white rounded-3xl border border-[#e0e0d8] shadow-sm overflow-hidden">
            {/* Card Header */}
            <div className="p-6 border-b border-[#e0e0d8] flex items-center gap-4 bg-white">
              <div className="w-12 h-12 bg-[#FEF3C0] rounded-2xl flex items-center justify-center text-[#d4a017]">
                <FiUserPlus className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#1A1F1B]">Add Accounts</h2>
                <p className="text-sm text-[#5C6560]">Create new credentials for teachers and principals</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              {showSuccess && (
                <div className="p-4 bg-[#F0F8F1] border border-[#D6EDD9] rounded-2xl flex items-center gap-3 text-[#4A8058] animate-in fade-in slide-in-from-top-2">
                  <div className="w-8 h-8 rounded-full bg-[#D6EDD9] flex items-center justify-center flex-shrink-0">
                    <FiCheckCircle className="w-4 h-4" />
                  </div>
                  <p className="text-sm font-medium">Account created successfully!</p>
                </div>
              )}

              {errorMessage && (
                <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 animate-in fade-in slide-in-from-top-2">
                  <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0">
                    <FiX className="w-4 h-4" />
                  </div>
                  <p className="text-sm font-medium">{errorMessage}</p>
                </div>
              )}

              {/* Account Details Section */}
              <div className="space-y-6">
                <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Profile Picture</h3>
                <div className="flex flex-col items-center md:items-start gap-4">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden transition-all group-hover:border-[#d4a017]/50">
                      {formData.imagePreviewUrl ? (
                        <img src={formData.imagePreviewUrl} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <FiCamera className="w-8 h-8 text-slate-300 group-hover:text-[#d4a017]/50 transition-colors" />
                      )}
                    </div>
                    <label className="absolute -bottom-2 -right-2 w-8 h-8 bg-white border border-[#e0e0d8] rounded-xl shadow-sm flex items-center justify-center cursor-pointer hover:bg-slate-50 transition-all text-[#d4a017]">
                      <FiUpload className="w-3.5 h-3.5" />
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageChange(e)} />
                    </label>
                  </div>
                  <div className="text-[10px] text-slate-400 italic">Recommended: Square image, max 2MB</div>
                </div>

                <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Account details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Username */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Username</label>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#d4a017] transition-colors">
                        <FiUser className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        placeholder="Enter username"
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#d4a017] focus:ring-4 focus:ring-[#FEF3C0]/30 transition-all text-sm"
                        required
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Email address</label>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#d4a017] transition-colors">
                        <FiMail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="example@papayaacademy.edu"
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#d4a017] focus:ring-4 focus:ring-[#FEF3C0]/30 transition-all text-sm"
                        required
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-3 md:col-span-2">
                    <label className="text-sm font-semibold text-slate-700">Password</label>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#d4a017] transition-colors">
                        <FiLock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        className="w-full pl-11 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#d4a017] focus:ring-4 focus:ring-[#FEF3C0]/30 transition-all text-sm"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                      </button>
                    </div>
                    
                    {/* Validation Rules */}
                    <div className="flex flex-wrap gap-x-6 gap-y-2 pt-1">
                      <ValidationItem fulfilled={passwordValidation.length} label="At least 8 characters" />
                      <ValidationItem fulfilled={passwordValidation.number} label="At least 1 number (0–9)" />
                      <ValidationItem fulfilled={passwordValidation.special} label="At least 1 special character (!@#$%^&*)" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="h-px bg-[#e0e0d8] w-full" />

              {/* Role & Status Section */}
              <div className="space-y-6">
                <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Role & status</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Role Dropdown */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">User Role</label>
                    <div className="relative group">
                      <select
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className="w-full appearance-none px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#d4a017] focus:ring-4 focus:ring-[#FEF3C0]/30 transition-all text-sm cursor-pointer"
                      >
                        <option value="Teacher">Teacher</option>
                        <option value="Principal">Principal</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-focus-within:text-[#d4a017] transition-colors">
                        <FiChevronDown className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="space-y-0.5">
                      <div className="text-sm font-bold text-slate-700">Active account</div>
                      <div className="text-xs text-[#5C6560]">Enable account access</div>
                    </div>
                    <button
                      type="button"
                      onClick={toggleActive}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#d4a017] focus:ring-offset-2 ${formData.isActive ? 'bg-[#d4a017]' : 'bg-slate-200'}`}
                    >
                      <span
                        className={`${formData.isActive ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              <div className="h-px bg-[#e0e0d8] w-full" />

              {/* Actions */}
              <div className="flex items-center gap-4 pt-2">
                <button
                  type="button"
                  onClick={onCancel}
                  className="flex-1 px-6 py-3.5 border border-[#e0e0d8] text-slate-600 font-bold rounded-2xl hover:bg-slate-50 active:scale-95 transition-all text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3.5 bg-[#d4a017] text-white font-bold rounded-2xl hover:bg-[#b88a14] shadow-lg shadow-[#d4a017]/20 active:scale-95 transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <FiLoader className="w-4 h-4 animate-spin" />
                  ) : (
                    <FiSave className="w-4 h-4" />
                  )}
                  {isSubmitting ? 'Creating...' : 'Save Account'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="w-full bg-white rounded-3xl border border-[#e0e0d8] shadow-sm overflow-hidden flex flex-col min-h-[500px]">
            {/* List Header */}
            <div className="p-6 border-b border-[#e0e0d8] flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#F0F8F1] rounded-2xl flex items-center justify-center text-[#4A8058]">
                  <FiUsers className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#1A1F1B]">Account Directory</h2>
                  <p className="text-sm text-[#5C6560]">List of all teachers and principals registered</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="relative">
                  <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search accounts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#d4a017] focus:ring-4 focus:ring-[#FEF3C0]/30 transition-all w-[200px] md:w-[250px]"
                  />
                </div>
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#d4a017] cursor-pointer"
                >
                  <option value="All">All Roles</option>
                  <option value="Teacher">Teacher</option>
                  <option value="Principal">Principal</option>
                </select>
              </div>
            </div>

            {/* List Content */}
            <div className="flex-1 overflow-x-auto">
              {isLoadingAccounts ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <FiLoader className="w-8 h-8 animate-spin text-[#d4a017]" />
                  <p className="text-sm font-medium text-slate-500">Loading accounts...</p>
                </div>
              ) : filteredAccounts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
                  <FiUsers className="w-12 h-12 opacity-20" />
                  <p className="text-sm font-medium">No accounts found</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-[#e0e0d8]">
                      <th className="px-8 py-4">User Details</th>
                      <th className="px-6 py-4">Role</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Date Created</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e0e0d8]">
                    {filteredAccounts.map((acc) => (
                      <tr key={acc.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden text-slate-400 group-hover:bg-[#FEF3C0] group-hover:text-[#d4a017] transition-colors uppercase font-bold text-sm">
                              {acc.imageUrl ? (
                                <img src={acc.imageUrl} alt={acc.username} className="w-full h-full object-cover" />
                              ) : (
                                acc.username?.substring(0, 2)
                              )}
                            </div>
                            <div>
                              <div className="text-sm font-bold text-[#1A1F1B]">{acc.username}</div>
                              <div className="text-xs text-slate-500">{acc.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                            acc.role === 'Principal' 
                              ? 'bg-[#FEF3C0] text-[#d4a017] border-[#FEF3C0]' 
                              : 'bg-slate-100 text-slate-600 border-slate-100'
                          }`}>
                            <FiShield className="w-3 h-3" />
                            {acc.role}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${acc.isActive ? 'bg-[#4A8058] animate-pulse' : 'bg-slate-300'}`} />
                            <span className={`text-xs font-bold ${acc.isActive ? 'text-[#4A8058]' : 'text-slate-400'}`}>
                              {acc.isActive ? 'Active' : 'Disabled'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="text-xs text-slate-500 font-medium">
                            {acc.createdAt?.toDate ? acc.createdAt.toDate().toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            }) : 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => handleEditClick(acc)}
                              className="p-2 text-slate-400 hover:text-[#d4a017] hover:bg-[#FEF3C0]/50 rounded-lg transition-all"
                              title="Edit Account"
                            >
                              <FiEdit className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteAccount(acc.uid || acc.id)}
                              className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                              title="Delete Account"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            
            <div className="p-6 border-t border-[#e0e0d8] bg-slate-50/50 flex justify-between items-center">
              <p className="text-xs text-slate-500 font-medium">
                Showing {filteredAccounts.length} of {accounts.length} total users
              </p>
              <button 
                onClick={fetchAccounts}
                className="text-xs font-bold text-[#d4a017] hover:underline flex items-center gap-1"
              >
                <FiLoader className={`w-3 h-3 ${isLoadingAccounts ? 'animate-spin' : ''}`} />
                Refresh List
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsEditModalOpen(false)} />
          <div className="relative bg-white w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-bold text-[#1A1F1B]">Edit Account</h3>
                  <p className="text-sm text-[#5C6560]">Update profile and role access</p>
                </div>
                <button onClick={() => setIsEditModalOpen(false)} className="w-10 h-10 rounded-full border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-50">
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUpdateAccount} className="space-y-6">
                <div className="flex flex-col items-center gap-4 mb-2">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden">
                      {editFormData.imagePreviewUrl ? (
                        <img src={editFormData.imagePreviewUrl} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <FiCamera className="w-8 h-8 text-slate-300" />
                      )}
                    </div>
                    <label className="absolute -bottom-2 -right-2 w-8 h-8 bg-white border border-[#e0e0d8] rounded-xl shadow-sm flex items-center justify-center cursor-pointer hover:bg-slate-50 transition-all text-[#d4a017]">
                      <FiUpload className="w-3.5 h-3.5" />
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageChange(e, true)} />
                    </label>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Username</label>
                    <input
                      type="text"
                      value={editFormData.username}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, username: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#d4a017] transition-all text-sm"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">User Role</label>
                    <select
                      value={editFormData.role}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, role: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#d4a017] transition-all text-sm"
                    >
                      <option value="Teacher">Teacher</option>
                      <option value="Principal">Principal</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="text-sm font-bold text-slate-700">Account status</div>
                    <button
                      type="button"
                      onClick={() => setEditFormData(prev => ({ ...prev, isActive: !prev.isActive }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${editFormData.isActive ? 'bg-[#d4a017]' : 'bg-slate-200'}`}
                    >
                      <span className={`${editFormData.isActive ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 px-6 py-3.5 border border-[#e0e0d8] text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-all text-sm">
                    Cancel
                  </button>
                  <button type="submit" disabled={isSubmitting} className="flex-1 px-6 py-3.5 bg-[#d4a017] text-white font-bold rounded-2xl hover:bg-[#b88a14] shadow-lg shadow-[#d4a017]/20 transition-all text-sm disabled:opacity-70">
                    {isSubmitting ? 'Updating...' : 'Update Account'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
