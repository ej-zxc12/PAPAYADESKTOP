import React, { useState, useEffect } from 'react';
import { FiSave, FiPlus, FiTrash2, FiType, FiUsers, FiTrendingUp, FiCheckCircle, FiImage, FiTarget, FiInfo } from 'react-icons/fi';
import { pineappleProjectService } from '../../../core/services/pineappleProjectService';

const PineappleProjectManager = () => {
  const [content, setContent] = useState({
    hero: {
      title: 'Pineapple Livelihood',
      description: 'Building sustainable livelihoods through creativity, environmental responsibility, and community empowerment.',
      imageUrl: ''
    },
    launch: {
      title: 'Pineapple Initiative Launch Events',
      description: 'Documenting the journey and milestones of the Pineapple Livelihood Initiative launch events and activities.',
      events: []
    },
    about: {
      title: 'About the Project',
      description: 'Empowering Parents. Supporting Education. Promoting Sustainability. Pineapple Livelihood turns creativity into income through handcrafted, recycled products made by the proud families of Papaya Academy scholars.',
      features: [
        { id: 1, title: 'Sustainable Farming', description: 'Teaching modern agricultural techniques that maximize yield while preserving the environment.', icon: 'FiType' },
        { id: 2, title: 'Community Empowerment', description: 'Building strong cooperative networks that support local farmers and their families.', icon: 'FiUsers' },
        { id: 3, title: 'Economic Growth', description: 'Creating sustainable income streams that lift families out of poverty permanently.', icon: 'FiTrendingUp' }
      ]
    },
    components: {
      title: 'Program Components',
      categories: [
        {
          id: 1,
          title: 'Training & Education',
          items: ['Modern farming techniques', 'Business management skills', 'Financial literacy training', 'Quality control standards']
        },
        {
          id: 2,
          title: 'Support Services',
          items: ['Access to quality seedlings', 'Equipment and tools provision', 'Market linkage assistance', 'Technical support visits']
        }
      ]
    },
    impact: {
      title: 'Our Impact',
      stats: [
        { id: 1, label: 'Farmers Trained', value: '150+' },
        { id: 2, label: 'Hectares Cultivated', value: '3' },
        { id: 3, label: 'Income Increase', value: '85%' },
        { id: 4, label: 'Families Supported', value: '50+' }
      ]
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
      const data = await pineappleProjectService.getContent();
      setContent(data);
    } catch (err) {
      console.error('Error loading content:', err);
      setError(err.message || 'Failed to load Pineapple Project content');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError('');
      await pineappleProjectService.updateContent(content);
      alert('Pineapple Project content updated successfully!');
    } catch (err) {
      console.error('Error saving content:', err);
      setError(err.message || 'Failed to save Pineapple Project content');
      alert('Error: Failed to save content. Please try again.');
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

  const updateLaunch = (field, value) => {
    setContent(prev => ({
      ...prev,
      launch: { ...prev.launch, [field]: value }
    }));
  };

  // Launch Events handlers
  const addEvent = async () => {
    const newEvent = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      title: '',
      description: '',
      images: [],
      createdAt: new Date().toISOString()
    };
    
    try {
      const updatedContent = {
        ...content,
        launch: {
          title: content.launch?.title || 'Pineapple Initiative Launch Events',
          description: content.launch?.description || 'Documenting the journey and milestones of the Pineapple Livelihood Initiative launch events and activities.',
          events: [...(content.launch?.events || []), newEvent]
        }
      };
      
      setContent(updatedContent);
      
      // Show success message
      const successMsg = document.createElement('div');
      successMsg.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      successMsg.textContent = '✓ New launch event added successfully';
      document.body.appendChild(successMsg);
      
      setTimeout(() => {
        if (document.body.contains(successMsg)) {
          document.body.removeChild(successMsg);
        }
      }, 3000);
      
    } catch (error) {
      console.error('Error adding event:', error);
      alert('Failed to add event. Please try again.');
    }
  };

  const updateEvent = (index, field, value) => {
    const newEvents = [...(content.launch?.events || [])];
    newEvents[index] = { ...newEvents[index], [field]: value };
    setContent(prev => ({
      ...prev,
      launch: {
        title: prev.launch?.title || 'Pineapple Initiative Launch Events',
        description: prev.launch?.description || 'Documenting the journey and milestones of the Pineapple Livelihood Initiative launch events and activities.',
        events: newEvents
      }
    }));
  };

  const removeEvent = async (index) => {
    const event = content.launch?.events?.[index];
    if (window.confirm(`Are you sure you want to delete the "${event?.title || 'Launch Event'}"? This action cannot be undone.`)) {
      try {
        const newEvents = (content.launch?.events || []).filter((_, i) => i !== index);
        const updatedContent = {
          ...content,
          launch: {
            title: content.launch?.title || 'Pineapple Initiative Launch Events',
            description: content.launch?.description || 'Documenting the journey and milestones of the Pineapple Livelihood Initiative launch events and activities.',
            events: newEvents
          }
        };
        
        setContent(updatedContent);
        
        // Show success message
        const successMsg = document.createElement('div');
        successMsg.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        successMsg.textContent = '✓ Launch event deleted successfully';
        document.body.appendChild(successMsg);
        
        setTimeout(() => {
          if (document.body.contains(successMsg)) {
            document.body.removeChild(successMsg);
          }
        }, 3000);
        
      } catch (error) {
        console.error('Error deleting event:', error);
        alert('Failed to delete event. Please try again.');
      }
    }
  };

  const handleEventImageUpload = async (eventIndex, imageIndex, file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('Image size should be less than 10MB');
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
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
          
          ctx.drawImage(img, 0, 0, width, height);
          
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85);
          
          if (compressedBase64.length > 10000000) {
            alert('Compressed image is still too large. Please use a smaller image.');
            return;
          }
          
          // Update event images
          const newEvents = [...(content.launch?.events || [])];
          const eventImages = [...newEvents[eventIndex].images];
          
          if (imageIndex === -1) {
            // Add new image
            eventImages.push({
              id: Date.now(),
              url: compressedBase64,
              uploadedAt: new Date().toISOString()
            });
          } else {
            // Replace existing image
            eventImages[imageIndex] = {
              ...eventImages[imageIndex],
              url: compressedBase64,
              uploadedAt: new Date().toISOString()
            };
          }
          
          newEvents[eventIndex] = { ...newEvents[eventIndex], images: eventImages };
          
          setContent(prev => ({
            ...prev,
            launch: {
              title: prev.launch?.title || 'Pineapple Initiative Launch Events',
              description: prev.launch?.description || 'Documenting the journey and milestones of the Pineapple Livelihood Initiative launch events and activities.',
              events: newEvents
            }
          }));
          
          // Show success message
          const successMsg = document.createElement('div');
          successMsg.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
          successMsg.textContent = '✓ Photo uploaded successfully';
          document.body.appendChild(successMsg);
          
          setTimeout(() => {
            if (document.body.contains(successMsg)) {
              document.body.removeChild(successMsg);
            }
          }, 3000);
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

  const removeEventImage = (eventIndex, imageIndex) => {
    if (window.confirm('Are you sure you want to remove this image?')) {
      const newEvents = [...(content.launch?.events || [])];
      const eventImages = newEvents[eventIndex].images.filter((_, i) => i !== imageIndex);
      newEvents[eventIndex] = { ...newEvents[eventIndex], images: eventImages };
      
      setContent(prev => ({
        ...prev,
        launch: {
          title: prev.launch?.title || 'Pineapple Initiative Launch Events',
          description: prev.launch?.description || 'Documenting the journey and milestones of the Pineapple Livelihood Initiative launch events and activities.',
          events: newEvents
        }
      }));
    }
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

  const updateComponentCategory = (index, value) => {
    const newCategories = [...content.components.categories];
    newCategories[index] = { ...newCategories[index], title: value };
    setContent(prev => ({
      ...prev,
      components: { ...prev.components, categories: newCategories }
    }));
  };

  const updateComponentItem = (catIndex, itemIndex, value) => {
    const newCategories = [...content.components.categories];
    newCategories[catIndex].items[itemIndex] = value;
    setContent(prev => ({
      ...prev,
      components: { ...prev.components, categories: newCategories }
    }));
  };

  const addComponentItem = (catIndex) => {
    const newCategories = [...content.components.categories];
    newCategories[catIndex].items.push('New program item');
    setContent(prev => ({
      ...prev,
      components: { ...prev.components, categories: newCategories }
    }));
  };

  const removeComponentItem = (catIndex, itemIndex) => {
    const newCategories = [...content.components.categories];
    newCategories[catIndex].items.splice(itemIndex, 1);
    setContent(prev => ({
      ...prev,
      components: { ...prev.components, categories: newCategories }
    }));
  };

  const updateStat = (index, field, value) => {
    const newStats = [...content.impact.stats];
    newStats[index] = { ...newStats[index], [field]: value };
    setContent(prev => ({
      ...prev,
      impact: { ...prev.impact, stats: newStats }
    }));
  };

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#1A1F1B]">Pineapple Project Manager</h2>
          <p className="text-sm text-[#5C6560]">Manage the content displayed on the Pineapple Livelihood page</p>
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
            <span className="ml-3 text-sm text-[#5C6560]">Loading Pineapple Project content...</span>
          </div>
        </div>
      ) : (
        <>

      <div className="flex bg-white rounded-2xl border border-[#E8EAE8] p-1 w-fit shadow-sm overflow-x-auto">
        <button onClick={() => setActiveTab('hero')} className={`px-6 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${activeTab === 'hero' ? 'bg-[#F0C000] text-white shadow-sm' : 'text-[#5C6560] hover:bg-[#FAFAFA]'}`}>Hero Section</button>
        <button onClick={() => setActiveTab('launch')} className={`px-6 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${activeTab === 'launch' ? 'bg-[#F0C000] text-white shadow-sm' : 'text-[#5C6560] hover:bg-[#FAFAFA]'}`}>Initiative Launch</button>
        <button onClick={() => setActiveTab('about')} className={`px-6 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${activeTab === 'about' ? 'bg-[#F0C000] text-white shadow-sm' : 'text-[#5C6560] hover:bg-[#FAFAFA]'}`}>About & Features</button>
        <button onClick={() => setActiveTab('components')} className={`px-6 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${activeTab === 'components' ? 'bg-[#F0C000] text-white shadow-sm' : 'text-[#5C6560] hover:bg-[#FAFAFA]'}`}>Components</button>
        <button onClick={() => setActiveTab('impact')} className={`px-6 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${activeTab === 'impact' ? 'bg-[#F0C000] text-white shadow-sm' : 'text-[#5C6560] hover:bg-[#FAFAFA]'}`}>Impact Stats</button>
      </div>

      <div className="bg-white rounded-3xl border border-[#E8EAE8] shadow-sm overflow-hidden">
        <div className="p-8">
          {activeTab === 'hero' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[#9CA89F] uppercase tracking-wider ml-1">Main Title</label>
                    <input type="text" value={content.hero.title} onChange={(e) => updateHero('title', e.target.value)} className="w-full rounded-2xl border border-[#E8EAE8] bg-[#FAFAFA] px-5 py-3 text-sm font-bold text-[#1A1F1B] focus:outline-none focus:ring-2 focus:ring-[#F0C000] focus:bg-white transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[#9CA89F] uppercase tracking-wider ml-1">Hero Description</label>
                    <textarea rows={4} value={content.hero.description} onChange={(e) => updateHero('description', e.target.value)} className="w-full rounded-2xl border border-[#E8EAE8] bg-[#FAFAFA] px-5 py-3 text-sm font-medium text-[#5C6560] focus:outline-none focus:ring-2 focus:ring-[#F0C000] focus:bg-white transition-all resize-none" />
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

          {activeTab === 'launch' && (
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[#9CA89F] uppercase tracking-wider ml-1">Section Title</label>
                    <input
                      type="text"
                      value={content.launch?.title || ''}
                      onChange={(e) => updateLaunch('title', e.target.value)}
                      className="w-full rounded-2xl border border-[#E8EAE8] bg-[#FAFAFA] px-5 py-3 text-sm font-bold text-[#1A1F1B] focus:outline-none focus:ring-2 focus:ring-[#F0C000] focus:bg-white transition-all"
                    />
                  </div>
                  <button
                    onClick={addEvent}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#F0C000] text-white text-sm font-bold px-6 py-3 hover:bg-[#B8920A] shadow-md transition-all active:scale-95"
                  >
                    <FiPlus className="h-4 w-4" />
                    <span>Add Launch Event</span>
                  </button>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#9CA89F] uppercase tracking-wider ml-1">Section Description</label>
                  <textarea
                    rows={2}
                    value={content.launch?.description || ''}
                    onChange={(e) => updateLaunch('description', e.target.value)}
                    className="w-full rounded-2xl border border-[#E8EAE8] bg-[#FAFAFA] px-5 py-3 text-sm font-medium text-[#5C6560] focus:outline-none focus:ring-2 focus:ring-[#F0C000] focus:bg-white transition-all resize-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(content.launch?.events || []).map((event, index) => (
                  <div key={event.id} className="bg-[#FAFAFA] rounded-3xl border border-[#E8EAE8] p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-3">
                          <span className="text-xs font-bold text-[#F0C000] uppercase tracking-wider">✏️ Editable Event</span>
                        </div>
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-[#9CA89F] uppercase tracking-wider">Event Date</label>
                            <input
                              type="date"
                              value={event.date}
                              onChange={(e) => updateEvent(index, 'date', e.target.value)}
                              className="w-full rounded-xl border border-[#E8EAE8] bg-white px-4 py-2 text-sm font-bold text-[#1A1F1B] focus:outline-none focus:ring-2 focus:ring-[#F0C000]"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-[#9CA89F] uppercase tracking-wider">Event Title</label>
                            <input
                              type="text"
                              value={event.title}
                              onChange={(e) => updateEvent(index, 'title', e.target.value)}
                              className="w-full rounded-xl border border-[#E8EAE8] bg-white px-4 py-2 text-sm font-bold text-[#1A1F1B] focus:outline-none focus:ring-2 focus:ring-[#F0C000]"
                              placeholder="e.g., Launch Ceremony, Workshop Event"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-[#9CA89F] uppercase tracking-wider">Event Description</label>
                            <textarea
                              rows={3}
                              value={event.description}
                              onChange={(e) => updateEvent(index, 'description', e.target.value)}
                              className="w-full rounded-xl border border-[#E8EAE8] bg-white px-4 py-2 text-sm font-medium text-[#5C6560] focus:outline-none focus:ring-2 focus:ring-[#F0C000] resize-none"
                              placeholder="Describe the event details and activities..."
                            />
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => removeEvent(index)}
                        className="p-3 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 rounded-xl transition-all border border-red-200 hover:border-red-300 group"
                        title="Delete this launch event"
                      >
                        <FiTrash2 className="h-5 w-5 group-hover:scale-110 transition-transform" />
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold text-[#9CA89F] uppercase tracking-wider">Event Photos</label>
                        <button
                          onClick={() => document.getElementById(`event-image-${index}-new`).click()}
                          className="inline-flex items-center gap-1 text-xs font-bold text-[#F0C000] hover:underline"
                        >
                          <FiPlus className="h-3 w-3" />
                          <span>Add Photo</span>
                        </button>
                      </div>
                      
                      {event.images && event.images.length > 0 ? (
                        <div className="grid grid-cols-2 gap-3">
                          {event.images.map((image, imgIndex) => (
                            <div key={image.id} className="relative group">
                              <img
                                src={image.url}
                                alt={`Event photo ${imgIndex + 1}`}
                                className="w-full h-24 object-cover rounded-xl"
                              />
                              <button
                                onClick={() => removeEventImage(index, imgIndex)}
                                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600"
                                title="Remove photo"
                              >
                                <FiTrash2 className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                          {event.images.length < 6 && (
                            <div
                              onClick={() => document.getElementById(`event-image-${index}-new`).click()}
                              className="w-full h-24 rounded-xl border-2 border-dashed border-[#E8EAE8] bg-white flex flex-col items-center justify-center cursor-pointer hover:bg-[#FAFAFA] hover:border-[#F0C000]/40 transition-all group"
                            >
                              <FiImage className="h-6 w-6 text-[#9CA89F] group-hover:text-[#F0C000]" />
                              <p className="text-xs font-bold text-[#5C6560] mt-1">Add Photo</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div
                          onClick={() => document.getElementById(`event-image-${index}-new`).click()}
                          className="w-full h-32 rounded-2xl border-2 border-dashed border-[#E8EAE8] bg-white flex flex-col items-center justify-center cursor-pointer hover:bg-[#FAFAFA] hover:border-[#F0C000]/40 transition-all group"
                        >
                          <FiImage className="h-8 w-8 text-[#9CA89F] mb-2 group-hover:text-[#F0C000]" />
                          <p className="text-xs font-bold text-[#5C6560]">Click to upload event photos</p>
                          <p className="text-[10px] text-[#9CA89F] mt-1">Up to 6 photos per event</p>
                        </div>
                      )}
                      
                      <input
                        id={`event-image-${index}-new`}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => {
                          const files = Array.from(e.target.files);
                          files.forEach((file, fileIndex) => {
                            handleEventImageUpload(index, -1, file);
                          });
                        }}
                        className="hidden"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {(content.launch?.events || []).length === 0 && (
                <div className="text-center py-12">
                  <FiImage className="h-16 w-16 text-[#9CA89F] mx-auto mb-4" />
                  <p className="text-lg font-bold text-[#1A1F1B] mb-2">No Launch Events Yet</p>
                  <p className="text-sm text-[#5C6560] mb-6">Start documenting your Pineapple Initiative launch events and activities</p>
                  <button
                    onClick={addEvent}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#F0C000] text-white text-sm font-bold px-6 py-3 hover:bg-[#B8920A] shadow-md transition-all active:scale-95"
                  >
                    <FiPlus className="h-4 w-4" />
                    <span>Add First Launch Event</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'about' && (
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#9CA89F] uppercase tracking-wider ml-1">Section Title</label>
                  <input type="text" value={content.about.title} onChange={(e) => updateAbout('title', e.target.value)} className="w-full rounded-2xl border border-[#E8EAE8] bg-[#FAFAFA] px-5 py-3 text-sm font-bold text-[#1A1F1B] focus:outline-none focus:ring-2 focus:ring-[#F0C000] focus:bg-white transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#9CA89F] uppercase tracking-wider ml-1">About Description</label>
                  <textarea rows={3} value={content.about.description} onChange={(e) => updateAbout('description', e.target.value)} className="w-full rounded-2xl border border-[#E8EAE8] bg-[#FAFAFA] px-5 py-3 text-sm font-medium text-[#5C6560] focus:outline-none focus:ring-2 focus:ring-[#F0C000] focus:bg-white transition-all resize-none" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {content.about.features.map((feature, index) => (
                  <div key={feature.id} className="bg-[#FAFAFA] rounded-3xl border border-[#E8EAE8] p-6 space-y-4">
                    <div className="w-10 h-10 rounded-2xl bg-[#F0F8F1] flex items-center justify-center text-[#7EB88A]">
                      {feature.id === 1 && <FiType className="h-5 w-5" />}
                      {feature.id === 2 && <FiUsers className="h-5 w-5" />}
                      {feature.id === 3 && <FiTrendingUp className="h-5 w-5" />}
                    </div>
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[#9CA89F] uppercase tracking-wider">Feature Title</label>
                        <input type="text" value={feature.title} onChange={(e) => updateAboutFeature(index, 'title', e.target.value)} className="w-full rounded-xl border border-[#E8EAE8] bg-white px-4 py-2 text-sm font-bold text-[#1A1F1B] focus:outline-none focus:ring-2 focus:ring-[#F0C000]" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[#9CA89F] uppercase tracking-wider">Feature Description</label>
                        <textarea rows={3} value={feature.description} onChange={(e) => updateAboutFeature(index, 'description', e.target.value)} className="w-full rounded-xl border border-[#E8EAE8] bg-white px-4 py-2 text-sm font-medium text-[#5C6560] focus:outline-none focus:ring-2 focus:ring-[#F0C000] resize-none" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'components' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {content.components.categories.map((cat, catIdx) => (
                <div key={cat.id} className="bg-[#FAFAFA] rounded-3xl border border-[#E8EAE8] p-8 space-y-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[#9CA89F] uppercase tracking-wider">Category Title</label>
                    <input type="text" value={cat.title} onChange={(e) => updateComponentCategory(catIdx, e.target.value)} className="w-full rounded-2xl border border-[#E8EAE8] bg-white px-5 py-3 text-lg font-bold text-[#1A1F1B] focus:outline-none focus:ring-2 focus:ring-[#F0C000]" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-[#9CA89F] uppercase tracking-wider">Program Items</label>
                    {cat.items.map((item, itemIdx) => (
                      <div key={itemIdx} className="flex items-center gap-2 group">
                        <div className="flex-1">
                          <input type="text" value={item} onChange={(e) => updateComponentItem(catIdx, itemIdx, e.target.value)} className="w-full rounded-xl border border-[#E8EAE8] bg-white px-4 py-2 text-sm font-medium text-[#5C6560] focus:outline-none focus:ring-2 focus:ring-[#F0C000]" />
                        </div>
                        <button onClick={() => removeComponentItem(catIdx, itemIdx)} className="p-2 text-[#9CA89F] hover:text-[#D97070] opacity-0 group-hover:opacity-100 transition-all"><FiTrash2 className="h-4 w-4" /></button>
                      </div>
                    ))}
                    <button onClick={() => addComponentItem(catIdx)} className="inline-flex items-center gap-2 text-xs font-bold text-[#F0C000] hover:underline pt-2"><FiPlus className="h-3 w-3" /><span>Add Item</span></button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'impact' && (
            <div className="space-y-8 max-w-4xl mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {content.impact.stats.map((stat, index) => (
                  <div key={stat.id} className="bg-[#FAFAFA] rounded-3xl border border-[#E8EAE8] p-6 space-y-4 hover:border-[#F0C000]/30 transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-[#4A8058] shadow-sm group-hover:scale-110 transition-transform">
                        <FiTarget className="h-6 w-6" />
                      </div>
                      <div className="flex-1 space-y-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-[#9CA89F] uppercase tracking-wider">Statistic Label</label>
                          <input type="text" value={stat.label} onChange={(e) => updateStat(index, 'label', e.target.value)} className="w-full rounded-xl border border-[#E8EAE8] bg-white px-4 py-2 text-sm font-bold text-[#1A1F1B] focus:outline-none focus:ring-2 focus:ring-[#F0C000]" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-[#9CA89F] uppercase tracking-wider">Impact Value</label>
                          <input type="text" value={stat.value} onChange={(e) => updateStat(index, 'value', e.target.value)} className="w-full rounded-xl border border-[#E8EAE8] bg-white px-4 py-2 text-sm font-black text-[#F0C000] focus:outline-none focus:ring-2 focus:ring-[#F0C000]" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-[#F0F8F1] border border-[#D6EDD9] rounded-3xl p-6 flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-[#4A8058] shadow-sm shrink-0"><FiInfo className="h-5 w-5" /></div>
                <div>
                  <h4 className="font-bold text-[#1A1F1B]">Impact Metrics Guide</h4>
                  <p className="text-sm text-[#5C6560] leading-relaxed mt-1">These statistics are showcased on the website to highlight the tangible outcomes of the Pineapple Livelihood initiative. Ensure values are updated regularly to reflect real-world progress.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
        </>
      )}
    </div>
  );
};

export default PineappleProjectManager;
