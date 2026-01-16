# Lab Management System (LMS)

This is a standalone Lab Management System extracted from the main 240Kw project.

## Features

- Dashboard with analytics and statistics
- Customer management
- RFQ (Request for Quotation) management
- Project management
- Test Plans, Test Executions, and Test Results
- Sample management
- TRF (Test Request Form) management
- Document management
- Reports generation
- Audits and NCRs (Non-Conformance Reports)
- Certification management

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## Project Structure

```
LMS/
├── src/
│   ├── components/
│   │   └── labManagement/     # Lab management UI components
│   ├── contexts/              # React contexts (Auth, Data)
│   ├── layouts/               # Layout components
│   ├── pages/
│   │   └── lab/
│   │       └── management/    # Lab management pages
│   ├── services/              # API services
│   ├── assets/                # Static assets
│   ├── App.jsx                # Main app component
│   ├── main.jsx               # Entry point
│   └── index.css              # Global styles
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## Technologies Used

- React 18
- React Router DOM
- Vite
- Tailwind CSS
- Framer Motion
- Axios
- Recharts
- Lucide React Icons

## Notes

- This is a standalone application extracted from the main 240Kw project
- The original 240Kw project remains unchanged
- All lab management functionality is self-contained in this folder
