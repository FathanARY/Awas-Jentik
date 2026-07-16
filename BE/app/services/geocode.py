import httpx
from typing import Optional


async def reverse_geocode(lat: float, lng: float) -> Optional[str]:
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(
                "https://nominatim.openstreetmap.org/reverse",
                params={"lat": lat, "lon": lng, "format": "json", "accept-language": "id"},
                headers={"User-Agent": "MalariaWatch/1.0"},
            )
            if resp.status_code == 200:
                data = resp.json()
                return data.get("display_name", None)
    except Exception:
        pass
    return None
