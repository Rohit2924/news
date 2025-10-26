export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-gray-50 text-gray-800 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-red-600 to-pink-500 text-white py-16 px-6 text-center dark:bg-gray-900">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
          Privacy Policy
        </h1>
        <p className="text-lg md:text-xl max-w-2xl mx-auto">
          Your privacy matters to us. Learn how we collect, use, and protect your information.
        </p>
      </section>

      {/* Content Section */}
      <section className="container mx-auto py-12 px-6 md:px-12 dark:bg-gray-900  bg-white ">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 space-y-8 dark:bg-gray-900 border-2">
          <div>
            <h2 className="text-2xl font-semibold mb-3 dark:text-white">1. Information We Collect</h2>
            <p className="text-gray-600 leading-relaxed  dark:text-gray-300">
              We may collect personal details such as your name, email, and usage data
              when you use our services. This helps us improve our offerings and provide
              a personalized experience.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-3 dark:text-white ">2. How We Use Your Information</h2>
            <p className="text-gray-600 leading-relaxed dark:text-gray-300">
              Your information is used to deliver our services, enhance functionality,
              and communicate updates. We never sell your data to third parties.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-3 dark:text-white">3. Data Protection</h2>
            <p className="text-gray-600 leading-relaxed dark:text-gray-300">
              We implement strict security measures to safeguard your data from
              unauthorized access, disclosure, or misuse.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-3 dark:text-white">4. Cookies & Tracking</h2>
            <p className="text-gray-600 leading-relaxed dark:text-gray-300">
              Our website may use cookies to improve user experience, track analytics,
              and remember your preferences.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-3 dark:text-white">5. Contact Us</h2>
            <p className="text-gray-600 leading-relaxed dark:text-gray-500" >
              If you have any questions about this privacy policy, please reach out to us at{" "}
              <a href="mailto:support@example.com" className="text-red-600 font-medium hover:underline">
                news@support.com
              </a>.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
