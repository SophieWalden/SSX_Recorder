import pyautogui
import time
import tkinter as tk

# Function to record mouse click positions
def get_mouse_position():
    print("Click on the top-left corner of the region.")
    time.sleep(5)  # Gives you time to prepare the mouse
    x1, y1 = pyautogui.position()  # Get the first (top-left) position
    print(f"Top-left corner: {x1}, {y1}")
    
    print("Now click on the bottom-right corner of the region.")
    time.sleep(5)  # Gives you time to prepare the mouse
    x2, y2 = pyautogui.position()  # Get the second (bottom-right) position
    print(f"Bottom-right corner: {x2}, {y2}")
    
    return x1, y1, x2, y2

# Function to capture the region defined by the mouse click
def capture_region(x1, y1, x2, y2):
    # Use pyautogui to capture the screenshot of the region
    screenshot = pyautogui.screenshot(region=(x1, y1, x2 - x1, y2 - y1))
    screenshot.save("captured_region.png")  # Save the screenshot
    print("Screenshot saved as 'captured_region.png'.")

# Create a simple Tkinter window to avoid blocking the main thread
root = tk.Tk()
root.withdraw()  # Hide the window

# Get the mouse positions and capture the region
x1, y1, x2, y2 = get_mouse_position()

# Capture the defined region
capture_region(x1, y1, x2, y2)
