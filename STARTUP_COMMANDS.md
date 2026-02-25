# LexiLearn AI - Startup Commands

## 🚀 How to Start the Project

### **Backend (Terminal 1):**
```powershell
cd C:\Users\diksh\Desktop\Lexilearn_AI\backend
..\.venv\Scripts\Activate.ps1
uvicorn main:app --reload
```c

### **Frontend (Terminal 2):**
```powershell
cd C:\Users\diksh\Desktop\Lexilearn_AI\frontend
npm run dev
```

---

## ✅ Quick Checklist:
1. Open two PowerShell terminals
2. In terminal 1: Navigate to backend → Activate venv → Start uvicorn
3. In terminal 2: Navigate to frontend → Start npm dev server
4. Access frontend at `http://localhost:5173`
5. Backend API runs at `http://127.0.0.1:8000`

---

## 🔍 Verify Virtual Environment is Active:
Your prompt should show `(.venv)` when the virtual environment is activated.

To check which Python is being used:
```powershell
python -c "import sys; print(sys.executable)"
```
Should show: `C:\Users\diksh\Desktop\Lexilearn_AI\.venv\Scripts\python.exe`
