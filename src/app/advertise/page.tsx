export default function AdvertisePage() {
  return (
    <main className="min-h-screen bg-gray-50 text-gray-800 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="bg-linear-to-r from-red-600 to-pink-500 text-white py-16 px-6 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
          Advertise with Nepal News
        </h1>
        <p className="text-lg md:text-xl max-w-2xl mx-auto">
          Reach thousands of readers across Nepal and get your brand noticed with our trusted platform.
        </p>
      </section>

      {/* Content Section */}
      <section className="container mx-auto py-12 px-6 md:px-12">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 space-y-10 dark:bg-gray-900 border-2">
          
          <div>
            <h2 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-white">Why Advertise With Us</h2>
            <p className="text-gray-600 leading-relaxed dark:text-gray-300">
              Nepal News provides a highly engaged audience, trustworthy journalism, and
              extensive reach across all major cities in Nepal. Your advertisements appear
              alongside high-quality content that readers trust.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-white">Audience Reach</h2>
            <p className="text-gray-600 leading-relaxed dark:text-gray-300">
              Our platform attracts readers interested in politics, sports, technology,
              business, health, and more. Advertise your brand to the right audience effectively.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-white">Advertising Options</h2>
            <p className="text-gray-600 leading-relaxed dark:text-gray-300">
              We offer banner ads, sponsored articles, newsletter placements, and social media promotions.
              Choose a plan that fits your marketing goals.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-white">Get Started</h2>
            <p className="text-gray-600 leading-relaxed mb-4 dark:text-gray-300">
              Interested in advertising with Nepal News? Contact our advertising team today to discuss
              packages, pricing, and placement options.
            </p>
            <a
              href="mailto:ads@nepalsamachar.com"
              className="inline-block bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300"
            >
              Contact Us for Ads
            </a>
          </div>
          
        </div>
      </section>
    </main>
  );
}
