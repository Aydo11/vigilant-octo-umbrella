# Solace Housing website

A complete website for Solace Housing with its own admin area. Staff can change every room, event, story, logo, document, photo and piece of text without a developer.

## What's included

- **Public pages:** Home, About, Services, Rooms (with filters and photo galleries), Referrals (with form download and a secure upload), Working Together, Report a Repair & Damp (with photo upload), Events Calendar with online booking and capacity limits, Tenants' Stories, News & Newsletter, Charter of Rights, Complaints (step-by-step timeline and online form), Contact (with a form and map), Downloads and Privacy.
- **WhatsApp:** a floating button on every page, a button on every room card and room page, and a sticky enquiry bar on mobile. Room enquiries arrive with the room reference already typed in (for example "SH-101"). Every click is counted by room and by source, such as Facebook, Google or the website.
- **Admin (`/admin`):** dashboard, inbox for all form submissions, rooms, events and registrations (with CSV export and phone bookings), stories (which only publish once consent is ticked), news, services, partners, documents, page text and images, settings, newsletter list, staff logins and a help guide.
- **Edit this page:** staff who are logged in can click text on the live website and type over it, or click an image to replace it and set its focal point.

## Run it locally

```
npm install
npm start
```

Then open http://localhost:3000/admin. The first visit asks you to create the main admin account.

## Put it live on Render (recommended, about $7–8 a month)

1. Create a free GitHub account and upload this folder as a new private repository. The GitHub website lets you drag and drop the files.
2. Go to render.com, then **New + → Blueprint**, and pick the repository. `render.yaml` sets everything up: the web service, plus a 2 GB disk that holds the database and uploaded photos.
3. When it's live, open `https://<your-app>.onrender.com/admin` and create the admin account.
4. To use your own domain, add it in Render under **Settings → Custom Domains** and follow the DNS instructions it shows.
5. In **Admin → Settings**, set the office address, email inbox and email (SMTP) details, then click **Send a test email**.

Render takes a daily snapshot of the disk. Everything the site stores lives in the `DATA_DIR` folder (`/var/data` on Render), so backing up that folder backs up the whole site.

### Other hosting

The site runs on any server with Node.js 20 or newer. Set `DATA_DIR` to a folder that persists between restarts and run `npm start`. The `PORT` setting is optional and defaults to 3000.

## Before launch

- In the admin dashboard, click **Remove all sample content**. This deletes the example rooms, events, stories and news. Then add real ones.
- Upload real photos over the illustrations in **Page text & images**, or use **Edit this page**.
- Replace the placeholder referral form, Charter and complaints PDFs in **Documents** with the official versions.
- Check the complaints timescales and ombudsman wording in **Page text & images → Complaints**, and make sure they match Solace's own policy.
