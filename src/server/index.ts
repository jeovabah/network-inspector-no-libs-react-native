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

const requests: RequestLog[] = []

io.on('connection', (socket) => {
  console.log('Client connectedddd')
  
  socket.emit('existingRequests', requests)
})

app.post('/', (req, res) => {
  const requestData = req.body;
  console.log("Received webhook data:", JSON.stringify(requestData, null, 2));
  
  const log: RequestLog = {
    id: Date.now().toString(),
    type: requestData.type || 'request',
    timestamp: requestData.timestamp || new Date().toISOString(),
    url: requestData.url || '',
    fullUrl: requestData.fullUrl || '',
    method: requestData.method?.toUpperCase() || 'GET',
    headers: requestData.headers || {},
    body: requestData.body,
    data: requestData.data,
    params: requestData.params,
    status: requestData.status,
    message: requestData.message,
    requestBody: requestData.requestBody,
    requestParams: requestData.requestParams,
    response: requestData.response
  };


  if (log.url) {
    log.url = log.url.replace(/^\/+|\/+$/g, '');
  }

  if (log.fullUrl) {
    log.fullUrl = log.fullUrl.replace(/\/+/g, '/').replace(/:\/\/+/, '://');
  }

  console.log("Processed log:", JSON.stringify(log, null, 2));

  requests.push(log);
  if (requests.length > 100) {
    requests.shift();
  }

  io.emit('newRequest', log);

  res.json({ message: 'Request received' });
});

app.all('*', (req, res) => {
  console.log('Request received', req, req.url)
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

  io.emit('newRequest', request);

  res.json({ message: 'Request received' });
});

const PORT = process.env.PORT || 3001
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
}) 