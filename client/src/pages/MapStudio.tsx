import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import MapToolbar, { MapTool } from "@/components/MapToolbar";
import Header from "@/components/Header";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useNotebookStore } from "@/stores/notebookStore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type {
  Character,
  Location,
  Settlement,
  TimelineEvent,
  InsertLocation,
  InsertSettlement,
} from "@shared/schema";
// Terrain color palette
const TERRAIN_COLORS: Record<string, string> = {
  land: "#8B7355",      // Brown land
  grass: "#6B8E23",     // Olive green
  forest: "#228B22",    // Forest green
  mountain: "#696969",  // Dark gray
  water: "#4682B4",     // Steel blue
  deepWater: "#191970", // Midnight blue
  sand: "#F4A460",      // Sandy brown
  snow: "#FFFAFA",      // Snow white
};

// Icon types with emoji/unicode representations
export type IconType = 'city' | 'castle' | 'mountain' | 'forest' | 'village' | 'port' | 'cave' | 'tower' | 'ruins';

const ICON_SYMBOLS: Record<IconType, string> = {
  city: '🏛️',
  castle: '🏰',
  mountain: '⛰️',
  forest: '🌲',
  village: '🏘️',
  port: '⚓',
  cave: '🕳️',
  tower: '🗼',
  ruins: '🏚️',
};

type LinkedContentType = 'location' | 'settlement';

const ICON_METADATA: Record<IconType, { label: string; contentType: LinkedContentType; defaultType: string }> = {
  city: { label: 'City', contentType: 'settlement', defaultType: 'City' },
  castle: { label: 'Castle', contentType: 'settlement', defaultType: 'Castle' },
  village: { label: 'Village', contentType: 'settlement', defaultType: 'Village' },
  port: { label: 'Port City', contentType: 'settlement', defaultType: 'Port City' },
  mountain: { label: 'Mountain', contentType: 'location', defaultType: 'Mountain' },
  forest: { label: 'Forest', contentType: 'location', defaultType: 'Forest' },
  cave: { label: 'Cave', contentType: 'location', defaultType: 'Cave' },
  tower: { label: 'Tower', contentType: 'location', defaultType: 'Tower' },
  ruins: { label: 'Ruins', contentType: 'location', defaultType: 'Ruins' },
};

interface LinkedContentDetail {
  type: LinkedContentType;
  data: Location | Settlement;
}

const ICON_INTERACTION_RADIUS = 20;

const PREVIEW_CARD_DIMENSIONS = { width: 280, height: 220 };

const truncateText = (value: string | null | undefined, limit = 160) => {
  if (!value) return '';
  return value.length > limit ? `${value.slice(0, limit).trim()}…` : value;
};

// Layer data structures
interface MapIcon {
  id: string;
  type: IconType;
  x: number;
  y: number;
  name: string;
  linkedContentId?: string;
  linkedContentType?: LinkedContentType;
}

interface MapLabel {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  fontWeight: 'normal' | 'bold';
}

interface MapBorder {
  id: string;
  name: string;
  points: { x: number; y: number }[];
  color: string;
  lineWidth: number;
  closed: boolean;
}

interface LayerVisibility {
  terrain: boolean;
  icons: boolean;
  labels: boolean;
  borders: boolean;
}

interface HistoryState {
  imageData: ImageData;
  icons: MapIcon[];
  labels: MapLabel[];
  borders: MapBorder[];
}

export default function MapStudio() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fix: Use separate stable subscriptions instead of creating new objects
  const activeNotebookId = useNotebookStore(state => state.activeNotebookId);
  const notebooks = useNotebookStore(state => state.notebooks);

  // Fix: Memoize activeNotebook to prevent infinite re-renders
  const activeNotebook = useMemo(() => {
    if (!activeNotebookId) return null;
    return notebooks.find(nb => nb.id === activeNotebookId) || null;
  }, [activeNotebookId, notebooks]);

  // Helper function for showing data load error toasts
  const showDataLoadErrorToast = useCallback((dataType: string) => {
    toast({
      title: `${dataType.charAt(0).toUpperCase() + dataType.slice(1)} unavailable`,
      description: `We could not load notebook ${dataType}. Please try again.`,
      variant: 'destructive',
    });
  }, [toast]);

  // ===== TOOLBAR STATE =====
  const [selectedTool, setSelectedTool] = useState<MapTool>("pencil");
  const [brushSize, setBrushSize] = useState(20);
  const [brushColor, setBrushColor] = useState(TERRAIN_COLORS["land"]);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDrawing, setIsDrawing] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [lastPoint, setLastPoint] = useState<{ x: number; y: number } | null>(null);

  // Layer data
  const [icons, setIcons] = useState<MapIcon[]>([]);
  const [labels, setLabels] = useState<MapLabel[]>([]);
  const [borders, setBorders] = useState<MapBorder[]>([]);
  const [currentBorder, setCurrentBorder] = useState<{ x: number; y: number }[]>([]);

  // Layer visibility
  const [layerVisibility, setLayerVisibility] = useState<LayerVisibility>({
    terrain: true,
    icons: true,
    labels: true,
    borders: true,
  });

  // Selected icon type for placement
  const [selectedIconType, setSelectedIconType] = useState<IconType>('city');

  // Selected item for editing
  const [selectedItem, setSelectedItem] = useState<{ type: 'icon' | 'label' | 'border', id: string } | null>(null);

  // Map-to-notebook integration state
  const [pendingIcon, setPendingIcon] = useState<{ x: number; y: number; iconType: IconType } | null>(null);
  const [locationDialogOpen, setLocationDialogOpen] = useState(false);
  const [locationFormName, setLocationFormName] = useState('');
  const [locationFormDescription, setLocationFormDescription] = useState('');
  const [localContentOverrides, setLocalContentOverrides] = useState<Record<string, LinkedContentDetail>>({});
  const [hoveredIconId, setHoveredIconId] = useState<string | null>(null);
  const [hoverPosition, setHoverPosition] = useState<{ x: number; y: number } | null>(null);

  // Fix: Track fetched content IDs to prevent refetching and cascading updates
  const fetchedContentIdsRef = useRef<Set<string>>(new Set());

  const { data: notebookLocations = [] } = useQuery<Location[]>({
    queryKey: ['/api/locations/user', activeNotebookId],
    enabled: !!activeNotebookId,
    queryFn: async () => {
      if (!activeNotebookId) return [] as Location[];
      try {
        const response = await apiRequest('GET', `/api/locations/user?notebookId=${activeNotebookId}`);
        const locations: Location[] = await response.json();
        return locations;
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          return [] as Location[];
        }
        console.error('Failed to load locations for notebook', error);
        showDataLoadErrorToast('locations');
        return [] as Location[];
      }
    },
  });

  const { data: notebookSettlements = [] } = useQuery<Settlement[]>({
    queryKey: ['/api/settlements/user', activeNotebookId],
    enabled: !!activeNotebookId,
    queryFn: async () => {
      if (!activeNotebookId) return [] as Settlement[];
      try {
        const response = await apiRequest('GET', `/api/settlements/user?notebookId=${activeNotebookId}`);
        const settlements: Settlement[] = await response.json();
        return settlements;
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          return [] as Settlement[];
        }
        console.error('Failed to load settlements for notebook', error);
        showDataLoadErrorToast('settlements');
        return [] as Settlement[];
      }
    },
  });

  const { data: characters = [] } = useQuery<Character[]>({
    queryKey: ['/api/characters', activeNotebookId],
    enabled: !!activeNotebookId,
    queryFn: async () => {
      if (!activeNotebookId) return [] as Character[];
      try {
        const response = await apiRequest('GET', `/api/characters?notebookId=${activeNotebookId}`);
        const notebookCharacters: Character[] = await response.json();
        return notebookCharacters;
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          return [] as Character[];
        }
        console.error('Failed to load characters for notebook', error);
        showDataLoadErrorToast('characters');
        return [] as Character[];
      }
    },
  });

  const { data: timelineEvents = [] } = useQuery<TimelineEvent[]>({
    queryKey: ['/api/timeline-events/notebook', activeNotebookId],
    enabled: !!activeNotebookId,
    queryFn: async () => {
      if (!activeNotebookId) return [] as TimelineEvent[];
      try {
        const response = await apiRequest('GET', `/api/timeline-events/notebook/${activeNotebookId}`);
        const events: TimelineEvent[] = await response.json();
        return events;
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          return [] as TimelineEvent[];
        }
        console.error('Failed to load timeline events for notebook', error);
        showDataLoadErrorToast('timeline events');
        return [] as TimelineEvent[];
      }
    },
  });

  const contentEntries = useMemo(() => {
    const entries: Record<string, LinkedContentDetail> = { ...localContentOverrides };
    notebookLocations.forEach(location => {
      entries[location.id] = { type: 'location', data: location };
    });
    notebookSettlements.forEach(settlement => {
      entries[settlement.id] = { type: 'settlement', data: settlement };
    });
    return entries;
  }, [localContentOverrides, notebookLocations, notebookSettlements]);

  // Memoized Sets for O(1) lookup performance during hover interactions
  const notebookLocationIds = useMemo(() => new Set(notebookLocations.map(l => l.id)), [notebookLocations]);
  const notebookSettlementIds = useMemo(() => new Set(notebookSettlements.map(s => s.id)), [notebookSettlements]);

  const hoveredIcon = useMemo(() => {
    return icons.find(icon => icon.id === hoveredIconId) || null;
  }, [icons, hoveredIconId]);

  const hoverContent = hoveredIcon?.linkedContentId
    ? contentEntries[hoveredIcon.linkedContentId]
    : undefined;

  const hoverCharacters = useMemo(() => {
    if (!hoverContent) return [] as Character[];
    const locationName = (hoverContent.data.name || '').toLowerCase();
    if (!locationName) return [] as Character[];

    return characters.filter(character => {
      const residence = (character.currentResidence || '').toLowerCase();
      const currentLocation = (character.currentLocation || '').toLowerCase();
      return residence === locationName || currentLocation === locationName;
    });
  }, [characters, hoverContent]);

  const hoverEvents = useMemo(() => {
    if (!hoveredIcon?.linkedContentId) return [] as TimelineEvent[];
    return timelineEvents.filter(event => {
      if (event.linkedContentId !== hoveredIcon.linkedContentId) {
        return false;
      }
      if (!event.linkedContentType) {
        return true;
      }
      return event.linkedContentType === (hoverContent?.type || event.linkedContentType);
    });
  }, [hoverContent?.type, hoveredIcon, timelineEvents]);

  const displayedResidents = useMemo(() => hoverCharacters.slice(0, 4), [hoverCharacters]);
  const residentOverflow = hoverCharacters.length - displayedResidents.length;
  const displayedEvents = useMemo(() => hoverEvents.slice(0, 4), [hoverEvents]);
  const eventOverflow = hoverEvents.length - displayedEvents.length;

  const pendingIconMeta = pendingIcon ? ICON_METADATA[pendingIcon.iconType] : null;

  const mapToScreen = useCallback((x: number, y: number) => ({
    x: x * zoom + pan.x,
    y: y * zoom + pan.y,
  }), [zoom, pan]);

  const createLocationMutation = useMutation<
    Location,
    Error,
    Pick<InsertLocation, 'name' | 'locationType' | 'description' | 'notebookId'>
  >({
    mutationFn: async (payload) => {
      const response = await apiRequest('POST', '/api/locations', payload);
      const created: Location = await response.json();
      return created;
    },
  });

  const createSettlementMutation = useMutation<
    Settlement,
    Error,
    Pick<InsertSettlement, 'name' | 'settlementType' | 'description' | 'notebookId'>
  >({
    mutationFn: async (payload) => {
      const response = await apiRequest('POST', '/api/settlements', payload);
      const created: Settlement = await response.json();
      return created;
    },
  });

  const isSavingLocation = createLocationMutation.isPending || createSettlementMutation.isPending;

  const previewPositionStyle = useMemo(() => {
    if (!hoverPosition) return null;

    const canvas = canvasRef.current;
    const basePosition = {
      left: hoverPosition.x + 16,
      top: hoverPosition.y - 16,
    };

    if (!canvas) {
      return basePosition;
    }

    const rect = canvas.getBoundingClientRect();
    const maxLeft = Math.max(rect.width - PREVIEW_CARD_DIMENSIONS.width, 0);
    const maxTop = Math.max(rect.height - PREVIEW_CARD_DIMENSIONS.height, 0);

    return {
      left: Math.min(Math.max(basePosition.left, 0), maxLeft),
      top: Math.min(Math.max(basePosition.top, 0), maxTop),
    };
  }, [hoverPosition]);

  useEffect(() => {
    if (!hoveredIconId) {
      setHoverPosition(null);
      return;
    }

    const icon = icons.find(item => item.id === hoveredIconId);
    if (!icon) {
      setHoverPosition(null);
      return;
    }

    setHoverPosition(mapToScreen(icon.x, icon.y));
  }, [hoveredIconId, icons, mapToScreen]);

  useEffect(() => {
    if (!layerVisibility.icons) {
      setHoveredIconId(null);
      setHoverPosition(null);
    }
  }, [layerVisibility.icons]);

  useEffect(() => {
    if (!hoveredIconId || !activeNotebookId) {
      return;
    }

    const icon = icons.find(item => item.id === hoveredIconId);
    if (!icon?.linkedContentId || !icon.linkedContentType) {
      return;
    }

    // Fix: Check if we already have the data locally or in query cache
    const hasLocal = localContentOverrides[icon.linkedContentId];
    const hasQueryData = icon.linkedContentType === 'location'
      ? notebookLocationIds.has(icon.linkedContentId)
      : notebookSettlementIds.has(icon.linkedContentId);

    // Fix: Check if we're already fetching or have fetched this content
    const alreadyFetched = fetchedContentIdsRef.current.has(icon.linkedContentId);

    if (hasLocal || hasQueryData || alreadyFetched) {
      return;
    }

    // Mark as being fetched
    fetchedContentIdsRef.current.add(icon.linkedContentId);

    const controller = new AbortController();

    (async () => {
      try {
        const endpoint = icon.linkedContentType === 'settlement'
          ? `/api/settlements/${icon.linkedContentId}?notebookId=${activeNotebookId}`
          : `/api/locations/${icon.linkedContentId}?notebookId=${activeNotebookId}`;
        const response = await apiRequest('GET', endpoint, undefined, { signal: controller.signal });
        const detail = await response.json() as Location | Settlement;
        setLocalContentOverrides(prev => {
          // Only update if we don't already have this data
          if (prev[icon.linkedContentId!]) {
            return prev;
          }
          return {
            ...prev,
            [icon.linkedContentId!]: {
              type: icon.linkedContentType!,
              data: detail,
            },
          };
        });
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          fetchedContentIdsRef.current.delete(icon.linkedContentId!);
          return;
        }
        console.error('Failed to load location preview data', error);
        // Remove from fetched set on error so it can be retried
        fetchedContentIdsRef.current.delete(icon.linkedContentId!);
      }
    })();

    return () => controller.abort();
  }, [
    hoveredIconId,
    icons,
    activeNotebookId,
    notebookLocationIds,
    notebookSettlementIds,
    // Fix: Removed localContentOverrides from dependencies to prevent cascading updates
  ]);

  const handleDialogOpenChange = (open: boolean) => {
    if (isSavingLocation) return;
    setLocationDialogOpen(open);
    if (!open) {
      setPendingIcon(null);
      setLocationFormName('');
      setLocationFormDescription('');
    }
  };

  // Undo/Redo history
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const handleNavigate = (toolId: string) => {
    if (toolId === 'notebook') {
      setLocation('/notebook');
    } else if (toolId === 'projects') {
      setLocation('/projects');
    } else if (toolId === 'generators') {
      setLocation('/generators');
    } else if (toolId === 'guides') {
      setLocation('/guides');
    }
  };

  const handleCreateNew = () => {
    setLocation('/notebook');
  };

  // Handler functions for toolbar actions
  const handleToolChange = (tool: MapTool) => {
    setSelectedTool(tool);

    // Auto-select appropriate colors for terrain tools
    if (tool === 'mountain') {
      setBrushColor(TERRAIN_COLORS["mountain"]);
    } else if (tool === 'forest') {
      setBrushColor(TERRAIN_COLORS["forest"]);
    } else if (tool === 'water') {
      setBrushColor(TERRAIN_COLORS["water"]);
    } else if (tool === 'pencil') {
      setBrushColor(TERRAIN_COLORS["land"]);
    }
  };

  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev + 0.25, 3)); // Max zoom 300%
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev - 0.25, 0.25)); // Min zoom 25%
  }, []);

  const saveToHistory = useCallback((overrides?: {
    icons?: MapIcon[];
    labels?: MapLabel[];
    borders?: MapBorder[];
  }) => {
    const canvas = offscreenCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // Remove any future history if we're not at the end
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({
      imageData,
      icons: overrides?.icons ?? [...icons],
      labels: overrides?.labels ?? [...labels],
      borders: overrides?.borders ?? [...borders],
    });

    // Limit history to 50 states
    if (newHistory.length > 50) {
      newHistory.shift();
    } else {
      setHistoryIndex(prev => prev + 1);
    }

    setHistory(newHistory);
  }, [history, historyIndex, icons, labels, borders]);

  const addIconForContent = (content: Location | Settlement, type: LinkedContentType) => {
    if (!pendingIcon) return;

    const newIcon: MapIcon = {
      id: `icon-${Date.now()}`,
      type: pendingIcon.iconType,
      x: pendingIcon.x,
      y: pendingIcon.y,
      name: content.name ?? '',
      linkedContentId: content.id,
      linkedContentType: type,
    };

    setIcons(prev => {
      const updatedIcons = [...prev, newIcon];
      saveToHistory({ icons: updatedIcons });
      return updatedIcons;
    });

    setLocalContentOverrides(prev => ({
      ...prev,
      [content.id]: { type, data: content },
    }));
  };

  const getCharacterDisplayName = useCallback((character: Character) => {
    const parts = [character.givenName, character.familyName].filter(Boolean);
    if (parts.length) {
      return parts.join(' ');
    }
    if (character.nickname) {
      return character.nickname;
    }
    if (character.occupation) {
      return character.occupation;
    }
    return 'Unnamed Character';
  }, []);

  const handleLocationDialogSubmit = async () => {
    if (!pendingIcon || !pendingIconMeta || !activeNotebookId) {
      toast({
        title: 'Unable to add location',
        description: 'Select a notebook and a map icon before creating a location.',
        variant: 'destructive',
      });
      return;
    }

    const trimmedName = locationFormName.trim();
    const trimmedDescription = locationFormDescription.trim();

    if (!trimmedName) {
      toast({
        title: 'Name required',
        description: 'Give this location a name so it can be added to your notebook.',
        variant: 'destructive',
      });
      return;
    }

    if (!trimmedDescription) {
      toast({
        title: 'Description required',
        description: 'Add a short description to remember what makes this place unique.',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (pendingIconMeta.contentType === 'settlement') {
        const payload: Pick<InsertSettlement, 'name' | 'settlementType' | 'description' | 'notebookId'> = {
          name: trimmedName,
          settlementType: pendingIconMeta.defaultType,
          description: trimmedDescription,
          notebookId: activeNotebookId,
        };
        const created = await createSettlementMutation.mutateAsync(payload);
        addIconForContent(created, 'settlement');
        queryClient.invalidateQueries({ queryKey: ['/api/settlements/user', activeNotebookId] });
        toast({
          title: 'Settlement added',
          description: `${created.name} is now part of ${activeNotebook?.name ?? 'your notebook'}.`,
        });
      } else {
        const payload: Pick<InsertLocation, 'name' | 'locationType' | 'description' | 'notebookId'> = {
          name: trimmedName,
          locationType: pendingIconMeta.defaultType,
          description: trimmedDescription,
          notebookId: activeNotebookId,
        };
        const created = await createLocationMutation.mutateAsync(payload);
        addIconForContent(created, 'location');
        queryClient.invalidateQueries({ queryKey: ['/api/locations/user', activeNotebookId] });
        toast({
          title: 'Location added',
          description: `${created.name} is now part of ${activeNotebook?.name ?? 'your notebook'}.`,
        });
      }

      setLocationDialogOpen(false);
      setPendingIcon(null);
      setLocationFormName('');
      setLocationFormDescription('');
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }
      console.error('Failed to create notebook entry from map', error);
      toast({
        title: 'Failed to add location',
        description: 'We could not save this entry. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleUndo = useCallback(() => {
    if (!canUndo) return;

    const newIndex = historyIndex - 1;
    setHistoryIndex(newIndex);

    const canvas = offscreenCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const state = history[newIndex];
    if (state) {
        ctx.putImageData(state.imageData, 0, 0);
        setIcons(state.icons);
        setLabels(state.labels);
        setBorders(state.borders);
    }
    // Call redraw to update the canvas, assuming it's a valid function in scope.
    redraw();
  }, [canUndo, historyIndex, history, redraw]);

  const handleRedo = useCallback(() => {
    if (!canRedo) return;

    const newIndex = historyIndex + 1;
    setHistoryIndex(newIndex);

    const canvas = offscreenCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const state = history[newIndex];
    if (state) {
      ctx.putImageData(state.imageData, 0, 0);
      setIcons(state.icons);
      setLabels(state.labels);
      setBorders(state.borders);
    }
    // Call redraw to update the canvas
    redraw();
  }, [canRedo, historyIndex, history, redraw]);

  // Initialize offscreen canvas for drawing operations
  useEffect(() => {
    const offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = 2000;
    offscreenCanvas.height = 2000;
    const offscreenCtx = offscreenCanvas.getContext('2d');
    if (offscreenCtx) {
      // Fill with ocean blue background
      const fillStyleColor = TERRAIN_COLORS["deepWater"] || "#000000";
      offscreenCtx.fillStyle = fillStyleColor;
      offscreenCtx.fillRect(0, 0, offscreenCanvas.width, offscreenCanvas.height);
      offscreenCanvasRef.current = offscreenCanvas;

      // Save initial state to history
      const imageData = offscreenCtx.getImageData(0, 0, offscreenCanvas.width, offscreenCanvas.height);
      setHistory([{
        imageData,
        icons: [],
        labels: [],
        borders: [],
      }]);
      setHistoryIndex(0);
    }
  }, []);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    const offscreenCanvas = offscreenCanvasRef.current;
    if (!canvas || !offscreenCanvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply zoom and pan transformations
    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    // Layer 1: Terrain (from offscreen canvas)
    if (layerVisibility.terrain) {
      ctx.drawImage(offscreenCanvas, 0, 0);
    }

    // Layer 2: Borders
    if (layerVisibility.borders) {
      borders.forEach(border => {
        if (border.points.length < 2) return;

        ctx.strokeStyle = border.color;
        ctx.lineWidth = border.lineWidth;
        ctx.setLineDash([10, 5]);
        ctx.beginPath();
        ctx.moveTo(border.points[0].x, border.points[0].y);

        for (let i = 1; i < border.points.length; i++) {
          ctx.lineTo(border.points[i].x, border.points[i].y);
        }

        if (border.closed && border.points.length > 2) {
          ctx.closePath();
        }

        ctx.stroke();
        ctx.setLineDash([]);
      });

      // Draw current border being drawn
      if (currentBorder.length > 0) {
        ctx.strokeStyle = '#FF6B6B';
        ctx.lineWidth = 3;
        ctx.setLineDash([10, 5]);
        ctx.beginPath();
        ctx.moveTo(currentBorder[0].x, currentBorder[0].y);

        for (let i = 1; i < currentBorder.length; i++) {
          ctx.lineTo(currentBorder[i].x, currentBorder[i].y);
        }

        ctx.stroke();
        ctx.setLineDash([]);

        // Draw points
        currentBorder.forEach(point => {
          ctx.fillStyle = '#FF6B6B';
          ctx.beginPath();
          ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
          ctx.fill();
        });
      }
    }

    // Layer 3: Icons
    if (layerVisibility.icons) {
      icons.forEach(icon => {
        const symbol = ICON_SYMBOLS[icon.type];
        ctx.font = '32px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Shadow for visibility
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        ctx.fillText(symbol, icon.x, icon.y);

        // Reset shadow
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        // Draw name below icon if it exists
        if (icon.name) {
          ctx.font = 'bold 14px Arial';
          ctx.fillStyle = '#ffffff';
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 3;
          ctx.strokeText(icon.name, icon.x, icon.y + 25);
          ctx.fillText(icon.name, icon.x, icon.y + 25);
        }

        // Highlight selected icon
        if (selectedItem?.type === 'icon' && selectedItem.id === icon.id) {
          ctx.strokeStyle = '#FFD700';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(icon.x, icon.y, 20, 0, Math.PI * 2);
          ctx.stroke();
        }
      });
    }

    // Layer 4: Labels
    if (layerVisibility.labels) {
      labels.forEach(label => {
        ctx.font = `${label.fontWeight} ${label.fontSize}px Arial`;
        ctx.fillStyle = label.color;
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Outline for readability
        ctx.strokeText(label.text, label.x, label.y);
        ctx.fillText(label.text, label.x, label.y);

        // Highlight selected label
        if (selectedItem?.type === 'label' && selectedItem.id === label.id) {
          const metrics = ctx.measureText(label.text);
          ctx.strokeStyle = '#FFD700';
          ctx.lineWidth = 2;
          ctx.strokeRect(
            label.x - metrics.width / 2 - 5,
            label.y - label.fontSize / 2 - 5,
            metrics.width + 10,
            label.fontSize + 10
          );
        }
      });
    }

    ctx.restore();
  }, [zoom, pan, layerVisibility, borders, currentBorder, icons, labels, selectedItem]);

  // Resize handler
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const container = canvas.parentElement;
      if (!container) return;

      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      redraw();
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [redraw]); // Fix: Only depend on redraw, which includes zoom/pan/etc

  // Redraw when any drawing state changes
  useEffect(() => {
    redraw();
  }, [redraw]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Undo/Redo
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z' && !e.shiftKey) {
          e.preventDefault();
          handleUndo();
        } else if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) {
          e.preventDefault();
          handleRedo();
        }
      }

      // Tool shortcuts
      if (!e.ctrlKey && !e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'v':
            setSelectedTool('select');
            break;
          case 'h':
            setSelectedTool('pan');
            break;
          case 'p':
            setSelectedTool('pencil');
            setBrushColor(TERRAIN_COLORS["land"]);
            break;
          case 'e':
            setSelectedTool('eraser');
            break;
          case 'm':
            setSelectedTool('mountain');
            setBrushColor(TERRAIN_COLORS["mountain"]);
            break;
          case 'f':
            setSelectedTool('forest');
            setBrushColor(TERRAIN_COLORS["forest"]);
            break;
          case 'w':
            setSelectedTool('water');
            setBrushColor(TERRAIN_COLORS["water"]);
            break;
          case 'i':
            setSelectedTool('icon');
            break;
          case 'l':
            setSelectedTool('label');
            break;
          case 'b':
            setSelectedTool('border');
            break;
          case '+':
          case '=':
            handleZoomIn();
            break;
          case '-':
          case '_':
            handleZoomOut();
            break;
          case 'enter':
            // Complete border
            if (currentBorder.length > 2) {
              const borderName = prompt('Enter name for this border/region:') || 'Unnamed Region';
              const newBorder: MapBorder = {
                id: `border-${Date.now()}`,
                name: borderName,
                points: [...currentBorder],
                color: '#FF6B6B',
                lineWidth: 3,
                closed: true,
              };
              setBorders(prev => {
                const updatedBorders = [...prev, newBorder];
                saveToHistory({ borders: updatedBorders });
                return updatedBorders;
              });
              setCurrentBorder([]);
            }
            break;
          case 'escape':
            // Cancel current border
            setCurrentBorder([]);
            setSelectedItem(null);
            break;
          case 'delete':
          case 'backspace':
            // Delete selected item
            if (selectedItem) {
              if (selectedItem.type === 'icon') {
                setIcons(prev => {
                  const updatedIcons = prev.filter(i => i.id !== selectedItem.id);
                  saveToHistory({ icons: updatedIcons });
                  return updatedIcons;
                });
              } else if (selectedItem.type === 'label') {
                setLabels(prev => {
                  const updatedLabels = prev.filter(l => l.id !== selectedItem.id);
                  saveToHistory({ labels: updatedLabels });
                  return updatedLabels;
                });
              } else if (selectedItem.type === 'border') {
                setBorders(prev => {
                  const updatedBorders = prev.filter(b => b.id !== selectedItem.id);
                  saveToHistory({ borders: updatedBorders });
                  return updatedBorders;
                });
              }
              setSelectedItem(null);
            }
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo, handleZoomIn, handleZoomOut, currentBorder, selectedItem, saveToHistory]);
  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - pan.x) / zoom;
    const y = (e.clientY - rect.top - pan.y) / zoom;
    return { x, y };
  };

  // Draw a brush stroke between two points
  const drawBrushStroke = (x1: number, y1: number, x2: number, y2: number) => {
    const offscreenCanvas = offscreenCanvasRef.current;
    if (!offscreenCanvas) return;

    const ctx = offscreenCanvas.getContext("2d");
    if (!ctx) return;

    const distance = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    const steps = Math.max(1, Math.floor(distance / (brushSize / 4)));

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = x1 + (x2 - x1) * t;
      const y = y1 + (y2 - y1) * t;

      ctx.beginPath();
      ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);

      if (selectedTool === 'eraser') {
        // Eraser reveals the background
        ctx.fillStyle = TERRAIN_COLORS["deepWater"];
      } else {
        ctx.fillStyle = brushColor;
      }

      ctx.fill();
    }

    redraw();
  };

  // Mouse event handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e);
    setHoveredIconId(null);
    setHoverPosition(null);

    if (selectedTool === 'pan') {
      setIsPanning(true);
      setLastPoint({ x: e.clientX, y: e.clientY });
    } else if (selectedTool === 'pencil' || selectedTool === 'eraser' ||
               selectedTool === 'mountain' || selectedTool === 'forest' ||
               selectedTool === 'water') {
      setIsDrawing(true);
      setLastPoint(pos);
      drawBrushStroke(pos.x, pos.y, pos.x, pos.y);
    } else if (selectedTool === 'icon') {
      if (!activeNotebookId) {
        toast({
          title: 'Select a notebook',
          description: 'Choose or create a notebook before adding locations to the map.',
          variant: 'destructive',
        });
        return;
      }

      if (locationDialogOpen || isSavingLocation) {
        return;
      }

      setPendingIcon({ x: pos.x, y: pos.y, iconType: selectedIconType });
      setLocationFormName(ICON_METADATA[selectedIconType].label);
      setLocationFormDescription('');
      setLocationDialogOpen(true);
    } else if (selectedTool === 'label') {
      // Create a label
      const labelText = prompt('Enter label text:');
      if (labelText) {
        const newLabel: MapLabel = {
          id: `label-${Date.now()}`,
          text: labelText,
          x: pos.x,
          y: pos.y,
          fontSize: 24,
          color: '#FFFFFF',
          fontWeight: 'bold',
        };
        setLabels(prev => {
          const updatedLabels = [...prev, newLabel];
          saveToHistory({ labels: updatedLabels });
          return updatedLabels;
        });
      }
    } else if (selectedTool === 'border') {
      // Add point to current border
      setCurrentBorder(prev => [...prev, pos]);
    } else if (selectedTool === 'select') {
      // Check if clicking on an icon
      const clickedIcon = icons.find(icon => {
        const distance = Math.sqrt((icon.x - pos.x) ** 2 + (icon.y - pos.y) ** 2);
        return distance < ICON_INTERACTION_RADIUS; // 20px click radius
      });

      if (clickedIcon) {
        setSelectedItem({ type: 'icon', id: clickedIcon.id });
        return;
      }

      // Check if clicking on a label
      const clickedLabel = labels.find(label => {
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) return false;
        ctx.font = `${label.fontWeight} ${label.fontSize}px Arial`;
        const metrics = ctx.measureText(label.text);
        const halfWidth = metrics.width / 2;
        const halfHeight = label.fontSize / 2;

        return pos.x >= label.x - halfWidth &&
               pos.x <= label.x + halfWidth &&
               pos.y >= label.y - halfHeight &&
               pos.y <= label.y + halfHeight;
      });

      if (clickedLabel) {
        setSelectedItem({ type: 'label', id: clickedLabel.id });
        return;
      }

      // Clear selection if nothing clicked
      setSelectedItem(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPanning && lastPoint) {
      const dx = e.clientX - lastPoint.x;
      const dy = e.clientY - lastPoint.y;
      setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      setLastPoint({ x: e.clientX, y: e.clientY });
    } else if (isDrawing && lastPoint) {
      const pos = getMousePos(e);
      drawBrushStroke(lastPoint.x, lastPoint.y, pos.x, pos.y);
      setLastPoint(pos);
    } else if (layerVisibility.icons) {
      const pos = getMousePos(e);
      const hovered = icons.find(icon => {
        if (!icon.linkedContentId) return false;
        const distance = Math.sqrt((icon.x - pos.x) ** 2 + (icon.y - pos.y) ** 2);
        return distance < ICON_INTERACTION_RADIUS;
      });

      if (hovered) {
        if (hoveredIconId !== hovered.id) {
          setHoveredIconId(hovered.id);
        }
        setHoverPosition(mapToScreen(hovered.x, hovered.y));
      } else if (hoveredIconId) {
        setHoveredIconId(null);
        setHoverPosition(null);
      }
    }
  };

  const handleMouseUp = () => {
    if (isDrawing) {
      saveToHistory();
    }
    setIsDrawing(false);
    setIsPanning(false);
    setLastPoint(null);
    setHoveredIconId(null);
    setHoverPosition(null);
  };

  const handleMouseLeave = () => {
    if (isDrawing) {
      saveToHistory();
    }
    setIsDrawing(false);
    setIsPanning(false);
    setLastPoint(null);
    setHoveredIconId(null);
    setHoverPosition(null);
  };
  return (
    <>
      <Dialog open={locationDialogOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Add {pendingIconMeta?.label ?? 'Location'} to {activeNotebook?.name ?? 'your notebook'}
            </DialogTitle>
            <DialogDescription>
              We'll create a {pendingIconMeta?.contentType ?? 'location'} entry linked to this map marker.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="map-location-name">Name</Label>
              <Input
                id="map-location-name"
                value={locationFormName}
                onChange={(event) => setLocationFormName(event.target.value)}
                disabled={isSavingLocation}
                placeholder={`Name this ${pendingIconMeta?.label?.toLowerCase() ?? 'location'}`}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="map-location-description">Description</Label>
              <Textarea
                id="map-location-description"
                rows={4}
                value={locationFormDescription}
                onChange={(event) => setLocationFormDescription(event.target.value)}
                disabled={isSavingLocation}
                placeholder="Describe this place so you remember why it's important."
              />
              <p className="text-xs text-muted-foreground">
                This description will be saved to your {pendingIconMeta?.contentType ?? 'location'} entry.
              </p>
            </div>
            <div className="rounded-md bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
              Map marker: <span className="font-medium capitalize">{pendingIconMeta?.label ?? 'Location'}</span> • Notebook type:{' '}
              <span className="font-medium capitalize">{pendingIconMeta?.contentType ?? 'location'}</span>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => handleDialogOpenChange(false)} disabled={isSavingLocation}>
              Cancel
            </Button>
            <Button onClick={handleLocationDialogSubmit} disabled={isSavingLocation}>
              {isSavingLocation ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : (
                'Add to notebook'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex flex-col h-screen">
      {/* Main Navigation Header */}
      <Header onNavigate={handleNavigate} onCreateNew={handleCreateNew} />

      {/* Map Studio Header */}
      <div className="border-b p-4 flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLocation('/notebook')}
          data-testid="button-back-to-notebook"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Map Studio</h1>
          <p className="text-sm text-muted-foreground">Create and design your world maps</p>
        </div>
      </div>

      {/* TOOLBAR */}
      <MapToolbar
        selectedTool={selectedTool}
        onToolChange={handleToolChange}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={canUndo}
        canRedo={canRedo}
      />

      {/* Brush Controls Panel */}
      <div className="border-b p-4 bg-muted/30">
        <div className="max-w-4xl mx-auto flex items-center gap-8">
          {/* Brush Size */}
          <div className="flex items-center gap-4 flex-1">
            <Label htmlFor="brush-size" className="whitespace-nowrap">
              Brush Size: {brushSize}px
            </Label>
            <Slider
              id="brush-size"
              min={5}
              max={100}
              step={5}
              value={[brushSize]}
              onValueChange={(value) => setBrushSize(value[0])}
              className="flex-1"
            />
          </div>

          {/* Color Palette */}
          <div className="flex items-center gap-2">
            <Label>Terrain Colors:</Label>
            <div className="flex gap-1">
              {Object.entries(TERRAIN_COLORS).map(([name, color]) => (
                <button
                  key={name}
                  onClick={() => setBrushColor(color)}
                  className={`w-8 h-8 rounded border-2 transition-all hover:scale-110 ${
                    brushColor === color ? 'border-primary ring-2 ring-primary' : 'border-border'
                  }`}
                  style={{ backgroundColor: color }}
                  title={name}
                  data-testid={`color-${name}`}
                />
              ))}
            </div>
          </div>

          {/* Zoom Display */}
          <div className="text-sm text-muted-foreground whitespace-nowrap">
            Zoom: {Math.round(zoom * 100)}%
          </div>
        </div>
      </div>

      {/* Canvas Container */}
      <div className="flex-1 overflow-hidden relative bg-muted/10">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full cursor-crosshair"
          style={{ cursor: selectedTool === 'pan' ? 'grab' : isPanning ? 'grabbing' : 'crosshair' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        />

        {/* Icon Library Panel - shown when icon tool is selected */}
        {selectedTool === 'icon' && (
          <div className="absolute top-4 left-4 bg-background/95 backdrop-blur-sm p-4 rounded-lg shadow-lg">
            <h3 className="font-semibold mb-3">Select Icon Type:</h3>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(ICON_SYMBOLS).map(([type, symbol]) => (
                <button
                  key={type}
                  onClick={() => setSelectedIconType(type as IconType)}
                  className={`p-3 rounded border-2 transition-all hover:scale-105 flex flex-col items-center gap-1 ${
                    selectedIconType === type ? 'border-primary bg-primary/10' : 'border-border'
                  }`}
                  title={type}
                >
                  <span className="text-2xl">{symbol}</span>
                  <span className="text-xs capitalize">{type}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Layer Controls Panel - always visible on the right */}
        <div className="absolute top-4 right-4 bg-background/95 backdrop-blur-sm p-4 rounded-lg shadow-lg min-w-[200px]">
          <h3 className="font-semibold mb-3">Layers</h3>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-2 rounded">
              <input
                type="checkbox"
                checked={layerVisibility.terrain}
                onChange={(e) => setLayerVisibility(prev => ({ ...prev, terrain: e.target.checked }))}
                className="w-4 h-4"
              />
              <span className="text-sm">Terrain</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-2 rounded">
              <input
                type="checkbox"
                checked={layerVisibility.borders}
                onChange={(e) => setLayerVisibility(prev => ({ ...prev, borders: e.target.checked }))}
                className="w-4 h-4"
              />
              <span className="text-sm">Borders ({borders.length})</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-2 rounded">
              <input
                type="checkbox"
                checked={layerVisibility.icons}
                onChange={(e) => setLayerVisibility(prev => ({ ...prev, icons: e.target.checked }))}
                className="w-4 h-4"
              />
              <span className="text-sm">Icons ({icons.length})</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-2 rounded">
              <input
                type="checkbox"
                checked={layerVisibility.labels}
                onChange={(e) => setLayerVisibility(prev => ({ ...prev, labels: e.target.checked }))}
                className="w-4 h-4"
              />
              <span className="text-sm">Labels ({labels.length})</span>
            </label>
          </div>

          {/* Active Tool Info */}
          <div className="mt-4 pt-4 border-t border-border">
            <h4 className="font-semibold text-xs uppercase text-muted-foreground mb-2">Active Tool</h4>
            <p className="text-sm font-medium capitalize">{selectedTool.replace('-', ' ')}</p>
            {selectedTool === 'border' && currentBorder.length > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                {currentBorder.length} points • Press Enter to finish
              </p>
            )}
          </div>
        </div>

        {hoverContent && previewPositionStyle && layerVisibility.icons && (
          <div
            className="absolute z-30 w-[280px] pointer-events-none"
            style={{ left: previewPositionStyle.left, top: previewPositionStyle.top }}
          >
            <div className="rounded-lg border border-border bg-background/95 backdrop-blur-sm p-4 shadow-lg space-y-3">
              <div>
                <p className="text-xs uppercase text-muted-foreground">
                  {hoverContent.type === 'settlement' ? 'Settlement' : 'Location'} Preview
                </p>
                <h3 className="text-sm font-semibold text-foreground">{hoverContent.data.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {truncateText(hoverContent.data.description)}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-1">Residents</h4>
                {displayedResidents.length ? (
                  <ul className="space-y-1">
                    {displayedResidents.map(resident => (
                      <li key={resident.id} className="text-xs text-foreground">
                        {getCharacterDisplayName(resident)}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-muted-foreground">No characters linked to this place yet.</p>
                )}
                {residentOverflow > 0 && (
                  <p className="text-[11px] text-muted-foreground mt-1">+{residentOverflow} more residents</p>
                )}
              </div>

              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-1">Timeline events</h4>
                {displayedEvents.length ? (
                  <ul className="space-y-1">
                    {displayedEvents.map(event => (
                      <li key={event.id} className="text-xs text-foreground">
                        <span className="font-medium">{event.title}</span>
                        {event.startDate && (
                          <span className="text-muted-foreground"> • {event.startDate}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-muted-foreground">No recorded events here yet.</p>
                )}
                {eventOverflow > 0 && (
                  <p className="text-[11px] text-muted-foreground mt-1">+{eventOverflow} more events</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Instructions Overlay */}
        <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm p-4 rounded-lg shadow-lg max-w-sm">
          <h3 className="font-semibold mb-2">Quick Tips:</h3>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>• <kbd className="px-1 bg-muted rounded">P</kbd> Pencil • <kbd className="px-1 bg-muted rounded">M</kbd> Mountain • <kbd className="px-1 bg-muted rounded">F</kbd> Forest • <kbd className="px-1 bg-muted rounded">W</kbd> Water</li>
            <li>• <kbd className="px-1 bg-muted rounded">I</kbd> Place Icon • <kbd className="px-1 bg-muted rounded">L</kbd> Add Label • <kbd className="px-1 bg-muted rounded">B</kbd> Draw Border</li>
            <li>• <kbd className="px-1 bg-muted rounded">V</kbd> Select • <kbd className="px-1 bg-muted rounded">H</kbd> Pan • <kbd className="px-1 bg-muted rounded">E</kbd> Eraser</li>
            <li>• <kbd className="px-1 bg-muted rounded">Ctrl+Z</kbd> Undo • <kbd className="px-1 bg-muted rounded">Del</kbd> Delete selected</li>
            <li>• Border tool: Click to add points, <kbd className="px-1 bg-muted rounded">Enter</kbd> to finish</li>
          </ul>
        </div>
      </div>
    </div>
    </>
  );
}
