import { WebSocketServer, WebSocket } from 'ws';
import * as Y from 'yjs';
import * as encoding from 'lib0/encoding';
import * as decoding from 'lib0/decoding';
import * as syncProtocol from 'y-protocols/sync';
import * as awarenessProtocol from 'y-protocols/awareness';
import type { Server } from 'http';
import type { IncomingMessage } from 'http';

const wsReadyStateConnecting = 0;
const wsReadyStateOpen = 1;

interface WSConnection {
  ws: WebSocket;
  doc: Y.Doc;
  awareness: awarenessProtocol.Awareness;
}

// Store all active documents
const docs = new Map<string, Y.Doc>();
// Track connections per document
const docConnections = new Map<string, Set<WSConnection>>();

// Message types
const messageSync = 0;
const messageAwareness = 1;

export function setupCollaborationServer(server: Server) {
  const wss = new WebSocketServer({ noServer: true });

  // Handle WebSocket upgrade
  server.on('upgrade', (request: IncomingMessage, socket: any, head: Buffer) => {
    const { pathname } = new URL(request.url!, `http://${request.headers.host}`);
    
    // Accept /collaboration or /collaboration/anything (y-websocket appends room name)
    if (pathname === '/collaboration' || pathname.startsWith('/collaboration/')) {
      wss.handleUpgrade(request, socket, head, (ws: WebSocket) => {
        wss.emit('connection', ws, request);
      });
    } else {
      socket.destroy();
    }
  });

  wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
    console.log('[Collaboration] New WebSocket connection');
    
    const url = new URL(req.url!, `http://${req.headers.host}`);
    const { pathname } = url;
    
    // Extract doc name from path (y-websocket appends it) or query params
    let docName = url.searchParams.get('doc');
    if (!docName && pathname.startsWith('/collaboration/')) {
      docName = pathname.substring('/collaboration/'.length);
    }
    
    const userId = url.searchParams.get('userId');
    
    if (!docName) {
      console.error('[Collaboration] Missing doc parameter');
      ws.close(1008, 'Document name required');
      return;
    }

    console.log(`[Collaboration] User ${userId || 'unknown'} connecting to ${docName}`);

    // Get or create document
    let doc = docs.get(docName);
    if (!doc) {
      doc = new Y.Doc();
      docs.set(docName, doc);
      console.log(`[Collaboration] Created new document ${docName}`);
    }

    // Create awareness instance
    const awareness = new awarenessProtocol.Awareness(doc);
    
    // Track this connection
    const conn: WSConnection = { ws, doc, awareness };
    if (!docConnections.has(docName)) {
      docConnections.set(docName, new Set());
    }
    docConnections.get(docName)!.add(conn);

    // Set up document update handler - broadcast to all other clients
    const updateHandler = (update: Uint8Array, origin: any) => {
      if (origin !== conn) {
        const encoder = encoding.createEncoder();
        encoding.writeVarUint(encoder, messageSync);
        syncProtocol.writeUpdate(encoder, update);
        const message = encoding.toUint8Array(encoder);
        
        // Send to all clients except origin
        docConnections.get(docName)?.forEach((c) => {
          if (c !== conn && c.ws.readyState === wsReadyStateOpen) {
            c.ws.send(message, (err: any) => {
              if (err) console.error('[Collaboration] Error sending update:', err);
            });
          }
        });
      }
    };
    doc.on('update', updateHandler);

    // Set up awareness handler - broadcast awareness changes
    const awarenessChangeHandler = ({ added, updated, removed }: any, origin: any) => {
      const changedClients = added.concat(updated).concat(removed);
      const encoder = encoding.createEncoder();
      encoding.writeVarUint(encoder, messageAwareness);
      encoding.writeVarUint8Array(encoder, awarenessProtocol.encodeAwarenessUpdate(awareness, changedClients));
      const message = encoding.toUint8Array(encoder);
      
      // Broadcast to all clients
      docConnections.get(docName)?.forEach((c) => {
        if (c.ws.readyState === wsReadyStateOpen) {
          c.ws.send(message, (err: any) => {
            if (err) console.error('[Collaboration] Error sending awareness:', err);
          });
        }
      });
    };
    awareness.on('update', awarenessChangeHandler);

    // Handle incoming messages
    ws.on('message', (message: Buffer) => {
      try {
        const decoder = decoding.createDecoder(message);
        const messageType = decoding.readVarUint(decoder);
        
        switch (messageType) {
          case messageSync:
            encoding.writeVarUint(encoding.createEncoder(), messageSync);
            syncProtocol.readSyncMessage(decoder, encoding.createEncoder(), doc, conn);
            break;
          case messageAwareness:
            awarenessProtocol.applyAwarenessUpdate(awareness, decoding.readVarUint8Array(decoder), conn);
            break;
        }
      } catch (err) {
        console.error('[Collaboration] Error handling message:', err);
      }
    });

    // Send sync step 1 immediately
    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, messageSync);
    syncProtocol.writeSyncStep1(encoder, doc);
    ws.send(encoding.toUint8Array(encoder), (err: any) => {
      if (err) console.error('[Collaboration] Error sending sync step 1:', err);
    });

    // Send current awareness state
    if (awareness.getStates().size > 0) {
      const awarenessEncoder = encoding.createEncoder();
      encoding.writeVarUint(awarenessEncoder, messageAwareness);
      encoding.writeVarUint8Array(awarenessEncoder, 
        awarenessProtocol.encodeAwarenessUpdate(awareness, Array.from(awareness.getStates().keys()))
      );
      ws.send(encoding.toUint8Array(awarenessEncoder));
    }

    // Handle disconnection
    ws.on('close', () => {
      console.log(`[Collaboration] Client disconnected from ${docName}`);
      
      // Clean up
      doc.off('update', updateHandler);
      awareness.off('update', awarenessChangeHandler);
      awarenessProtocol.removeAwarenessStates(awareness, [awareness.clientID], null);
      
      docConnections.get(docName)?.delete(conn);
      
      // Clean up empty documents
      if (docConnections.get(docName)?.size === 0) {
        docConnections.delete(docName);
        setTimeout(() => {
          // Double-check before destroying
          if (docConnections.get(docName)?.size === 0 || !docConnections.has(docName)) {
            console.log(`[Collaboration] Cleaning up document ${docName}`);
            doc.destroy();
            docs.delete(docName);
          }
        }, 30 * 60 * 1000); // 30 minutes
      }
    });

    ws.on('error', (error) => {
      console.error('[Collaboration] WebSocket error:', error);
    });
  });

  console.log('[Collaboration] WebSocket server initialized on /collaboration');
  
  return wss;
}

// Get active users in a room
export function getRoomUsers(docName: string): string[] {
  const connections = docConnections.get(docName);
  if (!connections) return [];
  
  const users = new Set<string>();
  connections.forEach(conn => {
    const states = conn.awareness.getStates();
    states.forEach((state: any) => {
      if (state.user && state.user.id) {
        users.add(state.user.id);
      }
    });
  });
  
  return Array.from(users);
}

// Get all active rooms
export function getActiveRooms(): string[] {
  return Array.from(docs.keys());
}
