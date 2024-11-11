import cv2
import numpy as np
from skimage.metrics import structural_similarity as ssim
import pyautogui

# Load and save reference histograms for each level
def save_level_reference(level_name, image_chunk):
    # Convert to HSV color space
    hsv_image = cv2.cvtColor(image_chunk, cv2.COLOR_RGB2HSV)
    
    # Calculate color histogram
    hist = cv2.calcHist([hsv_image], [0, 1], None, [50, 60], [0, 180, 0, 256])
    hist = cv2.normalize(hist, hist).flatten()
    
    # Save histogram as reference (use a file or a dictionary in practice)
    np.save(f"{level_name}_hist.npy", hist)

# Load reference histograms
def load_reference_histograms(levels):
    histograms = {}
    for level in levels:
        histograms[level] = np.load(f"{level}_hist.npy")
    return histograms

# Compare current level's histogram with reference histograms
def identify_level(image_chunk, reference_histograms):
    hsv_image = cv2.cvtColor(image_chunk, cv2.COLOR_RGB2HSV)
    current_hist = cv2.calcHist([hsv_image], [0, 1], None, [50, 60], [0, 180, 0, 256])
    current_hist = cv2.normalize(current_hist, current_hist).flatten()

    similarities = {}
    for level, ref_hist in reference_histograms.items():
        # Calculate similarity using correlation
        similarity = cv2.compareHist(current_hist, ref_hist, cv2.HISTCMP_CORREL)
        similarities[level] = similarity

    # Identify the level with the highest similarity score
    identified_level = max(similarities, key=similarities.get)
    return identified_level

# Capture image chunk at race start
def capture_start_chunk(region):
    screenshot = pyautogui.screenshot(region=region)
    image_chunk = np.array(screenshot)
    return image_chunk

# Example usage
if __name__ == "__main__":
    # Set the region and load reference histograms
    region = (257, 26, 714-257, 429-26)
    #reference_histograms = load_reference_histograms(["level1", "level2", "level3"])

    # Capture and identify the level
    image_chunk = capture_start_chunk(region)
    #level_name = identify_level(image_chunk, reference_histograms)
    print(f"Detected Level: {level_name}")
