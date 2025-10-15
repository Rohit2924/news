'use client';
import { useSiteSettings } from '../../hooks/useSiteSettings';

export default function TestSettingsPage() {
  const { settings, loading, error } = useSiteSettings();

  if (loading) {
    return <div className="p-8">Loading settings...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Settings Test Page</h1>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Current Settings from API:</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <strong>Site Name:</strong> {settings?.siteName || 'Not loaded'}
          </div>
          <div>
            <strong>Site Description:</strong> {settings?.siteDescription || 'Not loaded'}
          </div>
          <div>
            <strong>Site Logo:</strong> 
            {settings?.siteLogo ? (
              <img src={settings.siteLogo} alt="Site Logo" className="w-16 h-16 mt-2" />
            ) : (
              'Not set'
            )}
          </div>
          <div>
            <strong>Site Favicon:</strong> 
            {settings?.siteFavicon ? (
              <img src={settings.siteFavicon} alt="Site Favicon" className="w-16 h-16 mt-2" />
            ) : (
              'Not set'
            )}
          </div>
          <div>
            <strong>Contact Email:</strong> {settings?.contactEmail || 'Not set'}
          </div>
          <div>
            <strong>Contact Phone:</strong> {settings?.contactPhone || 'Not set'}
          </div>
          <div>
            <strong>Facebook URL:</strong> {settings?.facebookUrl || 'Not set'}
          </div>
          <div>
            <strong>Twitter URL:</strong> {settings?.twitterUrl || 'Not set'}
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Raw Settings Data:</h3>
          <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(settings, null, 2)}
          </pre>
        </div>
      </div>

      <div className="mt-8 bg-blue-50 dark:bg-blue-900 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Testing Instructions:</h2>
        <ol className="list-decimal list-inside space-y-2">
          <li>Go to <code>/admin/settings</code> and change some settings</li>
          <li>Save the settings</li>
          <li>Refresh this page to see if the changes appear</li>
          <li>Check the main website header and footer for changes</li>
        </ol>
      </div>
    </div>
  );
}

