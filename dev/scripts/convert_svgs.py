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

    starting_directory = os.getcwd()
    count = 0
    for root, _, files in os.walk(source_root, topdown=False):
        for fname in files:
            for keyword in exclude_keywords:
                if root.find(keyword) != -1:
                    continue
            if fname.endswith(source_ext):
                source_base, source_ext = os.path.splitext(fname)
                dest_filename = source_base + dest_ext
                dest_path = Path(root).joinpath(dest_filename)
                cmd = (
                    f"convert "
                    + f"-background none "
                    + f"{fname} "
                    + f"-resize {resolution} "
                    + f"-quality {quality} "
                    + f"{dest_filename}"
                )
                print(f"root={root} cmd={cmd}")
                os.chdir(root)
                if overwrite or not dest_path.exists():
                    if not dry_run:
                        os.system(cmd)
                if delete_source_file:
                    os.remove(fname)
                os.chdir(starting_directory)
                count += 1
    return count


def convert_svgs_to_x(
    source_path,
    dest_path,
    dest_ext,
    resolution,
    quality,
    overwrite,
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
        overwrite=overwrite,
        dry_run=dry_run,
    )
    print(f"converted {count} svgs")


def main():
    # one of the output formats must match the ones defined in flags.js
    output_fmts = [("png", "x300"), ("webp", "x300")]
    overwrite = False

    for dest_fmt, resolution in output_fmts:
        # recommend a fixed-height resolution with a variable width
        # consider square flags like Switzerland
        # if we matched the width, it would look out of proportion
        quality = 100
        source_path = Path("../../flags/svg/")
        dest_path = Path(f"../../flags/{dest_fmt}/{resolution}/")
        dest_ext = f".{dest_fmt}"
        dry_run = False
        convert_svgs_to_x(
            source_path.resolve(),
            dest_path.resolve(),
            dest_ext,
            resolution=resolution,
            quality=quality,
            overwrite=overwrite,
            dry_run=dry_run,
        )


if __name__ == "__main__":
    main()
