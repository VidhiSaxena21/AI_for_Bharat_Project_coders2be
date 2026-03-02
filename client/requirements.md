## Packages
tesseract.js | Client-side OCR for scanning food labels
framer-motion | Page transitions and high-quality animations
react-dropzone | Beautiful drag-and-drop interactions for image upload
clsx | Utility for constructing className strings conditionally
tailwind-merge | Utility to merge tailwind classes safely

## Notes
- Using Tesseract.js for client-side OCR processing without server roundtrips for the raw image.
- Extracted text is sent to the backend `/api/scans/analyze` endpoint.
- User ID is stored in localStorage as requested for MVP "auth-less" profile management.
