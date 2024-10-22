import { ColorSwatch, Group, Slider } from "@mantine/core";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import Draggable from "react-draggable";
import { SWATCHES } from "@/constants";
import { Loader } from "@/components/Loader";

interface GeneratedResult {
  expression: string;
  answer: string;
}

interface Response {
  expr: string;
  result: string;
  assign: boolean;
}

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("rgb(0, 0, 0)");
  const [reset, setReset] = useState(false);
  const [lineWidth, setLineWidth] = useState(3); // Default line width
  const [loading, setLoading] = useState(false);
  const [dictOfVars, setDictOfVars] = useState({});
  const [result, setResult] = useState<GeneratedResult>();
  const [latexPosition, setLatexPosition] = useState({ x: 10, y: 200 });
  const [latexExpression, setLatexExpression] = useState<Array<string>>([]);

  useEffect(() => {
    if (latexExpression.length > 0 && window.MathJax) {
      setTimeout(() => {
        window.MathJax.Hub.Queue(["Typeset", window.MathJax.Hub]);
      }, 0);
    }
  }, [latexExpression]);

  useEffect(() => {
    if (result) {
      renderLatexToCanvas(result.expression, result.answer);
    }
  }, [result]);

  useEffect(() => {
    if (reset) {
      resetCanvas();
      setLatexExpression([]);
      setResult(undefined);
      setDictOfVars({});
      setReset(false);
    }
  }, [reset]);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight - canvas.offsetTop;
        ctx.lineCap = "round";
        ctx.lineWidth = lineWidth; // Set line width dynamically based on slider
        // Set initial black background
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
    const script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.9/MathJax.js?config=TeX-MML-AM_CHTML";
    script.async = true;
    document.head.appendChild(script);

    script.onload = () => {
      window.MathJax.Hub.Config({
        tex2jax: {
          inlineMath: [
            ["$", "$"],
            ["\\(", "\\)"],
          ],
        },
      });
    };

    return () => {
      document.head.removeChild(script);
    };
  }, [lineWidth]);

  const renderLatexToCanvas = (expression: string, answer: string) => {
    const latex = `\\(\\LARGE{${expression} = ${answer}}\\)`;
    setLatexExpression([...latexExpression, latex]);

    // Clear the main canvas
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  const resetCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "black"; // Reset to black background
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      const rect = canvas.getBoundingClientRect(); // Get canvas position relative to window
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      ctx!.beginPath();
      ctx!.moveTo(x, y); // Start drawing from the correct position
      setIsDrawing(true);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      const rect = canvas.getBoundingClientRect(); // Get canvas position relative to window
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      ctx!.strokeStyle = color;
      ctx!.lineWidth = lineWidth; // Apply line width to drawing
      ctx!.lineTo(x, y);
      ctx!.stroke();
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const runRoute = async () => {
    setLoading(true);
    const canvas = canvasRef.current;

    if (canvas) {
      const response = await axios({
        method: "post",
        url: `${import.meta.env.VITE_API_URL}calculate`,
        data: {
          image: canvas.toDataURL("image/png"),
          dict_of_vars: dictOfVars,
        },
      });

      const resp = await response.data;
      console.log("Response", resp);
      resp.data.forEach((data: Response) => {
        if (data.assign === true) {
          setDictOfVars({
            ...dictOfVars,
            [data.expr]: data.result,
          });
        }
      });
      setLoading(false);
    }
  };

  return (
    <>
      {/* Slider placed outside of Draggable */}
      <div className="absolute top-6 left-6 z-30 p-4 bg-gray-700 rounded-lg shadow-lg max-w-xs text-white">
        <Slider
          label="Line Width"
          value={lineWidth}
          onChange={setLineWidth}
          min={1}
          max={20} // Increased range for larger stroke options
          step={1}
          size="lg"
          className="w-full my-2"
          styles={{
            thumb: { height: 16, width: 16, backgroundColor: "blue" },
            track: { height: 10, width: 200 },
          }}
        />
      </div>

      <Draggable>
        <div className="absolute top-2 right-2 z-20 p-6 bg-gray-900 rounded-lg shadow-lg max-w-xs">
          <div className="flex flex-col space-y-4 items-center">
            <Button
              onClick={resetCanvas}
              className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-full py-2 px-4 shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95"
            >
              Reset
            </Button>
            <Group spacing="sm" className="flex justify-center mt-2">
              {SWATCHES.map((swatch) => (
                <ColorSwatch
                  key={swatch}
                  color={swatch}
                  onClick={() => setColor(swatch)}
                  style={{
                    cursor: "pointer",
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    border: "2px solid white",
                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                    transition: "transform 0.2s ease-in-out",
                  }}
                  className="hover:scale-110 active:scale-95"
                />
              ))}
            </Group>
            <Button
              onClick={runRoute}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-full py-2 px-4 shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 mt-2"
              disabled={loading}
            >
              {loading ? <Loader /> : "Calculate"}
            </Button>
          </div>
        </div>
      </Draggable>

      <canvas
        ref={canvasRef}
        id="canvas"
        className="absolute top-0 left-0 w-full h-full border border-gray-700 shadow-lg"
        style={{
          backgroundColor: "#1c1c1e", // Dark background for the canvas
          cursor: "crosshair", // Crosshair cursor for precision drawing
        }}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseOut={stopDrawing}
      />

      {latexExpression &&
        latexExpression.map((latex, index) => (
          <Draggable
            key={index}
            defaultPosition={latexPosition}
            onStop={(e, data) => setLatexPosition({ x: data.x, y: data.y })}
          >
            <div className="absolute p-2 text-white rounded shadow-md bg-black bg-opacity-70">
              <div className="latex-content">{latex}</div>
            </div>
          </Draggable>
        ))}
    </>
  );
}
