import { Link } from 'react-router-dom';

const TermsPage = () => {
    return (
        <div className="container max-w-4xl mx-auto px-4 py-8">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
                <p className="text-muted-foreground text-lg">
                    Last updated: 9/24/2025
                </p>
            </div>

            <div className="prose prose-lg max-w-none">
                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
                    <p className="mb-4">
                        By accessing and using Moniflow ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
                    <p className="mb-4">
                        Moniflow is a personal finance management application that helps users track expenses, manage budgets, set financial goals, and analyze spending patterns. The service includes:
                    </p>
                    <ul className="list-disc pl-6 mb-4">
                        <li>Budget creation and management</li>
                        <li>Expense tracking and categorization</li>
                        <li>Financial goal setting and monitoring</li>
                        <li>Spending analysis and reports</li>
                        <li>Transaction import and export capabilities</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
                    <p className="mb-4">
                        To use certain features of the Service, you must register for an account. You agree to:
                    </p>
                    <ul className="list-disc pl-6 mb-4">
                        <li>Provide accurate, current, and complete information during registration</li>
                        <li>Maintain and update your account information</li>
                        <li>Maintain the security of your password and account</li>
                        <li>Accept responsibility for all activities under your account</li>
                        <li>Notify us immediately of any unauthorized use of your account</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">4. Privacy and Data Protection</h2>
                    <p className="mb-4">
                        Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your information when you use the Service. By using the Service, you agree to the collection and use of information in accordance with our Privacy Policy.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">5. User Responsibilities</h2>
                    <p className="mb-4">You agree to use the Service only for lawful purposes and in accordance with these Terms. You agree not to:</p>
                    <ul className="list-disc pl-6 mb-4">
                        <li>Use the Service in any way that violates applicable laws or regulations</li>
                        <li>Transmit any harmful, threatening, abusive, or harassing content</li>
                        <li>Attempt to gain unauthorized access to the Service or related systems</li>
                        <li>Interfere with or disrupt the Service or servers connected to the Service</li>
                        <li>Use automated systems to access the Service without permission</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">6. Subscription and Payment</h2>
                    <p className="mb-4">
                        Some features of the Service may require a paid subscription. Subscription fees are billed in advance on a recurring basis. You may cancel your subscription at any time, but no refunds will be provided for unused portions of the subscription period.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">7. Intellectual Property</h2>
                    <p className="mb-4">
                        The Service and its original content, features, and functionality are owned by Moniflow and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">8. Disclaimers</h2>
                    <p className="mb-4">
                        The Service is provided on an "AS IS" and "AS AVAILABLE" basis. Moniflow makes no representations or warranties of any kind, express or implied, regarding the use or results of the Service in terms of correctness, accuracy, reliability, or otherwise.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">9. Limitation of Liability</h2>
                    <p className="mb-4">
                        In no event shall Moniflow, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of the Service.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">10. Termination</h2>
                    <p className="mb-4">
                        We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">11. Changes to Terms</h2>
                    <p className="mb-4">
                        We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">12. Contact Information</h2>
                    <p className="mb-4">
                        If you have any questions about these Terms of Service, please contact us at:
                    </p>
                    <div className="bg-background p-4 rounded-lg">
                        <p><strong>Email:</strong> legal@moniflow.com</p>
                        <p><strong>Address:</strong> Moniflow Legal Department</p>
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

export default TermsPage; 