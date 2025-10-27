export interface EmailTemplateOptions {
  title: string;
  preheader: string;
  content: string;
}

export function renderBaseTemplate(options: EmailTemplateOptions): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${options.title}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f5f5f5;
      color: #1a1a1a;
    }
    .email-wrapper {
      width: 100%;
      background-color: #f5f5f5;
      padding: 40px 20px;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }
    .email-header {
      background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%);
      padding: 32px 40px;
      text-align: center;
    }
    .email-header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 700;
      color: #ffffff;
      letter-spacing: -0.5px;
    }
    .email-body {
      padding: 40px;
    }
    .email-body h2 {
      margin: 0 0 16px 0;
      font-size: 24px;
      font-weight: 600;
      color: #1a1a1a;
    }
    .email-body p {
      margin: 0 0 16px 0;
      font-size: 16px;
      line-height: 1.6;
      color: #4a5568;
    }
    .email-body p:last-child {
      margin-bottom: 0;
    }
    .button {
      display: inline-block;
      padding: 12px 32px;
      background-color: #7c3aed;
      color: #ffffff;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      margin: 24px 0;
      transition: background-color 0.2s;
    }
    .button:hover {
      background-color: #6d28d9;
    }
    .button-secondary {
      background-color: #14b8a6;
    }
    .button-secondary:hover {
      background-color: #0d9488;
    }
    .info-box {
      background-color: #f8fafc;
      border-left: 4px solid #7c3aed;
      padding: 16px 20px;
      margin: 24px 0;
      border-radius: 4px;
    }
    .warning-box {
      background-color: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 16px 20px;
      margin: 24px 0;
      border-radius: 4px;
    }
    .alert-box {
      background-color: #fee2e2;
      border-left: 4px solid #ef4444;
      padding: 16px 20px;
      margin: 24px 0;
      border-radius: 4px;
    }
    .email-footer {
      background-color: #f8fafc;
      padding: 32px 40px;
      text-align: center;
      border-top: 1px solid #e2e8f0;
    }
    .email-footer p {
      margin: 0 0 8px 0;
      font-size: 14px;
      color: #64748b;
    }
    .email-footer a {
      color: #7c3aed;
      text-decoration: none;
    }
    .email-footer a:hover {
      text-decoration: underline;
    }
    @media only screen and (max-width: 600px) {
      .email-wrapper {
        padding: 20px 10px;
      }
      .email-header {
        padding: 24px 20px;
      }
      .email-body {
        padding: 24px 20px;
      }
      .email-footer {
        padding: 24px 20px;
      }
    }
  </style>
</head>
<body>
  <div style="display:none;font-size:1px;color:#f5f5f5;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
    ${options.preheader}
  </div>
  <div class="email-wrapper">
    <div class="email-container">
      <div class="email-header">
        <h1>WriteCraft</h1>
      </div>
      <div class="email-body">
        ${options.content}
      </div>
      <div class="email-footer">
        <p>WriteCraft - Tools for Creative Writers</p>
        <p>
          <a href="https://writecraft.app">writecraft.app</a> •
          <a href="https://writecraft.app/privacy">Privacy Policy</a> •
          <a href="https://writecraft.app/support">Support</a>
        </p>
        <p style="margin-top: 16px;">
          If you have any questions, contact us at <a href="mailto:support@writecraft.app">support@writecraft.app</a>
        </p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}

export function renderPlainText(content: string): string {
  // Strip HTML tags and format for plain text
  return content
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .trim();
}
