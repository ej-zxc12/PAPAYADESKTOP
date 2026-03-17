import React, { useState, useMemo } from 'react';
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
  FiCheckCircle
} from 'react-icons/fi';
import { accountService } from '../../../core/services/accountService';

export default function AddAccountForm({ onCancel, onSave }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'Teacher',
    isActive: true,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

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
      });
      if (result.success) {
        setShowSuccess(true);
        setFormData({
          username: '',
          email: '',
          password: '',
          role: 'Teacher',
          isActive: true,
        });
        // Remove direct onSave call that triggers redirect
        // if (onSave) onSave({ ...formData, id: result.id });
        
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

  const ValidationItem = ({ fulfilled, label }) => (
    <div className="flex items-center gap-2 text-xs transition-colors duration-200">
      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${fulfilled ? 'bg-[#4A8058] text-white' : 'bg-slate-100 text-slate-300'}`}>
        <FiCheck className="w-2.5 h-2.5" />
      </div>
      <span className={fulfilled ? 'text-[#4A8058] font-medium' : 'text-slate-400'}>{label}</span>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col items-center justify-start p-6 bg-[#f5f5f0] overflow-y-auto">
      {/* Centered Form Card */}
      <div className="w-full max-width-[600px] bg-white rounded-3xl border border-[#e0e0d8] shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Card Header */}
        <div className="p-6 border-b border-[#e0e0d8] flex items-center gap-4 bg-white">
          <div className="w-12 h-12 bg-[#FEF3C0] rounded-2xl flex items-center justify-center text-[#d4a017]">
            <FiUserPlus className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#1A1F1B]">Add Accounts</h2>
            <p className="text-sm text-[#5C6560]">Managing user accounts and access levels</p>
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
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Account details</h3>
            
            <div className="grid grid-cols-1 gap-6">
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
              <div className="space-y-3">
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
            
            <div className="grid grid-cols-1 gap-8">
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
                  <div className="text-xs text-[#5C6560]">isActive will be set to true in Firestore</div>
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
    </div>
  );
}
