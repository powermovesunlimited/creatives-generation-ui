# Core User App Flow

This document explains the flow of the application from the point that a user clicks on the "Generate Ad Creatives" button to generating an ad and viewing it in the ad gallery.

## 1. Landing Page (app/page.tsx)

- The user starts on the landing page (/).
- If the user is not logged in, they see a "Generate Ad Creatives" button.
- Clicking this button redirects the user to the login page (/login).
- If the user is already logged in, they are automatically redirected to the ad gallery page (/ad-gallery).

## 2. Generate Ad Page (app/generate-ad/page.tsx and app/generate-ad/GenerateAdClient.tsx)

- After logging in, the user is directed to the Generate Ad page (/generate-ad).
- The page displays a form with various fields for creating an ad:
  - Headline
  - Body Text
  - Additional Description
  - Call to Action Text
  - Instructional Prompt
  - Number of Variations
  - Dimensions
- The user fills out the form with their desired ad details.
- Upon submitting the form, the application redirects to the Ad Results page (/ad-results) with the form data as query parameters.

## 3. Ad Results Page (app/ad-results/page.tsx and app/ad-results/AdResultsClient.tsx)

- The Ad Results page receives the form data from the query parameters.
- It displays a loading spinner while processing the ad generation request.
- The page makes an API call to the server to generate the ad using the provided form data.
- If the ad generation is successful:
  - The page receives a record ID for the generated ad.
  - The user is automatically redirected to the Ad Gallery page (/ad-gallery) with the record ID as a query parameter.
- If there's an error in ad generation:
  - The error is displayed to the user.
  - A "Go Back" button is provided to return to the Generate Ad page.

## 4. Ad Gallery Page (app/ad-gallery/page.tsx and app/ad-gallery/AdGalleryClient.tsx)

- The Ad Gallery page displays the user's generated ads.
- It uses the record ID from the query parameter to highlight the newly generated ad.
- Users can view all their previously generated ads in this gallery.
- Each ad in the gallery is displayed with its details and a preview image.

## Additional Notes

- Throughout the process, the application maintains user authentication state.
- The Navbar component (components/Navbar.tsx) is likely present on all pages, providing navigation options and user account information.
- Error handling is implemented at various stages to provide feedback to the user if something goes wrong.
- The application uses server-side rendering and client-side components to optimize performance and user experience.

This flow ensures a smooth user experience from initiating the ad creation process to viewing the final result in the ad gallery.