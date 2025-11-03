import React, { useEffect, useRef, useState } from "react";
import { Button } from "./components/ui/button";
import { DraggablePanel } from "./components/DraggablePanel";
import { ColorPicker } from "./components/ColorPicker";
import { LineWidthSlider } from "./components/LineWidthSlider";
import { MobileControls } from "./components/MobileControls";
import { ResultsPanel } from "./components/ResultsPanel";
import { Loader } from "./components/Loader";
import { useTouchDrawing } from "./hooks/useTouchDrawing";
import { SWATCHES, DRAWING_MODES, type DrawingMode } from "./constants";
import {
  Palette,
  RotateCcw,
  Send,
  Settings,
  Eraser,
  Loader2,
  Wifi,
  WifiOff,
} from "lucide-react";

interface Result {
  id: string;
  expression: string;
  answer: string;
}

interface Response {
  expr: string;
  result: string;
  assign: boolean;
}

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState(SWATCHES[0]);
  const [drawingMode, setDrawingMode] = useState<DrawingMode>(
    DRAWING_MODES.DRAW
  );
  const [lineWidth, setLineWidth] = useState(3);
  const [loading, setLoading] = useState(false);
  const [dictOfVars, setDictOfVars] = useState({});
  const [results, setResults] = useState<Result[]>([]);
  const [showControls, setShowControls] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [showCursor, setShowCursor] = useState(false);
  const [backendStatus, setBackendStatus] = useState<
    "checking" | "online" | "offline"
  >("checking");

  const { getTouchPos, getPointerPos, drawLine, lastTouchRef } =
    useTouchDrawing();

  // Function to check backend health
  const checkBackendStatus = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/check`);
      if (response.ok) {
        const data = await response.json();
        console.log("Backend check:", data);
        setBackendStatus("online");
      } else {
        setBackendStatus("offline");
      }
    } catch (error) {
      console.error("Backend unreachable:", error);
      setBackendStatus("offline");
    }
  };

  // Run every 5 seconds
  useEffect(() => {
    checkBackendStatus(); // initial call
    const interval = setInterval(checkBackendStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || "ontouchstart" in window);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        ctx.globalCompositeOperation = "source-over";
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.lineWidth = lineWidth;
        // Don't fill with black - keep transparent background
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }

    const handleResize = () => {
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          canvas.width = window.innerWidth;
          canvas.height = window.innerHeight;
          ctx.globalCompositeOperation = "source-over";
          ctx.fillStyle = "#0a0a0a";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Update line width
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.lineWidth = lineWidth;
      }
    }
  }, [lineWidth]);

  const resetCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setResults([]);
        setDictOfVars({});
      }
    }
  };

  const removeResult = (id: string) => {
    setResults((prev) => prev.filter((result) => result.id !== id));
  };

  const clearAllResults = () => {
    setResults([]);
  };

  // Mouse events
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      setCursorPosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      setShowCursor(true);

      const ctx = canvas.getContext("2d");
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (drawingMode === "erase") {
        ctx!.globalCompositeOperation = "destination-out";
        ctx!.lineWidth = lineWidth * 3; // Make eraser larger
      } else {
        ctx!.globalCompositeOperation = "source-over";
        ctx!.strokeStyle = color;
        ctx!.lineWidth = lineWidth;
      }

      ctx!.beginPath();
      ctx!.moveTo(x, y);
      lastTouchRef.current = { x, y };
      setIsDrawing(true);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    // Update cursor position
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      setCursorPosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }

    if (canvas && lastTouchRef.current) {
      const ctx = canvas.getContext("2d");
      const rect = canvas.getBoundingClientRect();
      const currentPos = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };

      drawLine(
        ctx!,
        lastTouchRef.current,
        currentPos,
        color,
        lineWidth,
        drawingMode
      );
      lastTouchRef.current = currentPos;
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    lastTouchRef.current = null;
    setShowCursor(false);
  };

  // Touch events for mobile/tablet
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (canvas && e.touches.length === 1) {
      const touch = e.touches[0];
      const pos = getTouchPos(canvas, touch);

      const ctx = canvas.getContext("2d");

      if (drawingMode === "erase") {
        ctx!.globalCompositeOperation = "destination-out";
        ctx!.lineWidth = lineWidth * 3; // Make eraser larger
      } else {
        ctx!.globalCompositeOperation = "source-over";
        ctx!.strokeStyle = color;
        ctx!.lineWidth = lineWidth;
      }

      ctx!.beginPath();
      ctx!.moveTo(pos.x, pos.y);
      lastTouchRef.current = pos;
      setIsDrawing(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing || e.touches.length !== 1) return;

    const canvas = canvasRef.current;
    if (canvas && lastTouchRef.current) {
      const ctx = canvas.getContext("2d");
      const touch = e.touches[0];
      const currentPos = getTouchPos(canvas, touch);

      drawLine(
        ctx!,
        lastTouchRef.current,
        currentPos,
        color,
        lineWidth,
        drawingMode
      );
      lastTouchRef.current = currentPos;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setIsDrawing(false);
    lastTouchRef.current = null;
  };

  // Handle mouse move for cursor tracking
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      setCursorPosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      setShowCursor(true);
    }

    // Continue with drawing if active
    draw(e);
  };

  const handleMouseEnter = () => {
    setShowCursor(true);
  };

  const handleMouseLeave = () => {
    setShowCursor(false);
    setIsDrawing(false);
    lastTouchRef.current = null;
  };

  // Pointer events (for Apple Pencil and advanced stylus support)
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.pointerType === "pen" || e.pointerType === "touch") {
      e.preventDefault();
      const canvas = canvasRef.current;
      if (canvas) {
        const pos = getPointerPos(canvas, e.nativeEvent);
        const ctx = canvas.getContext("2d");

        if (drawingMode === "erase") {
          ctx!.globalCompositeOperation = "source-over";
          ctx!.strokeStyle = "#111111"; // Dark color to match background
          ctx!.lineWidth = lineWidth * 5; // Make eraser larger
        } else {
          ctx!.globalCompositeOperation = "source-over";
          ctx!.strokeStyle = color;
          ctx!.lineWidth = lineWidth;
        }

        ctx!.beginPath();
        ctx!.moveTo(pos.x, pos.y);
        lastTouchRef.current = pos;
        setIsDrawing(true);
      }
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || (e.pointerType !== "pen" && e.pointerType !== "touch"))
      return;

    e.preventDefault();
    const canvas = canvasRef.current;
    if (canvas && lastTouchRef.current) {
      const ctx = canvas.getContext("2d");
      const currentPos = getPointerPos(canvas, e.nativeEvent);

      drawLine(
        ctx!,
        lastTouchRef.current,
        currentPos,
        color,
        lineWidth,
        drawingMode
      );
      lastTouchRef.current = currentPos;
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.pointerType === "pen" || e.pointerType === "touch") {
      e.preventDefault();
      setIsDrawing(false);
      lastTouchRef.current = null;
    }
  };

  const generateImage = async () => {
    setLoading(true);
    const canvas = canvasRef.current;

    if (!canvas) return;

    try {
      // Get the canvas image data
      const imageData = canvas.toDataURL("image/png");

      // Send to backend
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/calculate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            image: imageData,
            dict_of_vars: dictOfVars,
          }),
        }
      );

      const result = await response.json();
      console.log("Backend Response:", result);

      if (result.status === "error") {
        alert(result.error);
        return;
      }

      // Ensure data exists
      if (Array.isArray(result.data)) {
        const newResults: Result[] = result.data.map((item, index) => ({
          id: `${Date.now()}-${index}`,
          expression: item.expr,
          answer: item.result,
        }));

        // Add new results to existing ones
        setResults((prev) => [...prev, ...newResults]);
      } else {
        console.warn("Unexpected data format:", result);
      }
    } catch (error) {
      console.error("Error sending image to backend:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full h-screen bg-gray-900 overflow-hidden">
      {/* Dark background behind transparent canvas */}
      <div className="absolute inset-0 bg-gray-900"></div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className={`absolute top-0 left-0 touch-none bg-transparent ${
          drawingMode === "erase" ? "cursor-none" : "cursor-crosshair"
        }`}
        style={{ touchAction: "none" }} // Prevent scrolling on touch
        onMouseDown={startDrawing}
        onMouseMove={handleMouseMove}
        onMouseUp={stopDrawing}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      />

      {/* Custom Eraser Cursor */}
      {showCursor && drawingMode === "erase" && !isMobile && (
        <div
          className="absolute pointer-events-none z-50 border-2 border-red-400 rounded-full bg-red-400/20"
          style={{
            left: cursorPosition.x - (lineWidth * 5) / 2,
            top: cursorPosition.y - (lineWidth * 5) / 2,
            width: lineWidth * 5,
            height: lineWidth * 5,
            transition: "width 0.1s ease, height 0.1s ease",
          }}
        >
          <div className="absolute inset-2 border border-red-300 rounded-full bg-red-300/10"></div>
        </div>
      )}

      {/* Mobile Controls */}
      {isMobile ? (
        <MobileControls
          color={color}
          onColorChange={setColor}
          drawingMode={drawingMode}
          onModeChange={setDrawingMode}
          lineWidth={lineWidth}
          onLineWidthChange={setLineWidth}
          onReset={resetCanvas}
          onGenerate={generateImage}
          loading={loading}
          showControls={showControls}
          onToggleControls={() => setShowControls(!showControls)}
          results={results}
          onRemoveResult={removeResult}
        />
      ) : (
        <>
          {/* Desktop Controls */}
          <button
            className="absolute top-4 left-4 z-50 p-3 bg-black/50 backdrop-blur-sm rounded-full border border-white/20 hover:bg-black/70 transition-all duration-200"
            onClick={() => setShowControls(!showControls)}
          >
            <Settings className="w-5 h-5 text-white" />
          </button>

          {/* Line Width Control Panel */}
          {showControls && (
            <DraggablePanel initialPosition={{ x: 24, y: 80 }} className="z-40">
              <div className="bg-black/60 backdrop-blur-md rounded-xl border border-white/20 p-4 w-64 shadow-2xl">
                <div className="flex items-center gap-2 mb-4">
                  <Palette className="w-4 h-4 text-blue-400" />
                  <h3 className="text-white font-medium">Drawing Tools</h3>
                </div>
                <LineWidthSlider
                  value={lineWidth}
                  onChange={setLineWidth}
                  min={1}
                  max={100}
                />
              </div>
            </DraggablePanel>
          )}

          {/* Main Control Panel */}
          {showControls && (
            <DraggablePanel
              initialPosition={{ x: window.innerWidth - 280, y: 24 }}
              className="z-30"
            >
              <div className="bg-black/60 backdrop-blur-md rounded-xl border border-white/20 p-6 w-64 shadow-2xl">
                <div className="space-y-6">
                  {/* Color Picker */}
                  <div>
                    <div className="mb-3">
                      <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                        <Palette className="w-4 h-4 text-purple-400" />
                        Drawing Tools
                      </h3>
                      <div
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium shadow-md transition-all duration-300 ${
                          backendStatus === "online"
                            ? "bg-green-500/20 text-green-300 border border-green-400/50"
                            : backendStatus === "checking"
                            ? "bg-yellow-500/20 text-yellow-300 border border-yellow-400/50"
                            : "bg-red-500/20 text-red-300 border border-red-400/50"
                        }`}
                      >
                        {backendStatus === "online" && (
                          <>
                            <Wifi className="w-4 h-4 text-green-300 animate-pulse" />
                            <span>Backend Online</span>
                          </>
                        )}

                        {backendStatus === "checking" && (
                          <>
                            <Loader2 className="w-4 h-4 text-yellow-300 animate-spin" />
                            <span>Checking...</span>
                          </>
                        )}

                        {backendStatus === "offline" && (
                          <>
                            <WifiOff className="w-4 h-4 text-red-300 animate-bounce" />
                            <span>Backend Offline</span>
                          </>
                        )}
                      </div>
                    </div>
                    <ColorPicker
                      selectedColor={color}
                      onColorChange={setColor}
                      drawingMode={drawingMode}
                      onModeChange={setDrawingMode}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <Button
                      onClick={resetCanvas}
                      className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg py-3 px-4 shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center gap-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Reset Canvas
                    </Button>

                    <Button
                      onClick={generateImage}
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg py-3 px-4 shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center gap-2 disabled:transform-none disabled:opacity-70"
                    >
                      {loading ? (
                        <>
                          <Loader />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Generate / Send
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </DraggablePanel>
          )}
        </>
      )}

      {/* Results Panel */}
      <ResultsPanel
        results={results}
        onRemoveResult={removeResult}
        onClearAll={clearAllResults}
      />

      {/* Instructions */}
      <div
        className={`absolute ${
          isMobile ? "bottom-20" : "bottom-4"
        } left-4 right-4 text-center text-white/60 text-sm`}
      >
        {isMobile
          ? "Draw with your finger or Apple Pencil. Use eraser to remove parts. Tap Generate to process."
          : "Draw on the canvas or use eraser mode. Click Generate / Send to process your drawing."}
      </div>

      {/* Custom CSS for enhanced touch support */}
      <style>{`
        .touch-manipulation {
          touch-action: manipulation;
        }
        
        .safe-area-pb {
          padding-bottom: env(safe-area-inset-bottom);
        }
        
        .scrollbar-thin {
          scrollbar-width: thin;
        }
        
        .scrollbar-thumb-white\/20::-webkit-scrollbar-thumb {
          background-color: rgba(255, 255, 255, 0.2);
          border-radius: 4px;
        }
        
        .scrollbar-track-transparent::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 24px;
          width: 24px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          cursor: pointer;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
          transition: all 0.2s ease;
        }
        
        .slider::-webkit-slider-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.4);
        }
        
        .slider::-moz-range-thumb {
          height: 24px;
          width: 24px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          cursor: pointer;
          border: none;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        }
        
        /* Prevent text selection while drawing */
        canvas {
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }
        
        /* Enhanced touch targets for mobile */
        @media (max-width: 768px) {
          button {
            min-height: 44px;
            min-width: 44px;
          }
        }
      `}</style>
    </div>
  );
}

export default App;
