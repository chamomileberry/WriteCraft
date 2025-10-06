import ELK, { ElkNode } from 'elkjs/lib/elk.bundled.js';
import { Node, Edge } from '@xyflow/react';

const elk = new ELK();

export async function getLayoutedElements(
  nodes: Node[],
  edges: Edge[],
  options: {
    direction?: 'DOWN' | 'RIGHT';
    nodeSpacing?: number;
    layerSpacing?: number;
  } = {}
) {
  const {
    direction = 'DOWN',
    nodeSpacing = 50,
    layerSpacing = 100,
  } = options;

  const elkNodes: ElkNode['children'] = nodes.map((node) => ({
    id: node.id,
    width: 200,
    height: 100,
  }));

  const elkEdges = edges.map((edge) => ({
    id: edge.id,
    sources: [edge.source],
    targets: [edge.target],
  }));

  const graph: ElkNode = {
    id: 'root',
    layoutOptions: {
      'elk.algorithm': 'layered',
      'elk.direction': direction,
      'elk.spacing.nodeNode': String(nodeSpacing),
      'elk.layered.spacing.nodeNodeBetweenLayers': String(layerSpacing),
      'elk.edgeRouting': 'ORTHOGONAL',
    },
    children: elkNodes,
    edges: elkEdges,
  };

  const layoutedGraph = await elk.layout(graph);

  const layoutedNodes = nodes.map((node) => {
    const layoutedNode = layoutedGraph.children?.find((n) => n.id === node.id);
    return {
      ...node,
      position: {
        x: layoutedNode?.x ?? node.position.x,
        y: layoutedNode?.y ?? node.position.y,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
}
