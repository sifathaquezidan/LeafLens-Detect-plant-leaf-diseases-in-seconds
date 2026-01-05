# LeafLens (HTML/CSS/JS + PyTorch FastAPI)

## 1) Setup backend
```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate
pip install -r requirements.txt
```

Copy your model files into `backend/models/`:
- leaf_cnn_scripted.pt
- (optional) leaf_cnn_quantized.pt

Then start server:
```bash
uvicorn server:app --reload --host 127.0.0.1 --port 8000
```

## 2) Setup labels
Edit `backend/labels.json` and replace placeholders with your real class names
in the correct order (index 0..C-1).

## 3) Run frontend
Open `frontend/index.html` with VS Code Live Server or any static server.

If you host backend somewhere else, change `API_BASE` in `frontend/app.js`.

## Notes
- Model expects 160x160 input and ImageNet normalization (mean/std).
