from PIL import Image, ImageDraw
import os

def create_icon(size):
    # Create a new image with a white background
    image = Image.new('RGB', (size, size), 'white')
    draw = ImageDraw.Draw(image)
    
    # Draw a blue circle
    circle_color = '#1976D2'  # Material UI primary blue
    draw.ellipse([0, 0, size, size], fill=circle_color)
    
    # Draw a white document
    doc_margin = size // 8
    doc_width = size - (2 * doc_margin)
    doc_height = size - (2 * doc_margin)
    draw.rectangle(
        [doc_margin, doc_margin, doc_margin + doc_width, doc_margin + doc_height],
        fill='white'
    )
    
    # Draw lines in the document
    line_spacing = doc_height // 6
    line_width = doc_width - (2 * doc_margin)
    line_height = size // 32
    
    for i in range(3):
        y = doc_margin + (line_spacing * (i + 1))
        draw.rectangle(
            [doc_margin * 2, y, doc_margin * 2 + line_width, y + line_height],
            fill=circle_color
        )
    
    # Draw a checkmark
    check_margin = size // 4
    check_size = size // 8
    points = [
        (size - check_margin - check_size, size - check_margin - check_size),
        (size - check_margin, size - check_margin),
        (size - check_margin + check_size, size - check_margin - check_size)
    ]
    draw.line(points, fill=circle_color, width=size // 32)
    
    return image

def generate_icons():
    # Create output directory if it doesn't exist
    os.makedirs('frontend/public', exist_ok=True)
    
    # Generate different sizes
    sizes = {
        'favicon.ico': 64,
        'logo192.png': 192,
        'logo512.png': 512
    }
    
    for filename, size in sizes.items():
        icon = create_icon(size)
        if filename.endswith('.ico'):
            icon.save(f'frontend/public/{filename}', format='ICO', sizes=[(size, size)])
        else:
            icon.save(f'frontend/public/{filename}', format='PNG')

if __name__ == '__main__':
    generate_icons() 