from PIL import Image, ImageFilter

def remove_background_v2(input_path, output_path):
    # Load the original image
    img = Image.open(input_path).convert("RGBA")
    
    # Get the pixels
    datas = img.getdata()
    
    new_data = []
    # Threshold for "white-ish" background
    # The original robot is gold/orange, so we can isolate white easily
    for item in datas:
        # Check if the pixel is white-ish (high R, G, B)
        # Using a slightly higher threshold to catch gray-ish edges
        if item[0] > 235 and item[1] > 235 and item[2] > 235:
            # Change to fully transparent
            new_data.append((255, 255, 255, 0))
        else:
            new_data.append(item)
    
    # Apply the new transparent data
    img.putdata(new_data)
    
    # Optional: Smooth the edges slightly
    # This involves creating a mask and blurring it
    alpha = img.split()[-1]
    alpha = alpha.filter(ImageFilter.BoxBlur(1))
    img.putalpha(alpha)

    # Save as PNG
    img.save(output_path, "PNG")
    print(f"Background removed precisely and saved to {output_path}")

if __name__ == "__main__":
    # Ensure we use the original JPG provided by the user
    remove_background_v2("public/dot-bot.jpg", "public/dot-bot.png")
