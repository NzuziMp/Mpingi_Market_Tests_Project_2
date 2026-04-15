import { useState } from 'react';
import { Search, Menu, X, Heart, Plus, ChevronDown, LogOut, User, LayoutDashboard, Globe } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface HeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearchSubmit: () => void;
}

export default function Header({ currentPage, onNavigate, searchQuery, onSearchChange, onSearchSubmit }: HeaderProps) {
  const { user, profile, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') onSearchSubmit();
  }

  async function handleSignOut() {
    await signOut();
    setUserMenuOpen(false);
    onNavigate('home');
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16 gap-4">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 flex-shrink-0"
          >
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 hidden sm:block">
              Mpingi<span className="text-blue-600">Market</span>
            </span>
          </button>

          <div className="flex-1 max-w-2xl mx-auto hidden md:flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search for anything..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            <button
              onClick={onSearchSubmit}
              className="px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors flex-shrink-0"
            >
              Search
            </button>
          </div>

          <nav className="hidden md:flex items-center gap-1 ml-auto">
            <button
              onClick={() => onNavigate('listings')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${currentPage === 'listings' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
            >
              Browse
            </button>

            {user ? (
              <>
                <button
                  onClick={() => onNavigate('saved')}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors relative"
                >
                  <Heart className="w-5 h-5" />
                </button>
                <button
                  onClick={() => onNavigate('post-listing')}
                  className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-xl hover:bg-orange-600 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Post Ad
                </button>
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-sm">
                        {profile?.full_name?.charAt(0).toUpperCase() ?? user.email?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900">{profile?.full_name ?? 'User'}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                      <button
                        onClick={() => { onNavigate('dashboard'); setUserMenuOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4" /> My Dashboard
                      </button>
                      <button
                        onClick={() => { onNavigate('profile'); setUserMenuOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <User className="w-4 h-4" /> My Profile
                      </button>
                      <div className="border-t border-gray-100 mt-1">
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <button
                  onClick={() => onNavigate('auth')}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onNavigate('post-listing')}
                  className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-xl hover:bg-orange-600 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Post Ad
                </button>
              </>
            )}
          </nav>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors ml-auto"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <div className="md:hidden pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search for anything..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-3 space-y-1">
          <button
            onClick={() => { onNavigate('listings'); setMobileOpen(false); }}
            className="w-full text-left px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
          >
            Browse Ads
          </button>
          {user ? (
            <>
              <button
                onClick={() => { onNavigate('dashboard'); setMobileOpen(false); }}
                className="w-full text-left px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                My Dashboard
              </button>
              <button
                onClick={() => { onNavigate('post-listing'); setMobileOpen(false); }}
                className="w-full px-3 py-2.5 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors text-center"
              >
                Post Free Ad
              </button>
              <button
                onClick={handleSignOut}
                className="w-full text-left px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => { onNavigate('auth'); setMobileOpen(false); }}
                className="w-full text-left px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => { onNavigate('post-listing'); setMobileOpen(false); }}
                className="w-full px-3 py-2.5 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors text-center"
              >
                Post Free Ad
              </button>
            </>
          )}
        </div>
      )}
    </header>
  );
}
