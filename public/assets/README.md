# Landing Page Assets

This directory should contain all the static assets required for the landing page. Ensure that the following image files are placed in the `images` subdirectory:

## Required Image Files

1. **Logo & Branding:**
   - moniflow-logo.svg
   - moniflow-logo-footer.svg

2. **Icons:**
   - icon-expense.svg
   - icon-goal.svg
   - icon-budget.svg
   - feature-invest-icon.svg
   - feature-tracking-icon.svg
   - feature-goal-icon.svg
   - feature-banking-icon.svg
   - feature-resource-icon.svg
   - connect-icon1.svg
   - goals-icon.svg
   - track-icon.svg
   - twitter-icon.svg
   - facebook-icon.svg
   - youtube-icon.svg
   - instagram-icon.svg

3. **Screenshots & Product Images:**
   - homepage-screenshot.png
   - product-image.png
   - dashboard-screenshot.png

4. **Other Images:**
   - trusted-users.png
   - partner1.png through partner6.png (6 partner logo images)

## Note on Image Requirements

These images should be copied from the original HTML landing page project at:
`moniflow landing page/src/assets/`

If any image is missing, you may need to create a placeholder or substitute with an appropriate alternative.

## Image Path Usage

When referencing these images in your components, use the path:
`/assets/images/filename.extension`

For example:
```jsx
<img src="/assets/images/homepage-screenshot.png" alt="Homepage" />
``` 