export default function ContactPage() {
  return (
    <main className="min-h-screen bg-gray-50 text-gray-800">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-red-600 to-pink-500 text-white py-16 px-6 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
          Contact Us
        </h1>
        <p className="text-lg md:text-xl max-w-2xl mx-auto">
          Reach out to Nepal News for inquiries, feedback, or support. We are here to help!
        </p>
      </section>

      {/* Contact Section */}
      <section className="container mx-auto py-12 px-6 md:px-12">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 space-y-10">
          
          <div>
            <h2 className="text-2xl font-semibold mb-3 text-gray-900">Our Contact Information</h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              You can reach us via email, phone, or visit us at our office. We’ll respond to your queries promptly.
            </p>
            <ul className="space-y-4">
              <li>
                <strong>Email:</strong>{" "}
                <a href="mailto:info@nepalsamachar.com" className="text-red-600 font-medium hover:underline">
                  info@nepalsamachar.com
                </a>
              </li>
              <li>
                <strong>Phone:</strong> +977-1-4444444
              </li>
              <li>
                <strong>Address:</strong> Kathmandu, Nepal
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-3 text-gray-900">Send Us a Message</h2>
            <form className="space-y-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2" htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                  placeholder="Your Name"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2" htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                  placeholder="Your Email"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2" htmlFor="message">Message</label>
                <textarea
                  id="message"
                  rows={5}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                  placeholder="Your Message"
                ></textarea>
              </div>

              <button
                type="submit"
                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
