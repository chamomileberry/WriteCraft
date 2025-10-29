import { useEffect, useState, useRef } from 'react';
import { Editor } from '@tiptap/react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { useAuth } from './useAuth';

interface CollaborationUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
}

export interface CollaborationState {
  activeUsers: CollaborationUser[];
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  provider: WebsocketProvider | null;
}

export function useCollaboration(
  editor: Editor | null,
  documentId: string | null,
  resourceType: 'project' | 'guide',
  enabled: boolean = false
) {
  const { user } = useAuth();
  const [state, setState] = useState<CollaborationState>({
    activeUsers: [],
    connectionStatus: 'disconnected',
    provider: null,
  });
  
  const ydocRef = useRef<Y.Doc | null>(null);
  const providerRef = useRef<WebsocketProvider | null>(null);

  useEffect(() => {
    if (!enabled || !editor || !documentId || !user?.id) {
      // Cleanup if disabled
      if (providerRef.current) {
        providerRef.current.destroy();
        providerRef.current = null;
      }
      if (ydocRef.current) {
        ydocRef.current.destroy();
        ydocRef.current = null;
      }
      setState({
        activeUsers: [],
        connectionStatus: 'disconnected',
        provider: null,
      });
      return;
    }

    // Create Yjs document
    const ydoc = new Y.Doc();
    ydocRef.current = ydoc;

    // Get WebSocket URL (use same origin)
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/collaboration`;
    
    const docName = `${resourceType}:${documentId}`;
    
    // Create WebSocket provider
    const provider = new WebsocketProvider(
      wsUrl,
      docName,
      ydoc,
      {
        params: {
          doc: docName,
          userId: user.id,
        },
      }
    );

    providerRef.current = provider;

    // Update connection status
    provider.on('status', ({ status }: { status: string }) => {
      console.log('[Collaboration] Connection status:', status);
      setState(prev => ({
        ...prev,
        connectionStatus: status as CollaborationState['connectionStatus'],
      }));
    });

    // Listen for awareness updates (who's online)
    provider.awareness.on('change', () => {
      const states = provider.awareness.getStates();
      const users: CollaborationUser[] = [];
      
      states.forEach((state, clientId) => {
        if (state.user && clientId !== provider.awareness.clientID) {
          users.push(state.user);
        }
      });
      
      setState(prev => ({
        ...prev,
        activeUsers: users,
      }));
    });

    // Set local user info in awareness
    provider.awareness.setLocalStateField('user', {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImageUrl: user.profileImageUrl,
    });

    setState(prev => ({
      ...prev,
      provider,
      connectionStatus: 'connecting',
    }));

    // Cleanup
    return () => {
      provider.destroy();
      ydoc.destroy();
    };
  }, [editor, documentId, resourceType, enabled, user?.id]);

  return state;
}
