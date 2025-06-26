# Flight Spotter ✈️

A modern flight booking application inspired by Google Flights, built with Next.js, TypeScript, and Tailwind CSS. **Now with real flight data from Sky Scrapper API!**

## 🚀 Live Features

- **🔍 Real Flight Search** - Search actual flights using Sky Scrapper API
- **🏢 Live Airport Data** - Real airport search with autocomplete
- **📅 Dynamic Pricing** - Current flight prices and availability
- **💳 Multiple Airlines** - Compare flights from various carriers
- **📱 Fully Responsive** - Optimized for mobile and desktop
- **⚡ Real-time Search** - Debounced search with loading states
- **🎨 Google Flights UI** - Clean, intuitive interface

## 🛠 Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript for full type safety
- **Styling**: Tailwind CSS with custom components
- **UI Components**: Headless UI, Heroicons
- **Date Picker**: React DatePicker
- **HTTP Client**: Axios with real API integration
- **API**: Sky Scrapper API via RapidAPI

## 🎯 API Integration

This application uses the **Sky Scrapper API** from RapidAPI to provide:

- ✅ **Real flight search results**
- ✅ **Live airport data and codes**
- ✅ **Current pricing information**
- ✅ **Actual airline schedules**
- ✅ **Flight duration and stops**

### API Endpoints Used:

- `GET /searchAirport` - Search airports by name/code
- `GET /searchFlights` - Search flights between destinations
- `GET /checkServer` - API health monitoring

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd flight-spotter
npm install
```

### 2. Get API Key

1. Visit [Sky Scrapper API on RapidAPI](https://rapidapi.com/apiheya/api/sky-scrapper)
2. Subscribe to the **FREE plan** (100 requests/month)
3. Copy your API key

### 3. Configure Environment

```bash
cp .env.example .env.local
```

Add your API key to `.env.local`:

```env
NEXT_PUBLIC_RAPIDAPI_KEY=your_actual_api_key_here
```

### 4. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the app!

## 📂 Project Structure

```
flight-spotter/
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles with Tailwind
│   ├── layout.tsx         # Root layout component
│   └── page.tsx          # Main search page
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   │   ├── Button.tsx           # Flexible button component
│   │   ├── InputField.tsx       # Form input with validation
│   │   ├── AirportSearch.tsx    # Live airport search
│   │   ├── DatePicker.tsx       # Date selection
│   │   └── LoadingSkeleton.tsx  # Loading states
│   ├── FlightCard.tsx    # Flight result display
│   ├── FlightSearchForm.tsx     # Main search form
│   └── FlightResults.tsx        # Results container
├── lib/                  # Services and utilities
│   └── api.ts           # Sky Scrapper API integration
├── types/               # TypeScript definitions
│   └── flight.ts       # Flight and API types
├── next.config.ts      # Next.js configuration
└── SETUP.md           # Detailed setup guide
```

## 🎨 Key Components

### Real API Integration (`lib/api.ts`)

- **FlightApiService** class with full Sky Scrapper integration
- Automatic data transformation from API to app format
- Error handling and fallback mechanisms
- Debounced search for better performance

### Smart UI Components

- **AirportSearch**: Live search with real airport data
- **FlightCard**: Displays real flight information
- **FlightResults**: Handles loading, error, and empty states
- **DatePicker**: Modern date selection with validation

### Responsive Design

- Mobile-first Tailwind CSS approach
- Breakpoint-optimized layouts
- Touch-friendly interactions
- Consistent spacing and typography

## 🔧 Advanced Features

### Real-time Search

- Debounced input to reduce API calls
- Loading states with skeleton components
- Error boundaries with retry mechanisms

### Form Validation

- Required field validation
- Date range validation
- Airport selection validation
- User-friendly error messages

### Performance Optimizations

- Efficient React component composition
- Minimal re-renders with proper state management
- Optimized API calls with request deduplication

## 📊 API Usage & Limits

**Free Tier (Perfect for testing):**

- 100 requests per month
- Real flight data access
- All endpoints available

**Usage Tips:**

- Airport searches are cached locally
- Flight searches use the most current data
- Error handling includes retry logic

## 🚀 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Connect to Vercel
3. Add environment variables in dashboard
4. Deploy automatically

### Other Platforms

Works on any Next.js compatible platform:

- Netlify, AWS Amplify, Railway, Heroku

## 🐛 Troubleshooting

**No API results?**

- Check your API key in `.env.local`
- Verify you're subscribed to Sky Scrapper API
- Try different airport combinations

**Development issues?**

- Restart dev server after adding environment variables
- Clear browser cache
- Check console for errors

## 🔗 Resources

- [Sky Scrapper API Docs](https://rapidapi.com/apiheya/api/sky-scrapper)
- [Next.js 15 Documentation](https://nextjs.org/docs)
- [Tailwind CSS Guide](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Test with real API data
4. Submit a pull request

## 📝 License

MIT License - see LICENSE file for details

---

**🎉 Ready to find your next flight? Start searching with real data!** ✈️

---

**Happy Flying!** ✈️
