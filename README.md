# realtime-remote-browser

This project enables **real-time remote browser interaction** using **FastAPI** (backend) and **React** (frontend). The backend launches a **Playwright-controlled Chromium browser**, captures screenshots, and streams them to the frontend via **WebSockets**. The frontend displays the browser session and allows user interaction (clicks, keyboard input, scrolling, navigation).

## **Features**
- Live streaming of a remote browser inside a React application.
- Supports **mouse clicks, movement, scrolling and keyboard input**.
- Allows navigation to new pages.
- Can **close the browser** remotely.

---

## **1. Installation Instructions**
Follow these steps to set up the project locally.

### **Prerequisites**
- **Python 3.8+** (For the backend)
- **Node.js 16+** (For the frontend)
- **Git** (To clone the repository)
- **Playwright dependencies** (Installed via Playwright)

---

## **2. Clone the Repository**
```sh
git clone https://github.com/ae-atik/realtime-remote-browser.git
cd realtime-remote-browser
```

---

## **3. Backend Setup (FastAPI + Playwright)**
1. Navigate to the backend folder:
   ```sh
   cd backend
   ```

2. Create a virtual environment (optional but recommended):
   ```sh
   python -m venv venv
   source venv/bin/activate  # On Windows use: venv\Scripts\activate
   ```

3. Install the required dependencies:
   ```sh
   pip install -r requirements.txt
   ```

4. Install Playwright and the Chromium browser:
   ```sh
   playwright install
   ```

5. If running on **Windows**, ensure **asyncio** works properly by setting this policy **before running the backend**:
   ```python
   import asyncio
   asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
   ```

6. Run the backend server:
   ```sh
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```

---

## **4. Frontend Setup (React + WebSockets)**
1. Open a new terminal and navigate to the frontend directory:
   ```sh
   cd ../frontend
   ```

2. Install dependencies:
   ```sh
   npm install
   ```

3. Start the React application:
   ```sh
   npm start
   ```

The frontend will be available at `http://localhost:3000/`.

---

## **5. Usage**
1. Open `http://localhost:3000` in your browser.
2. The **remote browser session** should appear inside the webpage.
3. You can **click, type, scroll and navigate**.
4. To **close the remote browser**, click the "Close Remote Browser" button.

---

## **6. Deployment**
### **Deploying the Frontend**
- **GitHub Pages:**
  ```sh
  npm run build
  npm install -g gh-pages
  gh-pages -d build
  ```
- **Vercel / Netlify:** Connect the GitHub repository and deploy.

### **Deploying the Backend**
- **Render / Railway / Heroku:** Push the backend to a free cloud provider and expose an API.

---

## **7. Troubleshooting**
### **Windows Backend Not Running**
- If you get `NotImplementedError: Cannot use asyncio subprocess on Windows`, add this to `main.py` before running:
  ```python
  import asyncio
  asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
  ```

### **Playwright Browser Not Launching**
- Run:
  ```sh
  playwright install
  ```
- If running in **WSL**, install missing dependencies **(RECOMMENED FOR BACKEND)**:
  ```sh
  sudo apt update && sudo apt install -y libnss3 libatk1.0-0 libx11-xcb1
  ```

### **Frontend WebSocket Not Connecting**
- Ensure the backend is running at `http://localhost:8000/` before launching the frontend.
