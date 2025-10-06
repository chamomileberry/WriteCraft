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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, ZoomIn, ZoomOut, Maximize, Users, Grid3X3, Maximize2, UserPlus, RotateCcw, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { FamilyMemberNode, FamilyMemberNodeData } from './FamilyMemberNode';
import { FamilyRelationshipEdge, FamilyRelationshipEdgeData } from './FamilyRelationshipEdge';
import { CharacterGallery } from './CharacterGallery';
import { RelationshipSelector, type RelationshipType } from './RelationshipSelector';
import { InlineMemberDialog } from './InlineMemberDialog';
import { getLayoutedElements } from '@/lib/elk-layout';

interface FamilyTreeEditorProps {
  treeId: string;
  notebookId: string;
}

function FamilyTreeEditorInner({ treeId, notebookId }: FamilyTreeEditorProps) {
  const { toast } = useToast();
  const { screenToFlowPosition, fitView } = useReactFlow();
  const [isAutoLayout, setIsAutoLayout] = useState(true);
  const prevIsAutoLayout = useRef(isAutoLayout);
  
  // Relationship selector state
  const [pendingConnection, setPendingConnection] = useState<Connection | null>(null);
  const [selectorOpen, setSelectorOpen] = useState(false);
  
  // Add member dialog state (for inline node creation - task 3)
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false);
  
  // Tree metadata editing state (for auto-save - task 4)
  const [treeName, setTreeName] = useState('');
  const [treeDescription, setTreeDescription] = useState('');
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  // Sync tree metadata to local state when tree data loads
  useEffect(() => {
    if (tree) {
      setTreeName(tree.name || '');
      setTreeDescription(tree.description || '');
    }
  }, [tree]);

  // Mutation to update tree metadata
  const updateTreeMetadata = useMutation({
    mutationFn: async (data: { name?: string; description?: string }) => {
      return apiRequest(
        'PUT',
        `/api/family-trees/${treeId}?notebookId=${notebookId}`,
        { ...data, notebookId }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/family-trees', treeId] });
    },
    onError: (error) => {
      toast({
        title: 'Failed to save changes',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive',
      });
    },
  });

  // Debounced auto-save for tree metadata (name and description)
  useEffect(() => {
    if (!tree) return;
    
    const nameChanged = treeName !== tree.name;
    const descriptionChanged = treeDescription !== tree.description;
    
    if (!nameChanged && !descriptionChanged) return;
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      const updates: { name?: string; description?: string } = {};
      if (nameChanged) updates.name = treeName;
      if (descriptionChanged) updates.description = treeDescription;
      
      updateTreeMetadata.mutate(updates);
    }, 1000); // 1 second debounce
    
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [treeName, treeDescription, tree]);

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
    // Validation: Prevent self-links
    if (connection.source === connection.target) {
      toast({
        title: 'Invalid relationship',
        description: 'A family member cannot have a relationship with themselves',
        variant: 'destructive',
      });
      return;
    }
    
    // Validation: Prevent duplicate relationships
    const duplicateExists = relationships.some(rel => 
      (rel.fromMemberId === connection.source && rel.toMemberId === connection.target) ||
      (rel.fromMemberId === connection.target && rel.toMemberId === connection.source)
    );
    
    if (duplicateExists) {
      toast({
        title: 'Relationship already exists',
        description: 'A relationship between these family members already exists',
        variant: 'destructive',
      });
      return;
    }
    
    setPendingConnection(connection);
    setSelectorOpen(true);
  }, [relationships, toast]);

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

  // Handle reset layout - reapply ELK auto-layout
  const handleResetLayout = useCallback(() => {
    if (nodes.length > 0) {
      getLayoutedElements(nodes, edges, {
        direction: 'DOWN',
        nodeSpacing: 80,
        layerSpacing: 150,
      }).then(({ nodes: layoutedNodes }) => {
        setNodes(layoutedNodes);
        toast({
          title: 'Layout reset',
          description: 'Family tree layout has been reset',
        });
      });
    }
  }, [nodes, edges, setNodes, toast]);

  // Mutation to create inline member
  const createInlineMember = useMutation({
    mutationFn: async ({ name, x, y }: { name: string; x: number; y: number }) => {
      return apiRequest(
        'POST',
        `/api/family-trees/${treeId}/members?notebookId=${notebookId}`,
        {
          treeId,
          inlineName: name,
          positionX: x,
          positionY: y,
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/family-trees', treeId, 'members'] });
      setAddMemberDialogOpen(false);
      toast({
        title: 'Member added',
        description: 'Family member successfully created',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to create member',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive',
      });
    },
  });

  // Handle inline member creation
  const handleInlineMemberCreate = useCallback((name: string) => {
    // Calculate position to the right of existing nodes
    const centerX = nodes.length > 0 ? Math.max(...nodes.map(n => n.position.x)) + 300 : 100;
    const centerY = nodes.length > 0 ? nodes.reduce((sum, n) => sum + n.position.y, 0) / nodes.length : 100;
    
    createInlineMember.mutate({
      name,
      x: centerX,
      y: centerY,
    });
  }, [nodes, createInlineMember]);

  if (treeLoading || membersLoading || relationshipsLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col" data-testid="family-tree-editor">
      {/* Editable header for tree metadata */}
      <div className="border-b p-4 space-y-2 bg-background">
        <div className="flex items-center gap-2">
          <Input
            value={treeName}
            onChange={(e) => setTreeName(e.target.value)}
            className="text-2xl font-semibold border-0 px-0 focus-visible:ring-0"
            placeholder="Family Tree Name..."
            data-testid="input-tree-name"
          />
          {updateTreeMetadata.isPending && (
            <Save className="w-4 h-4 animate-spin text-muted-foreground" />
          )}
        </div>
        <Textarea
          value={treeDescription}
          onChange={(e) => setTreeDescription(e.target.value)}
          className="min-h-[60px] resize-none border-0 px-0 focus-visible:ring-0 text-muted-foreground"
          placeholder="Add a description for this family tree..."
          data-testid="textarea-tree-description"
        />
      </div>
      
      <div className="flex-1 relative w-full h-full">
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
              variant="outline"
              onClick={() => setAddMemberDialogOpen(true)}
              data-testid="button-add-member"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add Member
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => fitView({ padding: 0.2, duration: 400 })}
              data-testid="button-fit-view"
            >
              <Maximize2 className="w-4 h-4 mr-2" />
              Fit View
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleResetLayout}
              data-testid="button-reset-layout"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset Layout
            </Button>
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
      
      <InlineMemberDialog
        open={addMemberDialogOpen}
        onOpenChange={setAddMemberDialogOpen}
        onConfirm={handleInlineMemberCreate}
        isLoading={createInlineMember.isPending}
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
