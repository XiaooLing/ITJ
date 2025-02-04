from flask import Flask, request, jsonify
from PIL import Image
import requests
from io import BytesIO

app = Flask(__name__)

# Function to process image
def get_image_pixels(image_url, size=(32, 32)):
    try:
        # Fetch image from URL
        response = requests.get(image_url)
        image = Image.open(BytesIO(response.content))

        # Resize to 32x32 and convert to RGBA
        image = image.resize(size).convert("RGBA")

        # Extract pixel data
        pixels = list(image.getdata())  # [(R,G,B,A), (R,G,B,A), ...]

        # Convert to list of lists
        pixel_values = [list(pixel) for pixel in pixels]

        return {"width": size[0], "height": size[1], "pixels": pixel_values}
    
    except Exception as e:
        return {"error": str(e)}

# API Route
@app.route('/image-to-json', methods=['GET'])
def image_to_json():
    image_url = request.args.get("imageurl")  # Get URL from query parameter

    if not image_url:
        return jsonify({"error": "No image URL provided"}), 400

    # Process image
    image_data = get_image_pixels(image_url)

    return jsonify(image_data)  # Return JSON response

# Run server
if __name__ == '__main__':
    app.run(host="0.0.0.0", port=7700, debug=True)
