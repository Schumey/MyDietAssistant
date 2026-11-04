"""Minimal fake Home Assistant: frontend page with hassTokens, the WebSocket auth + supervisor/api calls, and an ingress page."""
import json
from fastapi import FastAPI, WebSocket
from fastapi.responses import HTMLResponse, Response

app = FastAPI()
LOG = []

@app.get("/")
def root():
    return HTMLResponse("<html><body><h1>FAKE HA</h1><script>"
        "setTimeout(function(){localStorage.setItem('hassTokens', JSON.stringify({access_token:'tok',expires:Date.now()+1e6}));},1500);"
        "</script></body></html>")

@app.get("/api/hassio_ingress/TOKEN123/")
def ingress():
    return HTMLResponse("<html><body><h1>MDA INGRESS OK</h1></body></html>")

@app.get("/log")
def log():
    return LOG

@app.websocket("/api/websocket")
async def ws(w: WebSocket):
    await w.accept()
    await w.send_json({"type": "auth_required"})
    m = await w.receive_json()
    if m.get("access_token") != "tok":
        await w.send_json({"type": "auth_invalid"}); return
    await w.send_json({"type": "auth_ok"})
    while True:
        m = await w.receive_json()
        LOG.append(m)
        if m["endpoint"] == "/ingress/session":
            await w.send_json({"id": m["id"], "type": "result", "success": True, "result": {"session": "SESS"}})
        else:
            await w.send_json({"id": m["id"], "type": "result", "success": True, "result": {"ingress_url": "/api/hassio_ingress/TOKEN123/"}})
