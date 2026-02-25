# Pyrefly Language Server Stack Overflow Fix

## Problem
The Pyrefly language server is crashing with stack overflow errors when analyzing your LexiLearn AI project.

## Solutions Applied

### 1. ✅ Created `.pyreignore` file
Excludes unnecessary directories from analysis to reduce load.

### 2. Additional Steps to Try

#### A. Reload Your Editor
1. Close all Python files
2. Reload/restart your editor (VS Code, etc.)
3. The language server should restart cleanly

#### B. Reduce Workspace Scope (If still crashing)
Open only the `backend` folder as your workspace instead of the entire `Lexilearn_AI` folder:
- File → Open Folder → Select `c:\Users\diksh\Desktop\Lexilearn_AI\backend`

#### C. Disable Pyrefly Temporarily (Last Resort)
If you need to work immediately:
1. Open Settings (Ctrl+,)
2. Search for "Pyrefly"
3. Disable the extension temporarily
4. Use basic Python language support instead

#### D. Check for Circular Imports
Run this command to detect circular dependencies:
```bash
cd c:\Users\diksh\Desktop\Lexilearn_AI\backend
python -m pip install pycycle
pycycle --here
```

## Why This Happened
- **Complex dependencies**: LangChain, Whisper, Supabase create deep type hierarchies
- **Large workspace**: Frontend + Backend together
- **AI agent code**: Recursive type inference in LangGraph agents

## Prevention
- Keep `.pyreignore` updated
- Consider splitting frontend/backend into separate workspaces
- Use explicit type hints to help the language server
