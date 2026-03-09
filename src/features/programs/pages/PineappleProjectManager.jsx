import React, { useState } from 'react';
import { FiSave, FiPlus, FiTrash2, FiType, FiUsers, FiTrendingUp, FiCheckCircle, FiImage, FiTarget, FiInfo } from 'react-icons/fi';

const PineappleProjectManager = () => {
  const [content, setContent] = useState({
    hero: {
      title: 'Pineapple Livelihood',
      description: 'Building sustainable livelihoods through creativity, environmental responsibility, and community empowerment.',
      imageUrl: ''
    },
    launch: {
      title: 'Launch of the Pineapple Livelihood Initiative',
      description: 'The launch of the Pineapple Livelihood Initiative marks a meaningful milestone in our commitment to empowering families within our community. Formed by proud parents of Papaya Academy scholars, this initiative creates sustainable income opportunities through handcrafted products made from recycled paper, magazines, beads, and crochet materials.',
      secondaryDescription: 'Made possible through the generous support of our partners and donors, this program transforms creativity into livelihood while promoting environmental responsibility. Each product reflects resilience, gratitude, and the shared vision of building brighter futures for our children.\n\nPineapple Livelihood is more than a project — it is a symbol of opportunity, unity, and our unwavering commitment to empowering parents and supporting scholars through purposeful enterprise.'
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
  const [activeTab, setActiveTab] = useState('hero');

  const handleSave = async () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      alert('Pineapple Project content updated successfully!');
    }, 1000);
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
            <div className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#9CA89F] uppercase tracking-wider ml-1">Section Title</label>
                <input type="text" value={content.launch.title} onChange={(e) => updateLaunch('title', e.target.value)} className="w-full rounded-2xl border border-[#E8EAE8] bg-[#FAFAFA] px-5 py-3 text-sm font-bold text-[#1A1F1B] focus:outline-none focus:ring-2 focus:ring-[#F0C000] focus:bg-white transition-all" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#9CA89F] uppercase tracking-wider ml-1">Main Narrative</label>
                  <textarea rows={8} value={content.launch.description} onChange={(e) => updateLaunch('description', e.target.value)} className="w-full rounded-2xl border border-[#E8EAE8] bg-[#FAFAFA] px-5 py-3 text-sm font-medium text-[#5C6560] focus:outline-none focus:ring-2 focus:ring-[#F0C000] focus:bg-white transition-all resize-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#9CA89F] uppercase tracking-wider ml-1">Impact & Vision Statement</label>
                  <textarea rows={8} value={content.launch.secondaryDescription} onChange={(e) => updateLaunch('secondaryDescription', e.target.value)} className="w-full rounded-2xl border border-[#E8EAE8] bg-[#FAFAFA] px-5 py-3 text-sm font-medium text-[#5C6560] focus:outline-none focus:ring-2 focus:ring-[#F0C000] focus:bg-white transition-all resize-none" />
                </div>
              </div>
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
    </div>
  );
};

export default PineappleProjectManager;
