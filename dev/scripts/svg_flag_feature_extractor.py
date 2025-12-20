import sys
import re
from typing import Optional
from pathlib import Path
from svgpathtools import svg2paths
import webcolors
import colorsys
import cssutils
import json

directory_path = Path("../../flags/svg/")


"""
Color Spaces (RGB vs. HSV)
RGB: Simple, but colors (like blue sky) can have varying R, G, B values.
HSV (Hue, Saturation, Value): 
Often better for segmentation as it separates color (Hue/Saturation) from brightness (Value), 
making it easier to group visually similar hues. 
"""


# This function currently locks up :(
# So I'm not currently using it
# TODO: Get it working
def analyze_svg_path(filename):
    """Loads an SVG file and analyzes the first path found."""
    try:
        # paths is a list of Path objects; attributes is a list of dictionaries
        paths, attributes = svg2paths(filename)  # type: ignore

        if not paths:
            print(f"No paths found in {filename}")
            return

        # Take the first path as an example
        mypath = paths[0]
        print(f"Analyzing the first path (d-string: {attributes[0]['d'][:30]}...):")

        # Find its length
        print("Length = ", mypath.length())

        # Find height and width using the bounding box method
        xmin, xmax, ymin, ymax = mypath.bbox()
        print("Width = ", xmax - xmin)
        print("Height = ", ymax - ymin)

        # Check if the path is closed and find its area
        try:
            print("Area = ", mypath.area())
        except AssertionError:
            print(
                "This path is not a closed loop, so area cannot be directly calculated."
            )

    except FileNotFoundError:
        print(f"Error: The file '{filename}' was not found. Make sure it exists.")


def parse_rgb_string(rgb_string) -> webcolors.IntegerRGB:
    """Parses an rgb(r, g, b) string and returns a 3-tuple of integers."""
    # Regex to match the numbers inside the rgb() string
    match = re.match(r"rgb\((\d+),\s*(\d+),\s*(\d+)\)", rgb_string)
    if match:
        # Extract and convert the matched groups to integers
        r, g, b = int(match.group(1)), int(match.group(2)), int(match.group(3))
        # Optional: Use webcolors to normalize the values to the 0-255 range
        return webcolors.normalize_integer_triplet((r, g, b))
    else:
        raise ValueError(f"Invalid rgb string format: {rgb_string}")


def normalize_color(color: str) -> Optional[webcolors.IntegerRGB]:
    """
    Docstring for normalize_color

    Problems:
    'url(#linearGradient8557) rgb(0, 0, 0)'

    :param color: Description
    :type color: str
    :return: Description
    :rtype: IntegerRGB | None
    """

    ret = None
    if color.lower() != "none" and color != "":
        rgb_idx = color.find("rgb(")
        # convert hex codes to rgb codes
        if color.startswith("#"):
            ret = webcolors.hex_to_rgb(color)
        # parse css rgb(r,g,b) string
        # not necessarily at the start, e.g.
        # 'url(#linearGradient8557) rgb(0, 0, 0)'
        elif rgb_idx >= 0:
            rgb_string = color[rgb_idx:]
            parsed_color = parse_rgb_string(rgb_string)
            ret = webcolors.IntegerRGB(
                red=parsed_color.red,
                green=parsed_color.green,
                blue=parsed_color.blue,
            )
        else:
            # try converting html color name to rgb code
            try:
                ret = webcolors.name_to_rgb(color)
            except ValueError:
                print(f"Error: Color name '{color}' not found.", file=sys.stderr)
    return ret


def rgb_to_hsl(rgb: webcolors.IntegerRGB):
    r_float = rgb.red / 255.0
    g_float = rgb.green / 255.0
    b_float = rgb.blue / 255.0

    # Convert float RGB to float HSV (0.0-1.0 for H, S, V)
    h_float, s_float, v_float = colorsys.rgb_to_hsv(r_float, g_float, b_float)

    # Optional: Convert HSV values to a more human-readable range
    # H: 0-360 degrees, S: 0-100%, V: 0-100%
    # h_degrees = h_float * 360.0
    # s_percent = s_float * 100.0
    # v_percent = v_float * 100.0

    return (h_float, s_float, v_float)


def reduce_hsl_resolution(hsl_tuple, hue_steps=8, sat_steps=2, light_steps=2):
    """
    Reduces the resolution of HSL color components.

    h, s, l are floats in the range [0.0, 1.0].
    *_steps are the number of discrete steps for each component.
    """
    h, s, l = hsl_tuple
    # Quantize the hue: map [0, 1] to a discrete number of steps
    h_quantized = round(h * hue_steps) / hue_steps
    # Quantize saturation and lightness similarly
    s_quantized = round(s * sat_steps) / sat_steps
    l_quantized = round(l * light_steps) / light_steps

    # Clamp values to the valid [0.0, 1.0] range just in case rounding exceeds bounds
    h_quantized = max(0.0, min(1.0, h_quantized))
    s_quantized = max(0.0, min(1.0, s_quantized))
    l_quantized = max(0.0, min(1.0, l_quantized))

    return (h_quantized, s_quantized, l_quantized)


def convert_to_hsl_tuples(colors):
    """
    Converts webcolors.IntegerRGB to primitive hsl tuples
    """
    hue_steps = 8
    sat_steps = 2
    light_steps = 2
    return [
        reduce_hsl_resolution(rgb_to_hsl(c), hue_steps, sat_steps, light_steps)
        for c in colors
    ]


def extract_colors_from_svg(filename):
    """
    Extracts fill and stroke colors from an SVG file using svgpathtools.

    Args:
        filename (str): The path to the SVG file.

    Returns:
        dict: A dictionary containing lists of fill and stroke colors found.
    """

    if str(filename).find("Ireland") != -1:
        print("Ireland")

    ret = {"fills_rgb": [], "strokes_rgb": []}
    try:
        # returns color (stroke and fill) lists
        paths, attributes = svg2paths(filename)  # type: ignore
    except FileNotFoundError:
        print(f"Error: The file '{filename}' was not found.")
        return ret
    except Exception as e:
        print(f"An error occurred while parsing the SVG file: {e}")
        return ret
    for attrib_dict in attributes:
        if "fill" in attrib_dict:
            normalized_color = normalize_color(attrib_dict["fill"])
            if normalized_color is not None:
                ret["fills_rgb"].append(normalized_color)
        if "stroke" in attrib_dict:
            normalized_color = normalize_color(attrib_dict["stroke"])
            if normalized_color is not None:
                ret["strokes_rgb"].append(normalized_color)
        if "style" in attrib_dict:
            style = attrib_dict["style"]
            sheet = cssutils.parseString(".st0 {" + style + "}")
            dct = {}
            for rule in sheet:
                if (
                    rule.type == rule.STYLE_RULE
                ):  # Ensures only style rules are processed, skipping @import etc.
                    selector = rule.selectorText
                    for prop in rule.style:
                        dct[prop.name] = prop.value
            if "fill" in dct:
                fill = dct["fill"]
                normalized_color = normalize_color(fill)
                if normalized_color is not None:
                    ret["fills_rgb"].append(normalized_color)
            if "stroke" in dct:
                stroke = dct["stroke"]
                normalized_color = normalize_color(stroke)
                if normalized_color is not None:
                    ret["strokes_rgb"].append(normalized_color)
    fills_rgb = list(set(ret["fills_rgb"]))
    strokes_rgb = list(set(ret["strokes_rgb"]))
    return {
        "fills_rgb": fills_rgb,
        "fills_hsl": convert_to_hsl_tuples(fills_rgb),
        "strokes_rgb": strokes_rgb,
        "strokes_hsl": convert_to_hsl_tuples(strokes_rgb),
    }


def extract_features():
    ret = {}
    for file_path in directory_path.iterdir():
        if file_path.is_file():
            colors = extract_colors_from_svg(file_path.absolute())
            ret[file_path.name] = colors
    return ret


if __name__ == "__main__":
    features = extract_features()
    json_str = json.dumps(features, indent=4)
    with open("flag_features.json", "w") as f:
        f.write(json_str)
