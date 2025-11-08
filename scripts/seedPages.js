// scripts/seedPages.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const initialPages = [
  {
    pageSlug: 'privacy-policy',
    pageTitle: 'Privacy Policy',
    pageContent: '<h1>Privacy Policy</h1><p>Your privacy is important to us. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website.</p><h2>Information We Collect</h2><p>We may collect personal details such as your name, email, and usage data when you use our services. This helps us improve our offerings and provide a personalized experience.</p><h2>How We Use Your Information</h2><p>Your information is used to deliver our services, enhance functionality, and communicate updates. We never sell your data to third parties.</p><h2>Data Security</h2><p>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>',
    metaTitle: 'Privacy Policy - News Portal',
    metaDescription: 'Learn about our privacy policy and how we protect your personal information.',
    metaKeywords: 'privacy, policy, data protection',
    isActive: true,
  },
  {
    pageSlug: 'terms',
    pageTitle: 'Terms of Service',
    pageContent: '<h1>Terms of Service</h1><p>Please read these terms carefully before using our website. By accessing or using our service, you agree to be bound by these terms.</p><h2>Acceptance of Terms</h2><p>By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement.</p><h2>Use License</h2><p>Permission is granted to temporarily download one copy of the materials on our website for personal, non-commercial transitory viewing only.</p><h2>Disclaimer</h2><p>The materials on our website are provided on an "as is" basis. We make no warranties, expressed or implied.</p>',
    metaTitle: 'Terms of Service - News Portal',
    metaDescription: 'Read our terms of service to understand the rules and regulations for using our website.',
    metaKeywords: 'terms, service, agreement',
    isActive: true,
  },
  {
    pageSlug: 'about',
    pageTitle: 'About Us',
    pageContent: '<h1>About Us</h1><p>Welcome to News Portal, your trusted source for the latest news and updates.</p><h2>Our Mission</h2><p>Our mission is to deliver accurate, timely, and unbiased news to our readers. We are committed to journalistic integrity and excellence.</p><h2>Our Team</h2><p>We have a dedicated team of journalists, editors, and content creators who work tirelessly to bring you the most important stories.</p><h2>Our Values</h2><p>We value truth, accuracy, fairness, and independence in our reporting. These principles guide everything we do.</p>',
    metaTitle: 'About Us - News Portal',
    metaDescription: 'Learn more about our news portal, our mission, and our commitment to quality journalism.',
    metaKeywords: 'about, news, portal, journalism',
    isActive: true,
  },
  {
    pageSlug: 'contact',
    pageTitle: 'Contact Us',
    pageContent: '<h1>Contact Us</h1><p>We would love to hear from you. Get in touch with our team for inquiries, feedback, or support.</p><h2>Get in Touch</h2><p>You can reach us via email, phone, or visit us at our office. We\'ll respond to your queries promptly.</p><h2>Contact Information</h2><p><strong>Email:</strong> info@newsportal.com<br><strong>Phone:</strong> +977-1-4444444<br><strong>Address:</strong> Kathmandu, Nepal</p>',
    metaTitle: 'Contact Us - News Portal',
    metaDescription: 'Contact our team for inquiries, feedback, or support. We are here to help!',
    metaKeywords: 'contact, support, help',
    isActive: true,
  },
  {
    pageSlug: 'advertise',
    pageTitle: 'Advertise With Us',
    pageContent: '<h1>Advertise With Us</h1><p>Reach your target audience through our advertising opportunities.</p><h2>Why Advertise With Us</h2><p>Our platform reaches thousands of readers daily, making it an ideal place to promote your products or services.</p><h2>Advertising Options</h2><p>We offer various advertising packages including banner ads, sponsored content, and newsletter placements.</p><h2>Contact Our Sales Team</h2><p>For more information about advertising opportunities, please contact our sales team at advertise@newsportal.com</p>',
    metaTitle: 'Advertise With Us - News Portal',
    metaDescription: 'Discover advertising opportunities on our news portal and reach your target audience.',
    metaKeywords: 'advertise, advertising, marketing',
    isActive: true,
  },
  {
    pageSlug: 'careers',
    pageTitle: 'Careers',
    pageContent: '<h1>Careers at News Portal</h1><p>Join our team and help us deliver unbiased, reliable journalism.</p><h2>Why Work With Us</h2><p>At News Portal, we value integrity, innovation, and collaboration. Our team is passionate about delivering high-quality news, and we provide a supportive environment for professional growth.</p><h2>Open Positions</h2><p>We are currently hiring for journalists, editors, digital media specialists, and marketing professionals.</p><h2>How to Apply</h2><p>Interested candidates can apply directly using the form on our careers page.</p>',
    metaTitle: 'Careers - News Portal',
    metaDescription: 'Join our team and help us deliver quality journalism. Explore career opportunities at News Portal.',
    metaKeywords: 'careers, jobs, hiring',
    isActive: true,
  },
];

async function main() {
  console.log('🌱 Seeding pages...');

  for (const page of initialPages) {
    try {
      // Check if page already exists
      const existing = await prisma.pageContent.findUnique({
        where: { pageSlug: page.pageSlug },
      });

      if (existing) {
        console.log(`⏭️  Page "${page.pageTitle}" already exists, skipping...`);
        continue;
      }

      await prisma.pageContent.create({
        data: page,
      });

      console.log(`✅ Created page: ${page.pageTitle}`);
    } catch (error) {
      console.error(`❌ Error creating page "${page.pageTitle}":`, error);
    }
  }

  console.log('✨ Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

