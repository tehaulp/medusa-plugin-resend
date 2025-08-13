# Medusa Plugin Resend

## Introduction

A Medusa plugin to send emails via [Resend](https://resend.com/).
Compatible with **Medusa v2.4.0+**.

---

## Installation

```bash
npm install @tehaulp/medusa-plugin-resend
```

---

## Configuration

Edit your `medusa-config.ts` to register the Resend provider and the plugin:

```ts
module.exports = defineConfig({
  projectConfig: {
    modules: [
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
      {
        resolve: "@tehaulp/medusa-plugin-resend",
        options: {
          templatesDir: "/src/templates/emails", // Optional
          events: ["auth.password_reset", "invite.created"], // Optional
          sendInvoiceOnOrder: false, // Optional, requires the documents plugin
        },
      },
    ],
  },
});
```

---

## Template Directory

- **Default**: If `templatesDir` is not set, the plugin uses its built-in templates located in
  `.medusa/server/src/templates/emails`.
- **Custom**: Set `templatesDir` to your own folder (path relative to Medusa root, e.g. `/src/templates/emails`).

> ⚠️ In production, Medusa does not include custom templates by default.
> You must copy them manually to the `.medusa/server` directory.

**Example (Docker):**

```dockerfile
RUN npm run build
COPY --from=builder ./src/templates/emails ./server/src/templates/emails
```

**Example (npm script):**

```json
"scripts": {
  "build": "medusa build && cpx \"src/templates/emails/**/*\" dist/templates/emails"
}
```

```bash
npm install --save-dev cpx
```

---

## Using the Documents Plugin (Optional)

If `sendInvoiceOnOrder: true`, the plugin will send an invoice when an order is placed.
Requires [`@tehaulp/medusa-plugin-documents`](https://www.npmjs.com/package/@tehaulp/medusa-plugin-documents):

```bash
npm install @tehaulp/medusa-plugin-documents
```

```ts
plugins: [
  {
    resolve: "@tehaulp/medusa-plugin-documents",
    options: { document_language: "en" },
  },
];
```

---

## Environment Variables

```env
MEDUSA_BACKEND_URL=<YOUR_BACKEND_URL>
RESEND_API_KEY=<YOUR_API_KEY>
RESEND_FROM=<noreply@yourdomain.com>
```

---

## Usage

### Built-in Subscribers

By default, the plugin includes subscribers for common events (more may be added in future releases):

| Event                 | Template file(s)                |
| --------------------- | ------------------------------- |
| `auth.password_reset` | `auth-password-reset.hbs/.json` |
| `invite.created`      | `auth-invite.hbs/.json`         |
| `invite.resent`       | `auth-invite.hbs/.json`         |
| `order.placed`        | `order-placed.hbs/.json`        |

**Customizing built-in subscribers:**

1. Set `templatesDir` in `medusa-config.ts`.
2. Recreate **all** template files using the **exact same filenames**.
3. Copy variables from the original templates to ensure nothing is missing.

---

### Creating Custom Subscribers

To fully control email behavior:

1. Create your own subscriber file.
2. Resolve the `NotificationService` from Medusa.
3. Send your email with any desired logic, templates, and variables.

Example skeleton:

```ts
import { SubscriberArgs } from "@medusajs/types";

export default async function myCustomSubscriber({
  event,
  container,
}: SubscriberArgs) {
  const notificationService = container.resolve("notificationService");
  await notificationService.send({
    to: "user@example.com",
    channel: "email",
    template: "custom-template",
    data: { name: "John Doe" },
  });
}
```
