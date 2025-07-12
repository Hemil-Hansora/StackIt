import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Search, 
  Bell, 
  Plus, 
  Sun, 
  Moon, 
  Menu, 
  X, 
  User,
  LogOut,
  Settings,
  Crown
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from './ui/dropdown-menu';
import { Badge } from './ui/badge';
import AuthDialog from './AuthDialog';
import { useApp } from '../context/AppContext';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';

export default function Navbar() {
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { state, dispatch } = useApp();
  const { currentUser, isAuthenticated, logout } = useAuth();
  const { getUnreadCount, getUserNotifications, markAsRead } = useNotifications();
  const navigate = useNavigate();

  const unreadCount = currentUser ? getUnreadCount(currentUser.id) : 0;
  const notifications = currentUser ? getUserNotifications(currentUser.id).slice(0, 5) : [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/');
  };

  const handleNotificationClick = (notification: { id: string; relatedId?: string }) => {
    markAsRead(notification.id);
    if (notification.relatedId) {
      navigate(`/q/${notification.relatedId}`);
    }
  };

  const toggleTheme = () => {
    dispatch({ type: 'TOGGLE_THEME' });
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className={`sticky top-0 z-50 border-b transition-colors ${
      state.theme === 'dark' 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    }`}>
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-2 rounded-lg"
            >
              <span className="font-bold text-lg">SI</span>
            </motion.div>
            <span className="font-bold text-xl hidden sm:block">
              StackIt
            </span>
          </Link>

          {/* Search Bar - Desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search questions..."
                value={state.searchQuery}
                onChange={(e) => dispatch({ type: 'SET_SEARCH_QUERY', payload: e.target.value })}
                className="pl-10 pr-4"
              />
            </div>
          </form>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Sort Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  {state.sortBy === 'newest' && 'Newest'}
                  {state.sortBy === 'votes' && 'Most Voted'}
                  {state.sortBy === 'unanswered' && 'Unanswered'}
                  {state.sortBy === 'trending' && 'Trending'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => dispatch({ type: 'SET_SORT_BY', payload: 'newest' })}>
                  Newest
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => dispatch({ type: 'SET_SORT_BY', payload: 'votes' })}>
                  Most Voted
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => dispatch({ type: 'SET_SORT_BY', payload: 'unanswered' })}>
                  Unanswered
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => dispatch({ type: 'SET_SORT_BY', payload: 'trending' })}>
                  Trending
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Ask Question Button */}
            {isAuthenticated && (
              <Button asChild className="bg-blue-600 hover:bg-blue-700">
                <Link to="/ask">
                  <Plus className="w-4 h-4 mr-2" />
                  Ask Question
                </Link>
              </Button>
            )}

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="p-2"
            >
              {state.theme === 'light' ? (
                <Moon className="w-4 h-4" />
              ) : (
                <Sun className="w-4 h-4" />
              )}
            </Button>

            {/* Notifications */}
            {isAuthenticated && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="relative p-2">
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center p-0">
                        {unreadCount}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-80">
                  <div className="p-3 border-b">
                    <h3 className="font-semibold">Notifications</h3>
                  </div>
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      No new notifications
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <DropdownMenuItem
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        className="p-4 cursor-pointer"
                      >
                        <div className="space-y-1">
                          <p className="text-sm font-medium">{notification.title}</p>
                          <p className="text-xs text-gray-500">{notification.message}</p>
                          <p className="text-xs text-gray-400">
                            {new Date(notification.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </DropdownMenuItem>
                    ))
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* User Menu */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="p-0">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={currentUser?.avatar} />
                      <AvatarFallback>
                        {currentUser?.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <div className="p-3 border-b">
                    <div className="flex items-center space-x-2">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={currentUser?.avatar} />
                        <AvatarFallback>
                          {currentUser?.name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{currentUser?.name}</p>
                        <p className="text-sm text-gray-500 flex items-center">
                          {currentUser?.reputation} reputation
                          {currentUser?.role === 'admin' && (
                            <Crown className="w-3 h-3 ml-1 text-yellow-500" />
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                  <DropdownMenuItem asChild>
                    <Link to={`/user/${currentUser?.id}`}>
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/leaderboard">
                      <Crown className="w-4 h-4 mr-2" />
                      Leaderboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={() => setIsAuthDialogOpen(true)}>
                Sign In
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t py-4 space-y-4"
          >
            {/* Mobile Search */}
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search questions..."
                  value={state.searchQuery}
                  onChange={(e) => dispatch({ type: 'SET_SEARCH_QUERY', payload: e.target.value })}
                  className="pl-10 pr-4"
                />
              </div>
            </form>

            <div className="space-y-2">
              {isAuthenticated && (
                <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
                  <Link to="/ask">
                    <Plus className="w-4 h-4 mr-2" />
                    Ask Question
                  </Link>
                </Button>
              )}

              {isAuthenticated ? (
                <>
                  <Button asChild variant="outline" className="w-full">
                    <Link to={`/user/${currentUser?.id}`}>
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/leaderboard">
                      <Crown className="w-4 h-4 mr-2" />
                      Leaderboard
                    </Link>
                  </Button>
                  <Button onClick={handleLogout} variant="outline" className="w-full">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsAuthDialogOpen(true)} className="w-full">
                  Sign In
                </Button>
              )}

              <Button
                variant="outline"
                onClick={toggleTheme}
                className="w-full"
              >
                {state.theme === 'light' ? (
                  <>
                    <Moon className="w-4 h-4 mr-2" />
                    Dark Mode
                  </>
                ) : (
                  <>
                    <Sun className="w-4 h-4 mr-2" />
                    Light Mode
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </div>

      <AuthDialog
        isOpen={isAuthDialogOpen}
        onClose={() => setIsAuthDialogOpen(false)}
      />
    </nav>
  );
}