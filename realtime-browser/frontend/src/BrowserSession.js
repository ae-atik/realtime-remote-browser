import React, { useEffect, useRef, useState } from "react";

const BrowserSession = () => {
  const wsRef = useRef(null);
  const canvasRef = useRef(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    // Connect to WebSocket at your backend endpoint
    const ws = new WebSocket("ws://127.0.0.1:8000/ws");
    ws.binaryType = "blob";
    wsRef.current = ws;

    ws.onopen = () => console.log("✅ WebSocket connected");

    ws.onmessage = async (event) => {
      // Handle JSON commands first
      if (typeof event.data === "string") {
        try {
          const msg = JSON.parse(event.data);
          if (msg.action === "clear_canvas") {
            setIsNavigating(true);
            const canvas = canvasRef.current;
            const ctx = canvas.getContext("2d");
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            return;
          } else if (msg.action === "resume") {
            setIsNavigating(false);
            return;
          } else if (msg.type === "screenshot") {
            // In case screenshots come as JSON (fallback)
            const img = new Image();
            img.src = `data:image/png;base64,${msg.data}`;
            img.onload = () => {
              const canvas = canvasRef.current;
              const ctx = canvas.getContext("2d");
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            };
            return;
          }
        } catch (err) {
          console.error("Error parsing message:", err);
        }
      }
      if (isNavigating) return; // Do not process frame blobs while navigating

      // Process Blob frames (screenshots)
      if (event.data instanceof Blob) {
        const blob = event.data;
        if (ws.readyState !== WebSocket.OPEN) return;
        const bitmap = await createImageBitmap(blob);
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
        bitmap.close();
      }
    };

    ws.onerror = (err) => console.error("❌ WebSocket error:", err);

    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, [isNavigating]);

  const sendAction = (actionObj) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(JSON.stringify(actionObj));
  };

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    // Scale coordinates to 1024x768 as per backend viewport
    const x = ((e.clientX - rect.left) / rect.width) * 1024;
    const y = ((e.clientY - rect.top) / rect.height) * 768;
    sendAction({ type: "click", x, y });
  };

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 1024;
    const y = ((e.clientY - rect.top) / rect.height) * 768;
    sendAction({ type: "mousemove", x, y });
  };

  const handleKeyDown = (e) => {
    sendAction({ type: "keydown", key: e.key });
  };

  const handleKeyUp = (e) => {
    sendAction({ type: "keyup", key: e.key });
  };

  const handleScroll = (e) => {
    const dx = e.deltaX;
    const dy = e.deltaY;
    sendAction({ type: "scroll", dx, dy });
  };

  const handleClose = () => {
    sendAction({ type: "close" });
    if (wsRef.current) {
      wsRef.current.close();
    }
    setClosed(true);
  };

  return (
    <div style={{ textAlign: "center",position: "relative" }}>
      <h2 style={{ marginBottom: "0px"}}>Interactive Browser Session</h2>
      {closed ? (
        <p style={{ fontSize: "1.5rem", color: "gray" }}>Browser Closed</p>
      ) : (
        <>
          <button
            onClick={handleClose}
            style={{
              margin: "1%",
              left: "77%",
              position:"relative",  
              paddingRight: "1px",
              display: "flex",
              alignItems: "center",
              // gap: "6px",
              backgroundColor: "#f8f9fa",
              border: "2px solid red",
              borderRadius: "50%",
              cursor: "pointer",
            }}
          >
            <svg
              width="40"
              height="40"
              
              viewBox="0 0 18 18"
              fill="red"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
            </svg>
            {/* Close Remote Browser */}
          </button>

          <canvas
            ref={canvasRef}
            width={1200}
            height={700}
            style={{
              width: "100%",
              maxWidth: "800px",
              border: "2px solid green",
              margin: "0 auto",
              display: "block",
            }}
            onClick={handleCanvasClick}
            onMouseMove={handleMouseMove}
            onKeyDown={handleKeyDown}
            onKeyUp={handleKeyUp}
            onWheel={handleScroll}
            tabIndex="0"
          />
        </>
      )}
    </div>
  );
};

export default BrowserSession;
