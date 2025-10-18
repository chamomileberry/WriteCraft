import { useState } from "react";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Code, Copy, Check, Key, Book, Zap, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ApiDocs() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setLocation(`/search?q=${encodeURIComponent(query)}`);
  };

  const handleNavigate = (view: string) => {
    if (view === 'notebook') {
      setLocation('/notebook');
    } else if (view === 'projects') {
      setLocation('/projects');
    } else if (view === 'generators') {
      setLocation('/generators');
    } else if (view === 'guides') {
      setLocation('/guides');
    }
  };

  const copyCode = (code: string, label: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(label);
    setTimeout(() => setCopiedCode(null), 2000);
    toast({
      title: "Copied!",
      description: "Code copied to clipboard",
    });
  };

  const CodeBlock = ({ code, language = "bash", label }: { code: string; language?: string; label: string }) => (
    <div className="relative">
      <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
        <code className={`language-${language}`}>{code}</code>
      </pre>
      <Button
        size="icon"
        variant="ghost"
        className="absolute top-2 right-2"
        onClick={() => copyCode(code, label)}
        data-testid={`button-copy-${label}`}
      >
        {copiedCode === label ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header
        onSearch={handleSearch}
        searchQuery={searchQuery}
        onNavigate={handleNavigate}
      />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">WriteCraft API Documentation</h1>
          <p className="text-lg text-muted-foreground">
            Build powerful integrations with the WriteCraft API
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Zap className="w-4 h-4" />
                RESTful API
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Simple HTTP requests with JSON responses
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Secure
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                API key authentication with rate limiting
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Book className="w-4 h-4" />
                Well Documented
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Clear examples and comprehensive guides
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="getting-started" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="getting-started" data-testid="tab-getting-started">Getting Started</TabsTrigger>
            <TabsTrigger value="authentication" data-testid="tab-authentication">Authentication</TabsTrigger>
            <TabsTrigger value="endpoints" data-testid="tab-endpoints">Endpoints</TabsTrigger>
            <TabsTrigger value="rate-limits" data-testid="tab-rate-limits">Rate Limits</TabsTrigger>
          </TabsList>

          <TabsContent value="getting-started" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Start</CardTitle>
                <CardDescription>Get started with the WriteCraft API in minutes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">1. Create an API Key</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Navigate to your{" "}
                    <button
                      onClick={() => setLocation("/account")}
                      className="text-primary hover:underline"
                      data-testid="link-settings"
                    >
                      Account Settings
                    </button>{" "}
                    and create a new API key under the "API Keys" section.
                  </p>
                  <Badge variant="secondary">Professional or Team plan required</Badge>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">2. Make Your First Request</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Use your API key to fetch your projects:
                  </p>
                  <CodeBlock
                    label="curl-example"
                    code={`curl https://writecraft.replit.app/api/v1/projects \\
  -H "Authorization: Bearer YOUR_API_KEY"`}
                  />
                </div>

                <div>
                  <h3 className="font-semibold mb-2">3. Parse the Response</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    All responses are JSON formatted:
                  </p>
                  <CodeBlock
                    label="response-example"
                    language="json"
                    code={`{
  "projects": [
    {
      "id": "123",
      "name": "My Novel",
      "description": "A fantasy adventure",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}`}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Base URL</CardTitle>
              </CardHeader>
              <CardContent>
                <CodeBlock
                  label="base-url"
                  code="https://writecraft.replit.app/api/v1"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  All API endpoints are relative to this base URL.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="authentication" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>API Key Authentication</CardTitle>
                <CardDescription>Secure your API requests with bearer token authentication</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Authorization Header</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Include your API key in the Authorization header of every request:
                  </p>
                  <CodeBlock
                    label="auth-header"
                    code="Authorization: Bearer wc_live_abc123..."
                  />
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Example with cURL</h3>
                  <CodeBlock
                    label="curl-auth"
                    code={`curl https://writecraft.replit.app/api/v1/projects \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`}
                  />
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Example with JavaScript</h3>
                  <CodeBlock
                    label="js-auth"
                    language="javascript"
                    code={`const response = await fetch('https://writecraft.replit.app/api/v1/projects', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});
const data = await response.json();`}
                  />
                </div>

                <div>
                  <h3 className="font-semibold mb-2">API Key Scopes</h3>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <Badge variant="secondary">read</Badge>
                      <p className="text-sm text-muted-foreground">View data only (GET requests)</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Badge variant="secondary">write</Badge>
                      <p className="text-sm text-muted-foreground">View and modify data (GET, POST, PATCH)</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Badge variant="secondary">admin</Badge>
                      <p className="text-sm text-muted-foreground">Full access including deletion (all methods)</p>
                    </div>
                  </div>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                    <Key className="w-4 h-4" />
                    Security Best Practices
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Never commit API keys to version control</li>
                    <li>Use environment variables to store keys</li>
                    <li>Rotate keys regularly for enhanced security</li>
                    <li>Use the minimum required scope for each key</li>
                    <li>Revoke unused or compromised keys immediately</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="endpoints" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Available Endpoints</CardTitle>
                <CardDescription>Comprehensive API reference for all available endpoints</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Projects Endpoints */}
                <div>
                  <h3 className="font-semibold text-lg mb-3">Projects</h3>
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge>GET</Badge>
                        <code className="text-sm">/api/v1/projects</code>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">List all your projects</p>
                      <CodeBlock
                        label="get-projects"
                        code={`curl https://writecraft.replit.app/api/v1/projects \\
  -H "Authorization: Bearer YOUR_API_KEY"`}
                      />
                    </div>

                    <div className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge>GET</Badge>
                        <code className="text-sm">/api/v1/projects/:id</code>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">Get a specific project by ID</p>
                      <CodeBlock
                        label="get-project"
                        code={`curl https://writecraft.replit.app/api/v1/projects/123 \\
  -H "Authorization: Bearer YOUR_API_KEY"`}
                      />
                    </div>

                    <div className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary">POST</Badge>
                        <code className="text-sm">/api/v1/projects</code>
                        <Badge variant="outline">write scope required</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">Create a new project</p>
                      <CodeBlock
                        label="create-project"
                        code={`curl -X POST https://writecraft.replit.app/api/v1/projects \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "My New Project",
    "description": "A thriller novel"
  }'`}
                      />
                    </div>

                    <div className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary">PATCH</Badge>
                        <code className="text-sm">/api/v1/projects/:id</code>
                        <Badge variant="outline">write scope required</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">Update an existing project</p>
                      <CodeBlock
                        label="update-project"
                        code={`curl -X PATCH https://writecraft.replit.app/api/v1/projects/123 \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Updated Project Name"
  }'`}
                      />
                    </div>

                    <div className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="destructive">DELETE</Badge>
                        <code className="text-sm">/api/v1/projects/:id</code>
                        <Badge variant="outline">admin scope required</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">Delete a project</p>
                      <CodeBlock
                        label="delete-project"
                        code={`curl -X DELETE https://writecraft.replit.app/api/v1/projects/123 \\
  -H "Authorization: Bearer YOUR_API_KEY"`}
                      />
                    </div>
                  </div>
                </div>

                {/* Notebooks Endpoints */}
                <div>
                  <h3 className="font-semibold text-lg mb-3">Notebooks</h3>
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge>GET</Badge>
                        <code className="text-sm">/api/v1/notebooks</code>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">List all your notebooks</p>
                      <CodeBlock
                        label="get-notebooks"
                        code={`curl https://writecraft.replit.app/api/v1/notebooks \\
  -H "Authorization: Bearer YOUR_API_KEY"`}
                      />
                    </div>

                    <div className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary">POST</Badge>
                        <code className="text-sm">/api/v1/notebooks</code>
                        <Badge variant="outline">write scope required</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">Create a new notebook</p>
                      <CodeBlock
                        label="create-notebook"
                        code={`curl -X POST https://writecraft.replit.app/api/v1/notebooks \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Character Notes",
    "category": "character"
  }'`}
                      />
                    </div>
                  </div>
                </div>

                {/* Characters Endpoints */}
                <div>
                  <h3 className="font-semibold text-lg mb-3">Characters</h3>
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge>GET</Badge>
                        <code className="text-sm">/api/v1/characters?notebookId=:id</code>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">List characters in a notebook</p>
                      <CodeBlock
                        label="get-characters"
                        code={`curl "https://writecraft.replit.app/api/v1/characters?notebookId=456" \\
  -H "Authorization: Bearer YOUR_API_KEY"`}
                      />
                    </div>

                    <div className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary">POST</Badge>
                        <code className="text-sm">/api/v1/characters</code>
                        <Badge variant="outline">write scope required</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">Create a new character</p>
                      <CodeBlock
                        label="create-character"
                        code={`curl -X POST https://writecraft.replit.app/api/v1/characters \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "notebookId": "456",
    "name": "Jane Doe",
    "age": "28",
    "role": "Protagonist"
  }'`}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rate-limits" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Rate Limits</CardTitle>
                <CardDescription>Understand API usage limits and monitoring</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Monthly Request Limits</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Professional Plan</p>
                        <p className="text-sm text-muted-foreground">Perfect for individual developers</p>
                      </div>
                      <Badge variant="secondary">5,000 requests/month</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Team Plan</p>
                        <p className="text-sm text-muted-foreground">Ideal for collaborative projects</p>
                      </div>
                      <Badge variant="secondary">25,000 requests/month</Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Rate Limit Headers</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Every API response includes rate limit information in the headers:
                  </p>
                  <CodeBlock
                    label="rate-headers"
                    code={`X-RateLimit-Limit: 5000
X-RateLimit-Remaining: 4850
X-RateLimit-Reset: 2024-02-01T00:00:00Z`}
                  />
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Handling Rate Limit Errors</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    When you exceed your rate limit, you'll receive a 429 status code:
                  </p>
                  <CodeBlock
                    label="rate-error"
                    language="json"
                    code={`{
  "error": "Rate limit exceeded",
  "message": "You have exceeded your monthly rate limit of 5000 requests",
  "resetAt": "2024-02-01T00:00:00Z"
}`}
                  />
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Best Practices</h3>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Monitor rate limit headers to avoid hitting limits</li>
                    <li>Implement exponential backoff for retries</li>
                    <li>Cache responses when possible to reduce API calls</li>
                    <li>Use webhooks for real-time updates instead of polling</li>
                    <li>Batch requests when creating multiple resources</li>
                  </ul>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-semibold text-sm mb-2">Need Higher Limits?</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Contact our support team to discuss custom plans with higher rate limits for enterprise applications.
                  </p>
                  <Button variant="outline" size="sm" data-testid="button-contact-support">
                    Contact Support
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monitoring Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Track your API usage in real-time through your{" "}
                  <button
                    onClick={() => setLocation("/account")}
                    className="text-primary hover:underline"
                    data-testid="link-settings-usage"
                  >
                    Account Settings
                  </button>
                  . View detailed statistics including:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Requests made this month</li>
                  <li>Remaining request quota</li>
                  <li>Last request timestamp</li>
                  <li>Usage trends and patterns</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Need Help?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Can't find what you're looking for? Check out these resources:
            </p>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => setLocation("/account")} data-testid="button-manage-keys">
                <Key className="w-4 h-4 mr-2" />
                Manage API Keys
              </Button>
              <Button variant="outline" data-testid="button-support">
                Contact Support
              </Button>
              <Button variant="outline" data-testid="button-examples">
                <Code className="w-4 h-4 mr-2" />
                View Examples
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
