import os
import io
import tempfile
from typing import List, Optional
from fastapi import FastAPI, File, UploadFile, Form
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import requests
import pytesseract
from PIL import Image
import fitz  # PyMuPDF
import docx
import faiss
import numpy as np
from sentence_transformers import SentenceTransformer

# Load environment variables
load_dotenv()
ADAPTLaw_URL = os.getenv("ADAPTLaw_URL")
ADAPTLaw_API_KEY = os.getenv("ADAPTLaw_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
# print(GEMINI_API_KEY)

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or ["http://127.0.0.1:5500"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Embedding model (always use small, fast model to avoid large downloads)
embedder = SentenceTransformer("all-MiniLM-L6-v2")

# In-memory FAISS index and metadata
embedding_dim = 384  # all-MiniLM-L6-v2 default; InLegalBERT is 768
index = faiss.IndexFlatL2(embedding_dim)
metadatas = []

# OCR helper

def extract_text_from_image(file: UploadFile) -> str:
    image = Image.open(file.file)
    # Try Telugu OCR first, fallback to English if nothing found
    telugu_text = pytesseract.image_to_string(image, lang="tel")
    eng_text = pytesseract.image_to_string(image, lang="eng")
    # If Telugu text is non-empty and not just gibberish, return both
    if telugu_text.strip() and len(telugu_text.strip()) > 10:
        return telugu_text.strip() + "\n" + eng_text.strip()
    return eng_text.strip()

def extract_text_from_pdf(file: UploadFile) -> str:
    text = ""
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        tmp.write(file.file.read())
        tmp.flush()
        doc = fitz.open(tmp.name)
        for page in doc:
            text += page.get_text()
    return text

def extract_text_from_docx(file: UploadFile) -> str:
    doc = docx.Document(file.file)
    return "\n".join([p.text for p in doc.paragraphs])

# Remote AdaptLLM/law-chat API call

def call_adaptllm(prompt: str) -> Optional[str]:
    if not ADAPTLaw_URL:
        # print("[DEBUG] AdaptLLM URL not set. Skipping AdaptLLM.")
        return None
    try:
        resp = requests.post(
            f"{ADAPTLaw_URL}/v1/chat/completions",
            json={"prompt": prompt},
            headers={"x-api-key": ADAPTLaw_API_KEY} if ADAPTLaw_API_KEY else None,
            timeout=30,
        )
        if resp.status_code == 200:
            print("[DEBUG] AdaptLLM responded.")
            data = resp.json()
            return data.get("response")
        else:
            print(f"[DEBUG] AdaptLLM error: {resp.status_code} {resp.text}")
    except Exception as e:
        print(f"[DEBUG] AdaptLLM exception: {e}")
    return None

# Gemini fallback

def call_gemini(prompt: str) -> Optional[str]:
    if not GEMINI_API_KEY:
        print("[DEBUG] Gemini API key not set.")
        return None
    try:
        resp = requests.post(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
            params={"key": GEMINI_API_KEY},
            json={"contents": [{"parts": [{"text": prompt}]}]},
            timeout=30,
        )
        if resp.status_code == 200:
            print("[DEBUG] Gemini responded.")
            data = resp.json()
            return data["candidates"][0]["content"]["parts"][0]["text"]
        else:
            print(f"[DEBUG] Gemini error: {resp.status_code} {resp.text}")
    except Exception as e:
        print(f"[DEBUG] Gemini exception: {e}")
    return None

# Translate Telugu to English using Gemini
def translate_telugu_to_english(text: str) -> Optional[str]:
    if not text.strip():
        return ""
    prompt = f"Translate the following Telugu text to English as accurately as possible.\nTelugu: {text}\nEnglish:"
    return call_gemini(prompt)

# File upload endpoint
@app.post("/upload")
def upload_file(file: UploadFile = File(...)):
    ext = file.filename.lower().split(".")[-1]
    text = ""
    translation = None
    if ext in ["jpg", "jpeg", "png", "bmp", "tiff"]:
        text = extract_text_from_image(file)
        print("[DEBUG] Extracted text from image.")
        # If Telugu detected, translate to English
        if text and any("\u0C00" <= c <= "\u0C7F" for c in text):
            translation = translate_telugu_to_english(text)
    elif ext == "pdf":
        text = extract_text_from_pdf(file)
        if text and any("\u0C00" <= c <= "\u0C7F" for c in text):
            translation = translate_telugu_to_english(text)
    elif ext == "docx":
        text = extract_text_from_docx(file)
        if text and any("\u0C00" <= c <= "\u0C7F" for c in text):
            translation = translate_telugu_to_english(text)
    else:
        return JSONResponse({"error": "Unsupported file type"}, status_code=400)
    # Use translation for embedding if available
    embed_text = translation if translation else text
    emb = embedder.encode([embed_text])[0]
    global embedding_dim
    if emb.shape[0] != embedding_dim:
        # Recreate index if embedding size changes
        embedding_dim = emb.shape[0]
        global index
        index = faiss.IndexFlatL2(embedding_dim)
        metadatas.clear()
    index.add(np.array([emb]).astype(np.float32))
    metadatas.append({"text": text, "filename": file.filename, "translation": translation})
    return {"message": "File processed and indexed", "text": text, "translation": translation}

# Summarize endpoint
@app.post("/summarize")
def summarize():
    if not metadatas:
        return {"summary": "No documents uploaded yet."}
    doc_text = "\n".join([m["text"] for m in metadatas])
    prompt = f"Summarize the following legal document(s):\n{doc_text}"
    response = call_adaptllm(prompt)
    if response:
        print("[DEBUG] Used AdaptLLM for summarization.")
    else:
        response = call_gemini(prompt)
        if response:
            print("[DEBUG] Used Gemini for summarization.")
    return {"summary": response or "No response from LLMs."}

# Query endpoint
@app.post("/query")
def query(question: str = Form(...)):
    if not metadatas:
        return {"answer": "No documents uploaded yet."}
    # Retrieve relevant chunk
    doc_texts = [m["text"] for m in metadatas]
    doc_embs = embedder.encode(doc_texts)
    q_emb = embedder.encode([question])[0]
    D, I = index.search(np.array([q_emb]).astype(np.float32), k=1)
    idx = int(I[0][0]) if I[0][0] != -1 else 0
    context = doc_texts[idx]
    prompt = f"Given the following legal document context, answer the question.\nContext: {context}\nQuestion: {question}"
    response = call_adaptllm(prompt)
    if response:
        print("[DEBUG] Used AdaptLLM for Q&A.")
    else:
        response = call_gemini(prompt)
        if response:
            print("[DEBUG] Used Gemini for Q&A.")
    return {"answer": response or "No response from LLMs."}
