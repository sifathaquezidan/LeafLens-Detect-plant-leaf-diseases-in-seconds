const API_BASE = "http://127.0.0.1:8000"; // change if hosting elsewhere

const el = (id) => document.getElementById(id);

const fileInput = el("fileInput");
const previewImg = el("previewImg");
const previewPlaceholder = el("previewPlaceholder");
const analyzeBtn = el("analyzeBtn");
const clearBtn = el("clearBtn");
const diseaseName = el("diseaseName");
const confidence = el("confidence");
const topk = el("topk");
const meterBar = el("meterBar");
const apiStatus = el("apiStatus");

const openCameraBtn = el("openCameraBtn");
const cameraCard = el("cameraCard");
const closeCameraBtn = el("closeCameraBtn");
const captureBtn = el("captureBtn");
const video = el("video");
const canvas = el("canvas");

const sampleBtn = el("sampleBtn");

let currentBlob = null;
let stream = null;

function setStatus(ok, msg){
  const dot = apiStatus.querySelector(".dot");
  const txt = apiStatus.querySelector(".txt");
  txt.textContent = msg;
  dot.style.background = ok ? "var(--accent)" : "var(--warn)";
  dot.style.boxShadow = ok ? "0 0 0 4px rgba(124,255,124,.16)" : "0 0 0 4px rgba(255,218,106,.16)";
}

async function ping(){
  try{
    const r = await fetch(`${API_BASE}/health`);
    if(!r.ok) throw new Error("bad status");
    setStatus(true, "Server connected");
  }catch(e){
    setStatus(false, "Server offline (start backend)");
  }
}
ping();

function setPreviewFromBlob(blob){
  currentBlob = blob;
  const url = URL.createObjectURL(blob);
  previewImg.src = url;
  previewImg.style.display = "block";
  previewPlaceholder.hidden = true;
  analyzeBtn.disabled = false;
  clearBtn.disabled = false;
  resetResult();
}

function resetResult(){
  diseaseName.textContent = "—";
  confidence.textContent = "—";
  topk.textContent = "—";
  meterBar.style.width = "0%";
}

fileInput.addEventListener("change", () => {
  const f = fileInput.files?.[0];
  if(!f) return;
  setPreviewFromBlob(f);
});

clearBtn.addEventListener("click", () => {
  currentBlob = null;
  previewImg.removeAttribute("src");
  previewImg.style.display = "none";
  previewPlaceholder.hidden = false;
  analyzeBtn.disabled = true;
  clearBtn.disabled = true;
  resetResult();
  fileInput.value = "";
});

analyzeBtn.addEventListener("click", async () => {
  if(!currentBlob) return;

  analyzeBtn.disabled = true;
  analyzeBtn.textContent = "Analyzing…";
  resetResult();

  try{
    const fd = new FormData();
    fd.append("image", currentBlob, "leaf.jpg");

    const r = await fetch(`${API_BASE}/predict`, { method:"POST", body: fd });
    if(!r.ok){
      const t = await r.text();
      throw new Error(t || "Prediction failed");
    }
    const data = await r.json();

    diseaseName.textContent = data.top1?.label ?? "Unknown";
    const conf = (data.top1?.prob ?? 0) * 100;
    confidence.textContent = `${conf.toFixed(2)}%`;
    meterBar.style.width = `${Math.max(0, Math.min(100, conf))}%`;

    topk.innerHTML = "";
    (data.topk ?? []).forEach((p) => {
      const row = document.createElement("div");
      const left = document.createElement("span");
      const right = document.createElement("span");
      left.textContent = p.label;
      right.textContent = `${(p.prob*100).toFixed(2)}%`;
      row.appendChild(left);
      row.appendChild(right);
      topk.appendChild(row);
    });

  }catch(e){
    diseaseName.textContent = "Error";
    confidence.textContent = "—";
    topk.textContent = (e?.message || "Could not analyze").slice(0, 200);
    meterBar.style.width = "0%";
  }finally{
    analyzeBtn.disabled = false;
    analyzeBtn.textContent = "Analyze";
  }
});

// ---- Camera flow (mobile-friendly) ----
openCameraBtn.addEventListener("click", async () => {
  cameraCard.hidden = false;

  try{
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
      audio: false
    });
    video.srcObject = stream;
    await video.play();
  }catch(e){
    alert("Camera access failed. Please allow camera permission or use upload.");
    cameraCard.hidden = true;
  }
});

closeCameraBtn.addEventListener("click", () => {
  stopCamera();
  cameraCard.hidden = true;
});

function stopCamera(){
  if(stream){
    stream.getTracks().forEach(t => t.stop());
    stream = null;
  }
  video.srcObject = null;
}

captureBtn.addEventListener("click", () => {
  if(!video.videoWidth) return;
  const w = video.videoWidth;
  const h = video.videoHeight;

  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(video, 0, 0, w, h);

  canvas.toBlob((blob) => {
    if(blob){
      setPreviewFromBlob(blob);
      stopCamera();
      cameraCard.hidden = true;
    }
  }, "image/jpeg", 0.95);
});

// ---- Demo sample (no backend needed to show UI) ----
sampleBtn.addEventListener("click", async () => {
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="800" height="600">
    <defs>
      <linearGradient id="g" x1="0" x2="1">
        <stop offset="0" stop-color="#2CE6A6"/>
        <stop offset="1" stop-color="#7CFF7C"/>
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="#0a2414"/>
    <path d="M450 80 C260 120 200 320 240 450 C300 580 520 580 610 440 C720 280 630 110 450 80 Z" fill="url(#g)" opacity="0.95"/>
    <path d="M450 110 C320 150 290 320 320 420 C360 520 520 520 580 420 C650 290 570 140 450 110 Z" fill="rgba(0,0,0,0.12)"/>
    <circle cx="470" cy="290" r="18" fill="#6b2b2b" opacity="0.75"/>
    <circle cx="420" cy="320" r="14" fill="#6b2b2b" opacity="0.75"/>
    <circle cx="520" cy="340" r="12" fill="#6b2b2b" opacity="0.75"/>
    <text x="40" y="560" fill="rgba(255,255,255,0.65)" font-family="Plus Jakarta Sans, Arial" font-size="22">Demo sample leaf (for UI preview)</text>
  </svg>`;
  const blob = new Blob([svg], {type:"image/svg+xml"});
  setPreviewFromBlob(blob);
});
