# RoadSOS+ shared rate limiter instance.
# Imported by main.py and all routers — single source of truth.
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
