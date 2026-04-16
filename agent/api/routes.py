from fastapi import FastAPI, WebSocket, Depends, Body
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel

from agent.api.auth import login, register_user, get_current_user, TokenData
from agent.api.rag_api import router as rag_router
from agent.api.websocket import websocket_endpoint, agent_websocket_endpoint
from agent.graph.graph import compiled_graph

app = FastAPI(title="QueryDoctor Agent")

app.include_router(rag_router)


class DiagnoseRequest(BaseModel):
    query: str


@app.get("/health")
async def health_check():
    return JSONResponse({"status": "ok"})


@app.get("/")
async def root():
    return {"message": "QueryDoctor Agent"}


@app.post("/diagnose")
async def diagnose(request: DiagnoseRequest):
    async def event_stream():
        init_state = {
            "queries": [request.query],
            "analyses": [],
            "diagnosis": None,
            "suggestions": [],
        }

        try:
            async for chunk in compiled_graph.astream(init_state, version="v2"):
                yield f"data: {json.dumps(chunk)}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'error': str(e)})}\n\n"

        yield 'data: {"type": "done"}\n\n'

    return StreamingResponse(event_stream(), media_type="text/event-stream")


@app.post("/auth/register")
async def register(username: str, password: str, email: str = None):
    user = register_user(username, password, email)
    return {"user_id": user.user_id, "username": user.username}


@app.post("/auth/login")
async def auth_login(username: str, password: str):
    return login(username, password)


@app.get("/auth/me")
async def get_me(current_user: TokenData = Depends(get_current_user)):
    return {"username": current_user.username}


@app.websocket("/ws")
async def ws_endpoint(websocket: WebSocket):
    await websocket_endpoint(websocket)


@app.websocket("/ws/agent")
async def ws_agent_endpoint(websocket: WebSocket):
    await agent_websocket_endpoint(websocket)


import json
