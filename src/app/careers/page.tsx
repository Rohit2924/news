export default function CareersPage() {
  return (
    <main className="min-h-screen bg-gray-50 text-gray-800">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-red-600 to-pink-500 text-white py-16 px-6 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
          Careers at Nepal News
        </h1>
        <p className="text-lg md:text-xl max-w-2xl mx-auto">
          Join our team and help us deliver unbiased, reliable journalism to the people of Nepal.
        </p>
      </section>

      {/* Content Section */}
      <section className="container mx-auto py-12 px-6 md:px-12">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 space-y-10">
          
          <div>
            <h2 className="text-2xl font-semibold mb-3 text-gray-900">Why Work With Us</h2>
            <p className="text-gray-600 leading-relaxed">
              At Nepal News, we value integrity, innovation, and collaboration. Our team is passionate
              about delivering high-quality news, and we provide a supportive environment for professional growth.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-3 text-gray-900">Open Positions</h2>
            <p className="text-gray-600 leading-relaxed">
              We are currently hiring for journalists, editors, digital media specialists, and marketing
              professionals. Check the positions below and apply to the role that fits your skills.
            </p>
            <ul className="list-disc list-inside mt-4 text-gray-600 space-y-2">
              <li>Senior Journalist</li>
              <li>Content Editor</li>
              <li>Digital Marketing Specialist</li>
              <li>Social Media Manager</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-3 text-gray-900">How to Apply</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Interested candidates can submit their resume and portfolio to our HR team.
            </p>
            <a
              href="mailto:careers@nepalsamachar.com"
              className="inline-block bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300"
            >
              Apply Now
            </a>
          </div>

        </div>
      </section>
    </main>
  );
}
