import json
from contextlib import asynccontextmanager

from fastapi import FastAPI, WebSocket, Depends
from fastapi.responses import JSONResponse, StreamingResponse
from typing import Optional
from pydantic import BaseModel

from api.auth import login, register_user, get_current_user, TokenData
from api.rag_api import router as rag_router
from api.websocket import websocket_endpoint, agent_websocket_endpoint
from engine.graph import compiled_graph


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        from db.users import init_users_table
        init_users_table()
    except Exception:
        pass
    yield


app = FastAPI(title="QueryDoctor Agent", lifespan=lifespan)

app.include_router(rag_router)


class DbConfig(BaseModel):
    host: Optional[str] = None
    port: Optional[int] = None
    user: Optional[str] = None
    password: Optional[str] = None
    database: Optional[str] = None


class DiagnoseRequest(BaseModel):
    query: str
    db_type: str = "postgresql"
    db_config: Optional[DbConfig] = None


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
            "db_type": request.db_type,
            "db_config": request.db_config.model_dump() if request.db_config else None,
            "analyses": [],
            "diagnosis": None,
            "suggestions": [],
        }

        try:
            async for chunk in compiled_graph.astream(init_state):
                yield f"data: {json.dumps(chunk)}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'error': str(e)})}\n\n"

        yield 'data: {"type": "done"}\n\n'

    return StreamingResponse(event_stream(), media_type="text/event-stream")


@app.post("/auth/register")
async def register(username: str, password: str):
    user = register_user(username, password)
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
