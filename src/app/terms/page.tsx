export default function TermsPage() {
  return (
    <main className="min-h-screen bg-gray-50 text-gray-800">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-red-600 to-pink-500 text-white py-16 px-6 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
          Terms & Conditions
        </h1>
        <p className="text-lg md:text-xl max-w-2xl mx-auto">
          By using Nepal News, you agree to the following terms and conditions. Please read them carefully.
        </p>
      </section>

      {/* Content Section */}
      <section className="container mx-auto py-12 px-6 md:px-12">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 space-y-8">
          <div>
            <h2 className="text-2xl font-semibold mb-3 text-gray-900">1. Acceptance of Terms</h2>
            <p className="text-gray-600 leading-relaxed">
              By accessing or using Nepal News, you agree to abide by these terms and conditions.
              If you do not agree, please do not use our website.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-3 text-gray-900">2. User Responsibilities</h2>
            <p className="text-gray-600 leading-relaxed">
              Users must not engage in illegal activities, post harmful content, or violate the rights of others while using our platform.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-3 text-gray-900">3. Intellectual Property</h2>
            <p className="text-gray-600 leading-relaxed">
              All content on Nepal News, including articles, images, and logos, is protected by copyright.
              Unauthorized use is prohibited.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-3 text-gray-900">4. Limitation of Liability</h2>
            <p className="text-gray-600 leading-relaxed">
              Nepal News is not responsible for any direct or indirect damages resulting from the use of our website.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-3 text-gray-900">5. Changes to Terms</h2>
            <p className="text-gray-600 leading-relaxed">
              We may update these terms from time to time. Users are encouraged to review them periodically.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-3 text-gray-900">6. Contact Us</h2>
            <p className="text-gray-600 leading-relaxed">
              For any questions regarding these terms, contact us at{" "}
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
