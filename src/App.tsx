import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Search, Hotel, MapPin, Calendar, Star, Users, MessageSquareText } from 'lucide-react';
import { useAuthStore } from './store/authStore';
import { useSearchStore } from './store/searchStore';
import { useThemeStore } from './store/themeStore';
import { SearchResults } from './components/SearchResults';
import { BookingModal } from './components/BookingModal';
import { UserDashboard } from './components/UserDashboard';
import { ThemeToggle } from './components/ThemeToggle';
import { NotificationCenter } from './components/NotificationCenter';
import { SignIn } from './pages/SignIn';
import { SignUp } from './pages/SignUp';
import { supabase } from './lib/supabase';
import { Toaster } from 'react-hot-toast';

function App() {
  const [selectedHotel, setSelectedHotel] = React.useState(null);
  const { user, setUser } = useAuthStore();
  const { query, setQuery, search } = useSearchStore();
  const { isDarkMode } = useThemeStore();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [setUser]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    await search();
  };

  return (
    <Router>
      <div className={`min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200`}>
        <header className="bg-white dark:bg-gray-800 shadow-sm">
          <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <Hotel className="w-8 h-8 text-primary-600 dark:text-primary-400" />
              <span className="text-2xl font-bold text-gray-900 dark:text-white">PromptInn</span>
            </Link>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              {user && <NotificationCenter />}
              {user ? (
                <>
                  <Link to="/dashboard" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                    Dashboard
                  </Link>
                  <button
                    onClick={() => useAuthStore.getState().signOut()}
                    className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/signin"
                    className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </nav>
        </header>

        <Routes>
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route
            path="/"
            element={
              <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="text-center mb-12">
                  <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                    Find Your Perfect Stay with AI
                  </h1>
                  <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                    Just tell us what you're looking for, and our AI will find the ideal hotel for you.
                  </p>
                </div>

                {/* Search Bar */}
                <div className="max-w-4xl mx-auto mb-16">
                  <form onSubmit={handleSearch}>
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl">
                      <div className="flex items-center p-4">
                        <Search className="w-6 h-6 text-gray-400 dark:text-gray-500 mr-3" />
                        <input
                          type="text"
                          placeholder="Try 'Find me a 4-star hotel with a pool in Mumbai'"
                          className="w-full text-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 bg-transparent outline-none"
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                        />
                      </div>
                      <div className="border-t border-gray-100 dark:border-gray-700 p-4 flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center space-x-6">
                          <div className="flex items-center text-gray-600 dark:text-gray-300">
                            <MapPin className="w-5 h-5 mr-2" />
                            <span>Location</span>
                          </div>
                          <div className="flex items-center text-gray-600 dark:text-gray-300">
                            <Calendar className="w-5 h-5 mr-2" />
                            <span>Dates</span>
                          </div>
                          <div className="flex items-center text-gray-600 dark:text-gray-300">
                            <Users className="w-5 h-5 mr-2" />
                            <span>Guests</span>
                          </div>
                        </div>
                        <button
                          type="submit"
                          className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition"
                        >
                          Search
                        </button>
                      </div>
                    </div>
                  </form>
                </div>

                {/* Search Results */}
                <SearchResults onBookNow={setSelectedHotel} />

                {/* Features Section */}
                <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="text-center">
                    <div className="bg-primary-100 dark:bg-primary-900 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageSquareText className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Natural Language Search</h3>
                    <p className="text-gray-600 dark:text-gray-300">Search for hotels using everyday language, just like talking to a friend.</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-primary-100 dark:bg-primary-900 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Star className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Personalized Results</h3>
                    <p className="text-gray-600 dark:text-gray-300">Get hotel recommendations tailored to your preferences and needs.</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-primary-100 dark:bg-primary-900 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Hotel className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Instant Booking</h3>
                    <p className="text-gray-600 dark:text-gray-300">Book your perfect stay directly through our platform with ease.</p>
                  </div>
                </div>
              </main>
            }
          />
        </Routes>

        {/* Modals and Toaster */}
        {selectedHotel && (
          <BookingModal
            hotel={selectedHotel}
            isOpen={true}
            onClose={() => setSelectedHotel(null)}
          />
        )}
        <Toaster position="top-right" />
      </div>
    </Router>
  );
}

export default App;