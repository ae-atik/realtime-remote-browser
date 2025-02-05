from fastapi import FastAPI, WebSocket
from playwright.async_api import async_playwright
import asyncio
import base64
import json

app = FastAPI()

async def capture_screenshot(page):
    try:
        screenshot = await page.screenshot()
        return base64.b64encode(screenshot).decode()
    except Exception as e:
        print("Error capturing screenshot:", e)
        return None

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    navigating = False

    async with async_playwright() as p:
        # Launch browser (headless=False for debugging; change to True for production)
        browser = await p.chromium.launch(headless=True)
        # Change viewport dimensions to 1920x1080
        context = await browser.new_context(viewport={"width": 1920, "height": 1080})
        page = await browser.new_page()
        await page.goto("https://www.startech.com.bd")

        async def send_screenshots():
            while True:
                if not navigating:
                    screenshot_b64 = await capture_screenshot(page)
                    if screenshot_b64:
                        msg = json.dumps({"type": "screenshot", "data": screenshot_b64})
                        try:
                            await websocket.send_text(msg)
                        except Exception as send_err:
                            print("Error sending screenshot:", send_err)
                await asyncio.sleep(0.05)

        screenshot_task = asyncio.create_task(send_screenshots())

        # Listen for user actions
        try:
            while True:
                data = await websocket.receive_text()
                action = json.loads(data)
                if action.get("type") == "navigate":
                    navigating = True
                    # Tell the frontend to clear the canvas
                    await websocket.send_text(json.dumps({"action": "clear_canvas"}))
                    try:
                        await page.goto(action["url"], wait_until="networkidle")
                    except Exception as nav_err:
                        print("Navigation error:", nav_err)
                    navigating = False
                    # Resume sending frames after navigation
                    await websocket.send_text(json.dumps({"action": "resume"}))
                elif action.get("type") == "mousemove":
                    await page.mouse.move(action["x"], action["y"])
                elif action.get("type") == "click":
                    await page.mouse.click(action["x"], action["y"])
                elif action.get("type") == "scroll":
                    dx = action.get("dx", 0)
                    dy = action.get("dy", 0)
                    await page.evaluate(f"window.scrollBy({dx}, {dy})")
                elif action.get("type") == "keydown":
                    await page.keyboard.down(action["key"])
                elif action.get("type") == "keyup":
                    await page.keyboard.up(action["key"])
                elif action.get("type") == "close":
                    break

        except Exception as e:
            print("WebSocket error:", e)
        finally:
            screenshot_task.cancel()
            await browser.close()
