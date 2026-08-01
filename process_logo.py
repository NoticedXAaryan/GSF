from PIL import Image

def process_logo(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    
    try:
        from rembg import remove
        print("Using rembg for background removal...")
        img = remove(img)
    except ImportError:
        print("rembg not found, using color threshold...")
        data = img.getdata()
        new_data = []
        for item in data:
            if item[0] > 180 and item[1] < 80 and item[2] < 80:
                # To handle fringe slightly, maybe scale alpha?
                new_data.append((255, 255, 255, 0))
            else:
                new_data.append(item)
        img.putdata(new_data)

    # Crop to bounding box
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)

    # Upscale 2x
    new_size = (img.width * 2, img.height * 2)
    img = img.resize(new_size, Image.Resampling.LANCZOS)
    
    img.save(output_path, "PNG")
    print(f"Saved processed logo to {output_path}")

process_logo(
    r"c:\Users\notic\.gemini\antigravity-ide\brain\3a248466-6268-4863-956a-f15d68e2bcbd\media__1785329063246.png", 
    r"c:\Users\notic\Downloads\goa-startup-festival-2026\public\logo.png"
)
