import { useCallback, useState, useEffect, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
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

interface FamilyTreeEditorProps {
  treeId: string;
  notebookId: string;
}

export function FamilyTreeEditor({ treeId, notebookId }: FamilyTreeEditorProps) {
  const { toast } = useToast();
  const [isAutoLayout, setIsAutoLayout] = useState(true);

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
      setNodes(newNodes);
    }
  }, [members, setNodes]);

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
    // We'll implement relationship creation later
    console.log('Connection created:', connection);
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
    </div>
  );
}
