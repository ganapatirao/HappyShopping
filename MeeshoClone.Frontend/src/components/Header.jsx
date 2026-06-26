import { useState, useEffect } from 'react';
import { Search, ShoppingBag, User, Menu, Heart, Download, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { siteConfigAPI } from '../services/api';

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const { cartCount } = useCart();
  const [config, setConfig] = useState({
    siteName: 'Meesho',
    header: {
      backgroundColor: '#EC4899',
      backgroundColorEnd: '#8B5CF6',
      textColor: '#FFFFFF',
      logoText: 'Meesho',
      links: [],
      icons: [
        { icon: '', iconBase64: '', title: 'Search', url: '', order: 0, isVisible: true, isMobile: true, isDesktop: true },
        { icon: '', iconBase64: '', title: 'Cart', url: '/cart', order: 1, isVisible: true, isMobile: true, isDesktop: true },
        { icon: '', iconBase64: '', title: 'Wishlist', url: '/dashboard?tab=wishlist', order: 2, isVisible: true, isMobile: true, isDesktop: true },
        { icon: '', iconBase64: '', title: 'Download App', url: '#', order: 3, isVisible: true, isMobile: true, isDesktop: true },
        { icon: '', iconBase64: '', title: 'Login', url: '/login', order: 4, isVisible: true, isMobile: true, isDesktop: true },
      ],
      logo: '',
      logoBase64: '',
      mobileMenuIcon: '',
      mobileMenuIconBase64: '',
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

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      window.location.href = `/shopping?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  const handleMobileSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      window.location.href = `/shopping?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  const handleSearchButtonClick = () => {
    if (searchQuery.trim()) {
      window.location.href = `/shopping?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <header className={`sticky top-0 z-50 shadow-xl backdrop-blur-md bg-opacity-95`} style={{ background: `linear-gradient(to right, ${config.header?.backgroundColor || '#EC4899'}, ${config.header?.backgroundColorEnd || '#8B5CF6'})` }}>
      <div className="container mx-auto px-4">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between py-3">
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`${config.header?.textColor || '#FFFFFF'} p-2 rounded-lg hover:bg-white/10 transition-all`}
            style={{ color: config.header?.textColor || '#FFFFFF' }}
          >
            {config.header?.mobileMenuIconBase64 ? (
              <img src={config.header.mobileMenuIconBase64} alt="Menu" className="w-6 h-6" />
            ) : config.header?.mobileMenuIcon ? (
              <img src={config.header.mobileMenuIcon} alt="Menu" className="w-6 h-6" />
            ) : (
              <Menu size={24} />
            )}
          </button>
          {config.header?.logoBase64 ? (
            <img src={config.header.logoBase64} alt={config.siteName || 'Meesho'} className="h-10 object-contain" />
          ) : config.header?.logo ? (
            <img src={config.header.logo} alt={config.siteName || 'Meesho'} className="h-10 object-contain" />
          ) : (
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: config.header?.textColor || '#FFFFFF' }}>{config.siteName || 'Meesho'}</h1>
          )}
          <div className="flex items-center gap-2">
            {config.header?.actions?.filter(action => action.isVisible).sort((a, b) => a.order - b.order).map((action, index) => {
              if (action.type === 'search') {
                return (
                  <button 
                    key={index}
                    onClick={() => {
                      const searchInput = document.querySelector('.mobile-search-input');
                      if (searchInput) {
                        searchInput.focus();
                      } else {
                        handleSearchButtonClick();
                      }
                    }}
                    className="p-2 rounded-lg hover:bg-white/10 transition-all"
                    style={{ color: config.header?.textColor || '#FFFFFF' }}
                  >
                    <Search size={20} />
                  </button>
                );
              }
              if (action.type === 'cart') {
                return (
                  <a key={index} href={action.url || '/cart'} className="p-2 rounded-lg hover:bg-white/10 transition-all relative" style={{ color: config.header?.textColor || '#FFFFFF' }}>
                    <ShoppingBag size={20} />
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-yellow-400 text-black text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold shadow-lg">
                        {cartCount}
                      </span>
                    )}
                  </a>
                );
              }
              if (action.type === 'login' && !isAuthenticated) {
                return (
                  <a key={index} href={action.url || '/login'} className="p-2 rounded-lg hover:bg-white/10 transition-all" style={{ color: config.header?.textColor || '#FFFFFF' }}>
                    <User size={20} />
                  </a>
                );
              }
              return null;
            })}
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:flex items-center justify-between py-4">
          <div className="flex items-center gap-10">
            {config.header?.logoBase64 ? (
              <img src={config.header.logoBase64} alt={config.siteName || 'Meesho'} className="h-12 object-contain" />
            ) : config.header?.logo ? (
              <img src={config.header.logo} alt={config.siteName || 'Meesho'} className="h-12 object-contain" />
            ) : (
              <h1 className="text-3xl font-bold tracking-tight" style={{ color: config.header?.textColor || '#FFFFFF' }}>{config.header?.logoText || config.siteName || 'Meesho'}</h1>
            )}
            {config.header?.icons?.filter(icon => icon.isVisible && icon.isDesktop && icon.title.toLowerCase() === 'search').length > 0 && (
              <div className="relative w-[450px]">
                <input
                  type="text"
                  placeholder="Search for products, brands and more"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleSearch}
                  className="w-full px-5 py-3 pl-12 pr-14 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50 focus:shadow-lg transition-all shadow-inner"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <button
                  onClick={handleSearchButtonClick}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg transition-all backdrop-blur-sm"
                >
                  <Search size={18} />
                </button>
              </div>
            )}
          </div>

          <nav className="flex items-center gap-4">
            {/* Dynamic Header Links */}
            {config.header?.links?.filter(link => link.isVisible).sort((a, b) => a.order - b.order).map((link, index) => (
              <a
                key={index}
                href={link.url}
                target={link.openInNewTab ? '_blank' : '_self'}
                rel={link.openInNewTab ? 'noopener noreferrer' : ''}
                className="hover:text-pink-200 transition-all px-3 py-2 rounded-lg hover:bg-white/10 flex items-center gap-2 font-medium"
                style={{ color: config.header?.textColor || '#FFFFFF' }}
              >
                {link.iconBase64 ? (
                  <img src={link.iconBase64} alt={link.text} className="w-5 h-5" />
                ) : link.icon ? (
                  <img src={link.icon} alt={link.text} className="w-5 h-5" />
                ) : null}
                <span>{link.text}</span>
              </a>
            ))}
            
            {/* Dynamic Header Icons */}
            {config.header?.icons?.filter(icon => icon.isVisible && icon.isDesktop).sort((a, b) => a.order - b.order).map((icon, index) => {
              const title = icon.title.toLowerCase();
              if (title === 'search') return null; // Search is handled separately
              
              if (title === 'cart') {
                return (
                  <a
                    key={index}
                    href={icon.url || '/cart'}
                    className="p-2 rounded-lg hover:bg-white/10 transition-all relative"
                    style={{ color: config.header?.textColor || '#FFFFFF' }}
                  >
                    {icon.iconBase64 ? (
                      <img src={icon.iconBase64} alt={icon.title} className="w-6 h-6" />
                    ) : icon.icon ? (
                      <img src={icon.icon} alt={icon.title} className="w-6 h-6" />
                    ) : (
                      <ShoppingBag size={22} />
                    )}
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-black text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold shadow-lg">
                        {cartCount}
                      </span>
                    )}
                  </a>
                );
              }
              
              if (title === 'wishlist') {
                return (
                  <a
                    key={index}
                    href={icon.url || '/dashboard?tab=wishlist'}
                    className="p-2 rounded-lg hover:bg-white/10 transition-all"
                    style={{ color: config.header?.textColor || '#FFFFFF' }}
                  >
                    {icon.iconBase64 ? (
                      <img src={icon.iconBase64} alt={icon.title} className="w-6 h-6" />
                    ) : icon.icon ? (
                      <img src={icon.icon} alt={icon.title} className="w-6 h-6" />
                    ) : (
                      <Heart size={22} />
                    )}
                  </a>
                );
              }
              
              if (title === 'download-app' || title === 'download app') {
                return (
                  <a
                    key={index}
                    href={icon.url || '#'}
                    className="hover:text-pink-200 transition-all px-3 py-2 rounded-lg hover:bg-white/10 flex items-center gap-2 font-medium"
                    style={{ color: config.header?.textColor || '#FFFFFF' }}
                  >
                    {icon.iconBase64 ? (
                      <img src={icon.iconBase64} alt={icon.title} className="w-5 h-5" />
                    ) : icon.icon ? (
                      <img src={icon.icon} alt={icon.title} className="w-5 h-5" />
                    ) : (
                      <Download size={18} />
                    )}
                    <span>{icon.title || 'Download App'}</span>
                  </a>
                );
              }
              
              if (title === 'login') {
                return isAuthenticated ? null : (
                  <a
                    key={index}
                    href={icon.url || '/login'}
                    className="bg-white text-purple-600 px-6 py-2.5 rounded-xl font-bold hover:bg-pink-100 transition-all shadow-lg hover:shadow-xl"
                  >
                    Login
                  </a>
                );
              }
              
              // Default icon rendering for custom icons
              return (
                <a
                  key={index}
                  href={icon.url || '#'}
                  className="p-2 rounded-lg hover:bg-white/10 transition-all"
                  style={{ color: config.header?.textColor || '#FFFFFF' }}
                >
                  {icon.iconBase64 ? (
                    <img src={icon.iconBase64} alt={icon.title} className="w-6 h-6" />
                  ) : icon.icon ? (
                    <img src={icon.icon} alt={icon.title} className="w-6 h-6" />
                  ) : (
                    <span className="text-sm font-medium">{icon.title}</span>
                  )}
                </a>
              );
            })}
            
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                {isAdmin ? (
                  <a href="/admin" className="p-2 rounded-lg hover:bg-white/10 transition-all" style={{ color: config.header?.textColor || '#FFFFFF' }}>
                    <User size={22} />
                  </a>
                ) : (
                  <a href="/dashboard" className="p-2 rounded-lg hover:bg-white/10 transition-all" style={{ color: config.header?.textColor || '#FFFFFF' }}>
                    <User size={22} />
                  </a>
                )}
                {user?.isPremier && (
                  <span className="bg-gradient-to-r from-yellow-400 to-orange-400 text-black px-4 py-1.5 rounded-full text-sm font-bold shadow-lg">
                    ⭐ Premier
                  </span>
                )}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    logout();
                    window.location.href = '/';
                  }}
                  className="p-2 rounded-lg hover:bg-white/10 transition-all"
                  style={{ color: config.header?.textColor || '#FFFFFF' }}
                >
                  <LogOut size={22} />
                </button>
              </div>
            ) : null}
          </nav>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white rounded-lg mt-2 p-4 shadow-lg">
            <div className="flex flex-col gap-4">
              {config.header?.icons?.filter(icon => icon.isVisible && icon.isMobile && icon.title.toLowerCase() === 'search').length > 0 && (
                <>
                  <input
                    type="text"
                    placeholder="Search products..."
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 mobile-search-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleMobileSearch}
                  />
                  <button
                    onClick={handleSearchButtonClick}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                  >
                    Search
                  </button>
                </>
              )}
              
              {/* Dynamic Header Links */}
              {config.header?.links?.filter(link => link.isVisible).sort((a, b) => a.order - b.order).map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  target={link.openInNewTab ? '_blank' : '_self'}
                  rel={link.openInNewTab ? 'noopener noreferrer' : ''}
                  className="flex items-center gap-2 text-gray-700 hover:text-purple-600 py-2 px-3 rounded-lg hover:bg-purple-50"
                >
                  {link.iconBase64 ? (
                    <img src={link.iconBase64} alt={link.text} className="w-5 h-5" />
                  ) : link.icon ? (
                    <img src={link.icon} alt={link.text} className="w-5 h-5" />
                  ) : null}
                  <span>{link.text}</span>
                </a>
              ))}
              
              {/* Dynamic Header Icons for Mobile */}
              {config.header?.icons?.filter(icon => icon.isVisible && icon.isMobile).sort((a, b) => a.order - b.order).map((icon, index) => {
                const title = icon.title.toLowerCase();
                if (title === 'search') return null; // Search is handled separately
                
                if (title === 'cart') {
                  return (
                    <a
                      key={index}
                      href={icon.url || '/cart'}
                      className="flex items-center gap-2 text-gray-700 hover:text-purple-600 py-2 px-3 rounded-lg hover:bg-purple-50 relative"
                    >
                      {icon.iconBase64 ? (
                        <img src={icon.iconBase64} alt={icon.title} className="w-5 h-5" />
                      ) : icon.icon ? (
                        <img src={icon.icon} alt={icon.title} className="w-5 h-5" />
                      ) : (
                        <ShoppingBag size={18} />
                      )}
                      <span>Cart</span>
                      {cartCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-black text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold shadow-lg">
                          {cartCount}
                        </span>
                      )}
                    </a>
                  );
                }
                
                if (title === 'wishlist') {
                  return (
                    <a
                      key={index}
                      href={icon.url || '/dashboard?tab=wishlist'}
                      className="flex items-center gap-2 text-gray-700 hover:text-purple-600 py-2 px-3 rounded-lg hover:bg-purple-50"
                    >
                      {icon.iconBase64 ? (
                        <img src={icon.iconBase64} alt={icon.title} className="w-5 h-5" />
                      ) : icon.icon ? (
                        <img src={icon.icon} alt={icon.title} className="w-5 h-5" />
                      ) : (
                        <Heart size={18} />
                      )}
                      <span>Wishlist</span>
                    </a>
                  );
                }
                
                if (title === 'download-app' || title === 'download app') {
                  return (
                    <a
                      key={index}
                      href={icon.url || '#'}
                      className="flex items-center gap-2 text-gray-700 hover:text-purple-600 py-2 px-3 rounded-lg hover:bg-purple-50"
                    >
                      {icon.iconBase64 ? (
                        <img src={icon.iconBase64} alt={icon.title} className="w-5 h-5" />
                      ) : icon.icon ? (
                        <img src={icon.icon} alt={icon.title} className="w-5 h-5" />
                      ) : (
                        <Download size={18} />
                      )}
                      <span>{icon.title || 'Download App'}</span>
                    </a>
                  );
                }
                
                if (title === 'login') {
                  return isAuthenticated ? null : (
                    <a
                      key={index}
                      href={icon.url || '/login'}
                      className="flex items-center gap-2 text-gray-700 hover:text-purple-600 py-2 px-3 rounded-lg hover:bg-purple-50"
                    >
                      <User size={18} />
                      <span>Login</span>
                    </a>
                  );
                }
                
                // Default icon rendering for custom icons
                return (
                  <a
                    key={index}
                    href={icon.url || '#'}
                    className="flex items-center gap-2 text-gray-700 hover:text-purple-600 py-2 px-3 rounded-lg hover:bg-purple-50"
                  >
                    {icon.iconBase64 ? (
                      <img src={icon.iconBase64} alt={icon.title} className="w-5 h-5" />
                    ) : icon.icon ? (
                      <img src={icon.icon} alt={icon.title} className="w-5 h-5" />
                    ) : null}
                    <span>{icon.title}</span>
                  </a>
                );
              })}
              
              {isAuthenticated ? (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {user?.fullName?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                      <span className="font-semibold text-gray-800">{user?.fullName || 'User'}</span>
                      <p className="text-xs text-gray-600">{user?.email || ''}</p>
                      {user?.isPremier && (
                        <span className="inline-block mt-1 bg-yellow-400 text-black px-2 py-0.5 rounded-full text-xs font-semibold">
                          ⭐ Premier
                        </span>
                      )}
                    </div>
                  </div>
                  {isAdmin ? (
                    <a href="/admin" className="flex items-center gap-2 text-gray-700 hover:text-purple-600 py-2 px-3 rounded-lg hover:bg-purple-50">
                      <User size={18} />
                      <span>Admin Dashboard</span>
                    </a>
                  ) : (
                    <a href="/dashboard" className="flex items-center gap-2 text-gray-700 hover:text-purple-600 py-2 px-3 rounded-lg hover:bg-purple-50">
                      <User size={18} />
                      <span>My Dashboard</span>
                    </a>
                  )}
                  {!isAdmin && (
                    <>
                      <a href="/dashboard?tab=orders" className="flex items-center gap-2 text-gray-700 hover:text-purple-600 py-2 px-3 rounded-lg hover:bg-purple-50">
                        <ShoppingBag size={18} />
                        <span>My Orders</span>
                      </a>
                      <a href="/dashboard?tab=wishlist" className="flex items-center gap-2 text-gray-700 hover:text-purple-600 py-2 px-3 rounded-lg hover:bg-purple-50">
                        <Heart size={18} />
                        <span>Wishlist</span>
                      </a>
                    </>
                  )}
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      logout();
                      setMobileMenuOpen(false);
                      window.location.href = '/';
                    }}
                    className="flex items-center gap-2 text-red-600 font-semibold py-2 px-3 rounded-lg hover:bg-red-50"
                  >
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <a href="/login" className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-lg font-semibold">
                  Login / Register
                </a>
              )}
              <a href="#" className="text-gray-700 hover:text-purple-600">Download App</a>
              <a href="#" className="text-gray-700 hover:text-purple-600">Become a Supplier</a>
              <a href="#" className="text-gray-700 hover:text-purple-600">Wishlist</a>
              <a href="#" className="text-gray-700 hover:text-purple-600">My Orders</a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
