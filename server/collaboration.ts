import { WebSocketServer, WebSocket as WSWebSocket } from 'ws';
import * as Y from 'yjs';
import { db } from './db';
import { projects } from '../shared/schema';
import { eq } from 'drizzle-orm';
import type { Server } from 'http';
import type { IncomingMessage } from 'http';

interface CollaborationRoom {
  doc: Y.Doc;
  users: Set<string>;
  lastUpdate: number;
  connections: Set<WSWebSocket>;
}

const rooms = new Map<string, CollaborationRoom>();
const ROOM_TIMEOUT = 30 * 60 * 1000; // 30 minutes of inactivity

// Custom persistence for saving to database
class DatabasePersistence {
  async bindState(docName: string, ydoc: Y.Doc) {
    // Load existing content from database
    try {
      const [resourceType, resourceId] = docName.split(':');
      
      if (resourceType === 'project') {
        const project = await db.query.projects.findFirst({
          where: eq(projects.id, resourceId),
        });
        
        if (project && project.content) {
          // Initialize Yjs document with existing content
          const fragment = ydoc.getXmlFragment('prosemirror');
          try {
            const content = typeof project.content === 'string' 
              ? JSON.parse(project.content)
              : project.content;
            
            if (content && typeof content === 'object') {
              // Convert JSON content to XML fragment
              // This is a simplified approach - in production you'd want proper conversion
              console.log(`[Collaboration] Loaded project ${resourceId} content`);
            }
          } catch (e) {
            console.error(`[Collaboration] Error parsing content for ${docName}:`, e);
          }
        }
      }
    } catch (error) {
      console.error(`[Collaboration] Error loading document ${docName}:`, error);
    }
  }

  async writeState(docName: string, ydoc: Y.Doc) {
    // Save to database
    try {
      const [resourceType, resourceId] = docName.split(':');
      
      if (resourceType === 'project') {
        // Get the prosemirror content from the Yjs doc
        const fragment = ydoc.getXmlFragment('prosemirror');
        
        // Convert to JSON format that Tiptap expects
        const content = JSON.stringify(fragment.toJSON());
        
        await db.update(projects)
          .set({
            content,
            updatedAt: new Date(),
          })
          .where(eq(projects.id, resourceId));
          
        console.log(`[Collaboration] Saved document ${docName} to database`);
      }
    } catch (error) {
      console.error(`[Collaboration] Error saving document ${docName}:`, error);
    }
  }
}

const persistence = new DatabasePersistence();

// Simplified message handling without y-websocket dependency
function handleConnection(ws: WSWebSocket, docName: string, userId: string) {
  let room = rooms.get(docName);
  
  if (!room) {
    const doc = new Y.Doc();
    room = {
      doc,
      users: new Set(),
      lastUpdate: Date.now(),
      connections: new Set(),
    };
    rooms.set(docName, room);
    
    // Load persisted state
    persistence.bindState(docName, doc);
    
    // Set up auto-save on updates
    doc.on('update', (update: Uint8Array) => {
      room!.lastUpdate = Date.now();
      
      // Broadcast update to all other clients
      const message = {
        type: 'update',
        update: Array.from(update),
      };
      
      room!.connections.forEach((client) => {
        if (client !== ws && client.readyState === WSWebSocket.OPEN) {
          client.send(JSON.stringify(message));
        }
      });
      
      // Debounce saves
      clearTimeout((room as any).saveTimeout);
      (room as any).saveTimeout = setTimeout(() => {
        persistence.writeState(docName, doc);
      }, 2000);
    });
  }

  room.users.add(userId);
  room.connections.add(ws);

  // Send current document state to new connection
  const state = Y.encodeStateAsUpdate(room.doc);
  ws.send(JSON.stringify({
    type: 'sync',
    state: Array.from(state),
  }));

  // Send awareness (active users) update
  broadcastAwareness(room, docName);

  ws.on('message', (data: Buffer) => {
    try {
      const message = JSON.parse(data.toString());
      
      if (message.type === 'update') {
        const update = new Uint8Array(message.update);
        Y.applyUpdate(room!.doc, update);
      }
    } catch (error) {
      console.error('[Collaboration] Error handling message:', error);
    }
  });

  ws.on('close', () => {
    console.log(`[Collaboration] User ${userId} disconnected from ${docName}`);
    if (room) {
      room.users.delete(userId);
      room.connections.delete(ws);
      
      // Broadcast updated awareness
      broadcastAwareness(room, docName);
      
      // Clean up empty rooms after timeout
      if (room.users.size === 0) {
        setTimeout(() => {
          const currentRoom = rooms.get(docName);
          if (currentRoom && currentRoom.users.size === 0) {
            const timeSinceUpdate = Date.now() - currentRoom.lastUpdate;
            if (timeSinceUpdate > ROOM_TIMEOUT) {
              console.log(`[Collaboration] Cleaning up inactive room ${docName}`);
              currentRoom.doc.destroy();
              rooms.delete(docName);
            }
          }
        }, ROOM_TIMEOUT);
      }
    }
  });
}

function broadcastAwareness(room: CollaborationRoom, docName: string) {
  const message = {
    type: 'awareness',
    users: Array.from(room.users),
  };
  
  room.connections.forEach((client) => {
    if (client.readyState === WSWebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}

export function setupCollaborationServer(server: Server) {
  const wss = new WebSocketServer({ 
    noServer: true,
  });

  // Handle WebSocket upgrade
  server.on('upgrade', (request: IncomingMessage, socket: any, head: Buffer) => {
    const { pathname } = new URL(request.url!, `http://${request.headers.host}`);
    
    if (pathname === '/collaboration') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    }
  });

  wss.on('connection', (conn: WSWebSocket, req: IncomingMessage) => {
    console.log('[Collaboration] New WebSocket connection');
    
    // Extract room (document) name from query params
    const url = new URL(req.url!, `http://${req.headers.host}`);
    const docName = url.searchParams.get('doc');
    const userId = url.searchParams.get('userId');
    
    if (!docName || !userId) {
      conn.close(1008, 'Document name and user ID required');
      return;
    }

    console.log(`[Collaboration] User ${userId} connecting to document ${docName}`);
    handleConnection(conn, docName, userId);
  });

  // Periodic cleanup of stale rooms
  setInterval(() => {
    const now = Date.now();
    const roomEntries = Array.from(rooms.entries());
    for (const [docName, room] of roomEntries) {
      if (room.users.size === 0 && now - room.lastUpdate > ROOM_TIMEOUT) {
        console.log(`[Collaboration] Cleaning up stale room ${docName}`);
        room.doc.destroy();
        rooms.delete(docName);
      }
    }
  }, 5 * 60 * 1000); // Check every 5 minutes

  console.log('[Collaboration] WebSocket server initialized on /collaboration');
  
  return wss;
}

// Get active users in a room
export function getRoomUsers(docName: string): string[] {
  const room = rooms.get(docName);
  return room ? Array.from(room.users) : [];
}

// Get all active rooms
export function getActiveRooms(): string[] {
  return Array.from(rooms.keys());
}
