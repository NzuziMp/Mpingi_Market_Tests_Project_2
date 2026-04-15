import { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import ListingsPage from './pages/ListingsPage';
import ListingDetailPage from './pages/ListingDetailPage';
import PostListingPage from './pages/PostListingPage';
import DashboardPage from './pages/DashboardPage';
import type { ListingFilters } from './lib/types';

type Page = 'home' | 'auth' | 'listings' | 'listing-detail' | 'post-listing' | 'dashboard' | 'profile' | 'saved';

interface PageState {
  page: Page;
  params: Record<string, string>;
}

function AppContent() {
  const [pageState, setPageState] = useState<PageState>({ page: 'home', params: {} });
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearchQuery, setActiveSearchQuery] = useState('');
  const [listingFilters, setListingFilters] = useState<ListingFilters>({});

  function navigate(page: string, params: Record<string, string> = {}) {
    setPageState({ page: page as Page, params });
    if (page === 'listings' && params.category) {
      setListingFilters({ category: params.category });
      setActiveSearchQuery('');
      setSearchQuery('');
    } else if (page !== 'listings') {
      setListingFilters({});
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleSearchSubmit() {
    setActiveSearchQuery(searchQuery);
    setListingFilters({});
    setPageState({ page: 'listings', params: {} });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const hideHeaderFooter = pageState.page === 'auth';

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {!hideHeaderFooter && (
        <Header
          currentPage={pageState.page}
          onNavigate={navigate}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSearchSubmit={handleSearchSubmit}
        />
      )}
      <main className="flex-1">
        {pageState.page === 'home' && (
          <HomePage
            onNavigate={navigate}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSearchSubmit={handleSearchSubmit}
          />
        )}
        {pageState.page === 'auth' && (
          <AuthPage onNavigate={navigate} />
        )}
        {pageState.page === 'listings' && (
          <ListingsPage
            onNavigate={navigate}
            initialFilters={listingFilters}
            searchQuery={activeSearchQuery}
          />
        )}
        {pageState.page === 'listing-detail' && (
          <ListingDetailPage
            listingId={pageState.params.id ?? ''}
            onNavigate={navigate}
          />
        )}
        {pageState.page === 'post-listing' && (
          <PostListingPage onNavigate={navigate} />
        )}
        {(pageState.page === 'dashboard' || pageState.page === 'profile' || pageState.page === 'saved') && (
          <DashboardPage onNavigate={navigate} />
        )}
      </main>
      {!hideHeaderFooter && <Footer onNavigate={navigate} />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
