# Request Inspector

A real-time request inspection tool for debugging and testing HTTP requests. This application allows you to inspect incoming requests from any application using a simple interface.

## Features

- Real-time request inspection
- Support for all HTTP methods (GET, POST, PUT, DELETE, etc.)
- Beautiful and intuitive interface
- Example code generation
- Request history with timestamps
- Easy to use with ngrok for local development

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- ngrok (for exposing your local server)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd debugger-react-native
```

2. Install dependencies:
```bash
npm install
```

## Usage

1. Start the application:
```bash
npm run dev:all
```

This will start both the frontend and backend servers:
- Frontend: http://localhost:5173
- Backend: http://localhost:3001

2. Start ngrok to expose your local server:
```bash
ngrok http 3001
```

3. Copy the ngrok URL and paste it in the "Your Ngrok URL" field in the application.

4. Use the example code provided in the application to send requests from your application.

## Example Code

```javascript
import axios from 'axios';

const sendRequest = async () => {
  try {
    const response = await axios.post('YOUR_NGROK_URL', {
      message: 'Test request',
      timestamp: new Date().toISOString()
    });
    console.log('Request sent successfully:', response.data);
  } catch (error) {
    console.error('Error sending request:', error);
  }
};
```

## Development

- Frontend development server: `npm run dev`
- Backend development server: `npm run server`
- Run both servers: `npm run dev:all`

## License

MIT
