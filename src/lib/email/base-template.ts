/**
 * FitSquad branded email base template.
 * All emails wrap their content with this layout for consistent branding.
 */
export function baseTemplate({
  preheader,
  content,
}: {
  preheader: string;
  content: string;
}): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>FitSquad</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    /* Reset */
    body, table, td, p, a, li, blockquote { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    body { margin: 0; padding: 0; width: 100% !important; background-color: #0f172a; }

    /* Base styles */
    .email-body { background-color: #0f172a; }
    .email-container { max-width: 480px; margin: 0 auto; }
    .email-content { background-color: #1e293b; border-radius: 16px; }

    /* Typography */
    .heading { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #ffffff; font-size: 22px; font-weight: 700; line-height: 1.3; margin: 0; }
    .subheading { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #94a3b8; font-size: 14px; font-weight: 400; line-height: 1.5; margin: 0; }
    .body-text { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #cbd5e1; font-size: 14px; font-weight: 400; line-height: 1.6; margin: 0; }
    .small-text { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #64748b; font-size: 12px; line-height: 1.5; margin: 0; }
    .accent-text { color: #f97316; font-weight: 600; }
    .stat-number { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #f97316; font-size: 28px; font-weight: 700; line-height: 1; margin: 0; }
    .stat-label { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #64748b; font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; margin: 4px 0 0 0; }

    /* Components */
    .btn {
      display: inline-block;
      background-color: #f97316;
      color: #ffffff !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      font-weight: 600;
      text-decoration: none;
      padding: 12px 32px;
      border-radius: 12px;
      text-align: center;
    }
    .btn-secondary {
      display: inline-block;
      background-color: #334155;
      color: #e2e8f0 !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 13px;
      font-weight: 500;
      text-decoration: none;
      padding: 10px 24px;
      border-radius: 10px;
      text-align: center;
    }
    .card {
      background-color: #0f172a;
      border-radius: 12px;
      padding: 16px;
    }
    .divider {
      border: none;
      border-top: 1px solid #334155;
      margin: 0;
    }
    .tag {
      display: inline-block;
      background-color: rgba(249, 115, 22, 0.1);
      color: #f97316;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 11px;
      font-weight: 600;
      padding: 4px 10px;
      border-radius: 20px;
      text-transform: capitalize;
    }

    /* Dark mode support */
    @media (prefers-color-scheme: dark) {
      .email-body { background-color: #0f172a !important; }
    }
  </style>
</head>
<body>
  <!-- Preheader (hidden preview text) -->
  <div style="display:none;font-size:1px;color:#0f172a;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
    ${preheader}
  </div>

  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" class="email-body">
    <tr>
      <td style="padding: 24px 16px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" class="email-container" width="100%" style="max-width:480px;margin:0 auto;">

          <!-- Logo -->
          <tr>
            <td style="padding: 0 0 24px 0; text-align: center;">
              <span style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 24px; font-weight: 800; color: #f97316;">FitSquad</span>
            </td>
          </tr>

          <!-- Main content card -->
          <tr>
            <td>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" class="email-content" style="background-color:#1e293b;border-radius:16px;">
                <tr>
                  <td style="padding: 32px 24px;">
                    ${content}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 0 0 0; text-align: center;">
              <p class="small-text" style="color:#475569;">
                FitSquad &mdash; Track workouts. Compete with friends.
              </p>
              <p class="small-text" style="color:#334155; margin-top: 8px;">
                <a href="https://fitsquad-ten.vercel.app" style="color:#475569;text-decoration:underline;">Open App</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
