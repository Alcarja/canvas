"use client";
"use client";

import { useState, useRef } from "react";
import { motion, useMotionValue } from "framer-motion";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CanvasItem {
  id: string;
  type: "image" | "icon";
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  alt: string;
  color?: string;
}

// Generate initial items scattered across a large canvas area
function generateInitialItems(): CanvasItem[] {
  const items: CanvasItem[] = [];
  const availableItems = [
    {
      type: "image" as const,
      src: "/next.svg",
      alt: "Next.js Logo",
      width: 150,
      height: 150,
    },
    {
      type: "image" as const,
      src: "/vercel.svg",
      alt: "Vercel Logo",
      width: 90,
      height: 130,
    },
    {
      type: "icon" as const,
      src: "/file.svg",
      alt: "File Icon",
      width: 200,
      height: 80,
    },
    {
      type: "icon" as const,
      src: "/window.svg",
      alt: "Window Icon",
      width: 100,
      height: 130,
    },
    {
      type: "icon" as const,
      src: "/globe.svg",
      alt: "Globe Icon",
      width: 140,
      height: 130,
    },
    {
      type: "icon" as const,
      src: "/star.svg",
      alt: "Star Icon",
      width: 200,
      height: 80,
    },
    {
      type: "icon" as const,
      src: "/heart.svg",
      alt: "Heart Icon",
      width: 130,
      height: 130,
    },
    {
      type: "icon" as const,
      src: "/circle.svg",
      alt: "Circle Icon",
      width: 200,
      height: 50,
    },
  ];

  const colors = [
    "#3B82F6",
    "#EF4444",
    "#10B981",
    "#F59E0B",
    "#8B5CF6",
    "#EC4899",
  ];

  // Generate items across a concentrated area (12000x12000 pixels)
  for (let i = 0; i < 400; i++) {
    const randomItem =
      availableItems[Math.floor(Math.random() * availableItems.length)];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    // Make items bigger but not too big
    const scaleFactor = 1.2 + Math.random() * 2; // 1.5x to 3.5x bigger
    const scaledWidth = randomItem.width * scaleFactor;
    const scaledHeight = randomItem.height * scaleFactor;

    items.push({
      id: `item-${i}`,
      type: randomItem.type,
      src: randomItem.src,
      x: Math.random() * 12000 - 6000, // -6000 to 6000
      y: Math.random() * 12000 - 6000, // -6000 to 6000
      width: scaledWidth,
      height: scaledHeight,
      alt: randomItem.alt,
      color: randomItem.type === "icon" ? randomColor : undefined,
    });
  }

  return items;
}

const PATTERN_SIZE = 12000;
const GAP = 0;

export default function InfiniteCanvas() {
  const [baseItems] = useState<CanvasItem[]>(() => generateInitialItems());
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [frontItems, setFrontItems] = useState<Set<string>>(new Set());
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogItem, setDialogItem] = useState<CanvasItem | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Infinite wrapping logic
  const x = useMotionValue(-0.5 * PATTERN_SIZE);
  const y = useMotionValue(-0.5 * PATTERN_SIZE);

  // When the drag offset exceeds pattern size, wrap it
  function handleDragEnd() {
    let newX = x.get();
    let newY = y.get();
    // Wrap horizontally
    if (newX > 0) newX = ((newX + PATTERN_SIZE) % PATTERN_SIZE) - PATTERN_SIZE;
    if (newX < -PATTERN_SIZE)
      newX = ((newX - PATTERN_SIZE) % PATTERN_SIZE) + PATTERN_SIZE;
    // Wrap vertically
    if (newY > 0) newY = ((newY + PATTERN_SIZE) % PATTERN_SIZE) - PATTERN_SIZE;
    if (newY < -PATTERN_SIZE)
      newY = ((newY - PATTERN_SIZE) % PATTERN_SIZE) + PATTERN_SIZE;
    x.set(newX);
    y.set(newY);
  }

  // Render 3x3 grids for seamless wrapping
  const gridOffsets = [
    [-(PATTERN_SIZE + GAP), -(PATTERN_SIZE + GAP)],
    [0, -(PATTERN_SIZE + GAP)],
    [PATTERN_SIZE + GAP, -(PATTERN_SIZE + GAP)],
    [-(PATTERN_SIZE + GAP), 0],
    [0, 0],
    [PATTERN_SIZE + GAP, 0],
    [-(PATTERN_SIZE + GAP), PATTERN_SIZE + GAP],
    [0, PATTERN_SIZE + GAP],
    [PATTERN_SIZE + GAP, PATTERN_SIZE + GAP],
  ];

  return (
    <div className="h-screen w-screen bg-gray-50 overflow-hidden">
      {/* Canvas Container */}
      <div
        className="relative w-full h-full overflow-hidden"
        ref={containerRef}
      >
        {/* Infinite Background Pattern */}
        <motion.div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              radial-gradient(circle, #e5e7eb 1px, transparent 1px)
            `,
            backgroundSize: "20px 20px",
            x,
            y,
          }}
        />

        {/* Canvas */}
        <motion.div
          className="absolute top-0 left-0"
          style={{ x, y }}
          drag
          dragMomentum={false}
          dragElastic={0}
          onDragEnd={handleDragEnd}
        >
          {gridOffsets.map(([ox, oy], gridIdx) => (
            <div
              key={gridIdx}
              style={{
                position: "absolute",
                left: ox,
                top: oy,
                width: PATTERN_SIZE,
                height: PATTERN_SIZE,
              }}
            >
              {baseItems.map((item) => (
                <div
                  key={`${item.id}-${gridIdx}`}
                  className={`absolute cursor-pointer select-none transition-shadow duration-150 ${
                    selectedItem === `${item.id}-${gridIdx}`
                      ? "ring-2 ring-blue-500"
                      : ""
                  } ${
                    hoveredItem === `${item.id}-${gridIdx}` ? "shadow-2xl" : ""
                  }`}
                  style={{
                    left: item.x,
                    top: item.y,
                    width: item.width,
                    height: item.height,
                    zIndex:
                      hoveredItem === `${item.id}-${gridIdx}`
                        ? 100
                        : frontItems.has(`${item.id}-${gridIdx}`)
                        ? 50
                        : 10,
                  }}
                  onClick={() => {
                    const itemKey = `${item.id}-${gridIdx}`;
                    setSelectedItem(itemKey);
                    setFrontItems((prev) => {
                      const newSet = new Set(prev);
                      newSet.add(itemKey);
                      return newSet;
                    });
                    setDialogItem(item);
                    setDialogOpen(true);
                  }}
                  onMouseEnter={() => setHoveredItem(`${item.id}-${gridIdx}`)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <div className="relative w-full h-full">
                    {/* Metallic border frame */}
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-600 via-gray-700 to-gray-800 rounded-lg shadow-lg"></div>
                    {/* Inner white canvas area */}
                    <div className="absolute inset-2 bg-white rounded-md"></div>
                    <Image
                      src={item.src}
                      alt={item.alt}
                      width={item.width}
                      height={item.height}
                      className="relative z-10 w-full h-full object-contain rounded-md p-2"
                      style={{
                        filter: item.color
                          ? `brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(${
                              item.color === "#3B82F6"
                                ? "346deg"
                                : item.color === "#EF4444"
                                ? "0deg"
                                : item.color === "#10B981"
                                ? "120deg"
                                : item.color === "#F59E0B"
                                ? "45deg"
                                : item.color === "#8B5CF6"
                                ? "270deg"
                                : "320deg"
                            }) brightness(104%) contrast(97%)`
                          : "none",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </motion.div>
      </div>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{dialogItem?.alt}</DialogTitle>
            <DialogDescription>
              {dialogItem?.type} • {dialogItem?.width} × {dialogItem?.height}px
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-center my-4">
            <div className="relative">
              {/* Metallic border frame */}
              <div className="absolute inset-0 bg-gradient-to-br from-gray-600 via-gray-700 to-gray-800 rounded-lg shadow-lg"></div>
              {/* Inner white canvas area */}
              <div className="absolute inset-2 bg-white rounded-md"></div>
              <Image
                src={dialogItem?.src || ""}
                alt={dialogItem?.alt || ""}
                width={dialogItem?.width || 100}
                height={dialogItem?.height || 100}
                className="relative z-10 w-full h-full object-contain rounded-md p-2"
                style={{
                  filter: dialogItem?.color
                    ? `brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(${
                        dialogItem.color === "#3B82F6"
                          ? "346deg"
                          : dialogItem.color === "#EF4444"
                          ? "0deg"
                          : dialogItem.color === "#10B981"
                          ? "120deg"
                          : dialogItem.color === "#F59E0B"
                          ? "45deg"
                          : dialogItem.color === "#8B5CF6"
                          ? "270deg"
                          : "320deg"
                      }) brightness(104%) contrast(97%)`
                    : "none",
                }}
              />
            </div>
          </div>

          {dialogItem?.color && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>
                <strong>Color:</strong>
              </span>
              <span
                className="inline-block w-4 h-4 rounded border"
                style={{ backgroundColor: dialogItem.color }}
              ></span>
              <span>{dialogItem.color}</span>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
