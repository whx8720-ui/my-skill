"""Export evenly spaced PNG inspection frames from a local video."""

from __future__ import annotations

import argparse
import re
import subprocess
from pathlib import Path

import imageio_ffmpeg


def duration(ffmpeg: str, video: Path) -> float:
    result = subprocess.run([ffmpeg, "-hide_banner", "-i", str(video)], capture_output=True, text=True)
    match = re.search(r"Duration: (\d+):(\d+):(\d+(?:\.\d+)?)", result.stderr)
    if not match:
        raise RuntimeError("Unable to read video duration")
    hours, minutes, seconds = match.groups()
    return int(hours) * 3600 + int(minutes) * 60 + float(seconds)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("video", type=Path)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--samples", type=int, default=12)
    args = parser.parse_args()
    if not args.video.is_file():
        raise FileNotFoundError(args.video)
    if args.samples < 1:
        raise ValueError("--samples must be at least 1")

    ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
    total = duration(ffmpeg, args.video)
    args.output.mkdir(parents=True, exist_ok=True)
    for index in range(args.samples):
        timestamp = total * index / max(args.samples - 1, 1)
        output = args.output / f"frame_{index + 1:02d}_{timestamp:07.3f}s.png"
        subprocess.run([ffmpeg, "-hide_banner", "-loglevel", "error", "-ss", f"{timestamp:.3f}", "-i", str(args.video), "-frames:v", "1", "-c:v", "png", "-y", str(output)], check=True)
    print(f"Exported {args.samples} frames from {total:.3f}s to {args.output}")


if __name__ == "__main__":
    main()
