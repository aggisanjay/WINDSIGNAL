import json
import os
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional
from app.config import settings

class FileCache:
    def __init__(self, cache_dir: Optional[Path] = None):
        self.cache_dir = cache_dir or settings.CACHE_DIR
        self.cache_dir.mkdir(parents=True, exist_ok=True)

    def _get_path(self, key: str) -> Path:
        # Sanitize key for filesystem
        safe_key = "".join(c if c.isalnum() or c in ("-", "_", ".") else "_" for c in key)
        return self.cache_dir / f"{safe_key}.json"

    def get(self, key: str, max_age_seconds: Optional[float] = None) -> Optional[Any]:
        path = self._get_path(key)
        if not path.exists():
            return None
        
        try:
            stat = path.stat()
            age = time.time() - stat.st_mtime
            if max_age_seconds is not None and age > max_age_seconds:
                return None
            
            with open(path, "r", encoding="utf-8") as f:
                data = json.load(f)
            return data
        except Exception:
            return None

    def set(self, key: str, data: Any) -> bool:
        path = self._get_path(key)
        temp_path = path.with_suffix(".tmp")
        try:
            with open(temp_path, "w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False)
            temp_path.replace(path)
            return True
        except Exception as e:
            if temp_path.exists():
                try:
                    temp_path.unlink()
                except Exception:
                    pass
            return False

    def get_metadata(self, key: str) -> Optional[Dict[str, Any]]:
        path = self._get_path(key)
        if not path.exists():
            return None
        stat = path.stat()
        mtime_dt = datetime.fromtimestamp(stat.st_mtime, tz=timezone.utc)
        age_seconds = time.time() - stat.st_mtime
        return {
            "key": key,
            "path": str(path),
            "size_bytes": stat.st_size,
            "last_modified": mtime_dt.isoformat(),
            "age_seconds": round(age_seconds, 1),
            "age_minutes": round(age_seconds / 60, 1),
        }

    def list_entries(self) -> List[Dict[str, Any]]:
        results = []
        for p in self.cache_dir.glob("*.json"):
            stat = p.stat()
            mtime_dt = datetime.fromtimestamp(stat.st_mtime, tz=timezone.utc)
            results.append({
                "key": p.stem,
                "size_bytes": stat.st_size,
                "last_modified": mtime_dt.isoformat(),
                "age_minutes": round((time.time() - stat.st_mtime) / 60, 1),
            })
        return sorted(results, key=lambda x: x["last_modified"], reverse=True)

    def clear(self) -> int:
        count = 0
        for p in self.cache_dir.glob("*.json"):
            try:
                p.unlink()
                count += 1
            except Exception:
                pass
        return count

file_cache = FileCache()
