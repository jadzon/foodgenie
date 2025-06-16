FROM python:3.6

WORKDIR /app

# 1) Install minimal dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt \
 && pip install "h5py<3.0.0"

# 2) Copy & install your package
COPY setup.py .
COPY food_volume_estimation/ food_volume_estimation/
COPY funkcja.py .
RUN python setup.py install

# 3) Place model files where volume_estimator expects them
COPY models/fine_tune_food_videos/monovideo_fine_tune_food_videos.json /models/depth_architecture.json
COPY models/fine_tune_food_videos/monovideo_fine_tune_food_videos.h5       /models/depth_weights.h5
COPY models/segmentation/mask_rcnn_food_segmentation.h5                    /models/segmentation_weights.h5

# 4) Copy entrypoint script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# 5) Default workdir for assets
VOLUME ["/assets"]
WORKDIR /assets

# 6) Entrypoint picks up first image in /assets
ENTRYPOINT ["/entrypoint.sh"]
