import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPolicy() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <div className="space-y-8">
          {/* Introduction */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Introduction</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <p>
                WriteCraft ("we," "us," "our," or "Company") operates the WriteCraft application and website
                (the "Service"). This Privacy Policy explains our data collection, use, and disclosure practices.
              </p>
              <p>
                Please read this Privacy Policy carefully. By accessing or using WriteCraft, you acknowledge that
                you have read, understood, and agree to be bound by all the provisions of this Privacy Policy.
              </p>
              <p>
                If you do not agree with our policies and practices, please do not use our Service.
              </p>
            </CardContent>
          </Card>

          {/* Information We Collect */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">1. Information We Collect</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-sm">
              <div>
                <h3 className="font-semibold mb-2">Account Information</h3>
                <p className="text-muted-foreground">
                  When you create an account, we collect: email address, username, password (hashed), and profile information
                  you choose to provide (display name, avatar, bio).
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Content You Create</h3>
                <p className="text-muted-foreground">
                  All content you create in WriteCraft (characters, projects, guides, notes, worldbuilding elements,
                  etc.) is stored on our servers.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Billing Information</h3>
                <p className="text-muted-foreground">
                  Payment information is processed directly by Stripe (payment processor). We receive confirmation of
                  successful payments and billing status but never store complete credit card information. We store
                  billing address, email, and subscription details.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Technical Information</h3>
                <p className="text-muted-foreground">
                  We automatically collect information about your device and how you use the Service:
                </p>
                <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                  <li>Browser type and version</li>
                  <li>Operating system</li>
                  <li>IP address</li>
                  <li>Pages visited and time spent</li>
                  <li>Features used</li>
                  <li>Referring website</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Communication Data</h3>
                <p className="text-muted-foreground">
                  If you contact us (support, feedback, bug reports), we store your message, email, and any attachments.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Cookies and Tracking Technologies</h3>
                <p className="text-muted-foreground mb-2">
                  We use cookies and similar tracking technologies to enhance your experience:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li><strong>Necessary Cookies:</strong> Essential for authentication, security, and core functionality</li>
                  <li><strong>Analytics Cookies:</strong> Help us understand usage patterns (PostHog)</li>
                  <li><strong>Functional Cookies:</strong> Remember your preferences and settings</li>
                </ul>
                <p className="text-muted-foreground mt-2">
                  You can manage your cookie preferences through the cookie consent banner or your browser settings.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* How We Use Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">2. How We Use Your Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <p className="text-muted-foreground">We use the information we collect to:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Provide, maintain, and improve the Service</li>
                <li>Create and manage your account</li>
                <li>Process payments and send billing information</li>
                <li>Send transactional emails (password reset, subscription confirmation, etc.)</li>
                <li>Respond to your inquiries and support requests</li>
                <li>Monitor and analyze usage patterns to improve performance</li>
                <li>Detect, prevent, and address fraud and security issues</li>
                <li>Comply with legal obligations</li>
              </ul>
            </CardContent>
          </Card>

          {/* Third-Party Services */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">3. Third-Party Services</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-sm">
              <p className="text-muted-foreground">
                WriteCraft uses third-party services that may collect information about you:
              </p>

              <div>
                <h3 className="font-semibold mb-2">Stripe (Payment Processing)</h3>
                <p className="text-muted-foreground">
                  Payment information is processed by Stripe. Please review their
                  <a href="https://stripe.com/en-ca/privacy" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer"> privacy policy</a>.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">AI Providers (Anthropic)</h3>
                <p className="text-muted-foreground">
                  We use AI services for features like character generation, writing prompts, and content suggestions.
                  Please review their privacy policies. We transmit minimal data necessary for these features.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Google Cloud Storage</h3>
                <p className="text-muted-foreground">
                  Images you generate and upload may be stored on Google Cloud Storage. Please review their
                  <a href="https://cloud.google.com/privacy" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer"> privacy policy</a>.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Analytics</h3>
                <p className="text-muted-foreground">
                  We may collect usage analytics to improve the Service. No personal data is transmitted to analytics
                  providers beyond hashed identifiers.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Data Security */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">4. Data Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <p className="text-muted-foreground">
                We implement appropriate technical and organizational security measures to protect your data against
                unauthorized access, alteration, disclosure, or destruction:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Encryption of data in transit (HTTPS/TLS)</li>
                <li>Password hashing using industry-standard algorithms</li>
                <li>Multi-factor authentication for account security</li>
                <li>Regular security audits and updates</li>
                <li>Access controls limiting employee access to personal data</li>
                <li>Intrusion detection systems</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                However, no security system is impenetrable. We cannot guarantee absolute security. You are responsible
                for maintaining the confidentiality of your password.
              </p>
            </CardContent>
          </Card>

          {/* Data Retention */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">5. Data Retention</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-sm">
              <p className="text-muted-foreground">
                We retain your personal information only as long as necessary for the purposes outlined in this Privacy Policy,
                unless a longer retention period is required or permitted by law.
              </p>

              <div>
                <h3 className="font-semibold mb-2">Active Accounts</h3>
                <p className="text-muted-foreground">
                  While your account is active, we retain all your data to provide the Service.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Account Deletion</h3>
                <p className="text-muted-foreground mb-2">
                  When you delete your account:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li><strong>Immediate deletion:</strong> Your account, profile, and all creative content (characters, projects, notebooks, etc.) are permanently deleted within 30 days</li>
                  <li><strong>Backup retention:</strong> Data may persist in backups for up to 90 days before permanent removal</li>
                  <li><strong>Before deletion:</strong> You can export all your data in JSON format</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Legal Retention</h3>
                <p className="text-muted-foreground mb-2">
                  Some data may be retained longer for legal, regulatory, or security purposes:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li><strong>Financial records:</strong> Billing and payment records retained for 7 years (tax compliance)</li>
                  <li><strong>Security logs:</strong> IP addresses and security event logs retained for 1 year (fraud prevention)</li>
                  <li><strong>Support communications:</strong> Retained for 3 years (customer service quality)</li>
                  <li><strong>Legal holds:</strong> Data may be retained if subject to litigation, subpoena, or legal investigation</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Inactive Accounts</h3>
                <p className="text-muted-foreground">
                  Accounts inactive for 3+ years (no login, no active subscription) may be deleted after email notification.
                  Free tier accounts are retained indefinitely unless deleted by the user.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Analytics Data</h3>
                <p className="text-muted-foreground">
                  Anonymized analytics data may be retained indefinitely for product improvement. This data cannot be linked
                  back to individual users after anonymization.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* User Rights */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">6. Your Rights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <p className="text-muted-foreground">
                Depending on your location, you may have rights regarding your personal data:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Correction:</strong> Request correction of inaccurate data</li>
                <li><strong>Deletion:</strong> Request deletion of your data ("right to be forgotten")</li>
                <li><strong>Portability:</strong> Request a copy of your data in portable format</li>
                <li><strong>Opt-Out:</strong> Opt-out of certain data uses</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                To exercise these rights, contact us at support@writecraft.app with your request.
              </p>
            </CardContent>
          </Card>

          {/* GDPR Compliance */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">7. GDPR Compliance (European Users)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-sm">
              <p className="text-muted-foreground">
                If you are located in the European Economic Area (EEA), United Kingdom, or Switzerland, you have specific
                rights under the General Data Protection Regulation (GDPR).
              </p>

              <div>
                <h3 className="font-semibold mb-2">Legal Basis for Processing</h3>
                <p className="text-muted-foreground mb-2">
                  We process your personal data under the following legal bases:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li><strong>Contract:</strong> Processing necessary to provide the Service under our Terms of Service</li>
                  <li><strong>Consent:</strong> For analytics and optional features (you can withdraw consent anytime)</li>
                  <li><strong>Legitimate interests:</strong> Fraud prevention, security, and service improvement</li>
                  <li><strong>Legal obligation:</strong> Compliance with tax and financial regulations</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Your GDPR Rights</h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li><strong>Right to access:</strong> Request a copy of your personal data</li>
                  <li><strong>Right to rectification:</strong> Correct inaccurate or incomplete data</li>
                  <li><strong>Right to erasure:</strong> Request deletion of your data ("right to be forgotten")</li>
                  <li><strong>Right to restrict processing:</strong> Limit how we use your data</li>
                  <li><strong>Right to data portability:</strong> Receive your data in a portable format</li>
                  <li><strong>Right to object:</strong> Object to certain types of processing</li>
                  <li><strong>Right to withdraw consent:</strong> Withdraw consent for processing based on consent</li>
                  <li><strong>Right to lodge a complaint:</strong> File a complaint with your local data protection authority</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">International Data Transfers</h3>
                <p className="text-muted-foreground">
                  Your data may be transferred to and processed in countries outside the EEA. We ensure appropriate safeguards
                  are in place, such as Standard Contractual Clauses (SCCs) approved by the European Commission.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Data Protection Officer</h3>
                <p className="text-muted-foreground">
                  For GDPR-related inquiries, contact our Data Protection Officer at: dpo@writecraft.app
                </p>
              </div>
            </CardContent>
          </Card>

          {/* CCPA Compliance */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">8. CCPA Compliance (California Residents)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-sm">
              <p className="text-muted-foreground">
                If you are a California resident, you have specific rights under the California Consumer Privacy Act (CCPA)
                and California Privacy Rights Act (CPRA).
              </p>

              <div>
                <h3 className="font-semibold mb-2">Categories of Personal Information We Collect</h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Identifiers (name, email, username, IP address)</li>
                  <li>Commercial information (subscription details, payment history)</li>
                  <li>Internet activity (pages visited, features used)</li>
                  <li>Professional or employment-related information (if you provide it)</li>
                  <li>User-generated content (creative writing, characters, projects)</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Your CCPA Rights</h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li><strong>Right to know:</strong> Request disclosure of personal information collected, used, or shared</li>
                  <li><strong>Right to delete:</strong> Request deletion of your personal information</li>
                  <li><strong>Right to correct:</strong> Request correction of inaccurate personal information</li>
                  <li><strong>Right to opt-out:</strong> Opt-out of the "sale" or "sharing" of personal information</li>
                  <li><strong>Right to limit:</strong> Limit use of sensitive personal information</li>
                  <li><strong>Right to non-discrimination:</strong> Not be discriminated against for exercising your rights</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">We Do Not Sell Your Personal Information</h3>
                <p className="text-muted-foreground">
                  WriteCraft does not sell your personal information to third parties. We do not share your personal information
                  for cross-context behavioral advertising.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Exercising Your Rights</h3>
                <p className="text-muted-foreground">
                  To exercise your CCPA rights, email us at privacy@writecraft.app or use the data export/deletion features
                  in your account settings. We will respond within 45 days.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Authorized Agent</h3>
                <p className="text-muted-foreground">
                  You may designate an authorized agent to make requests on your behalf. We require written authorization
                  and verification of the agent's identity.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Children */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">9. Children's Privacy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <p className="text-muted-foreground">
                WriteCraft is not intended for children under 13 years old. We do not knowingly collect personal information
                from children under 13. If we become aware of such collection, we will delete the information and terminate
                the child's account.
              </p>
            </CardContent>
          </Card>

          {/* Contact Us */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">10. Contact Us</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <p className="text-muted-foreground">
                If you have questions about this Privacy Policy or our privacy practices, please contact us:
              </p>
              <div className="bg-muted p-4 rounded-md">
                <p className="font-semibold">WriteCraft Support</p>
                <p className="text-muted-foreground">Email: support@writecraft.app</p>
                <p className="text-muted-foreground">Or use the feedback form in the application</p>
              </div>
            </CardContent>
          </Card>

          {/* Policy Changes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">11. Changes to This Privacy Policy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <p className="text-muted-foreground">
                We may update this Privacy Policy periodically. Material changes will be notified via email or prominent
                notice in the Service. Your continued use of WriteCraft after changes constitutes acceptance of the updated policy.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 pt-8 border-t">
          <p className="text-xs text-muted-foreground">
            © {currentYear} WriteCraft. All rights reserved. This Privacy Policy is provided as-is for the beta phase of WriteCraft.
          </p>
        </div>
      </div>
    </div>
  );
}
