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
import type { FamilyTree, FamilyTreeMember, FamilyTreeRelationship, Character } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, ZoomIn, ZoomOut, Maximize, Users, Grid3X3, Maximize2, UserPlus, RotateCcw, Save, ArrowLeft, Check, AlertCircle, RefreshCw, Search, X, Undo, Redo, Map as MapIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useDebouncedSave } from '@/hooks/useDebouncedSave';
import { FamilyMemberNode, FamilyMemberNodeData } from './FamilyMemberNode';
import { FamilyRelationshipEdge, FamilyRelationshipEdgeData } from './FamilyRelationshipEdge';
import { JunctionNode } from './JunctionNode';
import { JunctionEdge } from './JunctionEdge';
import { CharacterGallery } from './CharacterGallery';
import { RelationshipSelector, type RelationshipType } from './RelationshipSelector';
import { InlineMemberDialog } from './InlineMemberDialog';
import { MemberEditDialog } from './MemberEditDialog';
import { AddRelationshipDialog, type RelationshipType as AddRelationshipType } from './AddRelationshipDialog';
import { SelectCharacterDialog } from './SelectCharacterDialog';
import { getLayoutedElements } from '@/lib/dagre-layout';

interface FamilyTreeEditorProps {
  treeId: string;
  notebookId: string;
  onBack?: () => void;
}

function FamilyTreeEditorInner({ treeId, notebookId, onBack }: FamilyTreeEditorProps) {
  const { toast } = useToast();
  const { screenToFlowPosition, fitView, setCenter, getNode, getNodes } = useReactFlow();
  const [isAutoLayout, setIsAutoLayout] = useState(true); // Default to auto-layout with Dagre
  const prevIsAutoLayout = useRef(isAutoLayout);
  const lastComputedNodesRef = useRef<Node[]>([]);
  const lastComputedEdgesRef = useRef<Edge[]>([]);
  const isUpdatingJunctions = useRef(false);
  
  // Relationship selector state
  const [pendingConnection, setPendingConnection] = useState<Connection | null>(null);
  const [selectorOpen, setSelectorOpen] = useState(false);
  
  // Add member dialog state (for inline node creation - task 3)
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false);
  
  // Character edit modal state
  const [editingMember, setEditingMember] = useState<FamilyTreeMember | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  
  // Add relationship dialog state
  const [addRelationshipDialogOpen, setAddRelationshipDialogOpen] = useState(false);
  const [selectCharacterDialogOpen, setSelectCharacterDialogOpen] = useState(false);
  const [selectedMemberForRelationship, setSelectedMemberForRelationship] = useState<FamilyTreeMember | null>(null);
  const [selectedRelationshipType, setSelectedRelationshipType] = useState<AddRelationshipType | null>(null);
  
  // Tree metadata editing state
  const [treeName, setTreeName] = useState('');
  const [treeDescription, setTreeDescription] = useState('');
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FamilyTreeMember[]>([]);
  const [selectedSearchIndex, setSelectedSearchIndex] = useState(0);
  
  // MiniMap visibility state
  const [showMiniMap, setShowMiniMap] = useState(true);
  
  // Undo/Redo history state
  type HistoryAction = {
    type: 'move_node' | 'add_relationship' | 'remove_relationship';
    memberId?: string;
    oldPosition?: { x: number; y: number };
    newPosition?: { x: number; y: number };
    relationshipId?: string;
    relationshipData?: any;
  };
  
  const [history, setHistory] = useState<HistoryAction[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const MAX_HISTORY = 20;
  
  // Track node positions before drag starts for accurate history
  const dragStartPositions = useRef<Map<string, { x: number; y: number }>>(new Map());

  // Handle member edit
  const handleEditMember = useCallback((member: FamilyTreeMember) => {
    setEditingMember(member);
    setEditModalOpen(true);
  }, []);

  // Handle add relationship - opens AddRelationshipDialog
  const handleAddRelationship = useCallback((member: FamilyTreeMember) => {
    setSelectedMemberForRelationship(member);
    setAddRelationshipDialogOpen(true);
  }, []);

  // Handle relationship type selection - close first dialog, open second
  const onSelectRelationshipType = useCallback((type: AddRelationshipType) => {
    setSelectedRelationshipType(type);
    setAddRelationshipDialogOpen(false);
    setSelectCharacterDialogOpen(true);
  }, []);

  // Mutation to add related family member
  const addRelatedMember = useMutation({
    mutationFn: async (data: { 
      relativeMemberId: string; 
      relationshipType: AddRelationshipType; 
      characterId?: string;
      inlineName?: string;
    }) => {
      return apiRequest(
        'POST',
        `/api/family-trees/${treeId}/members/add-related`,
        { ...data, notebookId }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/family-trees', treeId, 'members'] });
      queryClient.invalidateQueries({ queryKey: ['/api/family-trees', treeId, 'relationships'] });
      
      setSelectCharacterDialogOpen(false);
      setAddRelationshipDialogOpen(false);
      setSelectedMemberForRelationship(null);
      setSelectedRelationshipType(null);
      
      toast({
        title: 'Success',
        description: 'Related family member added successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to add related member',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive',
      });
    },
  });

  // Handle selecting existing character
  const onSelectExisting = useCallback((characterId: string) => {
    if (!selectedMemberForRelationship || !selectedRelationshipType) {
      toast({
        title: 'Error',
        description: 'Missing required information',
        variant: 'destructive',
      });
      return;
    }

    addRelatedMember.mutate({
      relativeMemberId: selectedMemberForRelationship.id,
      relationshipType: selectedRelationshipType,
      characterId: characterId,
    });
  }, [selectedMemberForRelationship, selectedRelationshipType, addRelatedMember, toast]);

  // Handle creating new character
  const onCreateNew = useCallback((name: string) => {
    if (!selectedMemberForRelationship || !selectedRelationshipType) {
      toast({
        title: 'Error',
        description: 'Missing required information',
        variant: 'destructive',
      });
      return;
    }

    addRelatedMember.mutate({
      relativeMemberId: selectedMemberForRelationship.id,
      relationshipType: selectedRelationshipType,
      inlineName: name,
    });
  }, [selectedMemberForRelationship, selectedRelationshipType, addRelatedMember, toast]);

  // Define custom node and edge types
  const nodeTypes: NodeTypes = useMemo(() => ({
    familyMember: FamilyMemberNode,
    junction: JunctionNode,
  }), []);

  const edgeTypes: EdgeTypes = useMemo(() => ({
    familyRelationship: FamilyRelationshipEdge,
    junction: JunctionEdge,
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

  // Fetch characters for SelectCharacterDialog
  const { data: characters = [] } = useQuery<Character[]>({
    queryKey: ['/api/characters'],
    queryFn: async () => {
      const response = await fetch(`/api/characters?notebookId=${notebookId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch characters');
      }
      return response.json();
    },
    enabled: !!notebookId
  });

  // Sync tree metadata to local state when tree data loads
  useEffect(() => {
    if (tree) {
      setTreeName(tree.name || '');
      setTreeDescription(tree.description || '');
      // Sync layout mode from database
      setIsAutoLayout(tree.layoutMode === 'auto');
    }
  }, [tree]);

  // Mutation to update tree metadata
  const updateTreeMetadata = useMutation({
    mutationFn: async (data: { name?: string; description?: string; layoutMode?: string }) => {
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

  // Debounced auto-save for tree metadata using useDebouncedSave hook
  const metadataSave = useDebouncedSave({
    getData: () => {
      if (!tree) return null;
      
      const nameChanged = treeName !== tree.name;
      const descriptionChanged = treeDescription !== tree.description;
      
      if (!nameChanged && !descriptionChanged) return null;
      
      const updates: { name?: string; description?: string } = {};
      if (nameChanged) updates.name = treeName;
      if (descriptionChanged) updates.description = treeDescription;
      
      return updates;
    },
    saveFn: async (data) => {
      return await updateTreeMetadata.mutateAsync(data);
    },
    debounceMs: 1000,
    showToasts: false, // No toasts for auto-save
  });

  // Trigger save when treeName or treeDescription changes (but only after initial sync)
  const initialSyncDone = useRef(false);
  
  useEffect(() => {
    if (!tree) return;
    
    // Skip the first sync when component mounts
    if (!initialSyncDone.current) {
      initialSyncDone.current = true;
      return;
    }
    
    // Only trigger save if values actually differ from server
    if (treeName !== tree.name || treeDescription !== tree.description) {
      metadataSave.triggerSave();
    }
  }, [treeName, treeDescription]);

  // Search filtering logic
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setSelectedSearchIndex(0);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const results = members.filter(member => {
      // Search in inline name or character data if available
      const inlineName = member.inlineName || '';
      const charData = (member as any).character;
      const charName = charData ? 
        [charData.givenName, charData.middleName, charData.familyName, charData.nickname]
          .filter(Boolean).join(' ') : '';
      const fullName = (inlineName + ' ' + charName).toLowerCase();
      return fullName.includes(query);
    });
    
    setSearchResults(results);
    setSelectedSearchIndex(0);
  }, [searchQuery, members]);
  
  // Pan to search result
  useEffect(() => {
    if (searchResults.length > 0 && searchResults[selectedSearchIndex]) {
      const member = searchResults[selectedSearchIndex];
      const node = getNode(member.id);
      if (node) {
        setCenter(node.position.x + 75, node.position.y + 50, { zoom: 1.5, duration: 400 });
      }
    }
  }, [selectedSearchIndex, searchResults, getNode, setCenter]);
  
  // Search navigation handlers
  const handleNextResult = useCallback(() => {
    if (searchResults.length > 0) {
      setSelectedSearchIndex((prev) => (prev + 1) % searchResults.length);
    }
  }, [searchResults.length]);
  
  const handlePrevResult = useCallback(() => {
    if (searchResults.length > 0) {
      setSelectedSearchIndex((prev) => (prev - 1 + searchResults.length) % searchResults.length);
    }
  }, [searchResults.length]);
  
  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
    setSelectedSearchIndex(0);
  }, []);
  
  // Add action to history
  const addToHistory = useCallback((action: HistoryAction) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(action);
      if (newHistory.length > MAX_HISTORY) {
        newHistory.shift();
        return newHistory;
      }
      return newHistory;
    });
    setHistoryIndex(prev => Math.min(prev + 1, MAX_HISTORY - 1));
  }, [historyIndex, MAX_HISTORY]);

  // React Flow state - using generic types as React Flow's TypeScript support for custom data is limited
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  // Update junction positions and keep married couples aligned when parent nodes are dragged
  const onNodeDrag = useCallback((_event: any, node: Node) => {
    if (node.type !== 'familyMember' || isUpdatingJunctions.current || isAutoLayout) return;
    
    isUpdatingJunctions.current = true;
    
    setNodes(currentNodes => {
      const updatedNodes = [...currentNodes];
      
      // First, find and align the spouse to the same Y level
      const draggedNodeIndex = updatedNodes.findIndex(n => n.id === node.id);
      if (draggedNodeIndex !== -1) {
        updatedNodes[draggedNodeIndex] = node;
      }
      
      // Find all junctions that involve this node to identify spouses
      const spouseIds = new Set<string>();
      updatedNodes.forEach(n => {
        if (n.type === 'junction' && n.data.parent1Id && n.data.parent2Id) {
          const junctionData = n.data as { parent1Id: string; parent2Id: string };
          if (junctionData.parent1Id === node.id) {
            spouseIds.add(junctionData.parent2Id);
          } else if (junctionData.parent2Id === node.id) {
            spouseIds.add(junctionData.parent1Id);
          }
        }
      });
      
      // Align all spouses to the same Y coordinate
      updatedNodes.forEach((n, index) => {
        if (spouseIds.has(n.id) && n.type === 'familyMember') {
          updatedNodes[index] = {
            ...n,
            position: {
              x: n.position.x,
              y: node.position.y, // Align to same Y as dragged node
            },
          };
        }
      });
      
      // Now update all junction nodes that have this node or its spouses as parents
      updatedNodes.forEach((n, index) => {
        if (n.type === 'junction' && n.data.parent1Id && n.data.parent2Id) {
          const junctionData = n.data as { parent1Id: string; parent2Id: string };
          const isInvolved = junctionData.parent1Id === node.id || 
                           junctionData.parent2Id === node.id || 
                           spouseIds.has(junctionData.parent1Id) || 
                           spouseIds.has(junctionData.parent2Id);
          if (isInvolved) {
            const parent1 = updatedNodes.find(cn => cn.id === junctionData.parent1Id);
            const parent2 = updatedNodes.find(cn => cn.id === junctionData.parent2Id);
            
            if (parent1 && parent2) {
              updatedNodes[index] = {
                ...n,
                position: {
                  x: (parent1.position.x + parent2.position.x) / 2 - 4, // Offset to center 8x8 node
                  y: parent1.position.y - 4, // Use the aligned Y position, offset to center
                },
              };
            }
          }
        }
      });
      
      isUpdatingJunctions.current = false;
      return updatedNodes;
    });
  }, [setNodes, isAutoLayout]);

  // Create nodes and edges together to avoid infinite loops  
  useEffect(() => {
    if (members.length === 0) {
      setNodes([]);
      setEdges([]);
      return;
    }
    
    // Create member nodes
    const memberNodes: Node[] = members.map((member, index) => ({
      id: member.id,
      type: 'familyMember',
      position: member.positionX && member.positionY 
        ? { x: member.positionX, y: member.positionY }
        : { x: index * 200, y: index * 150 },
      data: { 
        member,
        notebookId,
        treeId,
        onEdit: handleEditMember,
        onAddRelationship: handleAddRelationship,
        onRemoveMember: handleRemoveMemberFromNode
      },
    }));
    
    // Build relationship maps
    const marriageMap = new Map<string, Set<string>>();
    const parentChildMap = new Map<string, { targetId: string; relationship: any }[]>();
    
    relationships.forEach(rel => {
      if (rel.relationshipType === 'marriage' || rel.relationshipType === 'spouse') {
        if (!marriageMap.has(rel.fromMemberId)) {
          marriageMap.set(rel.fromMemberId, new Set());
        }
        marriageMap.get(rel.fromMemberId)!.add(rel.toMemberId);
      } else if (rel.relationshipType === 'parent' || rel.relationshipType === 'child') {
        if (!parentChildMap.has(rel.fromMemberId)) {
          parentChildMap.set(rel.fromMemberId, []);
        }
        parentChildMap.get(rel.fromMemberId)!.push({ targetId: rel.toMemberId, relationship: rel });
      }
    });
    
    // Create junction nodes and edges
    const junctionNodes: Node[] = [];
    const newEdges: Edge[] = [];
    const handledParentChild = new Set<string>();
    const processedCouples = new Set<string>();
    
    parentChildMap.forEach((children, parent1Id) => {
      const spouses = marriageMap.get(parent1Id);
      if (!spouses) return;
      
      spouses.forEach(parent2Id => {
        const coupleKey = [parent1Id, parent2Id].sort().join('-');
        if (processedCouples.has(coupleKey)) return;
        processedCouples.add(coupleKey);
        
        const parent2Children = parentChildMap.get(parent2Id) || [];
        const parent1ChildIds = new Set(children.map(c => c.targetId));
        const sharedChildren = parent2Children.filter(c => parent1ChildIds.has(c.targetId));
        
        if (sharedChildren.length > 0) {
          const parent1Node = memberNodes.find(n => n.id === parent1Id);
          const parent2Node = memberNodes.find(n => n.id === parent2Id);
          
          if (parent1Node && parent2Node) {
            const junctionX = (parent1Node.position.x + parent2Node.position.x) / 2;
            // Use the same Y as parents (they should be aligned already)
            const junctionY = parent1Node.position.y;
            const junctionId = `junction-${coupleKey}`;
            
            // Offset junction position so its center (not top-left) aligns with the calculated position
            // Junction node is 8x8, so offset by 4 to center it
            junctionNodes.push({
              id: junctionId,
              type: 'junction',
              position: { x: junctionX - 4, y: junctionY - 4 },
              data: {
                parent1Id,
                parent2Id,
              },
              selectable: false,
              draggable: false,
            });
            
            newEdges.push({
              id: `${parent1Id}-${junctionId}`,
              source: parent1Id,
              target: junctionId,
              sourceHandle: 'right',
              targetHandle: 'left',
              type: 'junction',
              style: { stroke: 'hsl(var(--foreground))', strokeWidth: 2 },
            });
            
            newEdges.push({
              id: `${parent2Id}-${junctionId}`,
              source: parent2Id,
              target: junctionId,
              sourceHandle: 'left',
              targetHandle: 'right',
              type: 'junction',
              style: { stroke: 'hsl(var(--foreground))', strokeWidth: 2 },
            });
            
            sharedChildren.forEach(child => {
              newEdges.push({
                id: `${junctionId}-${child.targetId}`,
                source: junctionId,
                target: child.targetId,
                sourceHandle: 'bottom',
                targetHandle: 'top-target',
                type: 'junction',
                style: { stroke: 'hsl(var(--foreground))', strokeWidth: 2 },
              });
              
              handledParentChild.add(`${parent1Id}-${child.targetId}`);
              handledParentChild.add(`${parent2Id}-${child.targetId}`);
            });
          }
        }
      });
    });
    
    // Add remaining relationship edges
    relationships.forEach(rel => {
      if ((rel.relationshipType === 'parent' || rel.relationshipType === 'child') &&
          handledParentChild.has(`${rel.fromMemberId}-${rel.toMemberId}`)) {
        return;
      }
      
      const coupleKey = [rel.fromMemberId, rel.toMemberId].sort().join('-');
      if ((rel.relationshipType === 'marriage' || rel.relationshipType === 'spouse') &&
          processedCouples.has(coupleKey)) {
        return;
      }
      
      const edgeProps: any = {
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
      };
      
      if (rel.relationshipType === 'marriage' || rel.relationshipType === 'spouse') {
        edgeProps.sourceHandle = 'right';
        edgeProps.targetHandle = 'left-target';
      } else {
        edgeProps.sourceHandle = 'bottom';
        edgeProps.targetHandle = 'top-target';
      }
      
      newEdges.push(edgeProps);
    });
    
    // Compute final nodes with layout
    let finalNodes = [...memberNodes, ...junctionNodes];
    if (isAutoLayout) {
      // Only layout family members with Dagre (not junctions)
      const { nodes: layoutedMembers } = getLayoutedElements(memberNodes, newEdges, {
        direction: 'TB',
        nodeSep: 100,
        rankSep: 150,
      });
      
      // Align married couples to the same Y coordinate
      const coupleAlignments = new Map<string, number>();
      processedCouples.clear();
      
      marriageMap.forEach((spouses, memberId) => {
        spouses.forEach(spouseId => {
          const coupleKey = [memberId, spouseId].sort().join('-');
          if (processedCouples.has(coupleKey)) return;
          processedCouples.add(coupleKey);
          
          const member1 = layoutedMembers.find(n => n.id === memberId);
          const member2 = layoutedMembers.find(n => n.id === spouseId);
          
          if (member1 && member2) {
            const avgY = (member1.position.y + member2.position.y) / 2;
            coupleAlignments.set(memberId, avgY);
            coupleAlignments.set(spouseId, avgY);
          }
        });
      });
      
      // Apply alignments
      const alignedMembers = layoutedMembers.map(node => {
        const alignedY = coupleAlignments.get(node.id);
        if (alignedY !== undefined) {
          return {
            ...node,
            position: { x: node.position.x, y: alignedY },
          };
        }
        return node;
      });
      
      // Position junction nodes on the marriage line between aligned parents
      const positionedJunctions = junctionNodes.map(junctionNode => {
        if (junctionNode.data.parent1Id && junctionNode.data.parent2Id) {
          const parent1 = alignedMembers.find(n => n.id === junctionNode.data.parent1Id);
          const parent2 = alignedMembers.find(n => n.id === junctionNode.data.parent2Id);
          
          if (parent1 && parent2) {
            return {
              ...junctionNode,
              position: {
                x: (parent1.position.x + parent2.position.x) / 2 - 4, // Offset to center 8x8 node
                y: parent1.position.y - 4, // Offset to center 8x8 node on marriage line
              },
            };
          }
        }
        return junctionNode;
      });
      
      finalNodes = [...alignedMembers, ...positionedJunctions];
    }
    
    // Only update state if structure changed (compare IDs and basic structure, not positions)
    const finalStructure = {
      nodeIds: finalNodes.map(n => n.id).sort().join(','),
      edgeIds: newEdges.map(e => e.id).sort().join(','),
      count: `${finalNodes.length}:${newEdges.length}`
    };
    
    const lastStructure = {
      nodeIds: lastComputedNodesRef.current.map(n => n.id).sort().join(','),
      edgeIds: lastComputedEdgesRef.current.map(e => e.id).sort().join(','),
      count: `${lastComputedNodesRef.current.length}:${lastComputedEdgesRef.current.length}`
    };
    
    const structureChanged = 
      finalStructure.nodeIds !== lastStructure.nodeIds ||
      finalStructure.edgeIds !== lastStructure.edgeIds ||
      finalStructure.count !== lastStructure.count;
    
    if (structureChanged || lastComputedNodesRef.current.length === 0) {
      lastComputedNodesRef.current = finalNodes;
      lastComputedEdgesRef.current = newEdges;
      setNodes(finalNodes);
      setEdges(newEdges);
    }
  }, [members, relationships, isAutoLayout, setNodes, setEdges, notebookId, treeId]);

  // Re-apply layout when toggling to auto-layout mode
  useEffect(() => {
    const wasManual = !prevIsAutoLayout.current;
    const isNowAuto = isAutoLayout;
    
    if (wasManual && isNowAuto) {
      const currentNodes = getNodes();
      const currentEdges = edges;
      if (currentNodes.length > 0) {
        const { nodes: layoutedNodes } = getLayoutedElements(currentNodes, currentEdges, {
          direction: 'TB',
          nodeSep: 100,
          rankSep: 150,
        });
        setNodes(layoutedNodes);
      }
    }
    
    prevIsAutoLayout.current = isAutoLayout;
  }, [isAutoLayout, getNodes, edges, setNodes]);

  // Update member position mutation with optimistic updates
  const updateMemberPosition = useMutation({
    mutationFn: async ({ memberId, x, y }: { memberId: string; x: number; y: number }) => {
      return apiRequest(
        'PUT',
        `/api/family-trees/${treeId}/members/${memberId}?notebookId=${notebookId}`,
        { positionX: x, positionY: y }
      );
    },
    onMutate: async ({ memberId, x, y }) => {
      // Optimistically update the cached members data
      queryClient.setQueryData(
        ['/api/family-trees', treeId, 'members'],
        (old: FamilyTreeMember[] | undefined) => {
          if (!old) return old;
          return old.map(member => 
            member.id === memberId 
              ? { ...member, positionX: x, positionY: y }
              : member
          );
        }
      );
    },
  });

  // Handle node drag start - capture position before drag for accurate history
  const onNodeDragStart = useCallback((event: any, node: Node) => {
    if (!isAutoLayout) {
      // Capture the current position before drag starts
      dragStartPositions.current.set(node.id, { x: node.position.x, y: node.position.y });
    }
  }, [isAutoLayout]);
  
  // Handle node drag end - save position and record in history
  const onNodeDragStop = useCallback((event: any, node: Node) => {
    if (!isAutoLayout) {
      // Get old position from drag start (accurate React Flow state)
      const oldPosition = dragStartPositions.current.get(node.id) || { x: 0, y: 0 };
      
      // Only record in history if position actually changed
      if (oldPosition.x !== node.position.x || oldPosition.y !== node.position.y) {
        addToHistory({
          type: 'move_node',
          memberId: node.id,
          oldPosition,
          newPosition: { x: node.position.x, y: node.position.y },
        });
      }
      
      // Clean up the stored position
      dragStartPositions.current.delete(node.id);
      
      updateMemberPosition.mutate({
        memberId: node.id,
        x: node.position.x,
        y: node.position.y,
      });
    }
  }, [isAutoLayout, updateMemberPosition, addToHistory]);
  
  // Undo function - updates local state and persists to database
  const handleUndo = useCallback(() => {
    if (historyIndex < 0) return;
    
    const action = history[historyIndex];
    
    if (action.type === 'move_node' && action.memberId && action.oldPosition) {
      // Restore old position in local state
      const node = getNode(action.memberId);
      if (node) {
        node.position = action.oldPosition;
        setNodes(nds => [...nds]); // Trigger re-render
        
        // Persist to database
        updateMemberPosition.mutate({
          memberId: action.memberId,
          x: action.oldPosition.x,
          y: action.oldPosition.y,
        });
      }
    }
    
    setHistoryIndex(prev => prev - 1);
  }, [historyIndex, history, getNode, setNodes, updateMemberPosition]);
  
  // Redo function - updates local state and persists to database
  const handleRedo = useCallback(() => {
    if (historyIndex >= history.length - 1) return;
    
    const action = history[historyIndex + 1];
    
    if (action.type === 'move_node' && action.memberId && action.newPosition) {
      // Apply new position in local state
      const node = getNode(action.memberId);
      if (node) {
        node.position = action.newPosition;
        setNodes(nds => [...nds]); // Trigger re-render
        
        // Persist to database
        updateMemberPosition.mutate({
          memberId: action.memberId,
          x: action.newPosition.x,
          y: action.newPosition.y,
        });
      }
    }
    
    setHistoryIndex(prev => prev + 1);
  }, [historyIndex, history, getNode, setNodes, updateMemberPosition]);
  
  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z' && !e.shiftKey) {
          e.preventDefault();
          handleUndo();
        } else if ((e.key === 'y') || (e.key === 'z' && e.shiftKey)) {
          e.preventDefault();
          handleRedo();
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

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
    const existingRelationship = relationships.find(rel => 
      (rel.fromMemberId === connection.source && rel.toMemberId === connection.target) ||
      (rel.fromMemberId === connection.target && rel.toMemberId === connection.source)
    );
    
    if (existingRelationship) {
      // Highlight the existing edge
      setEdges(eds => 
        eds.map(e => 
          e.id === existingRelationship.id 
            ? { ...e, animated: true, style: { stroke: '#f59e0b', strokeWidth: 3 } }
            : e
        )
      );
      
      // Get member names for better error message
      const sourceMember = members.find(m => m.id === connection.source);
      const targetMember = members.find(m => m.id === connection.target);
      const sourceName = sourceMember?.inlineName || 'this member';
      const targetName = targetMember?.inlineName || 'the other member';
      
      toast({
        title: 'Relationship already exists',
        description: `${sourceName} and ${targetName} are already connected (${existingRelationship.relationshipType})`,
        variant: 'destructive',
      });
      
      // Reset edge highlight after 2 seconds
      setTimeout(() => {
        setEdges(eds => 
          eds.map(e => 
            e.id === existingRelationship.id 
              ? { ...e, animated: false, style: undefined }
              : e
          )
        );
      }, 2000);
      
      return;
    }
    
    setPendingConnection(connection);
    setSelectorOpen(true);
  }, [relationships, toast, setEdges, members]);

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

  // Handle reset layout - reapply Dagre auto-layout
  const handleResetLayout = useCallback(() => {
    if (nodes.length > 0) {
      const { nodes: layoutedNodes } = getLayoutedElements(nodes, edges, {
        direction: 'TB',
        nodeSep: 100,
        rankSep: 150,
      });
      setNodes(layoutedNodes);
      toast({
        title: 'Layout reset',
        description: 'Family tree layout has been reset',
      });
    }
  }, [nodes, edges, setNodes, toast]);

  // Handle layout mode toggle - save to database
  const handleToggleLayout = useCallback(() => {
    const newLayoutMode = isAutoLayout ? 'manual' : 'auto';
    setIsAutoLayout(!isAutoLayout);
    updateTreeMetadata.mutate({ layoutMode: newLayoutMode });
  }, [isAutoLayout, updateTreeMetadata]);

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

  // Mutation to delete a member
  const deleteMemberMutation = useMutation({
    mutationFn: async (memberId: string) => {
      const response = await fetch(`/api/family-trees/${treeId}/members/${memberId}?notebookId=${notebookId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to delete member');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/family-trees', treeId, 'members'] });
      queryClient.invalidateQueries({ queryKey: ['/api/family-trees', treeId, 'relationships'] });
      toast({
        title: 'Member removed',
        description: 'Family member has been removed from the tree',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to remove member',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive',
      });
    },
  });

  // Handle removing member from tree (called from CharacterGallery with memberId string)
  const handleRemoveMember = useCallback((memberId: string) => {
    deleteMemberMutation.mutate(memberId);
  }, [deleteMemberMutation]);

  // Handle removing member from node (called from FamilyMemberNode with member object)
  const handleRemoveMemberFromNode = useCallback((member: FamilyTreeMember) => {
    // Get display name for confirmation message
    const memberWithChar = member as any;
    let displayName = 'this member';
    
    if (memberWithChar.character) {
      const parts = [
        memberWithChar.character.givenName,
        memberWithChar.character.middleName,
        memberWithChar.character.familyName
      ].filter(Boolean);
      if (parts.length > 0) {
        displayName = parts.join(' ');
      } else if (memberWithChar.character.nickname) {
        displayName = memberWithChar.character.nickname;
      }
    } else if (member.inlineName) {
      displayName = member.inlineName;
    }
    
    // Show confirmation dialog
    const confirmed = window.confirm(
      `Are you sure you want to remove ${displayName} from this family tree? This will also remove their relationships.`
    );
    
    if (confirmed) {
      deleteMemberMutation.mutate(member.id);
    }
  }, [deleteMemberMutation]);

  // Mutation to update member details
  const updateMemberMutation = useMutation({
    mutationFn: async ({ memberId, updates }: { 
      memberId: string; 
      updates: { 
        inlineName?: string; 
        inlineDateOfBirth?: string | null; 
        inlineDateOfDeath?: string | null;
      } 
    }) => {
      return apiRequest(
        'PUT',
        `/api/family-trees/${treeId}/members/${memberId}?notebookId=${notebookId}`,
        { ...updates, notebookId }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/family-trees', treeId, 'members'] });
      toast({
        title: 'Member updated',
        description: 'Member details have been updated',
      });
      setEditModalOpen(false);
    },
    onError: (error) => {
      toast({
        title: 'Failed to update member',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive',
      });
    },
  });

  // Handle saving member details
  const handleSaveMemberDetails = useCallback((memberId: string, updates: {
    inlineName?: string;
    inlineDateOfBirth?: string | null;
    inlineDateOfDeath?: string | null;
  }) => {
    updateMemberMutation.mutate({ memberId, updates });
  }, [updateMemberMutation]);

  // Manual save handler for immediate save (moved before conditional return)
  const handleManualSave = useCallback(async () => {
    const updates: { name?: string; description?: string } = {};
    if (treeName !== tree?.name) updates.name = treeName;
    if (treeDescription !== tree?.description) updates.description = treeDescription;
    
    if (Object.keys(updates).length > 0) {
      try {
        await updateTreeMetadata.mutateAsync(updates);
        toast({
          title: 'Saved',
          description: 'Family tree updated successfully',
        });
      } catch (error) {
        // Error toast is already handled in mutation's onError
      }
    } else {
      toast({
        title: 'No changes to save',
        description: 'The family tree is already up to date',
      });
    }
  }, [treeName, treeDescription, tree, updateTreeMetadata, toast]);

  if (treeLoading || membersLoading || relationshipsLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col min-h-0" data-testid="family-tree-editor">
      <div className="flex-1 min-h-0 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeDrag={onNodeDrag}
          onNodeDragStart={onNodeDragStart}
          onNodeDragStop={onNodeDragStop}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          nodesDraggable={!isAutoLayout}
          nodesConnectable={true}
          defaultEdgeOptions={{
            type: 'smoothstep',
            markerEnd: undefined,
          }}
          fitView
          minZoom={0.1}
          maxZoom={2}
          style={{ width: '100%', height: '100%' }}
        >
          <Background />
          <Controls />
          {showMiniMap && (
            <MiniMap
              nodeColor={(node) => {
                // Highlight search results
                if (searchResults.some(r => r.id === node.id)) {
                  return '#f59e0b'; // orange for search results
                }
                return '#8b5cf6'; // purple for regular nodes
              }}
              maskColor="rgba(0, 0, 0, 0.4)"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
              }}
              className="border rounded shadow-lg"
            />
          )}
          
          {/* Top-left card for tree name and description */}
          <Panel position="top-left">
            <div className="bg-card border rounded-lg shadow-lg p-4 space-y-3 w-80">
              <div className="flex items-center gap-2">
                {onBack && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={onBack}
                    data-testid="button-back-to-notebook"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                )}
                <Input
                  value={treeName}
                  onChange={(e) => setTreeName(e.target.value)}
                  className="text-lg font-semibold flex-1"
                  placeholder="Family Tree Name..."
                  data-testid="input-tree-name"
                />
              </div>
              <Textarea
                value={treeDescription}
                onChange={(e) => setTreeDescription(e.target.value)}
                className="min-h-[60px] resize-none text-sm text-muted-foreground"
                placeholder="Add a description..."
                data-testid="textarea-tree-description"
              />
              <div className="flex items-center justify-between">
                <div className="text-xs flex-1">
                  {metadataSave.saveStatus === 'saving' ? (
                    <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Saving...
                    </span>
                  ) : metadataSave.saveStatus === 'saved' && metadataSave.lastSaveTime ? (
                    <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                      <Check className="w-3 h-3" />
                      Saved {new Date(metadataSave.lastSaveTime).toLocaleTimeString()}
                    </span>
                  ) : metadataSave.saveStatus === 'unsaved' ? (
                    <span className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                      <AlertCircle className="w-3 h-3" />
                      Unsaved changes
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Auto-saving enabled</span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {metadataSave.saveStatus === 'unsaved' && (
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => metadataSave.saveNow()}
                      disabled={metadataSave.isSaving}
                      data-testid="button-retry-save"
                      title="Retry Save"
                      className="h-7 w-7"
                    >
                      <RefreshCw className="w-3 h-3" />
                    </Button>
                  )}
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={handleManualSave}
                    disabled={metadataSave.isSaving}
                    data-testid="button-save-tree"
                    title="Save Now"
                    className="h-7 w-7"
                  >
                    <Save className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          </Panel>
          
          {/* Search Panel */}
          <Panel position="top-center">
            <div className="bg-card border rounded-lg shadow-lg p-2">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search family members..."
                    className="pl-8 pr-8 h-8 w-64"
                    data-testid="input-search-members"
                  />
                  {searchQuery && (
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={handleClearSearch}
                      className="absolute right-0 top-0 h-8 w-8"
                      data-testid="button-clear-search"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  )}
                </div>
                {searchResults.length > 0 && (
                  <>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {selectedSearchIndex + 1} of {searchResults.length}
                    </span>
                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={handlePrevResult}
                        disabled={searchResults.length === 0}
                        className="h-7 w-7"
                        data-testid="button-prev-result"
                        title="Previous Result"
                      >
                        <ArrowLeft className="w-3 h-3" />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={handleNextResult}
                        disabled={searchResults.length === 0}
                        className="h-7 w-7"
                        data-testid="button-next-result"
                        title="Next Result"
                      >
                        <ArrowLeft className="w-3 h-3 rotate-180" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </Panel>
          
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
            <div className="flex items-center gap-1 border-l pl-2">
              <Button
                size="icon"
                variant="outline"
                onClick={handleUndo}
                disabled={historyIndex < 0}
                data-testid="button-undo"
                title="Undo (Ctrl+Z)"
                className="h-8 w-8"
              >
                <Undo className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant="outline"
                onClick={handleRedo}
                disabled={historyIndex >= history.length - 1}
                data-testid="button-redo"
                title="Redo (Ctrl+Y)"
                className="h-8 w-8"
              >
                <Redo className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex items-center gap-1 border-l pl-2">
              <Button
                size="icon"
                variant={showMiniMap ? "default" : "outline"}
                onClick={() => setShowMiniMap(!showMiniMap)}
                data-testid="button-toggle-minimap"
                title={showMiniMap ? "Hide Mini-Map" : "Show Mini-Map"}
                className="h-8 w-8"
              >
                <MapIcon className="w-4 h-4" />
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
                onClick={handleToggleLayout}
                data-testid="button-toggle-layout"
              >
                <Grid3X3 className="w-4 h-4 mr-2" />
                {isAutoLayout ? "Auto Layout" : "Manual Layout"}
              </Button>
            </div>
          </Panel>
        </ReactFlow>
      </div>
      
      {/* Character Gallery - positioned at bottom but higher up */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <CharacterGallery 
          notebookId={notebookId} 
          existingMembers={members} 
          onRemoveMember={handleRemoveMember}
        />
      </div>
      
      <RelationshipSelector
        open={selectorOpen}
        onOpenChange={handleSelectorOpenChange}
        onConfirm={handleRelationshipConfirm}
        sourceNodeLabel={
          pendingConnection 
            ? (() => {
                const member = members.find(m => m.id === pendingConnection.source);
                if (!member) return 'Character A';
                if ((member as any).character) {
                  const char = (member as any).character;
                  return [char.givenName, char.familyName].filter(Boolean).join(' ') || 'Unknown Character';
                }
                return member.inlineName || 'Unknown Character';
              })()
            : 'Character A'
        }
        targetNodeLabel={
          pendingConnection 
            ? (() => {
                const member = members.find(m => m.id === pendingConnection.target);
                if (!member) return 'Character B';
                if ((member as any).character) {
                  const char = (member as any).character;
                  return [char.givenName, char.familyName].filter(Boolean).join(' ') || 'Unknown Character';
                }
                return member.inlineName || 'Unknown Character';
              })()
            : 'Character B'
        }
      />
      
      <InlineMemberDialog
        open={addMemberDialogOpen}
        onOpenChange={setAddMemberDialogOpen}
        onConfirm={handleInlineMemberCreate}
        isLoading={createInlineMember.isPending}
      />
      
      <MemberEditDialog
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        member={editingMember}
        notebookId={notebookId}
        onSave={handleSaveMemberDetails}
        isLoading={updateMemberMutation.isPending}
      />
      
      <AddRelationshipDialog
        open={addRelationshipDialogOpen}
        onOpenChange={setAddRelationshipDialogOpen}
        member={selectedMemberForRelationship}
        onSelectRelationshipType={onSelectRelationshipType}
      />
      
      <SelectCharacterDialog
        open={selectCharacterDialogOpen}
        onOpenChange={setSelectCharacterDialogOpen}
        relationshipType={selectedRelationshipType}
        characters={characters || []}
        onSelectExisting={onSelectExisting}
        onCreateNew={onCreateNew}
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
