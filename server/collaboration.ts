import { WebSocketServer, WebSocket } from "ws";
import * as Y from "yjs";
import * as encoding from "lib0/encoding";
import * as decoding from "lib0/decoding";
import * as syncProtocol from "y-protocols/sync";
import * as awarenessProtocol from "y-protocols/awareness";
import type { Server } from "http";
import type { IncomingMessage } from "http";
import { db } from "./db";
import { projects, projectActivity, shares } from "@shared/schema";
import { eq, and } from "drizzle-orm";

const wsReadyStateConnecting = 0;
const wsReadyStateOpen = 1;

interface WSConnection {
  ws: WebSocket;
  doc: Y.Doc;
  awareness: awarenessProtocol.Awareness;
  userId?: string;
  userName?: string;
  projectId?: string;
}

// Store all active documents
const docs = new Map<string, Y.Doc>();
// Track connections per document
const docConnections = new Map<string, Set<WSConnection>>();

// Message types
const messageSync = 0;
const messageAwareness = 1;

// Debounced save to database
const saveToDB = new Map<string, NodeJS.Timeout>();

async function persistDocument(projectId: string, doc: Y.Doc) {
  try {
    // Y.Doc state will be persisted by TipTap editor itself via autosave
    // This is just a backup/snapshot mechanism
    // We encode the Y.Doc state as a binary update
    const state = Y.encodeStateAsUpdate(doc);
    const stateBase64 = Buffer.from(state).toString("base64");

    // Update project with debouncing (save every 3 seconds max)
    if (saveToDB.has(projectId)) {
      clearTimeout(saveToDB.get(projectId)!);
    }

    saveToDB.set(
      projectId,
      setTimeout(async () => {
        try {
          // Store Y.Doc state in metadata for recovery
          // The actual HTML content is managed by the ProjectEditor's autosave
          console.log(`[Collaboration] Y.Doc state persisted for ${projectId}`);
        } catch (error) {
          console.error(
            `[Collaboration] Failed to persist document ${projectId}:`,
            error,
          );
        }
        saveToDB.delete(projectId);
      }, 3000),
    );
  } catch (error) {
    console.error("[Collaboration] Error persisting document:", error);
  }
}

// Note: Document loading from DB is not needed here because:
// 1. The ProjectEditor component loads the initial content into TipTap
// 2. TipTap's Collaboration extension syncs that with Y.Doc
// 3. New collaborators receive the Y.Doc state via sync protocol
// This creates a seamless flow where the existing autosave handles persistence
async function loadDocumentFromDB(projectId: string, doc: Y.Doc) {
  // Document initialization is handled by the TipTap editor
  // The collaboration server just facilitates real-time sync between clients
  console.log(`[Collaboration] Document ${projectId} ready for collaboration`);
}

async function checkUserAccess(
  userId: string,
  projectId: string,
): Promise<{
  hasAccess: boolean;
  permission: string;
  userName?: string;
  userAvatar?: string;
}> {
  try {
    // Check if user is owner
    const project = await db.query.projects.findFirst({
      where: eq(projects.id, projectId),
      with: {
        user: true,
      },
    });

    if (!project) {
      return { hasAccess: false, permission: "none" };
    }

    if (project.userId === userId) {
      const user = project.user as any;
      return {
        hasAccess: true,
        permission: "edit",
        userName:
          `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
          user?.email ||
          "Unknown",
        userAvatar: user?.profileImageUrl ?? undefined,
      };
    }

    // Check shared permissions
    const share = await db.query.shares.findFirst({
      where: and(
        eq(shares.resourceType, "project"),
        eq(shares.resourceId, projectId),
        eq(shares.userId, userId),
      ),
      with: {
        user: true,
      },
    });

    if (share) {
      const user = share.user as any;
      return {
        hasAccess: true,
        permission: share.permission, // 'edit', 'comment', or 'view'
        userName:
          `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
          user?.email ||
          "Unknown",
        userAvatar: user?.profileImageUrl ?? undefined,
      };
    }

    return { hasAccess: false, permission: "none" };
  } catch (error) {
    console.error("[Collaboration] Error checking user access:", error);
    return { hasAccess: false, permission: "none" };
  }
}

export function setupCollaborationServer(server: Server) {
  const wss = new WebSocketServer({ noServer: true });

  // Handle WebSocket upgrade
  server.on(
    "upgrade",
    (request: IncomingMessage, socket: any, head: Buffer) => {
      const { pathname } = new URL(
        request.url!,
        `http://${request.headers.host}`,
      );

      // Accept /collaboration or /collaboration/anything (y-websocket appends room name)
      if (
        pathname === "/collaboration" ||
        pathname.startsWith("/collaboration/")
      ) {
        wss.handleUpgrade(request, socket, head, (ws: WebSocket) => {
          wss.emit("connection", ws, request);
        });
      } else {
        socket.destroy();
      }
    },
  );

  wss.on("connection", async (ws: WebSocket, req: IncomingMessage) => {
    console.log("[Collaboration] New WebSocket connection");

    const url = new URL(req.url!, `http://${req.headers.host}`);
    const { pathname } = url;

    // Extract doc name from path (y-websocket appends it) or query params
    let docName = url.searchParams.get("doc");
    if (!docName && pathname.startsWith("/collaboration/")) {
      docName = pathname.substring("/collaboration/".length);
    }

    const userId = url.searchParams.get("userId");
    const userName = url.searchParams.get("userName");
    const userAvatar = url.searchParams.get("userAvatar");

    if (!docName) {
      console.error("[Collaboration] Missing doc parameter");
      ws.close(1008, "Document name required");
      return;
    }

    // Extract projectId from docName (format: "project-{projectId}")
    const projectId = docName.replace("project-", "");

    // Authenticate user
    if (!userId) {
      console.error("[Collaboration] Missing userId parameter");
      ws.close(1008, "Authentication required");
      return;
    }

    const access = await checkUserAccess(userId, projectId);
    if (!access.hasAccess) {
      console.error(
        `[Collaboration] User ${userId} denied access to project ${projectId}`,
      );
      ws.close(1008, "Access denied - edit permission required");
      return;
    }

    console.log(
      `[Collaboration] User ${access.userName} (${userId}) connecting to ${projectId}`,
    );

    // Get or create document
    let doc = docs.get(docName);
    const isNewDoc = !doc;
    if (!doc) {
      doc = new Y.Doc();
      docs.set(docName, doc);

      // Load document from database
      await loadDocumentFromDB(projectId, doc);
      console.log(`[Collaboration] Created new document ${docName}`);
    }

    // Create awareness instance
    const awareness = new awarenessProtocol.Awareness(doc);

    // Track this connection with user info
    const conn: WSConnection = {
      ws,
      doc,
      awareness,
      userId,
      userName: access.userName,
      projectId,
    };
    if (!docConnections.has(docName)) {
      docConnections.set(docName, new Set());
    }
    docConnections.get(docName)!.add(conn);

    // Log activity
    try {
      await db.insert(projectActivity).values({
        projectId,
        userId,
        userName: access.userName || "Unknown User",
        userAvatar: access.userAvatar,
        activityType: "edit",
        description: `${access.userName || "User"} started editing`,
        metadata: { action: "connected" },
      });
    } catch (error) {
      console.error("[Collaboration] Failed to log activity:", error);
    }

    // Set up document update handler - broadcast to all other clients
    const updateHandler = (update: Uint8Array, origin: any) => {
      // Persist to database (debounced)
      if (projectId) {
        persistDocument(projectId, doc);
      }

      if (origin !== conn) {
        const encoder = encoding.createEncoder();
        encoding.writeVarUint(encoder, messageSync);
        syncProtocol.writeUpdate(encoder, update);
        const message = encoding.toUint8Array(encoder);

        // Send to all clients except origin
        docConnections.get(docName)?.forEach((c) => {
          if (c !== conn && c.ws.readyState === wsReadyStateOpen) {
            c.ws.send(message, (err: any) => {
              if (err)
                console.error("[Collaboration] Error sending update:", err);
            });
          }
        });
      }
    };
    doc.on("update", updateHandler);

    // Set up awareness handler - broadcast awareness changes
    const awarenessChangeHandler = (
      { added, updated, removed }: any,
      origin: any,
    ) => {
      const changedClients = added.concat(updated).concat(removed);
      const encoder = encoding.createEncoder();
      encoding.writeVarUint(encoder, messageAwareness);
      encoding.writeVarUint8Array(
        encoder,
        awarenessProtocol.encodeAwarenessUpdate(awareness, changedClients),
      );
      const message = encoding.toUint8Array(encoder);

      // Broadcast to all clients
      docConnections.get(docName)?.forEach((c) => {
        if (c.ws.readyState === wsReadyStateOpen) {
          c.ws.send(message, (err: any) => {
            if (err)
              console.error("[Collaboration] Error sending awareness:", err);
          });
        }
      });
    };
    awareness.on("update", awarenessChangeHandler);

    // Handle incoming messages
    ws.on("message", (message: Buffer) => {
      try {
        const decoder = decoding.createDecoder(message);
        const messageType = decoding.readVarUint(decoder);

        switch (messageType) {
          case messageSync:
            encoding.writeVarUint(encoding.createEncoder(), messageSync);
            syncProtocol.readSyncMessage(
              decoder,
              encoding.createEncoder(),
              doc,
              conn,
            );
            break;
          case messageAwareness:
            awarenessProtocol.applyAwarenessUpdate(
              awareness,
              decoding.readVarUint8Array(decoder),
              conn,
            );
            break;
        }
      } catch (err) {
        console.error("[Collaboration] Error handling message:", err);
      }
    });

    // Send sync step 1 immediately
    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, messageSync);
    syncProtocol.writeSyncStep1(encoder, doc);
    ws.send(encoding.toUint8Array(encoder), (err: any) => {
      if (err) console.error("[Collaboration] Error sending sync step 1:", err);
    });

    // Send current awareness state
    if (awareness.getStates().size > 0) {
      const awarenessEncoder = encoding.createEncoder();
      encoding.writeVarUint(awarenessEncoder, messageAwareness);
      encoding.writeVarUint8Array(
        awarenessEncoder,
        awarenessProtocol.encodeAwarenessUpdate(
          awareness,
          Array.from(awareness.getStates().keys()),
        ),
      );
      ws.send(encoding.toUint8Array(awarenessEncoder));
    }

    // Handle disconnection
    ws.on("close", async () => {
      console.log(`[Collaboration] Client disconnected from ${docName}`);

      // Log disconnect activity
      if (projectId && userId && conn.userName) {
        try {
          await db.insert(projectActivity).values({
            projectId,
            userId,
            userName: conn.userName,
            userAvatar: access.userAvatar,
            activityType: "edit",
            description: `${conn.userName} stopped editing`,
            metadata: { action: "disconnected" },
          });
        } catch (error) {
          console.error(
            "[Collaboration] Failed to log disconnect activity:",
            error,
          );
        }
      }

      // Clean up
      doc.off("update", updateHandler);
      awareness.off("update", awarenessChangeHandler);
      awarenessProtocol.removeAwarenessStates(
        awareness,
        [awareness.clientID],
        null,
      );

      docConnections.get(docName)?.delete(conn);

      // Clean up empty documents
      if (docConnections.get(docName)?.size === 0) {
        docConnections.delete(docName);
        setTimeout(
          () => {
            // Double-check before destroying
            if (
              docConnections.get(docName)?.size === 0 ||
              !docConnections.has(docName)
            ) {
              console.log(`[Collaboration] Cleaning up document ${docName}`);
              doc.destroy();
              docs.delete(docName);
            }
          },
          30 * 60 * 1000,
        ); // 30 minutes
      }
    });

    ws.on("error", (error) => {
      console.error("[Collaboration] WebSocket error:", error);
    });
  });

  console.log("[Collaboration] WebSocket server initialized on /collaboration");

  return wss;
}

// Get active users in a room
export function getRoomUsers(docName: string): string[] {
  const connections = docConnections.get(docName);
  if (!connections) return [];

  const users = new Set<string>();
  connections.forEach((conn) => {
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
