# Real-Time WebSockets & Socket.IO Integration

CineVerse embeds real-time state synchronization for Watch Parties, live chat, and instant reaction delivery.

---

## 📡 Custom Server Integration (`server.ts`)

Instead of standard Next.js serverless handlers, CineVerse initializes a custom Node.js HTTP server hosting both Next.js and Socket.IO:

```typescript
import { createServer } from 'http';
import next from 'next';
import { Server } from 'socket.io';

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => handle(req, res));
  const io = new Server(httpServer, { cors: { origin: '*' } });

  io.on('connection', (socket) => {
    socket.on('join-room', (roomId) => socket.join(roomId));
    socket.on('playback-sync', ({ roomId, time, isPlaying }) => {
      socket.to(roomId).emit('playback-update', { time, isPlaying });
    });
  });

  httpServer.listen(port);
});
```
