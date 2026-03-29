#!/usr/bin/env python3
"""
Simple static file server for agentic-os frontend.
Strips the /agentic-os basePath prefix and serves files from frontend/dist/.
Falls back to index.html for SPA routes (non-asset paths).
"""
import os
import sys
from http.server import HTTPServer, BaseHTTPRequestHandler
from pathlib import Path
import mimetypes

DIST_DIR = Path(__file__).parent / "frontend" / "dist"
BASE_PATH = "/agentic-os"
PORT = 5173


class SPAHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        path = self.path.split("?")[0]  # strip query string

        # Strip basePath prefix
        if path.startswith(BASE_PATH):
            path = path[len(BASE_PATH):]
        if not path or path == "/":
            path = "/index.html"

        file_path = DIST_DIR / path.lstrip("/")

        # For non-asset paths (SPA routes), serve index.html
        if not file_path.exists() and not path.startswith("/assets/"):
            file_path = DIST_DIR / "index.html"

        if not file_path.exists():
            self.send_response(404)
            self.end_headers()
            return

        mime_type, _ = mimetypes.guess_type(str(file_path))
        if mime_type is None:
            mime_type = "application/octet-stream"

        content = file_path.read_bytes()
        self.send_response(200)
        self.send_header("Content-Type", mime_type)
        self.send_header("Content-Length", str(len(content)))
        self.send_header("Cache-Control", "no-cache")
        self.end_headers()
        self.wfile.write(content)

    def log_message(self, format, *args):
        print(f"[{self.address_string()}] {format % args}", flush=True)


if __name__ == "__main__":
    server = HTTPServer(("0.0.0.0", PORT), SPAHandler)
    print(f"Serving agentic-os frontend at http://0.0.0.0:{PORT}{BASE_PATH}/", flush=True)
    server.serve_forever()
