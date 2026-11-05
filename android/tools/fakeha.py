"""Minimal fake Home Assistant: frontend page with hassTokens, the WebSocket auth + supervisor/api calls, and an ingress page."""
import os
from fastapi import FastAPI, Request, WebSocket
from fastapi.responses import HTMLResponse, Response

app = FastAPI()
LOG = []

@app.get("/")
def root():
    return HTMLResponse("<html><body><h1>FAKE HA</h1><script>"
        "setTimeout(function(){localStorage.setItem('hassTokens', JSON.stringify({access_token:'tok',expires:Date.now()+1e6}));},1500);"
        "</script></body></html>")

# With MDA_UPSTREAM=http://127.0.0.1:8099 the ingress path forwards to a locally running add-on (real interface);
# without it a placeholder page is served.
UPSTREAM = os.environ.get("MDA_UPSTREAM", "").rstrip("/")

@app.api_route("/api/hassio_ingress/TOKEN123/{path:path}", methods=["GET", "POST", "PUT", "PATCH", "DELETE"])
async def ingress(path: str, request: Request):
    if not UPSTREAM:
        return HTMLResponse("<html><body><h1>MDA INGRESS OK</h1></body></html>")
    import httpx
    headers = {k: v for k, v in request.headers.items() if k.lower() in ("content-type", "accept", "accept-language")}
    async with httpx.AsyncClient() as c:
        r = await c.request(request.method, f"{UPSTREAM}/{path}", params=request.query_params, content=await request.body(), headers=headers)
    keep = {k: v for k, v in r.headers.items() if k.lower() in ("content-type", "cache-control", "content-disposition")}
    return Response(r.content, status_code=r.status_code, headers=keep)

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
