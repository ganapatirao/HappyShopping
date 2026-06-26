import { Settings, Plus, Trash2, Globe, Camera, X } from 'lucide-react';

const SiteConfiguration = ({ 
  config, 
  setConfig, 
  handleSaveConfiguration, 
  convertToBase64 
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 sm:p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-purple-600 p-2 rounded-lg">
            <Settings className="text-white" size={20} />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Site Configuration</h2>
            <p className="text-sm text-gray-600">Manage your site's header, footer, and branding settings</p>
          </div>
        </div>

        {/* Site Section */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Site Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Site Name</label>
              <input
                type="text"
                value={config.site?.name || ''}
                onChange={(e) => setConfig({ ...config, site: { ...config.site, name: e.target.value } })}
                className="w-full px-3 sm:px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                placeholder="Site name"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Site Description</label>
              <textarea
                value={config.site?.description || ''}
                onChange={(e) => setConfig({ ...config, site: { ...config.site, description: e.target.value } })}
                className="w-full px-3 sm:px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all resize-none"
                rows={2}
                placeholder="Site description"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Hero Image</label>
            <div className="flex items-center gap-4">
              {config.site?.heroImageBase64 && (
                <img src={config.site.heroImageBase64} alt="Hero" className="w-32 h-32 object-cover rounded-lg" />
              )}
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => convertToBase64(e, 'siteHeroImage')}
                  className="hidden"
                  id="siteHeroImage"
                />
                <label
                  htmlFor="siteHeroImage"
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg cursor-pointer hover:bg-purple-700 transition-colors"
                >
                  <Camera size={18} />
                  <span>Upload Hero Image</span>
                </label>
              </div>
            </div>
          </div>
          <div>
            <label className="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                checked={config.site?.enableSlideshow || false}
                onChange={(e) => setConfig({ ...config, site: { ...config.site, enableSlideshow: e.target.checked } })}
                className="w-4 h-4"
              />
              <span className="text-sm font-semibold text-gray-700">Enable Slideshow</span>
            </label>
            {config.site?.enableSlideshow && (
              <div className="mt-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Slideshow Images</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {config.site?.slideshowImages?.map((img, index) => (
                    <div key={index} className="relative">
                      <img src={img} alt={`Slide ${index + 1}`} className="w-24 h-24 object-cover rounded-lg" />
                      <button
                        onClick={() => {
                          const newImages = config.site.slideshowImages.filter((_, i) => i !== index);
                          setConfig({ ...config, site: { ...config.site, slideshowImages: newImages } });
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files);
                    files.forEach(file => {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setConfig(prev => ({
                          ...prev,
                          site: {
                            ...prev.site,
                            slideshowImages: [...(prev.site.slideshowImages || []), reader.result]
                          }
                        }));
                      };
                      reader.readAsDataURL(file);
                    });
                  }}
                  className="hidden"
                  id="slideshowImages"
                />
                <label
                  htmlFor="slideshowImages"
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg cursor-pointer hover:bg-purple-700 transition-colors"
                >
                  <Camera size={18} />
                  <span>Add Slideshow Images</span>
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Header Configuration</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Logo</label>
              <div className="flex items-center gap-4">
                {config.header?.logoBase64 && (
                  <img src={config.header.logoBase64} alt="Logo" className="h-12 object-contain" />
                )}
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => convertToBase64(e, 'headerLogo')}
                    className="hidden"
                    id="headerLogo"
                  />
                  <label
                    htmlFor="headerLogo"
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg cursor-pointer hover:bg-purple-700 transition-colors"
                  >
                    <Camera size={18} />
                    <span>Upload Logo</span>
                  </label>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Logo Text</label>
              <input
                type="text"
                value={config.header?.logoText || ''}
                onChange={(e) => setConfig({ ...config, header: { ...config.header, logoText: e.target.value } })}
                className="w-full px-3 sm:px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                placeholder="Logo text"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Background Gradient Start</label>
              <input
                type="color"
                value={config.header?.backgroundColor || '#EC4899'}
                onChange={(e) => setConfig({ ...config, header: { ...config.header, backgroundColor: e.target.value } })}
                className="w-full h-10 rounded-lg cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Background Gradient End</label>
              <input
                type="color"
                value={config.header?.backgroundColorEnd || '#8B5CF6'}
                onChange={(e) => setConfig({ ...config, header: { ...config.header, backgroundColorEnd: e.target.value } })}
                className="w-full h-10 rounded-lg cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Text Color</label>
              <input
                type="color"
                value={config.header?.textColor || '#FFFFFF'}
                onChange={(e) => setConfig({ ...config, header: { ...config.header, textColor: e.target.value } })}
                className="w-full h-10 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Footer Section */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Footer Configuration</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Company Name</label>
              <input
                type="text"
                value={config.footer?.companyName || ''}
                onChange={(e) => setConfig({ ...config, footer: { ...config.footer, companyName: e.target.value } })}
                className="w-full px-3 sm:px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                placeholder="Company name"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Company Description</label>
              <textarea
                value={config.footer?.companyDescription || ''}
                onChange={(e) => setConfig({ ...config, footer: { ...config.footer, companyDescription: e.target.value } })}
                className="w-full px-3 sm:px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all resize-none"
                rows={2}
                placeholder="Company description"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Background Gradient Start</label>
              <input
                type="color"
                value={config.footer?.backgroundColor || '#1F2937'}
                onChange={(e) => setConfig({ ...config, footer: { ...config.footer, backgroundColor: e.target.value } })}
                className="w-full h-10 rounded-lg cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Background Gradient End</label>
              <input
                type="color"
                value={config.footer?.backgroundColorEnd || '#111827'}
                onChange={(e) => setConfig({ ...config, footer: { ...config.footer, backgroundColorEnd: e.target.value } })}
                className="w-full h-10 rounded-lg cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Text Color</label>
              <input
                type="color"
                value={config.footer?.textColor || '#FFFFFF'}
                onChange={(e) => setConfig({ ...config, footer: { ...config.footer, textColor: e.target.value } })}
                className="w-full h-10 rounded-lg cursor-pointer"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Copyright Text</label>
            <input
              type="text"
              value={config.footer?.copyrightText || ''}
              onChange={(e) => setConfig({ ...config, footer: { ...config.footer, copyrightText: e.target.value } })}
              className="w-full px-3 sm:px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
              placeholder="Copyright text"
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSaveConfiguration}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg"
          >
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
};

export default SiteConfiguration;
