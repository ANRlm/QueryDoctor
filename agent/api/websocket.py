from fastapi import WebSocket, WebSocketDisconnect
from typing import List
import json


class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)


manager = ConnectionManager()


async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            await manager.send_message(f"Received: {data}", websocket)
    except WebSocketDisconnect:
        manager.disconnect(websocket)


async def agent_websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)

            if message.get("type") == "diagnose":
                query = message.get("query", "")
                result = await process_diagnose(query)
                await manager.send_message(json.dumps(result), websocket)
            else:
                await manager.send_message(
                    json.dumps({"type": "echo", "data": data}), websocket
                )
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        await manager.send_message(
            json.dumps({"type": "error", "message": str(e)}), websocket
        )


async def process_diagnose(query: str):
    from engine.graph import compiled_graph

    init_state = {
        "queries": [query],
        "analyses": [],
        "diagnosis": None,
        "suggestions": [],
    }

    result = {}
    async for chunk in compiled_graph.astream(init_state):
        result.update(chunk)

    return {"type": "diagnose_result", "data": result}
