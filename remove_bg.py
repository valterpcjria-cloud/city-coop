from PIL import Image
import numpy as np

def remove_background(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    data = np.array(img)
    
    # Define the range for near-white/gray background
    # Looking at the original, its background is around 245-255 range
    r, g, b, a = data.T
    
    # Background threshold (adjust if needed)
    white_areas = (r > 240) & (g > 240) & (b > 240)
    
    # We want to keep the robot, but remove the background
    # Let's also handle the "near white" edges
    data[..., 3][white_areas.T] = 0
    
    # Save as PNG
    new_img = Image.fromarray(data)
    new_img.save(output_path)
    print(f"Bkg removed and saved to {output_path}")

if __name__ == "__main__":
    remove_background("public/dot-bot.jpg", "public/dot-bot.png")
