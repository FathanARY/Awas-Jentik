"""Minimal SQLite audit log without PII or binary photo contents."""

from __future__ import annotations

import json
import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


class AuditRepository:
    def __init__(self, database_path: Path):
        database_path.parent.mkdir(parents=True, exist_ok=True)
        self._database_path = database_path
        with self._connect() as connection:
            connection.execute(
                """
                CREATE TABLE IF NOT EXISTS assessment_audit (
                    request_id TEXT PRIMARY KEY,
                    created_at TEXT NOT NULL,
                    grid_id TEXT NOT NULL,
                    model_version TEXT NOT NULL,
                    payload_json TEXT NOT NULL,
                    response_json TEXT NOT NULL
                )
                """
            )

    def _connect(self):
        return sqlite3.connect(self._database_path)

    def log(
        self,
        request_id: str,
        grid_id: str,
        model_version: str,
        payload: dict[str, Any],
        response: dict[str, Any],
    ) -> None:
        with self._connect() as connection:
            connection.execute(
                """
                INSERT INTO assessment_audit
                (request_id, created_at, grid_id, model_version, payload_json, response_json)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (
                    request_id,
                    datetime.now(timezone.utc).isoformat(),
                    grid_id,
                    model_version,
                    json.dumps(payload, default=str, ensure_ascii=False),
                    json.dumps(response, default=str, ensure_ascii=False),
                ),
            )
