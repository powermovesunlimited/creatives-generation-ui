# Core User App Flow

This document explains the updated flow of the application from the point that a user clicks on the "Generate Ad Creatives" button to generating an ad and viewing it in the ad gallery.

## 1. Landing Page (app/page.tsx)

- The user starts on the landing page (/).
- The "Generate Ad Creatives" button is visible to all users, regardless of authentication status.
- Clicking this button now redirects the user directly to the Generate Ad page (/generate-ad).
- If the user is already logged in, they can also access the ad gallery page (/ad-gallery).
- Auth Protected routes are managed by middleware.ts, but /generate-ad is now accessible without authentication.

## 2. Generate Ad Page (app/generate-ad/page.tsx and app/generate-ad/GenerateAdClient.tsx)

- The Generate Ad page (/generate-ad) is now accessible to both authenticated and unauthenticated users.
- For unauthenticated users, an anonymous account is created when they attempt to generate an ad.
- The page now offers two options for ad creation:
  1. Use the new Ad Wizard
  2. Use the standard form
- The Ad Wizard option is prominently displayed with an explanation of its benefits.
- If the user chooses the Ad Wizard, they are redirected to the Ad Wizard page (/ad_wizard).
- If the user chooses the standard form, they can proceed with the following steps:
  - The page displays a form with various fields for creating an ad:
    - Headline
    - Body Text
    - Additional Description
    - Call to Action Text
    - Instructional Prompt
    - Number of Variations
    - Dimensions
  - The user fills out the form with their desired ad details.
  - AI-assisted content generation is available for each field.
- Upon submitting the form, the application checks the user's authentication status and credit balance:
  - If the user is not authenticated, it creates an anonymous account and grants 5 free credits.
  - If the user is authenticated but has no credits:
    - For anonymous users (email contains '@anonymous.com'), a dialog prompts them to provide their email to get 5 additional credits.
    - For registered users, they are redirected to the get-credits page.
  - The application updates the authentication state to reflect any changes.
  - If the user has credits, the application redirects to the Ad Results page (/ad-results) with the form data as query parameters.

## 3. Ad Wizard Page (app/ad_wizard/page.tsx and app/ad_wizard/AdWizardClient.tsx)

- The Ad Wizard page provides a step-by-step guided process for creating an ad.
- The wizard includes the following steps:
  1. Welcome Screen: 
     - Asks for the product/service URL.
     - Uses AI to analyze the URL and extract business information.
     - Utilizes an improved scraping process with GPT-4 for more accurate data extraction.
  2. Pre-Populated Options: 
     - Suggests business types, headlines, and ad copy based on the AI analysis of the URL.
     - Options are dynamically generated using GPT-4 for more relevant and tailored suggestions.
  3. Call-to-Action Selection: 
     - Offers AI-generated CTAs based on the extracted business information.
     - Uses GPT-4 to create context-aware and effective call-to-action phrases.
  4. Visual Style Selection: 
     - Provides AI-suggested visual themes based on the business type and information.
     - Allows users to choose a visual theme.
     - Users can now upload a custom image for their ad.
     - The custom image is stored temporarily and will be used in the ad generation process.
  5. Preview and Customize: Shows a real-time preview of the ad (including the custom image if uploaded) and allows for final adjustments.
  6. Final Review: Displays the complete ad for review before submission.
- The wizard leverages AI throughout the process to provide personalized suggestions and streamline the ad creation process.
- Upon completion, the ad is submitted using the same process as the standard form, including the custom image if one was uploaded.

## 4. Email Prompt Dialog (components/EmailPromptDialog.tsx)

- This component is shown when an anonymous user with no credits attempts to generate an ad.
- It prompts the user to provide their email address.
- Upon submission:
  - The user's email is updated in the database.
  - 5 additional credits are added to the user's account.
  - The dialog closes, and the ad generation process continues.

## 5. Ad Results Page (app/ad-results/page.tsx and app/ad-results/AdResultsClient.tsx)

- The Ad Results page receives the form data from the query parameters.
- It displays a loading spinner while processing the ad generation request.
- Before generating the ad, the page:
  - Checks if the user has sufficient credits.
  - Generates a unique transaction ID to prevent duplicate requests.
  - Deducts one credit from the user's account.
- The page makes an API call to the server to generate the ad using the provided form data.
- If a custom image was uploaded, it's included in the ad generation request.
- If the ad generation is successful:
  - The transaction is recorded in the ad_transactions table.
  - The page receives a record ID for the generated ad.
  - The user is automatically redirected to the Ad Gallery page (/ad-gallery) with the record ID as a query parameter.
- If there's an error in ad generation:
  - If the error is due to insufficient credits, the user is redirected to the get-credits page.
  - For other errors, the error is displayed to the user.
  - A "Go Back" button is provided to return to the Generate Ad page.

## 6. Ad Gallery Page (app/ad-gallery/page.tsx and app/ad-gallery/AdGalleryClient.tsx)

- The Ad Gallery page displays the user's generated ads.
- It uses the record ID from the query parameter to highlight the newly generated ad.
- Users can view all their previously generated ads in this gallery.
- Each ad in the gallery is displayed with its details and a preview image.
- If a custom image was used in the ad generation, it will be displayed as part of the ad in the gallery.

## 7. Get Credits Page (app/get-credits/page.tsx)

- Users are redirected here when they run out of credits (except for anonymous users who are prompted to provide their email).
- This page provides options for users to purchase more credits.

## 8. Privacy Policy Page (app/privacy-policy/page.tsx)

- This page contains the privacy policy for Poly186 DAO LLC.
- It explains how user data is collected, used, and protected.
- Key points include:
  - Types of data collected (names, email addresses, IP addresses, ad creation inputs, usage data)
  - How data is used (account creation, service improvement, marketing, ad generation)
  - Data sharing practices (analytics, payment processing, marketing)
  - Data security measures
  - User rights (opt-out of marketing, data deletion requests)
  - Age restrictions (18 years or older)
- The privacy policy is accessible via a link in the footer or navbar.

## 9. Terms of Service Page (app/terms-of-service/page.tsx)

- This page contains the terms of service for Poly186 DAO LLC.
- It outlines the rules and regulations for using the service.
- Key points include:
  - Description of the service
  - User account information
  - Credit system and payments
  - Refund policy
  - User content and intellectual property rights
  - Limitation of liability
  - Age restrictions (18 years or older)
  - Modifications to service
  - Governing law (State of Wyoming, United States)
- The terms of service are accessible via a link in the footer or navbar.

## Additional Notes

- The application now supports two methods of ad creation: the new AI-powered Ad Wizard and the standard form.
- The Ad Wizard provides a more guided, AI-assisted experience for users who prefer a step-by-step process.
- The Ad Wizard now uses GPT-4 for various AI-generated suggestions, including:
  - Business information extraction from URLs
  - Ad content suggestions (headlines, ad copy)
  - Call-to-action phrases
  - Visual style recommendations
- Custom image upload is now supported in the Ad Wizard, allowing users to include their own images in the ad generation process.
- The custom image is handled securely, converted to a data URL for transmission, and included in the ad generation request.
- Anonymous users can use both the Ad Wizard and the standard form.
- The credit system and transaction handling remain the same for both ad creation methods.
- AI-assisted content generation is available in both the Ad Wizard and the standard form.
- The application continues to support anonymous users, allowing them to generate ads without a full account.
- Error handling and authentication state updates are implemented consistently across both ad creation methods.
- The Navbar component (components/Navbar.tsx) is present on all pages, providing navigation options and user account information.
- Privacy Policy and Terms of Service pages have been added to provide users with important information about data handling and usage rules.
- Both the Privacy Policy and Terms of Service are specific to Poly186 DAO LLC and reflect the company's practices and legal requirements.

This updated flow provides users with more flexibility in how they create ads, catering to both those who prefer a guided experience and those who are comfortable with a more direct approach. The integration of advanced AI assistance throughout the process helps users create more effective and personalized ads with less effort. The addition of custom image upload further enhances the personalization options for users, allowing them to create ads that better align with their brand identity. The new privacy policy and terms of service pages ensure transparency and compliance with legal requirements.