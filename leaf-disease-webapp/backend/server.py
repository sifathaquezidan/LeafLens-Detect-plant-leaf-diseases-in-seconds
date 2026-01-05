import io
import json
from typing import List, Dict, Any

import numpy as np
from PIL import Image
import torch
import torch.nn.functional as F
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

# ---- Config ----
MODEL_PATH = "./models/leaf_cnn_scripted.pt"   # or leaf_cnn_quantized.pt
LABELS_PATH = "./labels.json"
IMAGE_SIZE = 160

IMAGENET_MEAN = np.array([0.485, 0.456, 0.406], dtype=np.float32)
IMAGENET_STD  = np.array([0.229, 0.224, 0.225], dtype=np.float32)

# ---- Load model ----
model = torch.jit.load(MODEL_PATH, map_location="cpu")
model.eval()

with open(LABELS_PATH, "r", encoding="utf-8") as f:
    LABELS = json.load(f)

app = FastAPI(title="LeafLens API", version="1.0")

# Allow frontend to call backend from a different port
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def preprocess_image(pil_img: Image.Image) -> torch.Tensor:
    """Resize to 160x160, normalize with ImageNet mean/std, return 1x3xHxW."""
    img = pil_img.convert("RGB").resize((IMAGE_SIZE, IMAGE_SIZE))
    arr = np.asarray(img).astype(np.float32) / 255.0  # HWC, 0..1
    arr = (arr - IMAGENET_MEAN) / IMAGENET_STD
    arr = np.transpose(arr, (2, 0, 1))  # CHW
    x = torch.from_numpy(arr).unsqueeze(0)  # 1x3xHxW
    return x

def topk_from_logits(logits: torch.Tensor, k: int = 3) -> Dict[str, Any]:
    probs = F.softmax(logits, dim=1).squeeze(0)  # [C]
    top_probs, top_idx = torch.topk(probs, k=min(k, probs.numel()))
    result = []
    for p, i in zip(top_probs.tolist(), top_idx.tolist()):
        label = LABELS[i] if i < len(LABELS) else f"class_{i}"
        result.append({"index": int(i), "label": label, "prob": float(p)})
    return {
        "top1": result[0] if result else None,
        "topk": result
    }

@app.get("/health")
def health():
    return {"ok": True}

@app.post("/predict")
async def predict(image: UploadFile = File(...)):
    data = await image.read()
    pil = Image.open(io.BytesIO(data))
    x = preprocess_image(pil)
    with torch.no_grad():
        logits = model(x)
    out = topk_from_logits(logits, k=3)
    return out
