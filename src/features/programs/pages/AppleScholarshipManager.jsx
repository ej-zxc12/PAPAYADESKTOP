import React, { useState, useEffect } from 'react';
import { FiSave, FiPlus, FiTrash2, FiType, FiAlignLeft, FiList, FiCheckCircle, FiShield, FiStar, FiImage } from 'react-icons/fi';
import { appleScholarshipService } from '../../../core/services/appleScholarshipService';

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
    },
    graduatedScholars: {
      title: 'Our Successful Graduates',
      description: 'Celebrating the achievements of Apple Scholars who have successfully completed their education journey.',
      batches: []
    }
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('hero');

  // Load content from Firebase on component mount
  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await appleScholarshipService.getContent();
      setContent(data);
    } catch (err) {
      console.error('Error loading content:', err);
      // Don't show error for Firebase connection issues - just use default content
      if (err.message.includes('Failed to fetch') || err.message.includes('permission-denied')) {
        console.log('Using default content due to Firebase connection issues');
        setError('Firebase connection issue. Using default content - changes will not be saved until Firebase is properly configured.');
      } else {
        setError(err.message || 'Failed to load Apple Scholarship content');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError('');
      
      // Check if any images are too large before saving
      const batches = content.graduatedScholars?.batches || [];
      for (const batch of batches) {
        if (batch.imageUrl && batch.imageUrl.length > 10000000) { // 10MB base64 limit
          setError('One or more images are too large. Please use smaller images (under 10MB).');
          alert('Error: Images are too large. Please use smaller images (under 10MB).');
          return;
        }
      }
      
      await appleScholarshipService.updateContent(content);
      alert('Apple Scholarship content updated successfully!');
    } catch (err) {
      console.error('Error saving content:', err);
      if (err.message.includes('permission-denied') || err.message.includes('Failed to update')) {
        setError('Firebase permission error. Please deploy the Firestore rules to enable saving.');
        alert('Error: Firebase permissions not configured. Please deploy Firestore rules first.');
      } else if (err.message.includes('size') || err.message.includes('large')) {
        setError('Content too large. Try removing some images or using smaller files.');
        alert('Error: Content too large. Try removing some images or using smaller files.');
      } else {
        setError(err.message || 'Failed to save Apple Scholarship content');
        alert('Error: Failed to save content. Please try again.');
      }
    } finally {
      setIsSaving(false);
    }
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

  // Graduated Scholars handlers
  const addBatch = async () => {
    const newBatch = {
      id: Date.now(),
      year: new Date().getFullYear(),
      title: '',
      description: '',
      imageUrl: '',
      createdAt: new Date().toISOString()
    };
    
    try {
      // Add to local state immediately
      const updatedContent = {
        ...content,
        graduatedScholars: {
          title: content.graduatedScholars?.title || 'Our Successful Graduates',
          description: content.graduatedScholars?.description || 'Celebrating the achievements of Apple Scholars who have successfully completed their education journey.',
          batches: [...(content.graduatedScholars?.batches || []), newBatch]
        }
      };
      
      // Update local state
      setContent(updatedContent);
      
      // Automatically save to database
      await appleScholarshipService.updateContent(updatedContent);
      
      // Show success message
      const successMsg = document.createElement('div');
      successMsg.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      successMsg.textContent = '✓ New graduation batch added successfully';
      document.body.appendChild(successMsg);
      
      // Remove message after 3 seconds
      setTimeout(() => {
        document.body.removeChild(successMsg);
      }, 3000);
      
    } catch (error) {
      console.error('Error adding batch:', error);
      alert('Failed to add batch. Please try again.');
    }
  };

  const updateBatch = (index, field, value) => {
    const newBatches = [...(content.graduatedScholars?.batches || [])];
    newBatches[index] = { ...newBatches[index], [field]: value };
    setContent(prev => ({
      ...prev,
      graduatedScholars: {
        title: prev.graduatedScholars?.title || 'Our Successful Graduates',
        description: prev.graduatedScholars?.description || 'Celebrating the achievements of Apple Scholars who have successfully completed their education journey.',
        batches: newBatches
      }
    }));
  };

  const removeBatch = async (index) => {
    const batch = content.graduatedScholars?.batches?.[index];
    if (window.confirm(`Are you sure you want to delete the "${batch?.year || 'Graduation'}" batch? This action cannot be undone.`)) {
      try {
        // Remove from local state immediately
        const newBatches = (content.graduatedScholars?.batches || []).filter((_, i) => i !== index);
        const updatedContent = {
          ...content,
          graduatedScholars: {
            title: content.graduatedScholars?.title || 'Our Successful Graduates',
            description: content.graduatedScholars?.description || 'Celebrating the achievements of Apple Scholars who have successfully completed their education journey.',
            batches: newBatches
          }
        };
        
        // Update local state
        setContent(updatedContent);
        
        // Automatically save to database
        await appleScholarshipService.updateContent(updatedContent);
        
        // Show success message
        const successMsg = document.createElement('div');
        successMsg.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        successMsg.textContent = '✓ Graduation batch deleted successfully';
        document.body.appendChild(successMsg);
        
        // Remove message after 3 seconds
        setTimeout(() => {
          document.body.removeChild(successMsg);
        }, 3000);
        
      } catch (error) {
        console.error('Error deleting batch:', error);
        alert('Failed to delete batch. Please try again.');
      }
    }
  };

  const handleBatchImageUpload = (index, event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Simple validation - just check if it's an image
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      alert('Image size should be less than 10MB');
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        // Create an image element to compress
        const img = new Image();
        img.onload = () => {
          // Create canvas for compression
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Calculate new size (max 1200px width/height for better quality)
          let width = img.width;
          let height = img.height;
          const maxSize = 1200;
          
          if (width > height && width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          } else if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          // Draw and compress with higher quality
          ctx.drawImage(img, 0, 0, width, height);
          
          // Get compressed base64 (quality 0.85 for better quality)
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85);
          
          // Check final size (10MB limit)
          if (compressedBase64.length > 10000000) { // 10MB limit
            alert('Compressed image is still too large. Please use a smaller image.');
            return;
          }
          
          // Update local state and save to database
          updateBatch(index, 'imageUrl', compressedBase64);
          
          // Auto-save to database after image upload
          setTimeout(async () => {
            try {
              await appleScholarshipService.updateContent(content);
              
              // Show success message
              const successMsg = document.createElement('div');
              successMsg.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
              successMsg.textContent = '✓ Photo uploaded successfully';
              document.body.appendChild(successMsg);
              
              // Remove message after 3 seconds
              setTimeout(() => {
                if (document.body.contains(successMsg)) {
                  document.body.removeChild(successMsg);
                }
              }, 3000);
              
            } catch (error) {
              console.error('Error saving image:', error);
            }
          }, 500);
        };
        img.onerror = () => {
          alert('Failed to process image');
        };
        img.src = e.target.result;
      };
      reader.onerror = () => {
        alert('Failed to read image file');
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Image upload error:', error);
      alert('Failed to upload image');
    }
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
          disabled={isSaving || isLoading}
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

      {error && (
        <div className="bg-[#D97070]/5 border border-[#D97070]/10 rounded-xl p-4">
          <div className="flex items-start gap-2">
            <div className="text-[#D97070] mt-0.5">
              <FiTrash2 className="h-4 w-4" />
            </div>
            <div className="text-sm text-[#D97070]">{error}</div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="bg-white rounded-3xl border border-[#E8EAE8] shadow-sm p-12">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#F0C000] border-t-transparent"></div>
            <span className="ml-3 text-sm text-[#5C6560]">Loading Apple Scholarship content...</span>
          </div>
        </div>
      ) : (
        <>
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
            <button
              onClick={() => setActiveTab('graduatedScholars')}
              className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'graduatedScholars' ? 'bg-[#F0C000] text-white shadow-sm' : 'text-[#5C6560] hover:bg-[#FAFAFA]'}`}
            >
              Graduated Scholars
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-[#E8EAE8] shadow-sm overflow-hidden">
        <div className="p-8">
          {activeTab === 'hero' && (
            <div className="space-y-6">
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

          {activeTab === 'graduatedScholars' && (
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[#9CA89F] uppercase tracking-wider ml-1">Section Title</label>
                    <input
                      type="text"
                      value={content.graduatedScholars?.title || ''}
                      onChange={(e) => setContent(prev => ({
                        ...prev,
                        graduatedScholars: { 
                          ...prev.graduatedScholars, 
                          title: e.target.value,
                          description: prev.graduatedScholars?.description || '',
                          batches: prev.graduatedScholars?.batches || []
                        }
                      }))}
                      className="w-full rounded-2xl border border-[#E8EAE8] bg-[#FAFAFA] px-5 py-3 text-sm font-bold text-[#1A1F1B] focus:outline-none focus:ring-2 focus:ring-[#F0C000] focus:bg-white transition-all"
                    />
                  </div>
                  <button
                    onClick={addBatch}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#F0C000] text-white text-sm font-bold px-6 py-3 hover:bg-[#B8920A] shadow-md transition-all active:scale-95"
                  >
                    <FiPlus className="h-4 w-4" />
                    <span>Add Graduation Batch</span>
                  </button>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#9CA89F] uppercase tracking-wider ml-1">Section Description</label>
                  <textarea
                    rows={2}
                    value={content.graduatedScholars?.description || ''}
                    onChange={(e) => setContent(prev => ({
                      ...prev,
                      graduatedScholars: { 
                        ...prev.graduatedScholars, 
                        description: e.target.value,
                        title: prev.graduatedScholars?.title || '',
                        batches: prev.graduatedScholars?.batches || []
                      }
                    }))}
                    className="w-full rounded-2xl border border-[#E8EAE8] bg-[#FAFAFA] px-5 py-3 text-sm font-medium text-[#5C6560] focus:outline-none focus:ring-2 focus:ring-[#F0C000] focus:bg-white transition-all resize-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(content.graduatedScholars?.batches || []).map((batch, index) => (
                  <div key={batch.id} className="bg-[#FAFAFA] rounded-3xl border border-[#E8EAE8] p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-3">
                          <span className="text-xs font-bold text-[#F0C000] uppercase tracking-wider">✏️ Editable Fields</span>
                        </div>
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-[#9CA89F] uppercase tracking-wider">Graduation Year</label>
                            <input
                              type="number"
                              value={batch.year}
                              onChange={(e) => updateBatch(index, 'year', e.target.value)}
                              className="w-full rounded-xl border border-[#E8EAE8] bg-white px-4 py-2 text-sm font-bold text-[#1A1F1B] focus:outline-none focus:ring-2 focus:ring-[#F0C000]"
                              placeholder="e.g., 2025"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-[#9CA89F] uppercase tracking-wider">Batch Title</label>
                            <input
                              type="text"
                              value={batch.title}
                              onChange={(e) => updateBatch(index, 'title', e.target.value)}
                              className="w-full rounded-xl border border-[#E8EAE8] bg-white px-4 py-2 text-sm font-bold text-[#1A1F1B] focus:outline-none focus:ring-2 focus:ring-[#F0C000]"
                              placeholder="e.g., Class of 2025 Graduation"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-[#9CA89F] uppercase tracking-wider">Description</label>
                            <textarea
                              rows={4}
                              value={batch.description}
                              onChange={(e) => updateBatch(index, 'description', e.target.value)}
                              className="w-full rounded-xl border border-[#E8EAE8] bg-white px-4 py-2 text-sm font-medium text-[#5C6560] focus:outline-none focus:ring-2 focus:ring-[#F0C000] resize-none"
                              placeholder="Share about this graduation batch..."
                            />
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => removeBatch(index)}
                        className="p-3 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 rounded-xl transition-all border border-red-200 hover:border-red-300 group"
                        title="Delete this graduation batch"
                      >
                        <FiTrash2 className="h-5 w-5 group-hover:scale-110 transition-transform" />
                      </button>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[#9CA89F] uppercase tracking-wider">Graduation Photo</label>
                      <div className="relative">
                        <div 
                          onClick={() => document.getElementById(`batch-image-${index}`).click()}
                          className="w-full h-48 rounded-2xl border-2 border-dashed border-[#E8EAE8] bg-white flex flex-col items-center justify-center cursor-pointer hover:bg-[#FAFAFA] hover:border-[#F0C000]/40 transition-all group relative overflow-hidden"
                        >
                          {batch.imageUrl ? (
                            <>
                              <img 
                                src={batch.imageUrl} 
                                alt={`${batch.year} Graduation`} 
                                className="w-full h-full object-cover rounded-2xl"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all rounded-2xl flex items-center justify-center">
                                <div className="opacity-0 group-hover:opacity-100 transition-all text-white text-center">
                                  <FiImage className="h-6 w-6 mx-auto mb-1" />
                                  <p className="text-xs font-bold">Click to change photo</p>
                                </div>
                              </div>
                            </>
                          ) : (
                            <>
                              <FiImage className="h-8 w-8 text-[#9CA89F] mb-2 group-hover:text-[#F0C000]" />
                              <p className="text-xs font-bold text-[#5C6560]">Click to upload graduation photo</p>
                            </>
                          )}
                        </div>
                        <input
                          id={`batch-image-${index}`}
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleBatchImageUpload(index, e)}
                          className="hidden"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {(content.graduatedScholars?.batches || []).length === 0 && (
                <div className="text-center py-12">
                  <FiImage className="h-16 w-16 text-[#9CA89F] mx-auto mb-4" />
                  <p className="text-lg font-bold text-[#1A1F1B] mb-2">No Graduation Batches Yet</p>
                  <p className="text-sm text-[#5C6560] mb-6">Start adding graduation batches and celebrate your scholars' achievements</p>
                  <button
                    onClick={addBatch}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#F0C000] text-white text-sm font-bold px-6 py-3 hover:bg-[#B8920A] shadow-md transition-all active:scale-95"
                  >
                    <FiPlus className="h-4 w-4" />
                    <span>Add First Graduation Batch</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
        </>
      )}
    </div>
  );
};

export default AppleScholarshipManager;
