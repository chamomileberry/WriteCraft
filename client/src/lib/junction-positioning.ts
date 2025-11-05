/**
 * Junction Positioning Utilities for Family Tree Editor
 *
 * This module contains the critical positioning logic for junction nodes in family trees.
 * Junction nodes are the invisible connection points where marriage lines meet and children branch off.
 *
 * CRITICAL REQUIREMENTS FOR HORIZONTAL MARRIAGE LINES:
 * 1. Junction X must be calculated from actual HANDLE EDGES, not node centers
 * 2. Junction Y must align with parents' VERTICAL CENTERS (where left/right handles are)
 * 3. Spouse cards must ALIGN VERTICAL CENTERS, not top edges (handles at center)
 *
 * These requirements ensure perfectly horizontal marriage lines regardless of:
 * - Which parent is on the left vs right
 * - Different card widths
 * - Different card heights (from varying content)
 */

import type { Node } from "@xyflow/react";

/**
 * Parent node with required dimensions for junction positioning
 */
export interface ParentNodeWithDimensions {
  id: string;
  position: { x: number; y: number };
  measured?: { width?: number; height?: number };
  width?: number;
  height?: number;
}

/**
 * Result of junction position calculation
 */
export interface JunctionPosition {
  x: number;
  y: number;
  leftParentId: string;
  rightParentId: string;
}

/**
 * Configuration for spouse vertical center alignment
 */
export interface SpouseAlignment {
  spouseY: number;
  centerY: number;
}

/**
 * Calculate junction position for a married couple with shared children.
 *
 * THE MATH EXPLAINED:
 *
 * **X Position (Horizontal Centering)**:
 * - Marriage lines connect from character card EDGES, not centers
 * - Left parent's handle is at: x + width (right edge)
 * - Right parent's handle is at: x (left edge)
 * - Junction X = (leftParent.x + leftWidth + rightParent.x) / 2
 * - This centers the junction between where the lines actually connect
 *
 * **Y Position (Vertical Centering)**:
 * - Left/right handles on cards are at VERTICAL CENTER (50% height)
 * - Parent 1 center Y: parent1.y + (height1 / 2)
 * - Parent 2 center Y: parent2.y + (height2 / 2)
 * - If parents are already center-aligned (after drag/auto-layout): use either parent's center
 * - If parents are NOT aligned (initial creation): average both centers
 *
 * **Why This Matters**:
 * - Using node centers instead of handle edges causes off-center child lines
 * - Using top edges instead of vertical centers causes sloped marriage lines
 * - Different card heights break alignment if centers aren't considered
 *
 * @param parent1Node - First parent node
 * @param parent2Node - Second parent node
 * @param areParentsAligned - Whether parents' vertical centers are already aligned (true for drag/auto-layout)
 * @returns Junction position with X, Y coordinates and parent IDs
 */
export function calculateJunctionPosition(
  parent1Node: ParentNodeWithDimensions,
  parent2Node: ParentNodeWithDimensions,
  areParentsAligned: boolean = false,
): JunctionPosition {
  // Get node dimensions (use measured dimensions if available, fallback to defaults)
  const parent1Width = parent1Node.measured?.width || parent1Node.width || 200;
  const parent2Width = parent2Node.measured?.width || parent2Node.width || 200;
  const parent1Height =
    parent1Node.measured?.height || parent1Node.height || 80;
  const parent2Height =
    parent2Node.measured?.height || parent2Node.height || 80;

  // Determine which parent is on the left vs right based on X position
  const isParent1Left = parent1Node.position.x < parent2Node.position.x;
  const leftParentNode = isParent1Left ? parent1Node : parent2Node;
  const rightParentNode = isParent1Left ? parent2Node : parent1Node;
  const leftParentWidth = isParent1Left ? parent1Width : parent2Width;

  // Calculate junction X based on actual handle positions (edges, not centers)
  // Left parent's right handle: x + width, Right parent's left handle: x
  const junctionX =
    (leftParentNode.position.x + leftParentWidth + rightParentNode.position.x) /
    2;

  // Calculate junction Y based on parent vertical centers
  let junctionY: number;

  if (areParentsAligned) {
    // Parents are already center-aligned (drag or auto-layout), use either parent's center
    junctionY = parent1Node.position.y + parent1Height / 2;
  } else {
    // Parents may not be aligned (initial creation), average both centers
    const parent1CenterY = parent1Node.position.y + parent1Height / 2;
    const parent2CenterY = parent2Node.position.y + parent2Height / 2;
    junctionY = (parent1CenterY + parent2CenterY) / 2;
  }

  // Runtime validation in development mode
  if (import.meta.env.DEV) {
    validateJunctionPosition(
      parent1Node,
      parent2Node,
      { x: junctionX, y: junctionY },
      areParentsAligned,
    );
  }

  return {
    x: junctionX,
    y: junctionY,
    leftParentId: leftParentNode.id,
    rightParentId: rightParentNode.id,
  };
}

/**
 * Calculate spouse Y position to align vertical centers.
 *
 * When dragging a spouse, the other spouse must move so their vertical centers align.
 * This ensures marriage lines are horizontal even with different card heights.
 *
 * THE MATH:
 * - Dragged node center Y: draggedY + (draggedHeight / 2)
 * - Spouse center Y must equal dragged center Y
 * - Spouse Y = draggedCenterY - (spouseHeight / 2)
 * - Simplified: spouseY = draggedY + (draggedHeight - spouseHeight) / 2
 *
 * @param draggedNode - The node being dragged
 * @param spouseNode - The spouse node that needs to align
 * @param draggedPosition - New position of dragged node
 * @returns Calculated Y position for spouse to align vertical centers
 */
export function calculateSpouseAlignedY(
  draggedNode: ParentNodeWithDimensions,
  spouseNode: ParentNodeWithDimensions,
  draggedPosition: { x: number; y: number },
): number {
  const draggedHeight =
    draggedNode.measured?.height || draggedNode.height || 80;
  const spouseHeight = spouseNode.measured?.height || spouseNode.height || 80;

  // Calculate spouse Y so vertical centers align
  const spouseY = draggedPosition.y + (draggedHeight - spouseHeight) / 2;

  return spouseY;
}

/**
 * Calculate aligned Y positions for a married couple during auto-layout.
 *
 * During auto-layout, both spouses need to be positioned so their vertical centers align.
 * This calculates the average center point and returns the Y position for each spouse.
 *
 * @param parent1 - First parent node
 * @param parent2 - Second parent node
 * @returns Object with Y positions for both parents
 */
export function calculateCoupleAlignment(
  parent1: ParentNodeWithDimensions,
  parent2: ParentNodeWithDimensions,
): { parent1Y: number; parent2Y: number; centerY: number } {
  const height1 = parent1.measured?.height || parent1.height || 80;
  const height2 = parent2.measured?.height || parent2.height || 80;

  // Calculate vertical centers
  const center1Y = parent1.position.y + height1 / 2;
  const center2Y = parent2.position.y + height2 / 2;
  const avgCenterY = (center1Y + center2Y) / 2;

  return {
    parent1Y: avgCenterY - height1 / 2,
    parent2Y: avgCenterY - height2 / 2,
    centerY: avgCenterY,
  };
}

/**
 * Runtime validation for junction positioning (development mode only).
 * Logs warnings if junction position appears incorrect.
 */
function validateJunctionPosition(
  parent1: ParentNodeWithDimensions,
  parent2: ParentNodeWithDimensions,
  junctionPos: { x: number; y: number },
  areParentsAligned: boolean,
): void {
  const parent1Width = parent1.measured?.width || parent1.width || 200;
  const parent2Width = parent2.measured?.width || parent2.width || 200;
  const parent1Height = parent1.measured?.height || parent1.height || 80;
  const parent2Height = parent2.measured?.height || parent2.height || 80;

  // Validate X is between handle edges
  const isParent1Left = parent1.position.x < parent2.position.x;
  const leftParent = isParent1Left ? parent1 : parent2;
  const rightParent = isParent1Left ? parent2 : parent1;
  const leftParentWidth = isParent1Left ? parent1Width : parent2Width;

  const leftHandleX = leftParent.position.x + leftParentWidth;
  const rightHandleX = rightParent.position.x;

  if (
    junctionPos.x < Math.min(leftHandleX, rightHandleX) ||
    junctionPos.x > Math.max(leftHandleX, rightHandleX)
  ) {
    console.warn(
      "[Junction Positioning] Junction X is not between parent handle edges:",
      { junctionX: junctionPos.x, leftHandleX, rightHandleX },
    );
  }

  // Validate Y aligns with parent centers
  const parent1CenterY = parent1.position.y + parent1Height / 2;
  const parent2CenterY = parent2.position.y + parent2Height / 2;

  if (areParentsAligned) {
    const tolerance = 1; // 1px tolerance for floating point errors
    if (Math.abs(junctionPos.y - parent1CenterY) > tolerance) {
      console.warn(
        "[Junction Positioning] Junction Y does not match parent center (aligned mode):",
        { junctionY: junctionPos.y, parent1CenterY, parent2CenterY },
      );
    }
  } else {
    const avgCenterY = (parent1CenterY + parent2CenterY) / 2;
    const tolerance = 1;
    if (Math.abs(junctionPos.y - avgCenterY) > tolerance) {
      console.warn(
        "[Junction Positioning] Junction Y does not match average parent center (unaligned mode):",
        {
          junctionY: junctionPos.y,
          avgCenterY,
          parent1CenterY,
          parent2CenterY,
        },
      );
    }
  }
}
