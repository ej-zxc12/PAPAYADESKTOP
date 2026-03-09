import React, { useState, useEffect } from 'react';
import { FiSave, FiPlus, FiTrash2, FiType, FiAlignLeft, FiList, FiCheckCircle, FiShield, FiStar, FiImage } from 'react-icons/fi';

const AppleScholarshipManager = () => {
  const [content, setContent] = useState({
    hero: {
      title: 'Apple Scholarships',
      description: 'Empowering bright minds through education, transforming futures one scholarship at a time.',
      imageUrl: ''
    },
    about: {
      title: 'About the Program',
      description: 'The Apple Scholarships program provides comprehensive educational support to high-potential students from underserved communities in Payatas. We believe that education is the key to breaking the cycle of poverty and creating lasting change in our community.',
      features: [
        { id: 1, title: 'Academic Excellence', description: 'Supporting students from elementary through tertiary education with comprehensive academic assistance.', icon: 'FiType' },
        { id: 2, title: 'Holistic Development', description: 'Beyond financial support, we provide mentorship, counseling, and character formation programs.', icon: 'FiShield' },
        { id: 3, title: 'Long-term Impact', description: 'Creating sustainable change by investing in the next generation of leaders and professionals.', icon: 'FiStar' }
      ]
    },
    benefits: {
      title: 'Scholarship Benefits',
      categories: [
        {
          id: 1,
          title: 'Financial Support',
          items: ['Full tuition coverage', 'Book and learning materials allowance', 'Transportation stipend', 'Uniform and school supplies']
        },
        {
          id: 2,
          title: 'Academic Support',
          items: ['Regular tutoring sessions', 'Mentorship program', 'Career guidance counseling', 'Leadership development workshops']
        }
      ]
    },
    eligibility: {
      title: 'Eligibility Requirements',
      requirements: [
        'Resident of Payatas or nearby communities',
        'Demonstrated financial need',
        'Strong academic performance and potential',
        'Good moral character and conduct',
        'Commitment to community service',
        'Parent/guardian support and involvement'
      ]
    }
  });

  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('hero');

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      alert('Apple Scholarship content updated successfully!');
    }, 1000);
  };

  const updateHero = (field, value) => {
    setContent(prev => ({
      ...prev,
      hero: { ...prev.hero, [field]: value }
    }));
  };

  const updateAbout = (field, value) => {
    setContent(prev => ({
      ...prev,
      about: { ...prev.about, [field]: value }
    }));
  };

  const updateAboutFeature = (index, field, value) => {
    const newFeatures = [...content.about.features];
    newFeatures[index] = { ...newFeatures[index], [field]: value };
    setContent(prev => ({
      ...prev,
      about: { ...prev.about, features: newFeatures }
    }));
  };

  const updateBenefitCategory = (index, value) => {
    const newCategories = [...content.benefits.categories];
    newCategories[index] = { ...newCategories[index], title: value };
    setContent(prev => ({
      ...prev,
      benefits: { ...prev.benefits, categories: newCategories }
    }));
  };

  const updateBenefitItem = (catIndex, itemIndex, value) => {
    const newCategories = [...content.benefits.categories];
    newCategories[catIndex].items[itemIndex] = value;
    setContent(prev => ({
      ...prev,
      benefits: { ...prev.benefits, categories: newCategories }
    }));
  };

  const addBenefitItem = (catIndex) => {
    const newCategories = [...content.benefits.categories];
    newCategories[catIndex].items.push('New benefit item');
    setContent(prev => ({
      ...prev,
      benefits: { ...prev.benefits, categories: newCategories }
    }));
  };

  const removeBenefitItem = (catIndex, itemIndex) => {
    const newCategories = [...content.benefits.categories];
    newCategories[catIndex].items.splice(itemIndex, 1);
    setContent(prev => ({
      ...prev,
      benefits: { ...prev.benefits, categories: newCategories }
    }));
  };

  const updateRequirement = (index, value) => {
    const newRequirements = [...content.eligibility.requirements];
    newRequirements[index] = value;
    setContent(prev => ({
      ...prev,
      eligibility: { ...prev.eligibility, requirements: newRequirements }
    }));
  };

  const addRequirement = () => {
    setContent(prev => ({
      ...prev,
      eligibility: {
        ...prev.eligibility,
        requirements: [...prev.eligibility.requirements, 'New requirement']
      }
    }));
  };

  const removeRequirement = (index) => {
    const newRequirements = content.eligibility.requirements.filter((_, i) => i !== index);
    setContent(prev => ({
      ...prev,
      eligibility: { ...prev.eligibility, requirements: newRequirements }
    }));
  };

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#1A1F1B]">Apple Scholarship Manager</h2>
          <p className="text-sm text-[#5C6560]">Manage the content displayed on the Apple Scholarship page</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center gap-2 rounded-xl bg-[#F0C000] text-white text-sm font-bold px-6 py-2.5 hover:bg-[#B8920A] shadow-md transition-all active:scale-95 disabled:opacity-50"
        >
          {isSaving ? (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
          ) : (
            <FiSave className="h-4 w-4" />
          )}
          <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>

      <div className="flex bg-white rounded-2xl border border-[#E8EAE8] p-1 w-fit shadow-sm">
        <button
          onClick={() => setActiveTab('hero')}
          className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'hero' ? 'bg-[#F0C000] text-white shadow-sm' : 'text-[#5C6560] hover:bg-[#FAFAFA]'}`}
        >
          Hero Section
        </button>
        <button
          onClick={() => setActiveTab('about')}
          className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'about' ? 'bg-[#F0C000] text-white shadow-sm' : 'text-[#5C6560] hover:bg-[#FAFAFA]'}`}
        >
          About & Features
        </button>
        <button
          onClick={() => setActiveTab('benefits')}
          className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'benefits' ? 'bg-[#F0C000] text-white shadow-sm' : 'text-[#5C6560] hover:bg-[#FAFAFA]'}`}
        >
          Benefits
        </button>
        <button
          onClick={() => setActiveTab('eligibility')}
          className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'eligibility' ? 'bg-[#F0C000] text-white shadow-sm' : 'text-[#5C6560] hover:bg-[#FAFAFA]'}`}
        >
          Eligibility
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-[#E8EAE8] shadow-sm overflow-hidden">
        <div className="p-8">
          {activeTab === 'hero' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[#9CA89F] uppercase tracking-wider ml-1">Main Title</label>
                    <input
                      type="text"
                      value={content.hero.title}
                      onChange={(e) => updateHero('title', e.target.value)}
                      className="w-full rounded-2xl border border-[#E8EAE8] bg-[#FAFAFA] px-5 py-3 text-sm font-bold text-[#1A1F1B] focus:outline-none focus:ring-2 focus:ring-[#F0C000] focus:bg-white transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[#9CA89F] uppercase tracking-wider ml-1">Hero Description</label>
                    <textarea
                      rows={4}
                      value={content.hero.description}
                      onChange={(e) => updateHero('description', e.target.value)}
                      className="w-full rounded-2xl border border-[#E8EAE8] bg-[#FAFAFA] px-5 py-3 text-sm font-medium text-[#5C6560] focus:outline-none focus:ring-2 focus:ring-[#F0C000] focus:bg-white transition-all resize-none"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#9CA89F] uppercase tracking-wider ml-1">Background Image</label>
                  <div className="w-full h-48 rounded-3xl border-2 border-dashed border-[#E8EAE8] bg-[#FAFAFA] flex flex-col items-center justify-center cursor-pointer hover:bg-white hover:border-[#F0C000]/40 transition-all group">
                    <FiImage className="h-10 w-10 text-[#9CA89F] mb-3 group-hover:text-[#F0C000]" />
                    <p className="text-sm font-bold text-[#5C6560]">Click to upload hero image</p>
                    <p className="text-[10px] text-[#9CA89F] mt-1 uppercase font-bold tracking-widest">Recommended size: 1920x600</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'about' && (
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#9CA89F] uppercase tracking-wider ml-1">Section Title</label>
                  <input
                    type="text"
                    value={content.about.title}
                    onChange={(e) => updateAbout('title', e.target.value)}
                    className="w-full rounded-2xl border border-[#E8EAE8] bg-[#FAFAFA] px-5 py-3 text-sm font-bold text-[#1A1F1B] focus:outline-none focus:ring-2 focus:ring-[#F0C000] focus:bg-white transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#9CA89F] uppercase tracking-wider ml-1">About Description</label>
                  <textarea
                    rows={3}
                    value={content.about.description}
                    onChange={(e) => updateAbout('description', e.target.value)}
                    className="w-full rounded-2xl border border-[#E8EAE8] bg-[#FAFAFA] px-5 py-3 text-sm font-medium text-[#5C6560] focus:outline-none focus:ring-2 focus:ring-[#F0C000] focus:bg-white transition-all resize-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {content.about.features.map((feature, index) => (
                  <div key={feature.id} className="bg-[#FAFAFA] rounded-3xl border border-[#E8EAE8] p-6 space-y-4">
                    <div className="w-10 h-10 rounded-2xl bg-[#F0F8F1] flex items-center justify-center text-[#7EB88A]">
                      {feature.id === 1 && <FiType className="h-5 w-5" />}
                      {feature.id === 2 && <FiShield className="h-5 w-5" />}
                      {feature.id === 3 && <FiStar className="h-5 w-5" />}
                    </div>
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[#9CA89F] uppercase tracking-wider">Feature Title</label>
                        <input
                          type="text"
                          value={feature.title}
                          onChange={(e) => updateAboutFeature(index, 'title', e.target.value)}
                          className="w-full rounded-xl border border-[#E8EAE8] bg-white px-4 py-2 text-sm font-bold text-[#1A1F1B] focus:outline-none focus:ring-2 focus:ring-[#F0C000]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[#9CA89F] uppercase tracking-wider">Feature Description</label>
                        <textarea
                          rows={3}
                          value={feature.description}
                          onChange={(e) => updateAboutFeature(index, 'description', e.target.value)}
                          className="w-full rounded-xl border border-[#E8EAE8] bg-white px-4 py-2 text-sm font-medium text-[#5C6560] focus:outline-none focus:ring-2 focus:ring-[#F0C000] resize-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'benefits' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {content.benefits.categories.map((cat, catIdx) => (
                <div key={cat.id} className="bg-[#FAFAFA] rounded-3xl border border-[#E8EAE8] p-8 space-y-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[#9CA89F] uppercase tracking-wider">Category Title</label>
                    <input
                      type="text"
                      value={cat.title}
                      onChange={(e) => updateBenefitCategory(catIdx, e.target.value)}
                      className="w-full rounded-2xl border border-[#E8EAE8] bg-white px-5 py-3 text-lg font-bold text-[#1A1F1B] focus:outline-none focus:ring-2 focus:ring-[#F0C000]"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-[#9CA89F] uppercase tracking-wider">Benefit Items</label>
                    {cat.items.map((item, itemIdx) => (
                      <div key={itemIdx} className="flex items-center gap-2 group">
                        <div className="flex-1">
                          <input
                            type="text"
                            value={item}
                            onChange={(e) => updateBenefitItem(catIdx, itemIdx, e.target.value)}
                            className="w-full rounded-xl border border-[#E8EAE8] bg-white px-4 py-2 text-sm font-medium text-[#5C6560] focus:outline-none focus:ring-2 focus:ring-[#F0C000]"
                          />
                        </div>
                        <button
                          onClick={() => removeBenefitItem(catIdx, itemIdx)}
                          className="p-2 text-[#9CA89F] hover:text-[#D97070] opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <FiTrash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => addBenefitItem(catIdx)}
                      className="inline-flex items-center gap-2 text-xs font-bold text-[#F0C000] hover:underline pt-2"
                    >
                      <FiPlus className="h-3 w-3" />
                      <span>Add Item</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'eligibility' && (
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-[#9CA89F] uppercase tracking-wider ml-1">Requirement Items</label>
                <button
                  onClick={addRequirement}
                  className="inline-flex items-center gap-2 text-xs font-bold text-[#F0C000] hover:underline"
                >
                  <FiPlus className="h-3 w-3" />
                  <span>Add Requirement</span>
                </button>
              </div>
              <div className="space-y-3">
                {content.eligibility.requirements.map((req, index) => (
                  <div key={index} className="flex items-center gap-3 group bg-[#FAFAFA] p-3 rounded-2xl border border-[#E8EAE8] hover:border-[#F0C000]/30 transition-all">
                    <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-[#4A8058]">
                      <FiCheckCircle className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <input
                        type="text"
                        value={req}
                        onChange={(e) => updateRequirement(index, e.target.value)}
                        className="w-full bg-transparent border-none text-sm font-bold text-[#1A1F1B] focus:outline-none"
                      />
                    </div>
                    <button
                      onClick={() => removeRequirement(index)}
                      className="p-2 text-[#9CA89F] hover:text-[#D97070] opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <FiTrash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppleScholarshipManager;
