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
                <h3 className="font-semibold mb-2">Cookies</h3>
                <p className="text-muted-foreground">
                  We use cookies and similar tracking technologies to enhance your experience. You can control cookie
                  preferences through your browser settings.
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
            <CardContent className="space-y-4 text-sm">
              <p className="text-muted-foreground">
                We retain your personal information for as long as your account is active or as needed to provide the Service.
                You can request deletion of your account and associated data by contacting us.
              </p>
              <p className="text-muted-foreground">
                Some data may be retained for legal, regulatory, or legitimate business purposes even after account deletion.
              </p>
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

          {/* Children */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">7. Children's Privacy</CardTitle>
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
              <CardTitle className="text-2xl">8. Contact Us</CardTitle>
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
              <CardTitle className="text-2xl">9. Changes to This Privacy Policy</CardTitle>
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
