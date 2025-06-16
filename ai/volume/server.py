# server.py
import os
import uuid
import subprocess
from subprocess import PIPE
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from starlette.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Food Volume Estimation API",
    description="Upload a photo of your meal; returns estimated volume in ml",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["POST"],
    allow_headers=["*"],
)

ASSETS_DIR = os.path.join(os.getcwd(), "assets")
os.makedirs(ASSETS_DIR, exist_ok=True)

@app.post("/estimate-volume")
async def estimate_volume(file: UploadFile = File(...)):
    # 1) Zapisz plik
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in {".jpg", ".jpeg", ".png"}:
        raise HTTPException(400, "Only jpg/jpeg/png supported")
    unique_name = f"{uuid.uuid4().hex}{ext}"
    file_path = os.path.join(ASSETS_DIR, unique_name)
    with open(file_path, "wb") as out:
        out.write(await file.read())

    try:
        # 2) Wywołaj estimator
        cmd = [
            "python", "-m", "food_volume_estimation.volume_estimator",
            "--input_images", file_path,
            "--depth_model_architecture", "/models/depth_architecture.json",
            "--depth_model_weights",      "/models/depth_weights.h5",
            "--segmentation_weights",     "/models/segmentation_weights.h5",
            "--fov", "70",
            "--plate_diameter_prior", "0.20",
            "--plot_results",
        ]
        proc = subprocess.run(cmd, stdout=PIPE, stderr=PIPE, universal_newlines=True, check=False)
        if proc.returncode != 0:
            raise HTTPException(500, f"Estimator error:\n{proc.stderr}")

        # 3) Parsuj wynik
        volume_ml = None
        for line in proc.stdout.splitlines()[::-1]:
            if "Estimated volume:" in line:
                try:
                    volume_ml = float(line.split("Estimated volume:")[1].split()[0])
                except:
                    pass
                break

        if volume_ml is None:
            raise HTTPException(500, f"Could not parse volume from output:\n{proc.stdout}")

        return JSONResponse({"volume_ml": volume_ml})

    finally:
        # 4) Usuń plik wejściowy
        try:
            os.remove(file_path)
        except OSError:
            pass

# Uruchomienie serwera na porcie 8000
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)