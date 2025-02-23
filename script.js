async function processImage(imageUrl) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = imageUrl;

        img.onload = () => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            // Resize image to 32x32
            canvas.width = 32;
            canvas.height = 32;
            ctx.drawImage(img, 0, 0, 32, 32);

            // Get pixel data
            const imageData = ctx.getImageData(0, 0, 32, 32).data;
            let pixels = [];

            // Convert pixel data into RGBA format
            for (let i = 0; i < imageData.length; i += 4) {
                pixels.push([
                    imageData[i],     // Red
                    imageData[i + 1], // Green
                    imageData[i + 2], // Blue
                    imageData[i + 3]  // Alpha
                ]);
            }

            // Create JSON data
            const jsonData = {
                width: 32,
                height: 32,
                pixels: pixels
            };

            // Store the data in localStorage (for browser use)
            localStorage.setItem("imageData", JSON.stringify(jsonData));

            // If you need to update the server, make an API call (example below)
            fetch("/updateData", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(jsonData)
            }).then(response => {
                if (response.ok) {
                    resolve(jsonData);
                } else {
                    reject("Failed to update server with new data.");
                }
            }).catch(err => reject("Error updating server: " + err));
        };

        img.onerror = () => reject("Failed to load image.");
    });
}

// Get image from URL parameter (?imageurl=...)
const urlParams = new URLSearchParams(window.location.search);
const imageUrl = urlParams.get("imageurl");

if (imageUrl) {
    processImage(imageUrl).then(jsonData => {
        document.getElementById("output").textContent = JSON.stringify(jsonData, null, 2);
    }).catch(error => {
        document.getElementById("output").textContent = error;
    });
} else {
    document.getElementById("output").textContent = "No image URL provided.";
}
