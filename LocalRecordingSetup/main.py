import pytesseract
import pyautogui
from PIL import Image
import time
import numpy as np
import asyncio
import obsws_python as obs
from termcolor import colored
import cv2
from skimage.metrics import structural_similarity as ssim
import pyautogui
from uploadVideo import process_new_run

pytesseract.pytesseract.tesseract_cmd = r'C:/Program Files/Tesseract-OCR/tesseract.exe' 

regions = {"race_start": (823, 471, 1054-823, 604-471), "race_end": (672, 367, 1250-672, 488-367), "death": (256, 24, 1659-256, 1074-24),
           "speed": (350, 925, 460-350, 980-925), "level_id": (257, 26, 714-257, 429-26)}
thresholds = {"race_start": 0.05, "race_end": 0.25, "death": 0.95, "speed": 0.1}
colors = {"race_start": [(0, 160, 0), (50, 250, 50)], "race_end": [(210, 156, 5), (250, 196, 45)], "death": [(115,115,115), (140,140,140)],
            "speed": [(230, 230, 230), (250, 250, 250)]}

# OBS WebSocket settings
OBS_WS_URI = "ws://localhost:4455"  
OBS_PASSWORD = "6bidJcdn7qBtHBbq"  

MOCK_MODE = False
ACTION_COOLDOWN = 1


def text_found(key):
    screenshot = pyautogui.screenshot(region=regions[key])
    img_array = np.array(screenshot)

    neon_green_mask = np.all(np.logical_and(
        img_array >= colors[key][0],
        img_array <= colors[key][1]
    ), axis=-1)

    processed_img = np.zeros_like(img_array) 
    processed_img[neon_green_mask] = img_array[neon_green_mask]  

    processed_image = Image.fromarray(processed_img)
    processed_image_gray = processed_image.convert('L')

    gray_array = np.array(processed_image_gray)
    non_black_pixels = np.sum(gray_array > 0)
    total_pixels = gray_array.size
    proportion_non_black = non_black_pixels / total_pixels

    start_threshold = thresholds[key]

    if proportion_non_black > start_threshold:
        return True 

    return False

# OBS WebSocket connection setup using obswebsocket-py
def connect_obs():
    # Initialize the OBS WebSocket connection
    ws = obs.ReqClient(host='localhost', port=4455, timeout=3)
    
    print(f"{colored(f'Connected to OBS Sockets', 'green')}")
    return ws

def start_recording(ws):
    try:
        # Send StartRecording request
        start_recording_msg = ws.start_record()

        print(f"{colored('ACTION - Started Recording', 'blue')}")
    except Exception as e:
        print(f"{colored(f'ERROR - Failed to Start Recording {e}', 'red')}")

def stop_recording(ws):
    try:
        # Send StartRecording request
        stop_recording_message = ws.stop_record()

        print(f"{colored('ACTION - Ended Recording', 'blue')}")
    except Exception as e:
        print(f"{colored(f'ERROR - Failed to End Recording {e}', 'red')}")


import glob, os, shutil, json

PATH = "C:/Users/Sophie/Videos/SSX_Recordings"
def move_recording(stats):

    wanted_file = sorted(item for item in glob.glob("*.mp4", root_dir=PATH))[-1]
    full_path = f"{PATH}/{wanted_file}"
    storage_name = wanted_file[:-4]

    storage_path = f"{PATH}/{storage_name}"
    if not os.path.exists(storage_path):
        os.makedirs(storage_path)
        shutil.move(full_path, f"{storage_path}/{wanted_file}")

        json_path = f"{storage_path}/stats.json"
        with open(json_path, 'w') as output_file:
            json.dump(stats, output_file)

    print(f"{colored(f'ACTION - Saved Run', 'blue')}")

    return storage_name




def delete_last_recording():
    wanted_file = sorted(item for item in glob.glob("*.mp4", root_dir=PATH))[-1]
    full_path = f"{PATH}/{wanted_file}"
    os.remove(full_path)



def save_level_reference(level_name, image_chunk):
    # Convert to HSV color space
    hsv_image = cv2.cvtColor(image_chunk, cv2.COLOR_RGB2HSV)
    
    # Calculate color histogram
    hist = cv2.calcHist([hsv_image], [0, 1], None, [50, 60], [0, 180, 0, 256])
    hist = cv2.normalize(hist, hist).flatten()
    
    # Save histogram as reference (use a file or a dictionary in practice)
    np.save(f"{level_name}_hist.npy", hist)

def capture_start_chunk():
    screenshot = pyautogui.screenshot(region=regions["level_id"])
    image_chunk = np.array(screenshot)
    return image_chunk

def load_reference_histograms(levels):
    histograms = {}
    for level in levels:
        histograms[level] = np.load(f"histograms/{level}_hist.npy")
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

def monitor_game(ws):
    race_started = False
    race_stats = {"startedTime": None, "deaths": [], "speed": [], "endTime": None, "trackName": None}
    reference_histograms = load_reference_histograms(["alaska", "aloha", "garibaldi", "snowdream", "elysium", "mesablanca", "merqury", "tokyo"])

    while True:
        if text_found("race_start"):
            if not race_stats["startedTime"] or time.perf_counter() - race_stats["startedTime"] > 5:
            
                # Ending old race (restart)
                if race_stats["startedTime"] != None and not MOCK_MODE:
                    stop_recording(ws)
                    time.sleep(ACTION_COOLDOWN)
                    delete_last_recording()

                level_name = identify_level(capture_start_chunk(), reference_histograms)
                print(f"{colored(f'LEVEL - {level_name}', 'yellow')}")

                # Starting new race
                race_stats["startedTime"] = int(time.perf_counter())
                race_stats["deaths"] = []
                race_stats["speed"] = {}
                race_stats["trackName"] = level_name 

                if not MOCK_MODE:
                    start_recording(ws)

        if race_stats["startedTime"] and text_found("race_end"):
            race_stats["endTime"] = int(time.perf_counter()) 

            if not MOCK_MODE:
                stop_recording(ws)
                time.sleep(ACTION_COOLDOWN)

                uploadId = move_recording(race_stats)
                startUploadTime = time.perf_counter()
                process_new_run(uploadId, race_stats["trackName"], race_stats["endTime"] - race_stats["startedTime"])
                print(f"{colored(f'ACTION - FILE UPLOADED - {int(time.perf_counter() - startUploadTime)}s', 'cyan')}")

            race_stats["startedTime"] = None        



        if text_found("death"):
            if not race_stats["deaths"] or time.perf_counter() - race_stats["deaths"][-1] > 1:
                race_stats["deaths"].append(time.perf_counter())
                print(f"{colored(f'LOG - DEATH', 'cyan')}")
                
        if text_found("speed"):
            screenshot_speed = pyautogui.screenshot(region=regions["speed"])
            screenshot_speed.save("speed_region_screenshot.png") 
            speed_text = pytesseract.image_to_string(screenshot_speed, config='--psm 7').strip()

            if speed_text.isdigit() and 0 < int(speed_text) < 100:
                race_stats["speed"][int(time.perf_counter())] = speed_text


        time.sleep(0.05)  # Adjust the interval as needed

if __name__ == "__main__":
    ws = connect_obs()  # Establish the WebSocket connection to OBS
    monitor_game(ws)  # Monitor the game and start/stop recording
