# Medusa Plugin Resend

## Introduction

This plugin is compatible with **Medusa v2.4.0+** only.

## Installation & Configuration

Install this plugin by running `npm i @tehaulp/medusa-plugin-resend`

### `medusa-config.ts`

To enable the plugin, register both the Resend provider and the plugin in your Medusa config:

```ts
module.exports = defineConfig({
  projectConfig: {
    // ...
    modules: [
      // ...
      {
        resolve: "@medusajs/notification",
        options: {
          providers: [
            {
              resolve: "@tehaulp/medusa-plugin-resend/providers/resend",
              id: "resend",
              options: {
                channels: ["email"],
                api_key: process.env.RESEND_API_KEY,
                from: process.env.RESEND_FROM,
              },
            },
          ],
        },
      },
    ],
    plugins: [
      // ...
      {
        resolve: "@tehaulp/medusa-plugin-resend",
        options: {
          templatesDir: "/src/templates/emails", // Optional, default: "/src/templates/emails"
          events: ["auth.password_reset", "any.event"], // Optional
        },
      },
    ],
  },
});
```

### `.env`

Set the following environment variables (in `worker` or `shared` mode):

```env
MEDUSA_BACKEND_URL=<YOUR_BACKEND_URL>
RESEND_API_KEY=<YOUR_API_KEY>
RESEND_FROM=<noreply@yourorg.com>
```

## Usage

### Built-in Subscribers

Currently, the plugin includes a built-in subscriber for the `auth.password_reset` event.

When triggered, it sends an email using the template:
`/src/templates/emails/auth-password-reset.hbs`

This template **must**:

- Be named exactly `auth-password-reset.hbs`
- Use [Handlebars](https://handlebarsjs.com/) syntax
- Include the `{{resetUrl}}` variable

Example:

```handlebars
<a href="{{resetUrl}}" class="button">Réinitialiser mon mot de passe</a>
```

You can also provide an optional `.json` metadata file with the same name to customize email content:

```json
{
  "subject": "Réinitialisation de mot de passe"
}
```

More built-in subscribers will be added in future versions.

### Custom Subscribers

To fully customize email handling, create your own subscriber that resolves the Notification Service and uses your preferred logic.

---

## Template Example (auth-password-reset.hbs)

```handlebars
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Réinitialisation du mot de passe</title>
    <style>
      body {
        background: #f9f9f9;
        color: #1a1a1a;
        font-family:
          -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
          "Helvetica Neue", sans-serif;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 600px;
        margin: 40px auto;
        background: white;
        padding: 32px;
        border-radius: 8px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05);
        border: 1px solid #eaeaea;
      }
      .header {
        text-align: center;
        margin-bottom: 32px;
      }
      .header h1 {
        color: #3abf84;
        font-size: 28px;
      }
      .content p {
        font-size: 16px;
        line-height: 1.6;
      }
      .button {
        display: inline-block;
        margin-top: 24px;
        padding: 12px 24px;
        background: #3abf84;
        color: white;
        text-decoration: none;
        border-radius: 6px;
        font-weight: 600;
      }
      .footer {
        margin-top: 48px;
        text-align: center;
        font-size: 12px;
        color: #888;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Medusa</h1>
      </div>
      <div class="content">
        <p>Bonjour,</p>
        <p>Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le
          bouton ci-dessous :</p>
        <p style="text-align: center;">
          <a href="{{resetUrl}}" class="button">Réinitialiser mon mot de passe</a>
        </p>
        <p>Ce lien expirera automatiquement pour garantir la sécurité de votre
          compte.</p>
        <p>Si vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail.</p>
        <p>Merci.</p>
      </div>
      <div class="footer">
        © 2025 SomeCompany. Tous droits réservés.
      </div>
    </div>
  </body>
</html>
```
