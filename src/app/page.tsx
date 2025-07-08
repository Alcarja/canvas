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

function generateInitialItems(): CanvasItem[] {
  const items: CanvasItem[] = [];
  const availableItems = [
    {
      type: "image" as const,
      src: "/cabin.jpg",
      alt: "Cabin",
      width: 140,
      height: 100,
    },
    {
      type: "image" as const,
      src: "/chicken.jpg",
      alt: "Chicken",
      width: 90,
      height: 130,
    },
    {
      type: "icon" as const,
      src: "/china.jpg",
      alt: "China",
      width: 120,
      height: 200,
    },
    {
      type: "icon" as const,
      src: "/glasses.jpg",
      alt: "Glasses",
      width: 100,
      height: 130,
    },
    {
      type: "icon" as const,
      src: "/old-guy.jpg",
      alt: "Old Guy",
      width: 140,
      height: 130,
    },
  ];

  for (let i = 0; i < 350; i++) {
    const randomItem =
      availableItems[Math.floor(Math.random() * availableItems.length)];
    const scaleFactor = 1.2 + Math.random() * 2;
    items.push({
      id: `item-${i}`,
      type: randomItem.type,
      src: randomItem.src,
      x: Math.random() * 12000 - 6000,
      y: Math.random() * 12000 - 6000,
      width: randomItem.width * scaleFactor,
      height: randomItem.height * scaleFactor,
      alt: randomItem.alt,
    });
  }

  return items;
}

const PATTERN_SIZE = 12000;
const GAP = 0;

export default function InfiniteCanvas() {
  const [baseItems] = useState(() => generateInitialItems());
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [frontItems, setFrontItems] = useState<Set<string>>(new Set());
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogItem, setDialogItem] = useState<CanvasItem | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const x = useMotionValue(-0.5 * PATTERN_SIZE);
  const y = useMotionValue(-0.5 * PATTERN_SIZE);

  function handleDragEnd() {
    let newX = x.get();
    let newY = y.get();
    if (newX > 0) newX = ((newX + PATTERN_SIZE) % PATTERN_SIZE) - PATTERN_SIZE;
    if (newX < -PATTERN_SIZE)
      newX = ((newX - PATTERN_SIZE) % PATTERN_SIZE) + PATTERN_SIZE;
    if (newY > 0) newY = ((newY + PATTERN_SIZE) % PATTERN_SIZE) - PATTERN_SIZE;
    if (newY < -PATTERN_SIZE)
      newY = ((newY - PATTERN_SIZE) % PATTERN_SIZE) + PATTERN_SIZE;
    x.set(newX);
    y.set(newY);
  }

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
    <>
      <div className="h-screen w-screen bg-gray-100 overflow-hidden relative">
        {/* Background Pattern */}
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle, #d1d5db 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />

        {/* Corner Buttons */}
        <div className="absolute top-4 left-4 flex gap-2 z-50">
          <button className="bg-gray-800 text-white px-4 py-2 rounded shadow hover:bg-gray-700">
            TL 1
          </button>
          <button className="bg-gray-800 text-white px-4 py-2 rounded shadow hover:bg-gray-700">
            TL 2
          </button>
        </div>
        <div className="absolute top-4 right-4 flex gap-2 z-50">
          <button className="bg-black/30 backdrop-blur-2xl text-white w-[40px] h-[40px] rounded-lg shadow hover:bg-black/50">
            i
          </button>
          <button className="bg-gray-800 text-white px-4 py-2 rounded shadow hover:bg-gray-700">
            TR 2
          </button>
        </div>
        <div className="absolute bottom-4 left-4 flex gap-2 z-50">
          <button className="bg-gray-800 text-white px-4 py-2 rounded shadow hover:bg-gray-700">
            BL 1
          </button>
          <button className="bg-gray-800 text-white px-4 py-2 rounded shadow hover:bg-gray-700">
            BL 2
          </button>
        </div>
        <div className="absolute bottom-4 right-4 flex gap-2 z-50">
          <button className="bg-gray-800 text-white px-4 py-2 rounded shadow hover:bg-gray-700">
            BR 1
          </button>
          <button className="bg-gray-800 text-white px-4 py-2 rounded shadow hover:bg-gray-700">
            BR 2
          </button>
        </div>

        {/* Canvas */}
        <div
          className="relative w-full h-full overflow-hidden z-10"
          ref={containerRef}
        >
          <motion.div
            className="absolute top-0 left-0"
            style={{ x, y }}
            drag
            dragMomentum
            dragElastic={0}
            onDragEnd={handleDragEnd}
          >
            {gridOffsets.map(([ox, oy], gridIdx) => (
              <div
                key={gridIdx}
                className="absolute"
                style={{
                  left: ox,
                  top: oy,
                  width: PATTERN_SIZE,
                  height: PATTERN_SIZE,
                }}
              >
                {baseItems.map((item) => {
                  const itemKey = `${item.id}-${gridIdx}`;
                  const isSelected = selectedItem === itemKey;
                  const isHovered = hoveredItem === itemKey;
                  const isFront = frontItems.has(itemKey);

                  return (
                    <div
                      key={itemKey}
                      className={`absolute transition-shadow duration-150 cursor-pointer select-none ${
                        isSelected ? "ring-2" : ""
                      } ${isHovered ? "shadow-2xl" : ""}`}
                      style={{
                        left: item.x,
                        top: item.y,
                        width: item.width,
                        height: item.height,
                        zIndex: isHovered ? 100 : isFront ? 50 : 10,
                      }}
                      onClick={() => {
                        setSelectedItem(itemKey);
                        setFrontItems((prev) => new Set(prev).add(itemKey));
                        setDialogItem(item);
                        setDialogOpen(true);
                      }}
                      onMouseEnter={() => setHoveredItem(itemKey)}
                      onMouseLeave={() => setHoveredItem(null)}
                    >
                      <div className="relative w-full h-full rounded-lg border-4 border-black overflow-hidden">
                        <Image
                          src={item.src}
                          alt={item.alt}
                          fill
                          className="object-cover"
                        />
                        <div
                          className="absolute inset-x-0 top-0 h-10 pointer-events-none z-10"
                          style={{
                            background:
                              "linear-gradient(to bottom, rgba(0, 0, 0, 0.1), transparent)",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </motion.div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{dialogItem?.alt || "Item"}</DialogTitle>
                <DialogDescription>
                  Type: {dialogItem?.type} <br />
                  Size: {Math.round(dialogItem?.width || 0)} x{" "}
                  {Math.round(dialogItem?.height || 0)}
                </DialogDescription>
              </DialogHeader>
              {dialogItem?.src && (
                <div className="relative w-full h-64 mt-4 rounded-md overflow-hidden border">
                  <Image
                    src={dialogItem.src}
                    alt={dialogItem.alt}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </>
  );
}
