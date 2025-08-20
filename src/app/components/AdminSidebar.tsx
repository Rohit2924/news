import Link from 'next/link';
import { X, BarChart2, Folder, FileText, Users, Settings, Home, LogOut } from 'lucide-react';
import { useAuth } from './ui/AuthContext';
import { useRouter } from 'next/navigation';

interface AdminSidebarProps {
  open: boolean;
  onClose: () => void;
}

const links = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: <Home size={20} /> },
  { href: '/admin/analytics', label: 'Analytics', icon: <BarChart2 size={20} /> },
  { href: '/admin/catageories', label: 'Categories', icon: <Folder size={20} /> },
  { href: '/admin/articles', label: 'Articles', icon: <FileText size={20} /> },
  { href: '/admin/users', label: 'Users', icon: <Users size={20} /> },
  { href: '/admin/settings', label: 'Settings', icon: <Settings size={20} /> },
];

const AdminSidebar: React.FC<AdminSidebarProps> = ({ open, onClose }) => {
  const { logout, username } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/admin');
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
        aria-hidden={!open}
      />
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-900 shadow-lg z-50 transform transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'}`}
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <span className="text-lg font-bold text-red-600">Admin Panel</span>
          <button onClick={onClose} aria-label="Close sidebar">
            <X size={28} className="text-gray-700 dark:text-gray-200" />
          </button>
        </div>
        
        {/* User Info */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">Logged in as:</p>
          <p className="font-medium text-gray-900 dark:text-white">{username || 'Admin'}</p>
        </div>

        <nav className="mt-6">
          <ul className="space-y-2">
            {links.map(link => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="flex items-center px-6 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium"
                  onClick={onClose}
                >
                  <span className="mr-3">{link.icon}</span>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-4 left-0 right-0 px-6">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-6 py-3 text-gray-700 dark:text-gray-200 hover:bg-red-50 hover:text-red-600 transition-colors font-medium rounded-lg"
          >
            <LogOut size={20} className="mr-3" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar; 