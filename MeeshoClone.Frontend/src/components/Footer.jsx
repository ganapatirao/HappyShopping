import { useState, useEffect } from 'react';
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from 'lucide-react';
import { siteConfigAPI } from '../services/api';

const Footer = () => {
  const [config, setConfig] = useState({
    footer: {
      companyName: 'Meesho',
      companyDescription: 'Shop for the latest fashion, electronics, home products and more at the best prices.',
      socialLinks: [],
      backgroundColor: '#1F2937',
      backgroundColorEnd: '#111827',
      textColor: '#FFFFFF',
      contactFields: [],
      sections: [],
      copyrightText: '© 2024 Meesho Clone. All rights reserved.',
      copyrightLinks: [],
      logo: '',
      logoBase64: '',
    },
  });

  useEffect(() => {
    loadConfiguration();
  }, []);

  const loadConfiguration = async () => {
    try {
      const response = await siteConfigAPI.getConfiguration();
      if (response.data.success) {
        setConfig(response.data.configuration);
      }
    } catch (error) {
      console.error('Error loading configuration:', error);
    }
  };

  return (
    <footer style={{ background: `linear-gradient(to right, ${config.footer?.backgroundColor || '#1F2937'}, ${config.footer?.backgroundColorEnd || '#111827'})`, color: config.footer?.textColor || '#FFFFFF' }} className="mt-auto">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Company Info */}
          <div>
            {config.footer?.logoBase64 ? (
              <img src={config.footer.logoBase64} alt={config.footer?.companyName || 'Meesho'} className="h-14 mb-6 object-contain" />
            ) : config.footer?.logo ? (
              <img src={config.footer.logo} alt={config.footer?.companyName || 'Meesho'} className="h-14 mb-6 object-contain" />
            ) : (
              <h3 className="text-2xl font-bold mb-6 text-pink-400 tracking-tight">{config.footer?.companyName || 'Meesho'}</h3>
            )}
            <p className="text-gray-300 mb-6 leading-relaxed">{config.footer?.companyDescription || 'Shop for the latest fashion, electronics, home products and more at the best prices.'}</p>
            
            {/* Social Links */}
            {config.footer?.socialLinks?.filter(link => link.isVisible).sort((a, b) => a.order - b.order).length > 0 && (
              <div className="flex gap-4">
                {config.footer.socialLinks.filter(link => link.isVisible).sort((a, b) => a.order - b.order).map((link, index) => (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-pink-400 transition-colors"
                  >
                    {link.iconBase64 ? (
                      <img src={link.iconBase64} alt={link.platform} className="w-6 h-6" />
                    ) : link.icon ? (
                      <img src={link.icon} alt={link.platform} className="w-6 h-6" />
                    ) : (
                      <span className="text-xl">{link.platform}</span>
                    )}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Contact Fields */}
          {config.footer?.contactFields?.filter(field => field.isVisible).sort((a, b) => a.order - b.order).length > 0 && (
            <div>
              <h4 className="text-lg font-semibold mb-6">Contact Us</h4>
              <div className="space-y-4">
                {config.footer.contactFields.filter(field => field.isVisible).sort((a, b) => a.order - b.order).map((field, index) => (
                  <div key={index} className="flex items-start gap-3">
                    {field.type === 'email' && <Mail className="mt-1 text-pink-400" size={20} />}
                    {field.type === 'phone' && <Phone className="mt-1 text-pink-400" size={20} />}
                    {field.type === 'address' && <MapPin className="mt-1 text-pink-400" size={20} />}
                    <div>
                      <p className="font-medium mb-1">{field.title}</p>
                      <p className="text-gray-300 text-sm">{field.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dynamic Footer Sections */}
          {config.footer?.sections?.filter(section => section.isVisible).sort((a, b) => a.order - b.order).map((section, sectionIndex) => (
            <div key={sectionIndex}>
              <h4 className="text-lg font-semibold mb-6">{section.title}</h4>
              <ul className="space-y-3">
                {section.links?.filter(link => link.isVisible).sort((a, b) => a.order - b.order).map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a
                      href={link.url}
                      target={link.openInNewTab ? '_blank' : '_self'}
                      rel={link.openInNewTab ? 'noopener noreferrer' : ''}
                      className="text-gray-300 hover:text-pink-400 transition-colors flex items-center gap-2"
                    >
                      {link.iconBase64 ? (
                        <img src={link.iconBase64} alt={link.text} className="w-4 h-4" />
                      ) : link.icon ? (
                        <img src={link.icon} alt={link.text} className="w-4 h-4" />
                      ) : null}
                      {link.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Copyright Section */}
        <div className="border-t border-gray-700 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">{config.footer?.copyrightText || '© 2024 Meesho Clone. All rights reserved.'}</p>
            {config.footer?.copyrightLinks?.filter(link => link.isVisible).sort((a, b) => a.order - b.order).length > 0 && (
              <div className="flex gap-6">
                {config.footer.copyrightLinks.filter(link => link.isVisible).sort((a, b) => a.order - b.order).map((link, index) => (
                  <a
                    key={index}
                    href={link.url}
                    target={link.openInNewTab ? '_blank' : '_self'}
                    rel={link.openInNewTab ? 'noopener noreferrer' : ''}
                    className="text-gray-400 hover:text-pink-400 transition-colors text-sm"
                  >
                    {link.text}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
