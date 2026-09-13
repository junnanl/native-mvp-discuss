#!/usr/bin/env python3
"""容器内 CDP 转发器：0.0.0.0:<listen> -> 127.0.0.1:<target>。

Chromium 110+ 强制把 DevTools 绑定在 127.0.0.1（--remote-debugging-address
对非环回地址不再生效），跨容器接管需要一个本地转发器。
"""
import asyncio
import sys

LISTEN_HOST = sys.argv[1] if len(sys.argv) > 1 else "0.0.0.0"
LISTEN_PORT = int(sys.argv[2]) if len(sys.argv) > 2 else 9222
TARGET_HOST = sys.argv[3] if len(sys.argv) > 3 else "127.0.0.1"
TARGET_PORT = int(sys.argv[4]) if len(sys.argv) > 4 else 9222


async def _pipe(reader: asyncio.StreamReader, writer: asyncio.StreamWriter) -> None:
    try:
        while True:
            data = await reader.read(65536)
            if not data:
                break
            writer.write(data)
            await writer.drain()
    except Exception:  # noqa: BLE001 - 任一方向断开即结束
        pass
    finally:
        try:
            writer.close()
        except Exception:  # noqa: BLE001
            pass


async def _handle(client_reader, client_writer) -> None:
    peer = client_writer.get_extra_info("peername")
    try:
        remote_reader, remote_writer = await asyncio.open_connection(TARGET_HOST, TARGET_PORT)
    except Exception as exc:  # noqa: BLE001
        print(f"forwarder: target unreachable from {peer}: {exc}", file=sys.stderr, flush=True)
        client_writer.close()
        return
    await asyncio.gather(
        _pipe(client_reader, remote_writer),
        _pipe(remote_reader, client_writer),
    )


async def main() -> None:
    server = await asyncio.start_server(_handle, LISTEN_HOST, LISTEN_PORT)
    print(f"forwarder: {LISTEN_HOST}:{LISTEN_PORT} -> {TARGET_HOST}:{TARGET_PORT}",
          file=sys.stderr, flush=True)
    async with server:
        await server.serve_forever()


if __name__ == "__main__":
    asyncio.run(main())
