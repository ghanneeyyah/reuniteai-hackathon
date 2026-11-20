// src/components/common/Navbar.jsx
import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  User,
  LogOut,
  LayoutDashboard,
  Search,
  Bell,
  Shield,
  Map,
  FileCheck,
  Users,
  Activity,
  CheckCheck,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { SocketContext } from '../../context/SocketContext';
import notificationService from '../../services/notification.service';
import { timeAgo } from '../../utils/helpers';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { subscribe } = useContext(SocketContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    const fetchNotifications = async () => {
      try {
        const res = await notificationService.getAll(20);
        setNotifications(res.data || []);
        setUnreadCount(res.unreadCount || 0);
      } catch (err) {
        console.error('Failed to fetch notifications:', err);
      }
    };

    fetchNotifications();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || !subscribe) return;
    const unsub = subscribe('notification', (newNotif) => {
      setNotifications((prev) => {
        if (prev.some((n) => n._id === newNotif._id)) return prev;
        return [newNotif, ...prev].slice(0, 20);
      });
      setUnreadCount((prev) => prev + 1);
    });
    return unsub;
  }, [isAuthenticated, subscribe]);

  const handleNotificationClick = async (notif) => {
    setIsNotifOpen(false);
    if (!notif.isRead) {
      try {
        await notificationService.markAsRead(notif._id);
        setNotifications((prev) =>
          prev.map((n) => (n._id === notif._id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (err) {
        console.error('Failed to mark notification as read:', err);
      }
    }
    if (notif.link) {
      navigate(notif.link);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const citizenLinks = [
    { to: '/citizen/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/citizen/report-missing', label: 'Report Missing', icon: Search },
    { to: '/citizen/report-sighting', label: 'Report Sighting', icon: Bell },
    { to: '/citizen/map', label: 'Live Map', icon: Map },
    { to: '/citizen/my-reports', label: 'My Reports', icon: FileCheck },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: Shield },
    { to: '/admin/missing-persons', label: 'Missing Persons', icon: Users },
    { to: '/admin/sightings', label: 'Sightings', icon: Bell },
    { to: '/admin/matches', label: 'Matches', icon: Search },
    { to: '/admin/map', label: 'Live Map', icon: Map },
    { to: '/admin/users', label: 'Users', icon: User },
    { to: '/admin/system-health', label: 'System', icon: Activity },
  ];

  const navLinks = isAdmin ? adminLinks : citizenLinks;

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map((p) => p[0]).join('').toUpperCase().slice(0, 2);
  };

  const getFirstName = (name) => {
    if (!name) return '';
    return name.split(' ')[0];
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 bg-maroon-800 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <span className="text-xl font-bold text-maroon-800">
              Reunite<span className="text-gray-900">AI</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-maroon-800 text-white'
                        : 'text-gray-600 hover:text-maroon-800 hover:bg-maroon-50'
                    }`}
                  >
                    <link.icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                );
              })}
            </div>
          )}

          {/* Right side */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                {/* Notifications Bell */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setIsNotifOpen(!isNotifOpen);
                      setIsProfileDropdownOpen(false);
                    }}
                    className="relative p-2 rounded-lg text-gray-600 hover:text-maroon-800 hover:bg-maroon-50 transition-colors"
                    title="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {isNotifOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setIsNotifOpen(false)} />
                      <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                          <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                          {unreadCount > 0 && (
                            <button
                              onClick={handleMarkAllRead}
                              className="flex items-center gap-1 text-xs text-maroon-800 hover:underline font-medium"
                            >
                              <CheckCheck className="w-3.5 h-3.5" />
                              Mark all read
                            </button>
                          )}
                        </div>

                        <div className="max-h-96 overflow-y-auto divide-y divide-gray-100">
                          {notifications.length === 0 ? (
                            <div className="px-4 py-8 text-center text-sm text-gray-500">
                              No notifications yet.
                            </div>
                          ) : (
                            notifications.map((notif) => (
                              <button
                                key={notif._id}
                                onClick={() => handleNotificationClick(notif)}
                                className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-start gap-3 ${
                                  !notif.isRead ? 'bg-maroon-50/40' : ''
                                }`}
                              >
                                <span
                                  className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                                    !notif.isRead ? 'bg-maroon-800' : 'bg-transparent'
                                  }`}
                                />
                                <div className="min-w-0 flex-grow">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {notif.title}
                                  </p>
                                  <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">
                                    {notif.message}
                                  </p>
                                  <p className="text-[11px] text-gray-400 mt-1">
                                    {timeAgo(notif.createdAt)}
                                  </p>
                                </div>
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setIsProfileDropdownOpen(!isProfileDropdownOpen);
                      setIsNotifOpen(false);
                    }}
                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-maroon-50 transition-colors"
                  >
                    <div className="w-8 h-8 bg-maroon-800 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium text-sm">
                        {getInitials(user?.name)}
                      </span>
                    </div>
                    <span className="hidden sm:block text-sm font-medium text-gray-700">
                      {getFirstName(user?.name)}
                    </span>
                  </button>

                  {isProfileDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setIsProfileDropdownOpen(false)} />
                      <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-20 py-1">
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                          <p className="text-xs text-gray-500">{user?.email}</p>
                        </div>
                        <Link
                          to="/citizen/profile"
                          onClick={() => setIsProfileDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-maroon-50 hover:text-maroon-800"
                        >
                          <User className="w-4 h-4" />
                          Profile
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-maroon-50 hover:text-maroon-800"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-secondary text-sm py-2 px-4">Login</Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-4">Register</Link>
              </div>
            )}

            {isAuthenticated && (
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-maroon-50 hover:text-maroon-800"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {isAuthenticated && isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 py-3 space-y-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-maroon-800 text-white'
                      : 'text-gray-600 hover:text-maroon-800 hover:bg-maroon-50'
                  }`}
                >
                  <link.icon className="w-5 h-5" />
                  {link.label}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </nav>
  );
}