"""
Inference runner for trained Random Forest Claim Predictor
Accepts JSON string arguments and outputs probability & explanation.
"""

import sys
import os
import json
import joblib
import numpy as np

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "models", "claim_predictor.joblib")

def load_model():
    if not os.path.exists(MODEL_PATH):
        return None
    return joblib.load(MODEL_PATH)

def predict(data):
    artifact = load_model()
    if not artifact:
        return {
            "success": False,
            "error": "Model artifact not found. Please train model first."
        }
    
    clf = artifact["model"]
    categories = artifact["categories"]
    cat_map = {c: i for i, c in enumerate(categories)}
    
    # Extract features safely
    distance_km = float(data.get("distance_km", 5.0))
    quantity = int(data.get("quantity", 50))
    remaining_shelf_life_hours = float(data.get("remaining_shelf_life_hours", 4.0))
    ngo_capacity = int(data.get("ngo_capacity", 200))
    capacity_ratio = quantity / max(1, ngo_capacity)
    category = data.get("category", "cooked_meals")
    category_encoded = cat_map.get(category, 0)
    is_emergency = int(bool(data.get("is_emergency", False)))
    requires_refrigeration = int(bool(data.get("requires_refrigeration", False)))
    
    feature_row = np.array([[
        distance_km,
        quantity,
        remaining_shelf_life_hours,
        ngo_capacity,
        capacity_ratio,
        category_encoded,
        is_emergency,
        requires_refrigeration
    ]])
    
    prob = float(clf.predict_proba(feature_row)[0][1])
    score = int(round(prob * 100))
    
    # Explainable factors
    explanations = []
    if distance_km <= 8.0:
        explanations.append(f"Close proximity ({distance_km:.1f} km) increases prompt dispatch chance.")
    elif distance_km > 20.0:
        explanations.append(f"Extended transit distance ({distance_km:.1f} km) presents pickup challenge.")
        
    if remaining_shelf_life_hours >= 3.0:
        explanations.append(f"Sufficient rescue window ({remaining_shelf_life_hours:.1f} hrs) allows regular coordination.")
    else:
        explanations.append(f"Tight window ({remaining_shelf_life_hours:.1f} hrs) demands rapid response.")
        
    if capacity_ratio <= 0.6:
        explanations.append(f"Organization capacity comfortably covers donation ({quantity} servings).")
        
    return {
        "success": True,
        "claimProbability": prob,
        "mlScore": score,
        "modelVersion": artifact["version"],
        "algorithm": artifact["algorithm"],
        "metrics": artifact["metrics"],
        "explanations": explanations
    }

if __name__ == "__main__":
    if len(sys.argv) > 1:
        try:
            input_data = json.loads(sys.argv[1])
            res = predict(input_data)
            print(json.dumps(res))
        except Exception as e:
            print(json.dumps({"success": False, "error": str(e)}))
    else:
        # Default test run
        test_res = predict({
            "distance_km": 4.5,
            "quantity": 80,
            "remaining_shelf_life_hours": 4.5,
            "ngo_capacity": 300,
            "category": "cooked_meals",
            "is_emergency": False,
            "requires_refrigeration": False
        })
        print(json.dumps(test_res, indent=2))
