import { describe, it, expect } from "vitest";
import {
  calculateJunctionPosition,
  calculateSpouseAlignedY,
  calculateCoupleAlignment,
  type ParentNodeWithDimensions,
} from "../client/src/lib/junction-positioning";

describe("Junction Positioning Utilities", () => {
  describe("calculateJunctionPosition", () => {
    it("should calculate junction X at midpoint between handle edges", () => {
      const parent1: ParentNodeWithDimensions = {
        id: "parent1",
        position: { x: 100, y: 100 },
        width: 200,
        height: 80,
      };

      const parent2: ParentNodeWithDimensions = {
        id: "parent2",
        position: { x: 400, y: 100 },
        width: 200,
        height: 80,
      };

      const junction = calculateJunctionPosition(parent1, parent2, true);

      // Left parent (parent1) right edge: 100 + 200 = 300
      // Right parent (parent2) left edge: 400
      // Junction X: (300 + 400) / 2 = 350
      expect(junction.x).toBe(350);
    });

    it("should calculate junction Y at parent vertical center when aligned", () => {
      const parent1: ParentNodeWithDimensions = {
        id: "parent1",
        position: { x: 100, y: 100 },
        width: 200,
        height: 80,
      };

      const parent2: ParentNodeWithDimensions = {
        id: "parent2",
        position: { x: 400, y: 100 },
        width: 200,
        height: 80,
      };

      const junction = calculateJunctionPosition(parent1, parent2, true);

      // Parent1 center Y: 100 + (80 / 2) = 140
      expect(junction.y).toBe(140);
    });

    it("should average parent centers when not aligned", () => {
      const parent1: ParentNodeWithDimensions = {
        id: "parent1",
        position: { x: 100, y: 100 },
        width: 200,
        height: 80,
      };

      const parent2: ParentNodeWithDimensions = {
        id: "parent2",
        position: { x: 400, y: 120 },
        width: 200,
        height: 100,
      };

      const junction = calculateJunctionPosition(parent1, parent2, false);

      // Parent1 center Y: 100 + 40 = 140
      // Parent2 center Y: 120 + 50 = 170
      // Average: (140 + 170) / 2 = 155
      expect(junction.y).toBe(155);
    });

    it("should correctly identify left/right parents based on X position", () => {
      const parent1: ParentNodeWithDimensions = {
        id: "parent1",
        position: { x: 400, y: 100 }, // parent1 on right
        width: 200,
        height: 80,
      };

      const parent2: ParentNodeWithDimensions = {
        id: "parent2",
        position: { x: 100, y: 100 }, // parent2 on left
        width: 200,
        height: 80,
      };

      const junction = calculateJunctionPosition(parent1, parent2, true);

      expect(junction.leftParentId).toBe("parent2");
      expect(junction.rightParentId).toBe("parent1");
    });

    it("should handle different card widths correctly", () => {
      const parent1: ParentNodeWithDimensions = {
        id: "parent1",
        position: { x: 100, y: 100 },
        width: 150,
        height: 80,
      };

      const parent2: ParentNodeWithDimensions = {
        id: "parent2",
        position: { x: 400, y: 100 },
        width: 250,
        height: 80,
      };

      const junction = calculateJunctionPosition(parent1, parent2, true);

      // Left parent (parent1) right edge: 100 + 150 = 250
      // Right parent (parent2) left edge: 400
      // Junction X: (250 + 400) / 2 = 325
      expect(junction.x).toBe(325);
    });

    it("should handle different card heights with averaging", () => {
      const parent1: ParentNodeWithDimensions = {
        id: "parent1",
        position: { x: 100, y: 100 },
        width: 200,
        height: 60,
      };

      const parent2: ParentNodeWithDimensions = {
        id: "parent2",
        position: { x: 400, y: 100 },
        width: 200,
        height: 100,
      };

      const junction = calculateJunctionPosition(parent1, parent2, false);

      // Parent1 center Y: 100 + 30 = 130
      // Parent2 center Y: 100 + 50 = 150
      // Average: (130 + 150) / 2 = 140
      expect(junction.y).toBe(140);
    });

    it("should use measured dimensions over default dimensions", () => {
      const parent1: ParentNodeWithDimensions = {
        id: "parent1",
        position: { x: 100, y: 100 },
        measured: { width: 220, height: 90 },
        width: 200,
        height: 80,
      };

      const parent2: ParentNodeWithDimensions = {
        id: "parent2",
        position: { x: 400, y: 100 },
        width: 200,
        height: 80,
      };

      const junction = calculateJunctionPosition(parent1, parent2, true);

      // Uses measured width: 100 + 220 = 320
      // Junction X: (320 + 400) / 2 = 360
      expect(junction.x).toBe(360);

      // Uses measured height: 100 + (90 / 2) = 145
      expect(junction.y).toBe(145);
    });
  });

  describe("calculateSpouseAlignedY", () => {
    it("should align spouse vertical center with dragged node", () => {
      const draggedNode: ParentNodeWithDimensions = {
        id: "dragged",
        position: { x: 100, y: 100 },
        width: 200,
        height: 80,
      };

      const spouseNode: ParentNodeWithDimensions = {
        id: "spouse",
        position: { x: 400, y: 120 },
        width: 200,
        height: 80,
      };

      const newPosition = { x: 100, y: 150 };

      const spouseY = calculateSpouseAlignedY(
        draggedNode,
        spouseNode,
        newPosition,
      );

      // Dragged center Y: 150 + 40 = 190
      // Spouse Y to align center: 190 - 40 = 150
      expect(spouseY).toBe(150);
    });

    it("should handle different heights correctly", () => {
      const draggedNode: ParentNodeWithDimensions = {
        id: "dragged",
        position: { x: 100, y: 100 },
        width: 200,
        height: 60,
      };

      const spouseNode: ParentNodeWithDimensions = {
        id: "spouse",
        position: { x: 400, y: 120 },
        width: 200,
        height: 100,
      };

      const newPosition = { x: 100, y: 150 };

      const spouseY = calculateSpouseAlignedY(
        draggedNode,
        spouseNode,
        newPosition,
      );

      // Dragged center Y: 150 + 30 = 180
      // Spouse Y to align center: 180 - 50 = 130
      expect(spouseY).toBe(130);
    });

    it("should use measured dimensions when available", () => {
      const draggedNode: ParentNodeWithDimensions = {
        id: "dragged",
        position: { x: 100, y: 100 },
        measured: { height: 90 },
        width: 200,
        height: 80,
      };

      const spouseNode: ParentNodeWithDimensions = {
        id: "spouse",
        position: { x: 400, y: 120 },
        measured: { height: 110 },
        width: 200,
        height: 80,
      };

      const newPosition = { x: 100, y: 150 };

      const spouseY = calculateSpouseAlignedY(
        draggedNode,
        spouseNode,
        newPosition,
      );

      // Dragged center Y: 150 + 45 = 195
      // Spouse Y to align center: 195 - 55 = 140
      expect(spouseY).toBe(140);
    });
  });

  describe("calculateCoupleAlignment", () => {
    it("should calculate aligned Y positions for equal height cards", () => {
      const parent1: ParentNodeWithDimensions = {
        id: "parent1",
        position: { x: 100, y: 100 },
        width: 200,
        height: 80,
      };

      const parent2: ParentNodeWithDimensions = {
        id: "parent2",
        position: { x: 400, y: 120 },
        width: 200,
        height: 80,
      };

      const alignment = calculateCoupleAlignment(parent1, parent2);

      // Parent1 center: 100 + 40 = 140
      // Parent2 center: 120 + 40 = 160
      // Average center: 150
      expect(alignment.centerY).toBe(150);
      expect(alignment.parent1Y).toBe(110); // 150 - 40
      expect(alignment.parent2Y).toBe(110); // 150 - 40
    });

    it("should handle different heights correctly", () => {
      const parent1: ParentNodeWithDimensions = {
        id: "parent1",
        position: { x: 100, y: 100 },
        width: 200,
        height: 60,
      };

      const parent2: ParentNodeWithDimensions = {
        id: "parent2",
        position: { x: 400, y: 120 },
        width: 200,
        height: 100,
      };

      const alignment = calculateCoupleAlignment(parent1, parent2);

      // Parent1 center: 100 + 30 = 130
      // Parent2 center: 120 + 50 = 170
      // Average center: 150
      expect(alignment.centerY).toBe(150);
      expect(alignment.parent1Y).toBe(120); // 150 - 30
      expect(alignment.parent2Y).toBe(100); // 150 - 50
    });

    it("should ensure both parents have same center Y after alignment", () => {
      const parent1: ParentNodeWithDimensions = {
        id: "parent1",
        position: { x: 100, y: 100 },
        width: 200,
        height: 80,
      };

      const parent2: ParentNodeWithDimensions = {
        id: "parent2",
        position: { x: 400, y: 150 },
        width: 200,
        height: 120,
      };

      const alignment = calculateCoupleAlignment(parent1, parent2);

      // Verify both centers match
      const parent1NewCenterY = alignment.parent1Y + 80 / 2;
      const parent2NewCenterY = alignment.parent2Y + 120 / 2;

      expect(parent1NewCenterY).toBe(parent2NewCenterY);
      expect(parent1NewCenterY).toBe(alignment.centerY);
    });
  });

  describe("Integration: Horizontal Marriage Line Scenario", () => {
    it("should produce horizontal marriage line for aligned parents with different heights", () => {
      // Parent1: shorter card (height 60)
      const parent1: ParentNodeWithDimensions = {
        id: "parent1",
        position: { x: 100, y: 100 },
        width: 200,
        height: 60,
      };

      // Parent2: taller card (height 100)
      const parent2: ParentNodeWithDimensions = {
        id: "parent2",
        position: { x: 400, y: 100 },
        width: 200,
        height: 100,
      };

      // Step 1: Align couple vertical centers
      const alignment = calculateCoupleAlignment(parent1, parent2);

      // Step 2: Update positions
      const alignedParent1 = {
        ...parent1,
        position: { x: parent1.position.x, y: alignment.parent1Y },
      };
      const alignedParent2 = {
        ...parent2,
        position: { x: parent2.position.x, y: alignment.parent2Y },
      };

      // Step 3: Calculate junction position
      const junction = calculateJunctionPosition(
        alignedParent1,
        alignedParent2,
        true,
      );

      // Verify both parents' centers match junction Y (horizontal line)
      const parent1CenterY = alignedParent1.position.y + 60 / 2;
      const parent2CenterY = alignedParent2.position.y + 100 / 2;

      expect(parent1CenterY).toBe(junction.y);
      expect(parent2CenterY).toBe(junction.y);
      expect(parent1CenterY).toBe(parent2CenterY);
    });
  });
});
