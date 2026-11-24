"""Taller 01: sitio web Flask para un laboratorio DevOps/SRE."""

import json
import os
from datetime import datetime, timezone
from pathlib import Path

from flask import Flask, jsonify, render_template

ROOT = Path(__file__).resolve().parent
app = Flask(__name__)


def load_profile():
    """Lee la identidad pública publicada con cada commit."""
    with (ROOT / "profile.json").open(encoding="utf-8") as profile_file:
        return json.load(profile_file)


@app.get("/")
def home():
    sha = os.environ.get("DEPLOY_SHA", "local")
    deployed_at = os.environ.get("DEPLOYED_AT", "modo desarrollo")
    return render_template(
        "index.html",
        profile=load_profile(),
        short_sha=sha[:7] if sha else "local",
        deployed_at=deployed_at,
    )


@app.get("/health")
def health():
    return jsonify(status="ok", service="taller1-devops-sre", timestamp=datetime.now(timezone.utc).isoformat())


@app.after_request
def security_headers(response):
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; script-src 'self'; style-src 'self'; "
        "img-src 'self' data:; font-src 'self'; connect-src 'self'; "
        "base-uri 'self'; form-action 'self'; frame-ancestors 'none'"
    )
    return response


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", "8000")), debug=False)
