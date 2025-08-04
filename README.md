# Medusa Plugin Resend

## Introduction

This plugin is compatible with **Medusa v2.4.0+** only.

## Installation & Configuration

Install the plugin using the following command:

```bash
npm i @tehaulp/medusa-plugin-resend
```

### `medusa-config.ts`

To enable the plugin, register both the Resend provider and the plugin itself in your Medusa configuration:

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

### Template Directory

If you specify a `templatesDir`, its path must be relative to the Medusa root directory (e.g., `/src/templates/emails`).

This setup works out-of-the-box in development (`npm run dev`), but you might encounter issues in production.

In production, Medusa compiles everything into the `.medusa/server` directory **except** custom files like those in `/src/templates`. As a result, the templates may not be found at runtime.

#### Solution: Copy Templates in Production

To solve this, make sure the templates are included in the production build directory. Here are a couple of ways to do this:

**Using Docker:**

```Dockerfile
RUN npm run build
COPY --from=builder ./src/templates/emails ./server/src/templates/emails
```

**Using `package.json` scripts:**

```json
"scripts": {
  "build": "medusa build && cpx \"src/emails/**/*\" dist/emails"
}
```

Then install the `cpx` package:

```bash
npm i --save-dev cpx
```

### `.env`

Define the following environment variables (for `worker` or `shared` mode):

```env
MEDUSA_BACKEND_URL=<YOUR_BACKEND_URL>
RESEND_API_KEY=<YOUR_API_KEY>
RESEND_FROM=<noreply@yourorg.com>
```

---

## Usage

### Built-in Subscribers

This plugin currently includes a built-in subscriber for the `auth.password_reset` event.

When this event is triggered, the plugin sends an email using the template:

```
/src/templates/emails/auth-password-reset.hbs
```

Your template **must**:

- Be named exactly `auth-password-reset.hbs`
- Use [Handlebars](https://handlebarsjs.com/) syntax
- Contain a `{{resetUrl}}` variable

**Example:**

```handlebars
<a href="{{resetUrl}}" class="button">Reset my password</a>
```

You can also include an optional `.json` file with the same name in the same templates directory to customize the email content:

```json
{
  "subject": "Password reset verification"
}
```

Additional built-in subscribers will be added in future releases.

### Custom Subscribers

To have full control over email behavior, you can implement your own subscriber. Resolve the Notification Service and implement your custom logic accordingly.

---

## Template Example: `auth-password-reset.hbs`

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