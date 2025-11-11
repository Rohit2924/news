import React from 'react'
import Link from "next/link"
import { useSiteSettings } from '../../hooks/useSiteSettings'

const Footer = () => {
  const { settings } = useSiteSettings();
  
  return (
    <>
   <footer className="bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 text-white transition-all duration-300 relative overflow-hidden">
    {/* <!-- Background Pattern --> */}
    <div className="absolute inset-0 opacity-5 dark:opacity-10">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-linear(circle at 25% 25%, rgba(220, 38, 38, 0.1) 0%, transparent 50%), radial-linear(circle at 75% 75%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)"
        }}
      ></div>
    </div>
    <div className="container mx-auto px-4 py-12 relative z-10">
      <div className="grid md:grid-cols-5 gap-8">
        <div className="md:col-span-2">
          <div className="flex items-center mb-6">
            <img src={settings?.siteLogo || "https:placeholder.com"} alt="Logo" className="h-12 mr-3"/>
            <div>
              <h3 className="text-3xl font-bold bg-linear-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
                {settings?.siteName || "News Portal"}
              </h3>
              <p className="text-sm text-gray-400">
                {settings?.siteDescription || "Your trusted source for news"}
              </p>
            </div>
          </div>
          <p className="text-gray-300 mb-6 leading-relaxed text-lg">
            {settings?.siteDescription || "Your trusted source for news"}
          </p>
          <div className="flex space-x-4">
            {settings?.facebookUrl && (
              <a href={settings.facebookUrl} className="group bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 p-3 rounded-full transition-all duration-300 transform hover:scale-110 hover:shadow-lg">
                <i className="fab fa-facebook text-white text-lg"></i>
              </a>
            )}
            {settings?.twitterUrl && (
              <a href={settings.twitterUrl} className="group bg-linear-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 p-3 rounded-full transition-all duration-300 transform hover:scale-110 hover:shadow-lg">
                <i className="fab fa-twitter text-white text-lg"></i>
              </a>
            )}
            {settings?.youtubeUrl && (
              <a href={settings.youtubeUrl} className="group bg-linear-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 p-3 rounded-full transition-all duration-300 transform hover:scale-110 hover:shadow-lg">
                <i className="fab fa-youtube text-white text-lg"></i>
              </a>
            )}
            {settings?.instagramUrl && (
              <a href={settings.instagramUrl} className="group bg-linear-to-r from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800 p-3 rounded-full transition-all duration-300 transform hover:scale-110 hover:shadow-lg">
                <i className="fab fa-instagram text-white text-lg"></i>
              </a>
            )}
          </div>
        </div>
        
        <div className="space-y-6">
          <div>
            <h4 className="text-xl font-bold mb-4 bg-linear-to-r from-red-400 to-red-600 bg-clip-text text-transparent">Quick Links</h4>
            <ul className="space-y-3">
              <li><Link href="/privacy-policy" className="text-gray-300 hover:text-red-400 transition-all duration-300 block py-2 px-3 rounded-lg hover:bg-gray-800/50 hover:shadow-md transform hover:translate-x-1">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-gray-300 hover:text-red-400 transition-all duration-300 block py-2 px-3 rounded-lg hover:bg-gray-800/50 hover:shadow-md transform hover:translate-x-1">Terms</Link></li>
              <li><Link href="/about" className="text-gray-300 hover:text-red-400 transition-all duration-300 block py-2 px-3 rounded-lg hover:bg-gray-800/50 hover:shadow-md transform hover:translate-x-1">About Us</Link></li>
              <li><Link href="/contact" className="text-gray-300 hover:text-red-400 transition-all duration-300 block py-2 px-3 rounded-lg hover:bg-gray-800/50 hover:shadow-md transform hover:translate-x-1">Contact</Link></li>
              <li><Link href="/advertise" className="text-gray-300 hover:text-red-400 transition-all duration-300 block py-2 px-3 rounded-lg hover:bg-gray-800/50 hover:shadow-md transform hover:translate-x-1">Advertise</Link></li>
              <li><Link href="/careers" className="text-gray-300 hover:text-red-400 transition-all duration-300 block py-2 px-3 rounded-lg hover:bg-gray-800/50 hover:shadow-md transform hover:translate-x-1">Careers</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="space-y-6">
          <div>
            <h4 className="text-xl font-bold mb-4 bg-linear-to-r from-red-400 to-red-600 bg-clip-text text-transparent">Categories</h4>
            <ul className="space-y-3">
              <li><Link href="/politics" className="text-gray-300 hover:text-red-400 transition-all duration-300 block py-2 px-3 rounded-lg hover:bg-gray-800/50 hover:shadow-md transform hover:translate-x-1">Politics</Link></li>
              <li><Link href="/sports" className="text-gray-300 hover:text-red-400 transition-all duration-300 block py-2 px-3 rounded-lg hover:bg-gray-800/50 hover:shadow-md transform hover:translate-x-1">Sports</Link></li>
              <li><Link href="/entertainment" className="text-gray-300 hover:text-red-400 transition-all duration-300 block py-2 px-3 rounded-lg hover:bg-gray-800/50 hover:shadow-md transform hover:translate-x-1">Entertainment</Link></li>
              <li><Link href="/technology" className="text-gray-300 hover:text-red-400 transition-all duration-300 block py-2 px-3 rounded-lg hover:bg-gray-800/50 hover:shadow-md transform hover:translate-x-1">Tech</Link></li>
              <li><Link href="/international" className="text-gray-300 hover:text-red-400 transition-all duration-300 block py-2 px-3 rounded-lg hover:bg-gray-800/50 hover:shadow-md transform hover:translate-x-1">International</Link></li>
              <li><Link href="/economy" className="text-gray-300 hover:text-red-400 transition-all duration-300 block py-2 px-3 rounded-lg hover:bg-gray-800/50 hover:shadow-md transform hover:translate-x-1">Economy</Link></li>
              <li><Link href="/business" className="text-gray-300 hover:text-red-400 transition-all duration-300 block py-2 px-3 rounded-lg hover:bg-gray-800/50 hover:shadow-md transform hover:translate-x-1">Business</Link></li>
              <li><Link href="/health" className="text-gray-300 hover:text-red-400 transition-all duration-300 block py-2 px-3 rounded-lg hover:bg-gray-800/50 hover:shadow-md transform hover:translate-x-1">Health</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="space-y-6">
          <div>
            <h4 className="text-xl font-bold mb-4 bg-linear-to-r from-red-400 to-red-600 bg-clip-text text-transparent">Contact</h4>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-3 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-all duration-300">
                <div className="bg-linear-to-r from-red-500 to-red-600 p-3 rounded-full shadow-lg">
                  <i className="fas fa-envelope text-white"></i>
                </div>
                <div>
                  <div className="font-semibold text-white">Email</div>
                  <div className="text-gray-300 text-sm">{settings?.contactEmail || "info@newsportal.com"}</div>
                </div>
              </div>
              
              {settings?.contactPhone && (
                <div className="flex items-center space-x-4 p-3 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-all duration-300">
                  <div className="bg-linear-to-r from-green-500 to-green-600 p-3 rounded-full shadow-lg">
                    <i className="fas fa-phone text-white"></i>
                  </div>
                  <div>
                    <div className="font-semibold text-white">Phone</div>
                    <div className="text-gray-300 text-sm">{settings.contactPhone}</div>
                  </div>
                </div>
              )}
              
              {settings?.contactAddress && (
                <div className="flex items-center space-x-4 p-3 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-all duration-300">
                  <div className="bg-linear-to-r from-blue-500 to-blue-600 p-3 rounded-full shadow-lg">
                    <i className="fas fa-map-marker-alt text-white"></i>
                  </div>
                  <div>
                    <div className="font-semibold text-white">Address</div>
                    <div className="text-gray-300 text-sm">{settings.contactAddress}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
    
    {/* <!-- Bottom Section --> */}
    <div className="bg-linear-to-r from-gray-800 via-gray-900 to-gray-800 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 border-t border-gray-700/50 relative">
      <div className="absolute inset-0 bg-linear-to-r from-transparent via-red-500/5 to-transparent"></div>
      <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400 relative z-10">
        <div className="flex items-center space-x-4">
          <span>{settings?.footerText || "© 2024 News Portal. All rights reserved."}</span>
          <span className="hidden md:inline text-gray-500">|</span>
          <span className="text-red-400">Designed with ❤️ for News</span>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-4">
          <span className="text-gray-500">Follow us:</span>
          <div className="flex space-x-2">
            <a href="#" className="text-gray-400 hover:text-red-400 transition-colors duration-300">
              <i className="fab fa-facebook text-lg"></i>
            </a>
            <a href="#" className="text-gray-400 hover:text-red-400 transition-colors duration-300">
              <i className="fab fa-twitter text-lg"></i>
            </a>
            <a href="#" className="text-gray-400 hover:text-red-400 transition-colors duration-300">
              <i className="fab fa-instagram text-lg"></i>
            </a>
          </div>
        </div>
      </div>
    </div>
  </footer>
    </>
  )
}

export default Footer