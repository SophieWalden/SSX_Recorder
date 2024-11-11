import boto3
import os
import json
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

# Set up your DigitalOcean Spaces credentials and space name
DO_SPACE_NAME = 'ssx-tricky-video-clips'
DO_REGION = 'nyc3'  # replace with your region
ACCESS_KEY = os.getenv('DO_SPACES_ACCESS_KEY')
SECRET_KEY = os.getenv('DO_SPACES_SECRET_KEY')  # replace with your secret key

# Initialize the boto3 client for DigitalOcean Spaces (S3-compatible)
s3_client = boto3.client('s3',
                         endpoint_url=f'https://{DO_REGION}.digitaloceanspaces.com',
                         aws_access_key_id=ACCESS_KEY,
                         aws_secret_access_key=SECRET_KEY)

# Function to upload a file to DigitalOcean Space
def upload_file(file_path, file_key):
    try:
        with open(file_path, 'rb') as data:
            s3_client.put_object(Bucket=DO_SPACE_NAME, Key=file_key, Body=data, ACL='public-read')
    except Exception as e:
        print(f"Error uploading {file_path}: {e}")

# Function to upload video and its stats (JSON)
def upload_run(folder_name, run_id, video_path, json_path):
    # Upload video file
    video_key = f'videos/{folder_name}/{run_id}/run.mp4'
    upload_file(video_path, video_key)

    # Upload stats file (JSON)
    stats_key = f'videos/{folder_name}/{run_id}/stats.json'
    upload_file(json_path, stats_key)

# Function to fetch the current log from DigitalOcean Spaces
def fetch_log():
    try:
        response = s3_client.get_object(Bucket=DO_SPACE_NAME, Key='logs/runLog.json')
        log_data = json.loads(response['Body'].read().decode('utf-8'))
        return log_data
    except Exception as e:
        print(f"Error fetching log: {e}")
        return {}

# Function to upload the updated log to DigitalOcean
def upload_log(log_data):
    try:
        s3_client.put_object(
            Bucket=DO_SPACE_NAME,
            Key='logs/runLog.json',
            Body=json.dumps(log_data, indent=2),
            ContentType='application/json',
            ACL='public-read'
        )
    except Exception as e:
        print(f"Error uploading log: {e}")

# Function to delete the oldest video if there are more than 25 entries
def delete_old_video(folder_name, run_id):
    try:
        # Construct video key and stats key
        video_key = f'videos/{folder_name}/{run_id}/run.mp4'
        stats_key = f'videos/{folder_name}/{run_id}/stats.json'

        # Delete the old video and stats
        s3_client.delete_object(Bucket=DO_SPACE_NAME, Key=video_key)
        s3_client.delete_object(Bucket=DO_SPACE_NAME, Key=stats_key)

    except Exception as e:
        print(f"Error deleting old video: {e}")

# Function to update the log and maintain only the top 25 runs for each track
def update_run_log(folder_name, run_id, run_time, video_url, json_url):
    # Fetch the current log
    log_data = fetch_log()

    if folder_name not in log_data:
        log_data[folder_name] = []

    # Add the new run data
    log_data[folder_name].append({
        'runId': run_id,
        'time': run_time,
        'videoPath': video_url,
        'jsonPath': json_url
    })

    # Sort the runs and keep only the top 25 fastest
    log_data[folder_name] = sorted(log_data[folder_name], key=lambda x: x['time'])

    # If more than 25, delete the oldest video and stats, and keep only the top 25
    if len(log_data[folder_name]) > 25:
        old_run = log_data[folder_name].pop()  # Remove the last item (the oldest)
        delete_old_video(folder_name, old_run['runId'])

    # Upload the updated log
    upload_log(log_data)

PATH = "C:/Users/Sophie/Videos/SSX_Recordings"
def process_new_run(path_id, level_name, run_time):
    folder_name = level_name # The track name (this can be dynamic)
    run_id = path_id  # Use timestamp as unique ID for each run
    run_time = run_time  # Example run time in seconds (you can get this from the stats)

    # Paths to your video and JSON files

    full_path = f"{PATH}/{path_id}"
    video_path = f'{full_path}/{path_id}.mp4'  # Replace with actual path
    json_path = f'{full_path}/stats.json'  # Replace with actual path

    # Upload video and JSON files to DigitalOcean Spaces
    upload_run(folder_name, run_id, video_path, json_path)

    # URLs for uploaded files
    video_url = f'https://{DO_SPACE_NAME}.{DO_REGION}.digitaloceanspaces.com/videos/{folder_name}/{run_id}/run.mp4'
    json_url = f'https://{DO_SPACE_NAME}.{DO_REGION}.digitaloceanspaces.com/videos/{folder_name}/{run_id}/stats.json'

    # Update and upload the log with the new run details
    update_run_log(folder_name, run_id, run_time, video_url, json_url)
