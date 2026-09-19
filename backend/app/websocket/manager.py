"""Menedżer WebSocket: broadcast cen, newsów, produkcji."""
from fastapi import WebSocket
class Manager:
    def __init__(self):
        self.conns: list[WebSocket] = []
    async def connect(self, ws: WebSocket):
        await ws.accept()
        self.conns.append(ws)
    def drop(self, ws: WebSocket):
        if ws in self.conns: self.conns.remove(ws)
    async def broadcast(self, msg: dict):
        dead = []
        for ws in self.conns:
            try: await ws.send_json(msg)
            except Exception: dead.append(ws)
        for ws in dead: self.drop(ws)
manager = Manager()
