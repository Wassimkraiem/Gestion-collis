# Colissimo Management System

A comprehensive Next.js application for managing Colissimo Tunisia delivery parcels with full CRUD operations.

## Features

- 📦 **Complete Colis Management**: Add, view, edit, and delete parcels
- 🔍 **Advanced Search**: Search by reference, client name, phone number, or parcel number
- 📊 **Dashboard**: View all parcels in a clean, organized table
- 🎨 **Modern UI**: Beautiful interface with Tailwind CSS
- 🔐 **Secure API**: Server-side SOAP integration with Colissimo API
- ✅ **Form Validation**: Complete form with all API fields
- 🗑️ **Confirmation Dialogs**: Safe delete operations with confirmation
- 📱 **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **API Integration**: SOAP (node-soap)
- **Icons**: Lucide React
- **HTTP Client**: Axios

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Access to Colissimo Tunisia API credentials

### Installation

1. Clone the repository:
```bash
cd colissimo-app
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:

Create a `.env.local` file in the root directory:

```env
COLISSIMO_USERNAME=your_username
COLISSIMO_PASSWORD=your_password
COLISSIMO_WSDL_URL=http://delivery.colissimo.com.tn/wsColissimoGo/wsColissimoGo.asmx?wsdl
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
colissimo-app/
├── app/
│   ├── api/
│   │   └── colissimo/
│   │       ├── add/route.ts       # Add new colis
│   │       ├── update/route.ts    # Update existing colis
│   │       ├── delete/route.ts    # Delete colis
│   │       ├── list/route.ts      # List all colis
│   │       ├── search/route.ts    # Search colis
│   │       └── detail/route.ts    # Get colis details
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                   # Main dashboard
├── components/
│   ├── ColisForm.tsx              # Add/Edit form
│   ├── ColisTable.tsx             # Colis list table
│   ├── SearchBar.tsx              # Search component
│   ├── DeleteConfirmModal.tsx     # Delete confirmation
│   └── ColisDetailModal.tsx       # View details modal
├── lib/
│   └── soap-client.ts             # SOAP client configuration
├── types/
│   └── colissimo.ts               # TypeScript types
└── .env.local                     # Environment variables
```

## API Routes

### List Colis
```
GET /api/colissimo/list?page=1
```

### Search Colis
```
GET /api/colissimo/search?q=query&type=all
```

### Add Colis
```
POST /api/colissimo/add
Body: ColisFormData
```

### Update Colis
```
PUT /api/colissimo/update
Body: ColisFormData & { id: string }
```

### Delete Colis
```
DELETE /api/colissimo/delete?id=colis_id
```

### Get Colis Details
```
GET /api/colissimo/detail?id=colis_id
```

## Colis Form Fields

All fields match the Colissimo API specification:

- **reference**: Parcel reference number (required)
- **client**: Client name (required)
- **adresse**: Delivery address (required)
- **ville**: City (required)
- **gouvernorat**: Governorate/State (required)
- **tel1**: Primary phone number (required)
- **tel2**: Secondary phone number (optional)
- **designation**: Item description (required)
- **prix**: Price in TND (required)
- **nb_pieces**: Number of pieces (required)
- **type**: Parcel type - VO (Online Sale), EC (Exchange), DO (Document)
- **commentaire**: Additional comments (optional)
- **echange**: Exchange flag (0 or 1)
- **cod**: Cash on Delivery amount (optional)
- **poids**: Weight in kg (optional)

## Search Types

- **all**: Search across all fields
- **reference**: Search by reference number
- **client**: Search by client name
- **tel**: Search by phone number
- **numero**: Search by parcel tracking number

## Development

### Build for Production
```bash
npm run build
```

### Start Production Server
```bash
npm start
```

### Lint Code
```bash
npm run lint
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `COLISSIMO_USERNAME` | Colissimo API username | Yes |
| `COLISSIMO_PASSWORD` | Colissimo API password | Yes |
| `COLISSIMO_WSDL_URL` | SOAP WSDL endpoint URL | Yes |

## Security Notes

- Never commit `.env.local` to version control
- Keep API credentials secure
- Use environment variables for sensitive data
- The SOAP client is cached for performance

## Troubleshooting

### SOAP Connection Issues
- Verify WSDL URL is accessible
- Check network connectivity
- Ensure credentials are correct

### Build Errors
- Clear `.next` folder: `rm -rf .next`
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`

## License

This project is private and proprietary.

## Support

For issues or questions, contact your system administrator.
