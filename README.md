# 🎨 Auto Creatives - AI-Powered Ad Creatives Generator

Introducing Auto Creatives, an open-source project that generates AI-powered ad creatives in minutes.

This project was built to give developers & makers a great starting point into building AI applications. This is your launch pad - fork the code, modify it, and make it your own to build a popular AI SaaS app.

[![Auto Creatives Demo](/public/demo.png)](https://auto-creatives.example.com)

## How It Works

The app is powered by:

- 🚀 blackforestlabs/FLUX model for AI ad generation
- ▲ [Next.js](https://nextjs.org/) for app and landing page
- 🔋 [Supabase](https://supabase.com/) for DB & Auth
- 📩 [Resend](https://resend.com/) (optional) to email user when ad creatives are ready
- ⭐️ [Shadcn](https://ui.shadcn.com/) with [Tailwind CSS](https://tailwindcss.com/) for styles
- 💳 [Stripe](https://stripe.com/) for billing

## Main Components

### Landing Page (app\page.tsx)

The landing page (`app\page.tsx`) serves as the entry point for the application. It includes:

- A hero section with a catchy headline and description of the service
- A call-to-action button to start generating ad creatives
- Sample images of AI-generated ad creatives
- Sections explaining how the service works and pricing information

Key features:
- Responsive design for various screen sizes
- Authentication check to redirect logged-in users to the ad gallery
- Integration with other components like ExplainerSection and PricingSection

### Ad Generation Form (app\generate-ad\page.tsx)

The ad generation form (`app\generate-ad\page.tsx`) is where users input details for their ad creative. It includes:

- Form fields for ad content (headline, body text, call-to-action, etc.)
- Options for number of variations and ad dimensions
- Submission handler to process the form data and redirect to results page

Key features:
- Client-side form state management using React hooks
- Dynamic form updates based on user input
- Integration with the app's routing system for seamless navigation

## Running Locally

To create your own Auto Creatives app, follow these steps:

### 1. Clone the repository:

```
git clone https://github.com/yourusername/auto-creatives.git
```

### 2. Enter the project directory:

```
cd auto-creatives
```

### 3. Install dependencies:

For npm:

```bash
npm install
```

For yarn:

```bash
yarn
```

### 4. Set up environment variables:

Create a `.env.local` file in the root directory and add the necessary environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
BLACKFORESTLABS_API_KEY=your_blackforestlabs_api_key
```

### 5. Set up Supabase

Follow the Supabase documentation to set up your project and create the necessary tables.

### 6. Set up Stripe (Optional)

If you want to use Stripe for billing, follow the Stripe documentation to set up your account and add the necessary environment variables.

### 7. Start the development server:

For npm:

```bash
npm run dev
```

For yarn:

```bash
yarn dev
```

### 8. Visit `http://localhost:3000` in your browser to see the running app.

## Contributing

We welcome collaboration and appreciate your contribution to Auto Creatives. If you have suggestions for improvement or significant changes in mind, feel free to open an issue!

If you want to contribute to the codebase, make sure you create a new branch and open a pull request that points to `main`.

## License

Auto Creatives is released under the [MIT License](https://choosealicense.com/licenses/mit/).
