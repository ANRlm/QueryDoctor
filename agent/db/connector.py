import redis
import os


class RedisClient:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance.client = redis.Redis(
                host=os.getenv("REDIS_HOST", "localhost"),
                port=int(os.getenv("REDIS_PORT", 6379)),
                db=int(os.getenv("REDIS_DB", 0)),
                decode_responses=True,
            )
        return cls._instance

    def xadd(self, stream: str, data: dict) -> str:
        return self.client.xadd(stream, data)

    def xreadgroup(self, group: str, consumer: str, streams: dict, count: int = 1):
        return self.client.xreadgroup(group, consumer, streams, count=count)

    def xack(self, stream: str, group: str, *ids):
        return self.client.xack(stream, group, *ids)


redis_client = RedisClient()
