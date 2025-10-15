export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gray-50 text-gray-800 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-red-600 to-pink-500 text-white py-16 px-6 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
          About Us
        </h1>
        <p className="text-lg md:text-xl max-w-2xl mx-auto">
          Learn more about Nepal News and our commitment to delivering unbiased, reliable journalism.
        </p>
      </section>

      {/* Content Section */}
      <section className="container mx-auto py-12 px-6 md:px-12 ">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 space-y-10 dark:bg-gray-900 border-2">
          
          <div>
            <h2 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-white">Our Mission</h2>
            <p className="text-gray-600 leading-relaxed dark:text-gray-300">
              Our mission is to provide accurate and unbiased news coverage to keep the citizens of Nepal informed.
              We focus on transparency, accountability, and fairness in every story we publish.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-white">Our Vision</h2>
            <p className="text-gray-600 leading-relaxed dark:text-gray-300">
              We envision a Nepal where everyone has access to trustworthy news and can make informed decisions
              in their daily lives. We aim to be the most reliable and respected news portal in the country.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-white">Our Team</h2>
            <p className="text-gray-600 leading-relaxed dark:text-gray-300">
              Our team consists of experienced journalists, editors, and digital media experts dedicated
              to delivering high-quality news. We work tirelessly to maintain integrity and uphold
              the highest journalistic standards.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-white">Why Choose Us</h2>
            <p className="text-gray-600 leading-relaxed dark:text-gray-300">
              At Nepal News, we prioritize the truth above all. Our readers can rely on us for timely
              updates, factual reporting, and insightful analysis on national and international events.
            </p>
          </div>
          
        </div>
      </section>
    </main>
  );
}
