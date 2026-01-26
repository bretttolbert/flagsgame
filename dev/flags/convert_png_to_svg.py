import vtracer
import os


def convert_png_to_svg(input_path, output_path):
    # Check if the input file exists
    if not os.path.exists(input_path):
        print(f"Error: {input_path} not found.")
        return

    print(f"Vectorizing {input_path}...")

    # vtracer.convert handles the heavy lifting
    # You can tweak these parameters for different results:
    # mode: "spline" (smooth) or "polygon" (sharp)
    # filter_speckle: ignores small noise (pixels)
    # color_precision: higher number = more colors/detail
    vtracer.convert_image_to_svg_py(
        input_path,
        output_path,
        mode="spline",
        filter_speckle=4,
        color_precision=6,
        layer_difference=16,
        corner_threshold=60,
        length_threshold=4.0,
        max_iterations=10,
        splice_threshold=45,
        path_precision=2,
    )

    print(f"Success! SVG saved at: {output_path}")


# Usage
convert_png_to_svg(
    "Flag_of_Under_No_Pretext-(no-text).png",
    "Flag_of_Under_No_Pretext_(no-text).svg",
)
