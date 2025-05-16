import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { fabric } from "fabric";
import { Socket } from "socket.io-client";
import { Pencil, Square, LineSegment, Palette, Eraser, Undo, Redo, Trash2, Users, Save } from "lucide-react";

// Define interface for the component props
interface RoomProps {
  userNo: number;
  socket: Socket;
  setUsers: (users: any[]) => void;
  setUserNo: (userNo: number) => void;
}

// Define shapes for our history tracking
type HistoryItem = {
  type: "add" | "remove" | "modify";
  objects: fabric.Object[];z
};

/*************  ✨ Windsurf Command ⭐  *************/
/**
 * This component renders a collaborative drawing canvas using Fabric.js.
 * It uses Socket.IO to broadcast canvas changes to other users.
 * The component also handles tool selection, color, and size changes.
/*******  960584cb-e7f7-4ebe-b1b6-0200917522eb  *******/const Room: React.FC<RoomProps> = ({ userNo, socket, setUsers, setUserNo }) => {
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const [color, setColor] = useState<string>("#000000");
  const [brushSize, setBrushSize] = useState<number>(5);
  const [tool, setTool] = useState<string>("pencil");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);

  // Initialize Fabric.js canvas
  useEffect(() => {
    if (canvasRef.current) {
      fabricCanvasRef.current = new fabric.Canvas(canvasRef.current, {
        isDrawingMode: true,
        width: window.innerWidth * 0.8,
        height: window.innerHeight * 0.7,
        backgroundColor: "#ffffff",
      });

      const canvas = fabricCanvasRef.current;
      
      // Set default brush
      canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
      canvas.freeDrawingBrush.color = color;
      canvas.freeDrawingBrush.width = brushSize;
      
      // Handle window resize
      const handleResize = () => {
        if (canvas) {
          canvas.setDimensions({
            width: window.innerWidth * 0.8,
            height: window.innerHeight * 0.7,
          });
          canvas.renderAll();
        }
      };
      
      window.addEventListener("resize", handleResize);
      
      // Set up event listeners for history tracking
      canvas.on("object:added", (e) => {
        if (!isDrawing) {
          pushToHistory("add", [e.target as fabric.Object]);
        }
      });
      
      // Broadcast canvas changes to other users
      canvas.on("path:created", (e) => {
        const path = e.path?.toJSON();
        if (path) {
          socket.emit("drawing", { type: "path", path, color, brushSize });
        }
        setIsDrawing(false);
        pushToHistory("add", [e.path as fabric.Object]);
      });
      
      return () => {
        window.removeEventListener("resize", handleResize);
        canvas.dispose();
      };
    }
  }, []);

  // Update socket event listeners
  useEffect(() => {
    socket.on("message", (data: { message: string }) => {
      toast.info(data.message);
    });

    socket.on("users", (data: any[]) => {
      setUsers(data);
      setUserNo(data.length);
    });

    // Handle received drawing from other users
    socket.on("drawing", (data: any) => {
      if (fabricCanvasRef.current) {
        if (data.type === "path") {
          fabric.Path.fromObject(data.path, (path) => {
            path.set({
              stroke: data.color,
              strokeWidth: data.brushSize,
              selectable: false,
            });
            fabricCanvasRef.current?.add(path);
          });
        } else if (data.type === "clear") {
          clearCanvas();
        }
      }
    });

    return () => {
      socket.off("message");
      socket.off("users");
      socket.off("drawing");
    };
  }, [socket]);

  // Update brush when color or size changes
  useEffect(() => {
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.freeDrawingBrush.color = color;
      fabricCanvasRef.current.freeDrawingBrush.width = brushSize;
    }
  }, [color, brushSize]);

  // Update tool settings
  useEffect(() => {
    if (!fabricCanvasRef.current) return;
    
    const canvas = fabricCanvasRef.current;
    
    switch (tool) {
      case "pencil":
        canvas.isDrawingMode = true;
        canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
        break;
      case "line":
        canvas.isDrawingMode = false;
        canvas.selection = false;
        // Line tool will be handled with custom event handlers
        break;
      case "rect":
        canvas.isDrawingMode = false;
        canvas.selection = false;
        // Rectangle tool will be handled with custom event handlers
        break;
      case "eraser":
        canvas.isDrawingMode = true;
        canvas.freeDrawingBrush = new fabric.EraserBrush(canvas);
        break;
      default:
        canvas.isDrawingMode = true;
        break;
    }
    
    canvas.freeDrawingBrush.color = color;
    canvas.freeDrawingBrush.width = brushSize;
  }, [tool]);

  // Custom shape drawing handlers
  useEffect(() => {
    if (!fabricCanvasRef.current || tool === "pencil" || tool === "eraser") return;
    
    const canvas = fabricCanvasRef.current;
    let startPoint: { x: number; y: number } | null = null;
    let currentShape: fabric.Object | null = null;
    
    const handleMouseDown = (e: fabric.IEvent) => {
      if (tool !== "line" && tool !== "rect") return;
      setIsDrawing(true);
      canvas.selection = false;
      const pointer = canvas.getPointer(e.e);
      startPoint = { x: pointer.x, y: pointer.y };
      
      if (tool === "line") {
        currentShape = new fabric.Line([pointer.x, pointer.y, pointer.x, pointer.y], {
          stroke: color,
          strokeWidth: brushSize,
          selectable: true
        });
      } else if (tool === "rect") {
        currentShape = new fabric.Rect({
          left: pointer.x,
          top: pointer.y,
          width: 0,
          height: 0,
          fill: "transparent",
          stroke: color,
          strokeWidth: brushSize,
          selectable: true
        });
      }
      
      if (currentShape) {
        canvas.add(currentShape);
      }
    };
    
    const handleMouseMove = (e: fabric.IEvent) => {
      if (!isDrawing || !startPoint || !currentShape) return;
      const pointer = canvas.getPointer(e.e);
      
      if (tool === "line" && currentShape instanceof fabric.Line) {
        currentShape.set({
          x2: pointer.x,
          y2: pointer.y
        });
      } else if (tool === "rect" && currentShape instanceof fabric.Rect) {
        const width = Math.abs(pointer.x - startPoint.x);
        const height = Math.abs(pointer.y - startPoint.y);
        
        currentShape.set({
          left: Math.min(startPoint.x, pointer.x),
          top: Math.min(startPoint.y, pointer.y),
          width: width,
          height: height
        });
      }
      
      canvas.renderAll();
    };
    
    const handleMouseUp = () => {
      if (!isDrawing) return;
      setIsDrawing(false);
      canvas.selection = true;
      startPoint = null;
      
      if (currentShape) {
        // Broadcast the shape to other users
        socket.emit("drawing", {
          type: tool,
          object: currentShape.toJSON(),
          color,
          brushSize
        });
        
        pushToHistory("add", [currentShape]);
        currentShape = null;
      }
    };
    
    canvas.on("mouse:down", handleMouseDown);
    canvas.on("mouse:move", handleMouseMove);
    canvas.on("mouse:up", handleMouseUp);
    
    return () => {
      canvas.off("mouse:down", handleMouseDown);
      canvas.off("mouse:move", handleMouseMove);
      canvas.off("mouse:up", handleMouseUp);
    };
  }, [tool, color, brushSize, isDrawing]);

  // History tracking function
  const pushToHistory = (type: "add" | "remove" | "modify", objects: fabric.Object[]): void => {
    // Remove any future history if we're not at the latest point
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ type, objects });
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const clearCanvas = (): void => {
    if (fabricCanvasRef.current) {
      // Store objects before clearing for history
      const objects = [...fabricCanvasRef.current.getObjects()];
      
      fabricCanvasRef.current.clear();
      fabricCanvasRef.current.setBackgroundColor("#ffffff", () => {});
      fabricCanvasRef.current.renderAll();
      
      // Add to history if there were objects to clear
      if (objects.length > 0) {
        pushToHistory("remove", objects);
      }
      
      // Broadcast clear to other users
      socket.emit("drawing", { type: "clear" });
    }
  };

  const undo = (): void => {
    if (historyIndex < 0 || !fabricCanvasRef.current) return;
    
    const canvas = fabricCanvasRef.current;
    const action = history[historyIndex];
    
    if (action.type === "add") {
      // If objects were added, remove them
      action.objects.forEach(obj => {
        const canvasObject = canvas.getObjects().find(o => o === obj);
        if (canvasObject) {
          canvas.remove(canvasObject);
        }
      });
    } else if (action.type === "remove") {
      // If objects were removed, add them back
      action.objects.forEach(obj => {
        canvas.add(obj);
      });
    }
    
    canvas.renderAll();
    setHistoryIndex(historyIndex - 1);
  };

  const redo = (): void => {
    if (historyIndex >= history.length - 1 || !fabricCanvasRef.current) return;
    
    const nextIndex = historyIndex + 1;
    const canvas = fabricCanvasRef.current;
    const action = history[nextIndex];
    
    if (action.type === "add") {
      // If objects were added, add them back
      action.objects.forEach(obj => {
        canvas.add(obj);
      });
    } else if (action.type === "remove") {
      // If objects were removed, remove them again
      action.objects.forEach(obj => {
        const canvasObject = canvas.getObjects().find(o => o === obj);
        if (canvasObject) {
          canvas.remove(canvasObject);
        }
      });
    }
    
    canvas.renderAll();
    setHistoryIndex(nextIndex);
  };

  const saveCanvas = (): void => {
    if (!fabricCanvasRef.current) return;
    
    const dataURL = fabricCanvasRef.current.toDataURL({
      format: 'png',
      quality: 1
    });
    
    const link = document.createElement('a');
    link.download = 'canvas-drawing.png';
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-gray-100 min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              Collaborative Drawing App
            </h1>
            <div className="flex items-center bg-blue-50 p-2 rounded-md">
              <Users className="h-5 w-5 text-blue-500 mr-2" />
              <span className="text-blue-700 font-medium">{userNo} users online</span>
            </div>
          </div>
          
          {/* Tool Selection */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex space-x-2">
              <button
                className={`p-2 rounded-md flex items-center ${tool === "pencil" ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"}`}
                onClick={() => setTool("pencil")}
                title="Pencil"
              >
                <Pencil className="h-5 w-5 mr-1" />
                <span>Pencil</span>
              </button>
              <button
                className={`p-2 rounded-md flex items-center ${tool === "line" ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"}`}
                onClick={() => setTool("line")}
                title="Line"
              >
                <LineSegment className="h-5 w-5 mr-1" />
                <span>Line</span>
              </button>
              <button
                className={`p-2 rounded-md flex items-center ${tool === "rect" ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"}`}
                onClick={() => setTool("rect")}
                title="Rectangle"
              >
                <Square className="h-5 w-5 mr-1" />
                <span>Rectangle</span>
              </button>
              <button
                className={`p-2 rounded-md flex items-center ${tool === "eraser" ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"}`}
                onClick={() => setTool("eraser")}
                title="Eraser"
              >
                <Eraser className="h-5 w-5 mr-1" />
                <span>Eraser</span>
              </button>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Color Picker */}
              <div className="flex items-center">
                <Palette className="h-5 w-5 text-gray-600 mr-2" />
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-8 h-8 rounded-md border border-gray-300 cursor-pointer"
                  title="Color"
                />
              </div>
              
              {/* Size Slider */}
              <div className="flex items-center">
                <span className="text-sm text-gray-600 mr-2">Size:</span>
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={brushSize}
                  onChange={(e) => setBrushSize(parseInt(e.target.value))}
                  className="w-24"
                />
                <span className="text-sm text-gray-600 ml-2">{brushSize}px</span>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <button
                className="p-2 rounded-md bg-gray-100 text-gray-600 flex items-center disabled:opacity-50"
                onClick={undo}
                disabled={historyIndex < 0}
                title="Undo"
              >
                <Undo className="h-5 w-5 mr-1" />
                <span>Undo</span>
              </button>
              <button
                className="p-2 rounded-md bg-gray-100 text-gray-600 flex items-center disabled:opacity-50"
                onClick={redo}
                disabled={historyIndex >= history.length - 1}
                title="Redo"
              >
                <Redo className="h-5 w-5 mr-1" />
                <span>Redo</span>
              </button>
              <button
                className="p-2 rounded-md bg-red-50 text-red-600 flex items-center"
                onClick={clearCanvas}
                title="Clear Canvas"
              >
                <Trash2 className="h-5 w-5 mr-1" />
                <span>Clear</span>
              </button>
              <button
                className="p-2 rounded-md bg-green-50 text-green-600 flex items-center"
                onClick={saveCanvas}
                title="Save Canvas"
              >
                <Save className="h-5 w-5 mr-1" />
                <span>Save</span>
              </button>
            </div>
          </div>
          
          {/* Canvas Container */}
          <div className="border border-gray-300 rounded-lg overflow-hidden flex justify-center bg-white">
            <canvas ref={canvasRef} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Room;