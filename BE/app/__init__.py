import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.config import MODEL_DIR

MODEL_DIR_ABS = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", MODEL_DIR))
sys.path.insert(0, MODEL_DIR_ABS)
