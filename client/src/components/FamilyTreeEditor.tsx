import { useCallback, useState, useEffect, useMemo, useRef } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
  addEdge,
  Connection,
  NodeTypes,
  EdgeTypes,
  Panel
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import type { FamilyTree, FamilyTreeMember, FamilyTreeRelationship } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Loader2, ZoomIn, ZoomOut, Maximize, Users, Grid3X3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { FamilyMemberNode, FamilyMemberNodeData } from './FamilyMemberNode';
import { FamilyRelationshipEdge, FamilyRelationshipEdgeData } from './FamilyRelationshipEdge';
import { CharacterGallery } from './CharacterGallery';
import { RelationshipSelector, type RelationshipType } from './RelationshipSelector';
import { getLayoutedElements } from '@/lib/elk-layout';

interface FamilyTreeEditorProps {
  treeId: string;
  notebookId: string;
}

function FamilyTreeEditorInner({ treeId, notebookId }: FamilyTreeEditorProps) {
  const { toast } = useToast();
  const { screenToFlowPosition } = useReactFlow();
  const [isAutoLayout, setIsAutoLayout] = useState(true);
  const prevIsAutoLayout = useRef(isAutoLayout);
  
  // Relationship selector state
  const [pendingConnection, setPendingConnection] = useState<Connection | null>(null);
  const [selectorOpen, setSelectorOpen] = useState(false);

  // Define custom node and edge types
  const nodeTypes: NodeTypes = useMemo(() => ({
    familyMember: FamilyMemberNode,
  }), []);

  const edgeTypes: EdgeTypes = useMemo(() => ({
    familyRelationship: FamilyRelationshipEdge,
  }), []);

  // Fetch tree data
  const { data: tree, isLoading: treeLoading } = useQuery<FamilyTree>({
    queryKey: ['/api/family-trees', treeId],
    queryFn: () => fetch(`/api/family-trees/${treeId}?notebookId=${notebookId}`).then(r => r.json()),
    enabled: !!treeId && !!notebookId
  });

  // Fetch members
  const { data: members = [], isLoading: membersLoading } = useQuery<FamilyTreeMember[]>({
    queryKey: ['/api/family-trees', treeId, 'members'],
    queryFn: () => fetch(`/api/family-trees/${treeId}/members?notebookId=${notebookId}`).then(r => r.json()),
    enabled: !!treeId && !!notebookId
  });

  // Fetch relationships
  const { data: relationships = [], isLoading: relationshipsLoading } = useQuery<FamilyTreeRelationship[]>({
    queryKey: ['/api/family-trees', treeId, 'relationships'],
    queryFn: () => fetch(`/api/family-trees/${treeId}/relationships?notebookId=${notebookId}`).then(r => r.json()),
    enabled: !!treeId && !!notebookId
  });

  // React Flow state - using generic types as React Flow's TypeScript support for custom data is limited
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  // Convert members to nodes
  useEffect(() => {
    if (members.length > 0) {
      const newNodes: Node[] = members.map((member, index) => ({
        id: member.id,
        type: 'familyMember',
        position: member.positionX && member.positionY 
          ? { x: member.positionX, y: member.positionY }
          : { x: index * 200, y: index * 150 }, // Default positioning
        data: { 
          member,
          notebookId,
          treeId
        },
      }));
      
      // Apply auto-layout if enabled
      if (isAutoLayout) {
        getLayoutedElements(newNodes, edges, {
          direction: 'DOWN',
          nodeSpacing: 80,
          layerSpacing: 150,
        }).then(({ nodes: layoutedNodes }) => {
          setNodes(layoutedNodes);
        });
      } else {
        setNodes(newNodes);
      }
    }
  }, [members, setNodes, isAutoLayout, edges]);

  // Convert relationships to edges
  useEffect(() => {
    if (relationships.length > 0) {
      const newEdges: Edge[] = relationships.map(rel => ({
        id: rel.id,
        source: rel.fromMemberId,
        target: rel.toMemberId,
        type: 'familyRelationship',
        data: {
          relationship: rel,
          notebookId,
          treeId
        },
        label: rel.relationshipType === 'custom' ? rel.customLabel : rel.relationshipType,
      }));
      setEdges(newEdges);
    }
  }, [relationships, setEdges]);

  // Re-apply layout when toggling to auto-layout mode
  useEffect(() => {
    const wasManual = !prevIsAutoLayout.current;
    const isNowAuto = isAutoLayout;
    
    if (wasManual && isNowAuto && nodes.length > 0) {
      getLayoutedElements(nodes, edges, {
        direction: 'DOWN',
        nodeSpacing: 80,
        layerSpacing: 150,
      }).then(({ nodes: layoutedNodes }) => {
        setNodes(layoutedNodes);
      });
    }
    
    prevIsAutoLayout.current = isAutoLayout;
  }, [isAutoLayout]);

  // Update member position mutation
  const updateMemberPosition = useMutation({
    mutationFn: async ({ memberId, x, y }: { memberId: string; x: number; y: number }) => {
      return apiRequest(
        'PUT',
        `/api/family-trees/${treeId}/members/${memberId}?notebookId=${notebookId}`,
        { positionX: x, positionY: y }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/family-trees', treeId, 'members'] });
    },
  });

  // Handle node drag end - save position
  const onNodeDragStop = useCallback((event: any, node: Node) => {
    if (!isAutoLayout) {
      updateMemberPosition.mutate({
        memberId: node.id,
        x: node.position.x,
        y: node.position.y,
      });
    }
  }, [isAutoLayout, updateMemberPosition]);

  // Handle connection (create relationship)
  const onConnect = useCallback((connection: Connection) => {
    setPendingConnection(connection);
    setSelectorOpen(true);
  }, []);

  // Mutation to create a new family tree member
  const createMember = useMutation({
    mutationFn: async (data: { characterId: string; x: number; y: number }) => {
      return apiRequest(
        'POST',
        `/api/family-trees/${treeId}/members?notebookId=${notebookId}`,
        {
          treeId,
          characterId: data.characterId,
          positionX: data.x,
          positionY: data.y,
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/family-trees', treeId, 'members'] });
      toast({
        title: 'Character added',
        description: 'Character successfully added to family tree',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to add character',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive',
      });
    },
  });

  // Handle drop from character gallery
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const data = event.dataTransfer.getData('application/json');
      
      if (!data) return;

      try {
        const { type, character } = JSON.parse(data);
        
        if (type === 'character') {
          // Get the bounding rect of the ReactFlow wrapper to calculate relative coordinates
          const reactFlowBounds = event.currentTarget.getBoundingClientRect();
          
          // Convert to pane-relative coordinates, then to flow coordinates using viewport transform
          const position = screenToFlowPosition({
            x: event.clientX - reactFlowBounds.left,
            y: event.clientY - reactFlowBounds.top,
          });

          createMember.mutate({
            characterId: character.id,
            x: position.x,
            y: position.y,
          });
        }
      } catch (error) {
        console.error('Failed to parse drop data:', error);
      }
    },
    [createMember, screenToFlowPosition]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  }, []);

  // Mutation to create a relationship
  const createRelationship = useMutation({
    mutationFn: async (data: { 
      fromMemberId: string; 
      toMemberId: string; 
      relationshipType: RelationshipType;
      customLabel?: string;
    }) => {
      return apiRequest(
        'POST',
        `/api/family-trees/${treeId}/relationships?notebookId=${notebookId}`,
        {
          treeId,
          fromMemberId: data.fromMemberId,
          toMemberId: data.toMemberId,
          relationshipType: data.relationshipType,
          customLabel: data.customLabel,
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/family-trees', treeId, 'relationships'] });
      toast({
        title: 'Relationship added',
        description: 'Relationship successfully created',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to create relationship',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive',
      });
    },
  });

  // Handle relationship type selection
  const handleRelationshipConfirm = useCallback((relationshipType: RelationshipType, customLabel?: string) => {
    if (!pendingConnection) return;

    createRelationship.mutate({
      fromMemberId: pendingConnection.source,
      toMemberId: pendingConnection.target!,
      relationshipType,
      customLabel,
    });

    setSelectorOpen(false);
    setPendingConnection(null);
  }, [pendingConnection, createRelationship]);

  // Handle relationship selector close (including cancel)
  const handleSelectorOpenChange = useCallback((open: boolean) => {
    setSelectorOpen(open);
    if (!open) {
      setPendingConnection(null); // Clear pending connection when dialog closes
    }
  }, []);

  if (treeLoading || membersLoading || relationshipsLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col" data-testid="family-tree-editor">
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeDragStop={onNodeDragStop}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          nodesDraggable={!isAutoLayout}
          nodesConnectable={true}
          fitView
          minZoom={0.1}
          maxZoom={2}
        >
          <Background />
          <Controls />
          <MiniMap />
          
          <Panel position="top-right" className="flex gap-2">
            <Button
              size="sm"
              variant={isAutoLayout ? "default" : "outline"}
              onClick={() => setIsAutoLayout(!isAutoLayout)}
              data-testid="button-toggle-layout"
            >
              <Grid3X3 className="w-4 h-4 mr-2" />
              {isAutoLayout ? "Auto Layout" : "Manual Layout"}
            </Button>
          </Panel>
        </ReactFlow>
      </div>
      
      <CharacterGallery notebookId={notebookId} />
      
      <RelationshipSelector
        open={selectorOpen}
        onOpenChange={handleSelectorOpenChange}
        onConfirm={handleRelationshipConfirm}
        sourceNodeLabel={
          pendingConnection 
            ? members.find(m => m.id === pendingConnection.source)?.inlineName || 'Character A'
            : 'Character A'
        }
        targetNodeLabel={
          pendingConnection 
            ? members.find(m => m.id === pendingConnection.target)?.inlineName || 'Character B'
            : 'Character B'
        }
      />
    </div>
  );
}

// Wrapper component to provide React Flow context
export function FamilyTreeEditor(props: FamilyTreeEditorProps) {
  return (
    <ReactFlowProvider>
      <FamilyTreeEditorInner {...props} />
    </ReactFlowProvider>
  );
}
