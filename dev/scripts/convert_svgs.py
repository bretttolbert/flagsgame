import os
from pathlib import Path
from typing import List
import shutil


"""
Script to batch convert images from svg to webp (in place),
optionally deleting the source svgs.
By default it converts at 80% quality and 1000x1000 resolution.
"""


def convert_all(
    source_root: Path,
    source_ext: str = ".svg",
    dest_ext: str = ".webp",
    exclude_keywords: List[str] = [],
    resolution: str = "x200",
    quality: int = 90,
    delete_source_file: bool = True,
    overwrite: bool = False,
    dry_run: bool = False,
) -> int:
    """
    Recursively batch convert images from one format to another,
    with the specified resolution and quality settings.
    The conversion is performed in place.

    Returns the number it converted (or would have converted if not dry_run)

    """

    absolute_root_path = source_root.resolve()
    count = 0
    for root, _, files in os.walk(absolute_root_path, topdown=False):
        for fname in files:
            for keyword in exclude_keywords:
                if root.find(keyword) != -1:
                    continue
            if fname.endswith(source_ext):
                source_base, source_ext = os.path.splitext(fname)
                dest_filename = source_base + dest_ext
                if overwrite or not Path(root).joinpath(dest_filename).exists():
                    if not dry_run:
                        cmd = (
                            f"convert {fname} "
                            + f"-resize {resolution} "
                            + f"-quality {quality} "
                            + f"{dest_filename}"
                        )
                        print(f"root={root} cmd={cmd}")
                        os.chdir(root)
                        os.system(cmd)
                        if delete_source_file:
                            os.remove(fname)
                    count += 1
    return count


def convert_svgs_to_x(
    source_path,
    dest_path,
    dest_ext,
    resolution,
    quality,
    dry_run,
):
    # copy svgs from source_path to dest_path (webp/png folder)
    shutil.copytree(source_path, dest_path, dirs_exist_ok=True)
    # convert in place (webp/png folder), then delete svg
    count = convert_all(
        source_root=dest_path,
        source_ext=".svg",
        dest_ext=dest_ext,
        resolution=resolution,
        quality=quality,
        delete_source_file=True,
        overwrite=True,
        dry_run=dry_run,
    )
    print(f"converted {count} svgs")


def main():
    # recommend a fixed-height resolution with a variable width
    # consider square flags like Switzerland
    # if we matched the width, it would look out of proportion
    resolution = "x300"  # update flags.js if you change the resolution
    quality = 100
    source_path = Path("../../flags/svg/")
    dest_fmt = "webp"
    dest_path = Path(f"../../flags/{dest_fmt}/{resolution}/")
    dest_ext = f".{dest_fmt}"
    dry_run = False
    convert_svgs_to_x(
        source_path,
        dest_path,
        dest_ext,
        resolution=resolution,
        quality=quality,
        dry_run=dry_run,
    )


if __name__ == "__main__":
    main()
