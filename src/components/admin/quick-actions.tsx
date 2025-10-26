'use client';

import Link from 'next/link';
import { 
  Plus, 
  Users, 
  FileText, 
  MessageCircle, 
  Settings, 
  BarChart3, 
  Upload,
  Download,
  Shield,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';

const QuickActions = () => {
  const actions = [
    {
      title: 'Add Article',
      description: 'Create new news article',
      icon: <Plus className="h-6 w-6" />,
      href: '/admin/articles/add',
      color: 'bg-blue-500 hover:bg-blue-600',
      iconColor: 'text-blue-100'
    },
    {
      title: 'Manage Users',
      description: 'View and edit user accounts',
      icon: <Users className="h-6 w-6" />,
      href: '/admin/users',
      color: 'bg-green-500 hover:bg-green-600',
      iconColor: 'text-green-100'
    },
    {
      title: 'Moderate Comments',
      description: 'Review and manage comments',
      icon: <MessageCircle className="h-6 w-6" />,
      href: '/admin/comments',
      color: 'bg-purple-500 hover:bg-purple-600',
      iconColor: 'text-purple-100'
    },
    {
      title: 'View Analytics',
      description: 'Check performance metrics',
      icon: <BarChart3 className="h-6 w-6" />,
      href: '/admin/analytics',
      color: 'bg-orange-500 hover:bg-orange-600',
      iconColor: 'text-orange-100'
    },
    {
      title: 'System Settings',
      description: 'Configure application',
      icon: <Settings className="h-6 w-6" />,
      href: '/admin/settings',
      color: 'bg-gray-500 hover:bg-gray-600',
      iconColor: 'text-gray-100'
    },
    {
      title: 'Backup Data',
      description: 'Export database backup',
      icon: <Download className="h-6 w-6" />,
      href: '#',
      color: 'bg-indigo-500 hover:bg-indigo-600',
      iconColor: 'text-indigo-100',
      onClick: () => toast.message('Backup feature coming soon!')
    }
  ];

  return (
    <div className="bg-card text-card-foreground rounded-lg shadow-sm border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">
            Quick Actions
          </h2>
          <p className="text-sm text-muted-foreground">
            Fast access to common admin tasks
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Zap className="h-4 w-4" />
          <span>Quick Access</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {actions.map((action, index) => (
          <div key={index}>
            {action.onClick ? (
              <button
                onClick={action.onClick}
                className={`w-full p-4 rounded-lg text-left transition-all duration-200 transform hover:scale-105 ${action.color} text-white shadow-sm hover:shadow-md`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${action.iconColor} bg-white/20`}>
                    {action.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">{action.title}</h3>
                    <p className="text-sm text-white/80 mt-1">{action.description}</p>
                  </div>
                </div>
              </button>
            ) : (
              <Link
                href={action.href}
                className={`block w-full p-4 rounded-lg text-left transition-all duration-200 transform hover:scale-105 ${action.color} text-white shadow-sm hover:shadow-md`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${action.iconColor} bg-white/20`}>
                    {action.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">{action.title}</h3>
                    <p className="text-sm text-white/80 mt-1">{action.description}</p>
                  </div>
                </div>
              </Link>
            )}
          </div>
        ))}
      </div>
      
      {/* Quick Stats Summary */}
      <div className="mt-6 pt-6 border-t border-border">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {/* Need help? Check the admin guide */}
          </span>
          <Link 
            href="/admin/settings" 
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            View Guide →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;
