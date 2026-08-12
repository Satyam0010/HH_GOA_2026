# 🌴 HackerHouse Goa 2026 — Frame & Builder ID Generator

A web application built for **HackerHouse Goa 2026** that allows participants to create personalized **Social Frames / PFP Frames** and **Builder IDs**, generate a unique shareable page, and share their creation on **X (Twitter)** with a rich image preview.

The project combines client-side image generation, cloud image hosting, serverless APIs, dynamic social metadata, and database-backed share links to create a complete **Create → Generate → Share → Discover → Create** experience.

---

## ✨ Features

* 🖼️ Generate a personalized HackerHouse Goa social frame
* 🪪 Generate a personalized Builder ID / Builder Card
* 📸 Upload and process user profile images
* 🎨 Canvas-based image composition
* ☁️ Upload generated images to Cloudinary
* 🔗 Generate unique share URLs
* 🗄️ Store share records in Supabase
* 🌐 Dynamic share landing pages
* 🐦 X/Twitter-compatible Open Graph and Twitter Card metadata
* 🖼️ Rich image preview when the share URL is unfurled by X
* 🔗 "Create Your Own" CTA from shared pages back to the generator
* 📱 Responsive UI
* ⚡ Vercel serverless deployment
* 🔒 Environment-variable based configuration
* 🧩 Separate sharing flows for Frame and Builder ID

---

# 🎯 Project Objective

The goal of the project is to make it easy for HackerHouse Goa participants to create and publicly share a personalized identity around the event.

Instead of simply generating an image and downloading it, the application creates a complete social-sharing experience:

```text
Create Identity
      ↓
Generate Image
      ↓
Upload Image
      ↓
Create Share Record
      ↓
Generate Unique Share URL
      ↓
Open X Composer
      ↓
X Fetches Share Page
      ↓
Twitter/Open Graph Metadata
      ↓
Generated Image Preview
      ↓
User Clicks Preview
      ↓
Share Landing Page
      ↓
Create Your Own
      ↓
Back to Generator
```

---

# 🏗️ Architecture

The application consists of four major layers:

```text
┌──────────────────────────────────────────────┐
│                 React Frontend               │
│                                              │
│  Format Selection                            │
│  Image Upload                                │
│  Name / Role Input                           │
│  Image Generation                            │
│  Share to X                                  │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│             Image Generation Layer           │
│                                              │
│  HTML Canvas                                 │
│  Frame Rendering                             │
│  Builder ID Rendering                        │
│  Profile Image Processing                    │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│              Cloud Storage Layer             │
│                                              │
│                 Cloudinary                   │
│                                              │
│  Generated PNG                               │
│  Public HTTPS Image URL                      │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│               Backend Layer                  │
│                                              │
│              Vercel Functions                │
│                                              │
│  Create Share Record                         │
│  Fetch Share Record                          │
│  Render Share Page                           │
│  Generate Social Metadata                    │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│                 Supabase                     │
│                                              │
│  share_records                               │
│  Unique share IDs                            │
│  Image URLs                                  │
│  Share metadata                              │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
                 ┌───────────┐
                 │    X      │
                 │ Twitter   │
                 └───────────┘
```

---

# 🛠️ Tech Stack

## Frontend

* React
* TypeScript
* Vite
* HTML5 Canvas
* CSS
* Lucide React

## Backend

* Vercel Serverless Functions
* TypeScript

## Database

* Supabase
* PostgreSQL

## Image Storage

* Cloudinary

## Deployment

* Vercel

## Social Sharing

* X / Twitter Web Intent
* Twitter Card metadata
* Open Graph metadata

---

# 📁 Project Structure

A simplified project structure looks like:

```text
HH_GOA_2026/
│
├── api/
│   ├── share.ts
│   └── ...
│
├── src/
│   ├── components/
│   │
│   ├── utils/
│   │   └── render.ts
│   │
│   ├── App.tsx
│   ├── main.tsx
│   └── ...
│
├── public/
│
├── tests/
│   └── share-handler.test.mjs
│
├── index.html
├── package.json
├── package-lock.json
├── tsconfig.json
├── tsconfig.api.json
├── tsconfig.share-test.json
├── vite.config.ts
└── README.md
```

---

# 🚀 Application Flow

## 1. User opens the application

The user lands on the HackerHouse Goa website and chooses what they want to create.

Two formats are available:

```text
Social Frame / PFP
        OR
Builder ID
```

---

# 🖼️ 2. Social Frame Generation

For the Social Frame option, the user uploads or selects a profile image.

The application processes the image and combines it with the HackerHouse Goa artwork.

The final composition is generated on the client side using HTML Canvas.

Conceptually:

```text
User Photo
    +
HackerHouse Goa Artwork
    +
Frame Layout
    ↓
Canvas
    ↓
Generated PNG
```

This approach avoids requiring a heavy image-processing backend for the basic composition.

---

# 🪪 3. Builder ID Generation

The Builder ID format collects information such as:

* Name
* Role
* Profile image
* Builder ID information

The rendering function creates a personalized Builder Card.

Example structure:

```text
┌───────────────────────────────┐
│       HACKER HOUSE GOA        │
│                               │
│          Profile              │
│           Photo               │
│                               │
│       SATYAM                  │
│                               │
│    FULL STACK DEVELOPER       │
│                               │
│    Builder ID: #HH-GOA-XXXX   │
└───────────────────────────────┘
```

---

# 🎨 4. Canvas-Based Rendering

The application uses a rendering utility to generate the final image.

The renderer is responsible for:

* Loading assets
* Loading the profile image
* Drawing the HackerHouse artwork
* Drawing user information
* Applying typography
* Positioning elements
* Drawing backgrounds and borders
* Exporting the final canvas as PNG

The important concept is:

```text
Canvas
  ↓
drawImage()
  ↓
drawText()
  ↓
drawShapes()
  ↓
canvas.toDataURL()
  ↓
PNG
```

This allows the generated image to be completely dynamic.

---

# ☁️ 5. Uploading the Generated Image

Once the image is generated, the client uploads it to **Cloudinary**.

The generated image receives a publicly accessible HTTPS URL.

Example:

```text
https://res.cloudinary.com/<cloud-name>/image/upload/.../image.png
```

Cloudinary is useful here because social crawlers such as X need an externally accessible image URL.

The image cannot simply exist inside the user's browser.

It must be reachable by:

```text
X crawler
Open Graph crawler
Browser
Share page
```

---

# 🗄️ 6. Creating a Share Record

After the image is uploaded, the application creates a share record.

The frontend sends something similar to:

```http
POST /api/share
Content-Type: application/json
```

with:

```json
{
  "imageUrl": "https://res.cloudinary.com/..."
}
```

The backend creates a unique identifier for the share.

Example:

```text
dcc3627c186e4f6283849b1023771edc
```

The share record associates the ID with the generated image.

Conceptually:

```text
share_records

id                  image_url
────────────────────────────────────────────
dcc3627c...         https://cloudinary.com/...
```

This allows the generated image to have a permanent shareable identity.

---

# 🔗 7. Unique Share URL

After creating the share record, the backend returns a URL such as:

```text
https://hh-goa-2026-pearl.vercel.app/share/dcc3627c186e4f6283849b1023771edc
```

This URL is important because it is **not simply the image URL**.

It is a webpage representing the shared creation.

---

# 🌐 8. Share Landing Page

When someone visits:

```text
/share/<shareId>
```

the backend retrieves the corresponding share record from Supabase.

It then generates a complete HTML page.

The page contains:

* HackerHouse branding
* Generated image
* Description
* "Create Your Own" button
* Social metadata

The flow becomes:

```text
/share/<id>
      ↓
Fetch share record
      ↓
Get Cloudinary image URL
      ↓
Generate HTML
      ↓
Return HTML
```

---

# 🐦 9. X/Twitter Preview System

This is one of the most important parts of the project.

X does not need to directly understand the generated image application.

Instead, it visits the share URL:

```text
/share/<id>
```

and reads the metadata inside the HTML.

The share page contains Twitter Card metadata such as:

```html
<meta
  name="twitter:card"
  content="summary_large_image"
/>

<meta
  name="twitter:title"
  content="HackerHouse Goa"
/>

<meta
  name="twitter:description"
  content="Check out my custom HackerHouse Goa frame."
/>

<meta
  name="twitter:image"
  content="https://res.cloudinary.com/..."
/>
```

It also contains Open Graph metadata:

```html
<meta
  property="og:title"
  content="HackerHouse Goa"
/>

<meta
  property="og:description"
  content="Check out my custom HackerHouse Goa frame."
/>

<meta
  property="og:image"
  content="https://res.cloudinary.com/..."
/>

<meta
  property="og:type"
  content="website"
/>
```

This makes the share page compatible with social crawlers.

---

# 🔄 Why a Share Page Is Used Instead of Sharing the Image Directly

The generated image is stored on Cloudinary.

However, Cloudinary only gives us the image.

For social sharing, we also need:

```text
Title
Description
Image
Canonical URL
Social card type
```

Therefore:

```text
Cloudinary
    ↓
Image

Share Page
    ↓
Metadata + Image
```

The share page acts as a bridge between the generated image and social platforms.

---

# 🧠 10. X Web Intent

The frontend opens an X Web Intent URL.

The application prepares the tweet text dynamically depending on the selected format.

Example:

```ts
const buildShareText = () =>
  format === "frame"
    ? `🌴 Hacker House Goa is officially on my profile!
A little frame, a lot of excitement. See you in Goa! 🚀
#FrameInGoa #HHGoa2026`
    : `Got my Builder ID for Hacker House Goa!
👤 ${name}
💻 ${role}
Now it’s time to build something worth showing 👀
#FrameInGoa #HHGoa2026`;
```

The share URL is then supplied to X.

Conceptually:

```text
React
  ↓
Generate caption
  ↓
Generate share URL
  ↓
X Web Intent
  ↓
X Composer
```

---

# 🖼️ 11. X Preview Behaviour

The important distinction is between the **X composer** and the **published post**.

When the share URL is used, X may not immediately display the final card inside the composer.

However, after the post is published, X can crawl:

```text
/share/<id>
```

and retrieve:

```text
twitter:card
twitter:title
twitter:description
twitter:image
```

The resulting post can display the generated HackerHouse image.

The project was tested against this behaviour during development.

---

# 🔗 12. Clickable Share Experience

The share URL is not just a metadata endpoint.

It is a complete landing page.

When someone clicks the generated card:

```text
X Post
   ↓
Generated Image
   ↓
/share/<shareId>
```

they see a branded HackerHouse Goa page.

The page contains:

```text
Made for
HackerHouse
Goa.

Check out my custom HackerHouse Goa frame.

[ Create Your Own ]
```

The CTA sends the visitor back to the main application.

Therefore, the share flow also acts as a user acquisition loop:

```text
Participant
   ↓
Creates frame
   ↓
Shares on X
   ↓
Another user sees frame
   ↓
Clicks frame
   ↓
Share landing page
   ↓
Create Your Own
   ↓
New participant
```

---

# 🔁 Complete End-to-End Flow

```text
                         USER
                           │
                           ▼
                ┌─────────────────────┐
                │   Select Format     │
                │                     │
                │  Social Frame       │
                │       OR            │
                │  Builder ID         │
                └──────────┬──────────┘
                           │
                           ▼
                ┌─────────────────────┐
                │   Upload / Input    │
                │   User Information  │
                └──────────┬──────────┘
                           │
                           ▼
                ┌─────────────────────┐
                │   Canvas Renderer   │
                │                     │
                │ Photo + Artwork     │
                │ Text + Layout       │
                └──────────┬──────────┘
                           │
                           ▼
                     Generated PNG
                           │
                           ▼
                ┌─────────────────────┐
                │     Cloudinary      │
                │                     │
                │ Public Image URL    │
                └──────────┬──────────┘
                           │
                           ▼
                ┌─────────────────────┐
                │  POST /api/share    │
                └──────────┬──────────┘
                           │
                           ▼
                ┌─────────────────────┐
                │      Supabase       │
                │                     │
                │ Share ID + Image    │
                └──────────┬──────────┘
                           │
                           ▼
                /share/<unique-id>
                           │
             ┌─────────────┴─────────────┐
             │                           │
             ▼                           ▼
      Browser Visitor                X Crawler
             │                           │
             ▼                           ▼
       Branded Page              Twitter Metadata
             │                           │
             ▼                           ▼
      Create Your Own              Image Preview
             │
             ▼
        Main Website
```

---

# ⚡ Performance Techniques

## Client-Side Image Generation

The image composition is performed in the browser.

This avoids sending large source images to the backend simply to combine them.

Advantages:

* Faster interaction
* Less server processing
* Lower backend cost
* Better scalability

---

## Serverless Backend

The backend uses Vercel serverless functions.

Instead of maintaining a dedicated Node.js server:

```text
Request
   ↓
Vercel Function
   ↓
Process
   ↓
Response
```

This is especially suitable for the share page because the endpoint is lightweight and request-driven.

---

# 🔐 Environment Variables

Sensitive configuration is not hard-coded into the application.

Typical environment variables include:

```env
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
```

and Supabase configuration such as:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

Depending on the implementation, the exact variable names may differ.

### Important

Never expose a Supabase `service_role` key to the frontend.

The service role key should only be available to server-side Vercel functions.

Frontend-exposed variables should use the `VITE_` prefix only when they are intentionally safe to expose.

---

# 🛡️ Database Security

The share records are stored in Supabase.

Row Level Security should be enabled for the relevant tables where appropriate.

The backend can use the server-side service role for controlled database operations.

The architecture is:

```text
Browser
   │
   │ no service role key
   ▼
Vercel Function
   │
   │ service role
   ▼
Supabase
```

This prevents sensitive database credentials from being shipped to the browser.

---

# 🧩 Dynamic Metadata

The social metadata is generated dynamically.

For example, the image URL:

```html
<meta
  name="twitter:image"
  content="https://res.cloudinary.com/..."
/>
```

is generated from the specific share record.

Therefore:

```text
/share/ABC
      ↓
Image A

/share/XYZ
      ↓
Image B
```

Each participant gets their own social preview.

---

# 🗂️ Why Unique Share IDs Are Used

Instead of putting the entire Cloudinary URL into the public share path:

```text
/share?image=<very-long-url>
```

the application uses:

```text
/share/<unique-id>
```

This provides several advantages:

* Shorter URLs
* Cleaner X posts
* Better readability
* Database-backed persistence
* Easy lookup
* Easier metadata management
* Better control over shared pages

Example:

```text
Bad:

/api/share?image=https%3A%2F%2Fres.cloudinary.com%2F...

Better:

/share/dcc3627c186e4f6283849b1023771edc
```

---

# 🌍 Share Page vs API Endpoint

The project separates responsibilities.

## API

Responsible for:

```text
Creating share records
Fetching share data
Returning data required by the application
```

## Share Page

Responsible for:

```text
HTML
Social metadata
Generated image
Landing page
CTA
```

This separation makes the system easier to maintain.

---

# 🐛 Problems Encountered During Development

## X Preview Not Appearing Consistently

Initially, the application used a dynamic URL containing the image.

X sometimes displayed only the URL.

The important observation was:

```text
Share URL only
      ↓
X
      ↓
Image preview
```

while:

```text
Caption + additional URLs + share URL
      ↓
X
      ↓
Normal link
```

could produce different behaviour.

This highlighted that social previews are controlled by the platform's crawler and caching behaviour rather than solely by frontend code.

---

# 🧪 Testing the Share Flow

A basic testing sequence is:

### 1. Generate an image

Create either:

```text
Social Frame
```

or:

```text
Builder ID
```

### 2. Verify Cloudinary URL

Make sure the generated image is publicly accessible.

### 3. Generate share URL

Example:

```text
https://your-domain.vercel.app/share/<id>
```

### 4. Open share URL directly

Verify that:

* Page loads
* Generated image appears
* CTA works
* No server error occurs

### 5. Inspect metadata

The HTML should contain:

```text
twitter:card
twitter:title
twitter:description
twitter:image
og:title
og:description
og:image
```

### 6. Test X sharing

Use:

```text
Share to X
```

and verify the resulting post.

---

# 🧪 Local Development

Install dependencies:

```bash
npm install
```

Start the Vite development server:

```bash
npm run dev
```

The application will normally be available at:

```text
http://localhost:5173
```

---

# 🏗️ Production Build

Run:

```bash
npm run build
```

The build process performs TypeScript checking and creates the Vite production bundle.

---

# 🔍 API Type Checking

The API TypeScript configuration can be checked independently:

```bash
npm run typecheck:api
```

---

# 🧪 Share Handler Testing

If the repository contains the share-handler test configuration:

```bash
npm run test:share
```

This verifies the server-side share handling separately from the frontend.

---

# 🚀 Deployment

The project is designed for Vercel.

Typical deployment flow:

```text
GitHub
   ↓
Push to main
   ↓
Vercel detects commit
   ↓
Install dependencies
   ↓
Run build
   ↓
Deploy frontend
   ↓
Deploy serverless functions
```

After deployment, verify:

```text
https://your-domain.vercel.app/
```

and:

```text
https://your-domain.vercel.app/share/<id>
```

---

# ☁️ External Services

## Cloudinary

Used for:

* Storing generated images
* Providing public HTTPS image URLs
* Serving images to browsers and social crawlers

## Supabase

Used for:

* Persisting share records
* Mapping unique share IDs to generated image URLs
* Maintaining shareable state

## Vercel

Used for:

* Hosting the React application
* Running serverless APIs
* Rendering dynamic share pages
* Production deployment

## X / Twitter

Used for:

* Social sharing
* Tweet composition
* Link crawling
* Twitter Card rendering

---

# 🎨 Design Philosophy

The UI follows a visual identity inspired by HackerHouse Goa:

* Goa-inspired tropical illustrations
* Green and cream palette
* Pink and yellow accents
* Editorial typography
* Builder-focused messaging
* Minimal interface
* Strong visual identity

The share page intentionally resembles an event landing page instead of a raw image viewer.

---

# 📱 Responsive Design

The share page adapts to smaller screens.

The desktop layout uses:

```text
Text + Image
```

while smaller screens transition to:

```text
Text
↓
Image
```

This is achieved through CSS media queries.

---

# 🔄 Reusable Architecture

One of the key design decisions is keeping the rendering and sharing systems independent.

The renderer doesn't need to know about X.

```text
Renderer
   ↓
PNG
```

Cloudinary doesn't need to know about X.

```text
Cloudinary
   ↓
Image URL
```

Supabase doesn't need to know about the frontend layout.

```text
Supabase
   ↓
Share Record
```

The share page connects everything.

```text
Image URL
   +
Share ID
   +
Metadata
   ↓
Share Page
```

This separation makes the system easier to extend.

---

# 🔮 Possible Future Improvements

## Direct X Media Upload

A future version could upload the generated image directly to X through the X API and create a post with the image attached.

That would produce:

```text
Caption
+
Website URL
+
Actual Image Attachment
```

instead of relying entirely on URL unfurling.

---

## Dynamic Share Metadata

The share page can be extended to display:

```text
Participant Name
Role
Builder ID
Format
```

and dynamically generate:

```text
twitter:title
twitter:description
og:title
og:description
```

for each participant.

---

## Analytics

Share records could be extended with:

```text
created_at
format
click_count
source
```

allowing the project to measure:

* Number of generated frames
* Number of Builder IDs
* Number of shared links
* Most popular format
* Share-page visits

---

## Image Optimization

Generated images can be optimized before upload to reduce:

* Upload time
* Storage usage
* Social crawler load time

---

# 📌 Key Technical Concepts Demonstrated

This project demonstrates practical use of:

* React component architecture
* TypeScript
* Vite
* HTML Canvas
* Client-side image processing
* Dynamic image composition
* Cloudinary uploads
* REST-style serverless APIs
* Vercel Functions
* Supabase/PostgreSQL
* Unique share identifiers
* Dynamic server-rendered HTML
* Twitter Cards
* Open Graph metadata
* X Web Intents
* Social crawler compatibility
* Environment variables
* Responsive CSS
* Production deployment
* Social sharing architecture

---

# 🧠 What Makes This Project Interesting?

The project is more than a simple image generator.

It combines **frontend graphics, backend persistence, cloud storage, serverless rendering, and social media integration** into one workflow.

The important architectural idea is:

```text
Generated Image
      ↓
Persistent Share Record
      ↓
Dynamic Share Page
      ↓
Social Metadata
      ↓
Social Platform
```

This allows a locally generated image to become a persistent, publicly accessible social identity.

---

# 👨‍💻 Author

Built for **HackerHouse Goa 2026**.

The project focuses on building a lightweight, visually polished, and social-first experience for participants to create and share their HackerHouse identity.

---

# 📄 License

This project is intended for the HackerHouse Goa 2026 event and associated project/demo purposes.
