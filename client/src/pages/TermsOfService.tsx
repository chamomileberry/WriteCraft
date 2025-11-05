import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function TermsOfService() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
          <p className="text-muted-foreground">
            Last updated:{" "}
            {new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        <div className="space-y-8">
          {/* Agreement */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">1. Agreement to Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <p className="text-muted-foreground">
                By accessing and using WriteCraft ("Service"), you accept and
                agree to be bound by and comply with these Terms of Service. If
                you do not agree to these terms, do not use the Service.
              </p>
              <p className="text-muted-foreground font-semibold text-base bg-amber-50 dark:bg-amber-950 p-4 rounded-md border border-amber-200 dark:border-amber-800">
                WriteCraft is currently in BETA. This means features may change,
                data may be affected by updates, and we appreciate your patience
                and feedback as we improve the Service.
              </p>
            </CardContent>
          </Card>

          {/* Service Description */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">2. Service Description</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <p className="text-muted-foreground">
                WriteCraft is a web-based application designed to help writers,
                worldbuilders, and storytellers organize, create, and develop
                creative content. The Service includes:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Character and worldbuilding tools</li>
                <li>Project and content management</li>
                <li>AI-powered writing assistance</li>
                <li>Collaborative features (team functionality)</li>
                <li>Content export and backup features</li>
              </ul>
            </CardContent>
          </Card>

          {/* User Accounts */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">3. User Accounts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-sm">
              <div>
                <h3 className="font-semibold mb-2">Account Creation</h3>
                <p className="text-muted-foreground">
                  To use WriteCraft, you must create an account with accurate,
                  complete, and current information. You must be at least 13
                  years old.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Account Responsibility</h3>
                <p className="text-muted-foreground">
                  You are responsible for maintaining the confidentiality of
                  your password and account information. You agree to accept
                  responsibility for all activities that occur under your
                  account. You must notify us immediately of any unauthorized
                  use of your account.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Account Termination</h3>
                <p className="text-muted-foreground">
                  WriteCraft may terminate or suspend your account for:
                </p>
                <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                  <li>Violation of these Terms of Service</li>
                  <li>Illegal activity</li>
                  <li>Payment fraud</li>
                  <li>Abuse of the Service or other users</li>
                  <li>Inactivity</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* User Content */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                4. User Content and Intellectual Property
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-sm">
              <div>
                <h3 className="font-semibold mb-2">Your Content</h3>
                <p className="text-muted-foreground">
                  You retain all rights to content you create and store on
                  WriteCraft. WriteCraft does not claim ownership of your
                  content. You grant WriteCraft a limited license to:
                </p>
                <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                  <li>Store and backup your content</li>
                  <li>
                    Display your content to you and authorized collaborators
                  </li>
                  <li>Generate backups and exports</li>
                  <li>Analyze usage to improve the Service</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">WriteCraft Content</h3>
                <p className="text-muted-foreground">
                  All content provided by WriteCraft (guides, templates, tools,
                  features) is protected by copyright and other intellectual
                  property laws. You may use this content only as permitted by
                  these Terms.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Prohibited Content</h3>
                <p className="text-muted-foreground">
                  You agree not to create or share content that:
                </p>
                <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                  <li>Violates laws or regulations</li>
                  <li>Infringes on intellectual property rights</li>
                  <li>Contains malware or harmful code</li>
                  <li>Harasses, threatens, or defames others</li>
                  <li>Violates others' privacy</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Subscription and Billing */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                5. Subscription and Billing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-sm">
              <div>
                <h3 className="font-semibold mb-2">Subscription Plans</h3>
                <p className="text-muted-foreground">
                  WriteCraft offers free and paid subscription tiers. Features
                  and limits vary by tier. Prices are subject to change with 30
                  days' notice.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Billing</h3>
                <p className="text-muted-foreground">
                  Paid subscriptions renew automatically. You authorize
                  WriteCraft to charge your payment method on a recurring basis.
                  You can cancel anytime in your account settings. Cancellation
                  takes effect at the end of the current billing period.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Payment Processing</h3>
                <p className="text-muted-foreground">
                  Payments are processed by Stripe. By providing payment
                  information, you authorize Stripe to process the transaction.
                  See Stripe's terms for payment processing details.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Refund Policy</h3>
                <p className="text-muted-foreground">
                  We offer a 7-day refund policy from the date of purchase for
                  subscription upgrades. Refunds are processed to the original
                  payment method. Contact support@writecraft.app for refund
                  requests.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Limitations of Liability */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                6. Limitation of Liability
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <p className="text-muted-foreground">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL
                WRITECRAFT, ITS DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE FOR
                ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE
                DAMAGES.
              </p>
              <p className="text-muted-foreground">
                THIS INCLUDES DAMAGES FOR LOSS OF PROFITS, GOODWILL, USE, DATA,
                OR OTHER INTANGIBLE LOSSES (EVEN IF WRITECRAFT HAS BEEN ADVISED
                OF THE POSSIBILITY OF SUCH DAMAGES).
              </p>
              <p className="text-muted-foreground">
                THE TOTAL LIABILITY OF WRITECRAFT UNDER THESE TERMS SHALL NOT
                EXCEED THE AMOUNT YOU PAID IN THE PAST 12 MONTHS, OR $100,
                WHICHEVER IS GREATER.
              </p>
            </CardContent>
          </Card>

          {/* Disclaimer */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                7. Disclaimer of Warranties
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <p className="text-muted-foreground">
                WRITECRAFT IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT
                WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED.
              </p>
              <p className="text-muted-foreground">
                WRITECRAFT DISCLAIMS ALL WARRANTIES INCLUDING:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Merchantability</li>
                <li>Fitness for a particular purpose</li>
                <li>Non-infringement</li>
                <li>Uninterrupted or error-free service</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                We do not guarantee that the Service will always be available,
                secure, or free of bugs or errors.
              </p>
            </CardContent>
          </Card>

          {/* Acceptable Use */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                8. Acceptable Use Policy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <p className="text-muted-foreground">
                You agree not to use WriteCraft to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Violate any law or regulation</li>
                <li>Infringe on others' intellectual property rights</li>
                <li>Transmit viruses, malware, or harmful code</li>
                <li>Harass, threaten, or abuse other users</li>
                <li>Spam or send unsolicited messages</li>
                <li>Attempt to gain unauthorized access to the Service</li>
                <li>
                  Scrape or extract data except as permitted by WriteCraft
                </li>
                <li>Reverse-engineer or decompile WriteCraft</li>
                <li>Overload or disrupt the Service</li>
              </ul>
            </CardContent>
          </Card>

          {/* AI Services Disclaimer */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">9. AI-Powered Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <p className="text-muted-foreground">
                WriteCraft uses AI services (including those from Anthropic and
                other providers) to generate content suggestions and features.
                Please note:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>AI-generated content may contain errors or inaccuracies</li>
                <li>
                  You are responsible for reviewing and editing AI-generated
                  content
                </li>
                <li>
                  WriteCraft does not guarantee the quality, accuracy, or
                  originality of AI-generated content
                </li>
                <li>
                  Your content may be transmitted to AI providers as described
                  in our Privacy Policy
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Indemnification */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">10. Indemnification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <p className="text-muted-foreground">
                You agree to indemnify, defend, and hold harmless WriteCraft and
                its officers, directors, employees, and agents from any claims,
                damages, losses, liabilities, and expenses (including reasonable
                attorney fees) arising from or relating to your use of the
                Service or violation of these Terms.
              </p>
            </CardContent>
          </Card>

          {/* Governing Law */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">11. Governing Law</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <p className="text-muted-foreground">
                These Terms of Service are governed by and construed in
                accordance with the laws of the jurisdiction in which WriteCraft
                is operated, without regard to its conflict of law principles.
              </p>
              <p className="text-muted-foreground">
                You agree to submit to the exclusive jurisdiction of the courts
                in that jurisdiction.
              </p>
            </CardContent>
          </Card>

          {/* Changes to Terms */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">12. Changes to Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <p className="text-muted-foreground">
                WriteCraft may modify these Terms at any time. Material changes
                will be notified via email or prominent notice in the Service.
                Your continued use of WriteCraft constitutes acceptance of the
                updated Terms.
              </p>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                13. Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <p className="text-muted-foreground">
                If you have questions about these Terms of Service, please
                contact us:
              </p>
              <div className="bg-muted p-4 rounded-md">
                <p className="font-semibold">WriteCraft Support</p>
                <p className="text-muted-foreground">
                  Email: support@writecraft.app
                </p>
                <p className="text-muted-foreground">
                  Or use the feedback form in the application
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 pt-8 border-t">
          <p className="text-xs text-muted-foreground">
            © {currentYear} WriteCraft. All rights reserved. These Terms of
            Service are provided for the beta phase of WriteCraft.
          </p>
        </div>
      </div>
    </div>
  );
}
