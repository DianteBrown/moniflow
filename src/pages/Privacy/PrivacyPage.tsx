

import { Link } from 'react-router-dom';

const PrivacyPage = () => {
  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-muted-foreground text-lg">
          Last updated: 9/24/2025
        </p>
      </div>

      <div className="prose prose-lg max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
          <p className="mb-4">
            Moniflow ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our personal finance management application and related services.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
          
          <h3 className="text-xl font-semibold mb-3">2.1 Personal Information</h3>
          <p className="mb-4">We may collect the following types of personal information:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Account information (name, email address, password)</li>
            <li>Profile information (preferences, settings)</li>
            <li>Financial data (transactions, budgets, goals, categories)</li>
            <li>Usage data (how you interact with our service)</li>
            <li>Device information (IP address, browser type, operating system)</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3">2.2 Automatically Collected Information</h3>
          <p className="mb-4">We automatically collect certain information when you use our service:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Log data (access times, pages viewed, IP address)</li>
            <li>Device information (hardware model, operating system version)</li>
            <li>Cookies and similar tracking technologies</li>
            <li>Analytics data to improve our service</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
          <p className="mb-4">We use the collected information for the following purposes:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Provide and maintain our service</li>
            <li>Process transactions and manage your financial data</li>
            <li>Send you important updates and notifications</li>
            <li>Improve our service and develop new features</li>
            <li>Provide customer support</li>
            <li>Comply with legal obligations</li>
            <li>Prevent fraud and ensure security</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Information Sharing and Disclosure</h2>
          <p className="mb-4">We do not sell, trade, or rent your personal information to third parties. We may share your information in the following circumstances:</p>
          
          <h3 className="text-xl font-semibold mb-3">4.1 Service Providers</h3>
          <p className="mb-4">We may share information with trusted third-party service providers who assist us in operating our service, such as:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Cloud hosting providers</li>
            <li>Payment processors</li>
            <li>Analytics services</li>
            <li>Customer support tools</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3">4.2 Legal Requirements</h3>
          <p className="mb-4">We may disclose your information if required by law or in response to valid legal requests.</p>

          <h3 className="text-xl font-semibold mb-3">4.3 Business Transfers</h3>
          <p className="mb-4">In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of the transaction.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Data Security</h2>
          <p className="mb-4">We implement appropriate security measures to protect your personal information:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Encryption of data in transit and at rest</li>
            <li>Regular security audits and assessments</li>
            <li>Access controls and authentication</li>
            <li>Secure data centers and infrastructure</li>
            <li>Employee training on data protection</li>
          </ul>
          <p className="mb-4">
            However, no method of transmission over the internet or electronic storage is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Data Retention</h2>
          <p className="mb-4">
            We retain your personal information for as long as necessary to provide our service and fulfill the purposes outlined in this Privacy Policy. We may retain certain information for longer periods to comply with legal obligations, resolve disputes, and enforce our agreements.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Your Rights and Choices</h2>
          <p className="mb-4">Depending on your location, you may have the following rights regarding your personal information:</p>
          <ul className="list-disc pl-6 mb-4">
            <li><strong>Access:</strong> Request access to your personal information</li>
            <li><strong>Correction:</strong> Request correction of inaccurate information</li>
            <li><strong>Deletion:</strong> Request deletion of your personal information</li>
            <li><strong>Portability:</strong> Request a copy of your data in a portable format</li>
            <li><strong>Restriction:</strong> Request restriction of processing</li>
            <li><strong>Objection:</strong> Object to certain types of processing</li>
          </ul>
          <p className="mb-4">
            To exercise these rights, please contact us using the information provided in the "Contact Us" section.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">8. Cookies and Tracking Technologies</h2>
          <p className="mb-4">
            We use cookies and similar tracking technologies to enhance your experience on our service. Cookies are small data files stored on your device that help us:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Remember your preferences and settings</li>
            <li>Analyze how you use our service</li>
            <li>Provide personalized content</li>
            <li>Improve our service performance</li>
          </ul>
          <p className="mb-4">
            You can control cookie settings through your browser preferences, but disabling cookies may affect the functionality of our service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">9. Third-Party Services</h2>
          <p className="mb-4">
            Our service may contain links to third-party websites or integrate with third-party services. This Privacy Policy does not apply to these third-party services. We encourage you to review the privacy policies of any third-party services you use.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">10. International Data Transfers</h2>
          <p className="mb-4">
            Your information may be transferred to and processed in countries other than your own. We ensure that such transfers comply with applicable data protection laws and implement appropriate safeguards to protect your information.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">11. Children's Privacy</h2>
          <p className="mb-4">
            Our service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If we become aware that we have collected personal information from a child under 13, we will take steps to delete such information.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">12. Changes to This Privacy Policy</h2>
          <p className="mb-4">
            We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the "Last updated" date. We encourage you to review this Privacy Policy periodically for any changes.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">13. Contact Us</h2>
          <p className="mb-4">
            If you have any questions about this Privacy Policy or our privacy practices, please contact us:
          </p>
          <div className="bg-background p-4 rounded-lg">
            <p><strong>Email:</strong> privacy@moniflow.com</p>
            <p><strong>Address:</strong> Moniflow Privacy Department</p>
            <p><strong>Data Protection Officer:</strong> dpo@moniflow.com</p>
          </div>
        </section>
      </div>

      <div className="mt-12 text-center">
        <Link to="/" className="text-blue-600 hover:text-blue-800 underline">
          ← Back to Home
        </Link>
      </div>
    </div>
  );
};
export default PrivacyPage; 