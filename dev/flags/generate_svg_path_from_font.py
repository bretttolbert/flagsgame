from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen


def get_svg_path(font_path, char):
    # Load the font
    font = TTFont(font_path)
    glyph_set = font.getGlyphSet()
    cmap = font.getBestCmap()

    # Get the glyph name for the character
    glyph_name = cmap.get(ord(char))
    if not glyph_name:
        return f"Character '{char}' not found in font."

    # Create an SVGPathPen
    svg_pen = SVGPathPen(glyph_set)

    # Fonts use a coordinate system where Y grows UP, but SVG grows DOWN.
    # We use a TransformPen to flip it so the result isn't upside down.
    # (1, 0, 0, -1, 0, unitsPerEm) flips Y and moves it back into view.
    upm = font["head"].unitsPerEm  # type: ignore
    transform_pen = TransformPen(svg_pen, (1, 0, 0, -1, 0, upm))

    # Draw the glyph into the pen
    glyph_set[glyph_name].draw(transform_pen)

    return svg_pen.getCommands()


LETTER_SPACING_MAP = {
    "A": 9,
    "B": 9,
    "C": 9,
    "E": 9,
    "I": 4,
    "H": 9,
    "L": 8,
    "N": 9,
    "O": 9,
    "P": 9,
    "R": 9,
    "S": 8,
    "T": 8,
    "U": 9,
    " ": 4,
    ",": 4,
}

# Example usage:
font_file = "Copperplate Gothic Std 29 BC.otf"
text = "LIBERTAS, HONOR, RESPECTUS"
x = 280
letter_spacing = 8
for i, character in enumerate(text):
    path_data = get_svg_path(font_file, character)
    char_escaped = (character.replace(" ", "_")).replace(",", "")
    print(
        f'<g id="g_char_{i}_{char_escaped}" transform="translate({x}, 310) scale(0.02, 0.02)">'
    )
    print(
        f'<path id="path_char_{i}_{char_escaped}" fill="#2B8F81" d="{path_data}"></path>'
    )
    print("</g>")
    x += LETTER_SPACING_MAP[character]
