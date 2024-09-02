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
- The page displays a form with various fields for creating an ad:
  - Headline
  - Body Text
  - Additional Description
  - Call to Action Text
  - Instructional Prompt
  - Number of Variations
  - Dimensions
- The user fills out the form with their desired ad details.
- Upon submitting the form, the application checks the user's authentication status and credit balance:
  - If the user is not authenticated, it creates an anonymous account and grants 5 free credits.
  - If the user is authenticated but has no credits:
    - For anonymous users (email contains '@anonymous.com'), a dialog prompts them to provide their email to get 5 additional credits.
    - For registered users, they are redirected to the get-credits page.
  - The application updates the authentication state to reflect any changes.
  - If the user has credits, the application redirects to the Ad Results page (/ad-results) with the form data as query parameters.

## 3. Email Prompt Dialog (components/EmailPromptDialog.tsx)

- This new component is shown when an anonymous user with no credits attempts to generate an ad.
- It prompts the user to provide their email address.
- Upon submission:
  - The user's email is updated in the database.
  - 5 additional credits are added to the user's account.
  - The dialog closes, and the ad generation process continues.

## 4. Ad Results Page (app/ad-results/page.tsx and app/ad-results/AdResultsClient.tsx)

- The Ad Results page receives the form data from the query parameters.
- It displays a loading spinner while processing the ad generation request.
- Before generating the ad, the page:
  - Checks if the user has sufficient credits.
  - Generates a unique transaction ID to prevent duplicate requests.
  - Deducts one credit from the user's account.
- The page makes an API call to the server to generate the ad using the provided form data.
- If the ad generation is successful:
  - The transaction is recorded in the ad_transactions table.
  - The page receives a record ID for the generated ad.
  - The user is automatically redirected to the Ad Gallery page (/ad-gallery) with the record ID as a query parameter.
- If there's an error in ad generation:
  - If the error is due to insufficient credits, the user is redirected to the get-credits page.
  - For other errors, the error is displayed to the user.
  - A "Go Back" button is provided to return to the Generate Ad page.

## 5. Ad Gallery Page (app/ad-gallery/page.tsx and app/ad-gallery/AdGalleryClient.tsx)

- The Ad Gallery page displays the user's generated ads.
- It uses the record ID from the query parameter to highlight the newly generated ad.
- Users can view all their previously generated ads in this gallery.
- Each ad in the gallery is displayed with its details and a preview image.

## 6. Get Credits Page (app/get-credits/page.tsx)

- Users are redirected here when they run out of credits (except for anonymous users who are prompted to provide their email).
- This page provides options for users to purchase more credits.

## Additional Notes

- The application now supports anonymous users, allowing them to generate ads without a full account.
- Anonymous users are given an opportunity to provide their email and receive additional credits when they run out.
- A credit system is implemented to manage ad generation requests.
- Transaction handling prevents duplicate ad generation requests, even on page refresh.
- The Navbar component (components/Navbar.tsx) is present on all pages, providing navigation options and user account information.
- The authentication state is updated immediately after creating an anonymous account or updating user information, ensuring seamless access to protected routes.
- Error handling is implemented at various stages to provide feedback to the user if something goes wrong.
- The application uses server-side rendering and client-side components to optimize performance and user experience.

This updated flow ensures a smooth user experience for both new and existing users, integrates the credit system, and provides a path for anonymous users to easily convert to registered users. It also prevents potential abuse through anonymous account creation or duplicate transactions. The immediate update of the authentication state after creating an anonymous account or updating user information ensures that users can proceed directly to ad generation without being redirected to the login page.