import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import { Server } from 'socket.io'

interface RequestLog {
  id: string;
  type: 'request' | 'response' | 'error';
  timestamp: string;
  url: string;
  fullUrl: string;
  method: string;
  body?: unknown;
  data?: unknown;
  params?: unknown;
  headers: Record<string, string>;
  status?: number;
  message?: string;
  requestBody?: unknown;
  requestParams?: unknown;
  response?: {
    status: number;
    data: unknown;
  };
}

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD']
  }
})

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.raw())
app.use(express.text())

// Store the last 100 requests
const requests: RequestLog[] = []

io.on('connection', (socket) => {
  console.log('Client connected')
  
  // Send existing requests to new client
  socket.emit('existingRequests', requests)
})

app.post('/', (req, res) => {
  const requestData = req.body;
  
  // Extract data from the body if it exists
  const bodyData = typeof requestData.body === 'object' ? requestData.body : {};
  
  // Create a standardized log entry
  const log: RequestLog = {
    id: Date.now().toString(),
    type: bodyData.type || 'request',
    timestamp: bodyData.timestamp || new Date().toISOString(),
    url: bodyData.url || '',
    fullUrl: bodyData.fullUrl || '',
    method: bodyData.method?.toUpperCase() || 'GET',
    headers: bodyData.headers || {},
    body: bodyData.body,
    data: bodyData.data,
    params: bodyData.params,
    status: bodyData.status,
    message: bodyData.message,
    requestBody: bodyData.requestBody,
    requestParams: bodyData.requestParams,
    response: bodyData.response
  };

  // Clean up the URL by removing leading/trailing slashes and ensuring proper format
  if (log.url) {
    log.url = log.url.replace(/^\/+|\/+$/g, '');
  }

  // Ensure fullUrl is properly formatted
  if (log.fullUrl) {
    log.fullUrl = log.fullUrl.replace(/\/+/g, '/');
  }

  requests.push(log);
  if (requests.length > 100) {
    requests.shift();
  }

  // Emit the new request to all connected clients
  io.emit('newRequest', log);

  res.json({ message: 'Request received' });
});

// Fallback route for any other requests
app.all('*', (req, res) => {
  const request: RequestLog = {
    id: Date.now().toString(),
    type: 'request',
    method: req.method.toUpperCase(),
    url: req.url.replace(/^\/+|\/+$/g, ''),
    fullUrl: `${req.protocol}://${req.get('host')}${req.url}`.replace(/\/+/g, '/'),
    headers: req.headers as Record<string, string>,
    body: req.body,
    params: req.query,
    timestamp: new Date().toISOString()
  };

  requests.push(request);
  if (requests.length > 100) {
    requests.shift();
  }

  // Emit the new request to all connected clients
  io.emit('newRequest', request);

  res.json({ message: 'Request received' });
});

const PORT = process.env.PORT || 3001
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
}) 