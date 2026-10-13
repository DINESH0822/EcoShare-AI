"""
EcoShare AI: Claim Success Prediction Engine
Supervised Learning Pipeline for Food Donation Claim Probability

Features:
- distance_km (float): Haversine distance between donor and NGO
- quantity (int): Number of servings/meals
- remaining_shelf_life_hours (float): Hours remaining before food expiration
- ngo_capacity (int): NGO max daily handling capacity
- capacity_ratio (float): quantity / ngo_capacity
- category_encoded (int): Encoded food category
- is_emergency (int): 1 if marked urgent, 0 otherwise
- requires_refrigeration (int): 1 if cold chain needed, 0 otherwise

Target:
- is_successfully_claimed (binary): 1 if claimed and completed, 0 if expired/cancelled
"""

import os
import joblib
import numpy as np
import pandas as pd
import sklearn
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, roc_auc_score, confusion_matrix

CATEGORIES = [
    "cooked_meals",
    "raw_vegetables",
    "raw_fruits",
    "dairy",
    "bakery",
    "grains_pulses",
    "packaged_food",
    "beverages",
    "snacks",
    "meat_seafood",
    "mixed",
    "other"
]

CATEGORY_MAP = {cat: idx for idx, cat in enumerate(CATEGORIES)}

def generate_synthetic_dataset(num_samples=2500, random_seed=42):
    """
    Generate synthetic development dataset for supervised training pipeline.
    Label is grounded in realistic logistics constraints.
    """
    np.random.seed(random_seed)
    
    distance_km = np.random.exponential(scale=7.5, size=num_samples)
    distance_km = np.clip(distance_km, 0.5, 45.0)
    
    quantity = np.random.choice([15, 30, 50, 100, 150, 250, 500], size=num_samples)
    remaining_shelf_life_hours = np.random.uniform(0.5, 24.0, size=num_samples)
    ngo_capacity = np.random.choice([100, 200, 300, 500, 1000], size=num_samples)
    category = np.random.choice(CATEGORIES, size=num_samples)
    category_encoded = np.array([CATEGORY_MAP[c] for c in category])
    
    is_emergency = (remaining_shelf_life_hours < 3.0).astype(int)
    requires_refrigeration = np.random.choice([0, 1], size=num_samples, p=[0.75, 0.25])
    capacity_ratio = np.clip(quantity / ngo_capacity, 0.01, 2.5)
    
    # Ground truth probability calculation based on operational realities:
    # 1. Proximity penalty: distance > 15km reduces claim probability sharply
    # 2. Expiry penalty: < 1.5 hr without immediate proximity decreases claim success
    # 3. Capacity fit: ratio between 0.05 and 0.8 is optimal
    logits = (
        2.2
        - (distance_km * 0.16)
        + (remaining_shelf_life_hours * 0.08)
        - (capacity_ratio * 1.5)
        + (is_emergency * 0.4)
        - (requires_refrigeration * 0.35)
    )
    
    prob = 1.0 / (1.0 + np.exp(-logits))
    is_claimed = (np.random.uniform(0, 1, size=num_samples) < prob).astype(int)
    
    df = pd.DataFrame({
        "distance_km": distance_km,
        "quantity": quantity,
        "remaining_shelf_life_hours": remaining_shelf_life_hours,
        "ngo_capacity": ngo_capacity,
        "capacity_ratio": capacity_ratio,
        "category_encoded": category_encoded,
        "is_emergency": is_emergency,
        "requires_refrigeration": requires_refrigeration,
        "is_successfully_claimed": is_claimed
    })
    return df

def train_model():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    model_dir = os.path.join(base_dir, "models")
    os.makedirs(model_dir, exist_ok=True)
    
    print("[1/4] Generating synthetic training data...")
    df = generate_synthetic_dataset(num_samples=3000)
    
    features = [
        "distance_km",
        "quantity",
        "remaining_shelf_life_hours",
        "ngo_capacity",
        "capacity_ratio",
        "category_encoded",
        "is_emergency",
        "requires_refrigeration"
    ]
    X = df[features]
    y = df["is_successfully_claimed"]
    
    print(f"[2/4] Training set size: {len(X)} samples. Positive claim rate: {y.mean():.2%}")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    print("[3/4] Fitting Random Forest Classifier...")
    clf = RandomForestClassifier(
        n_estimators=100,
        max_depth=7,
        min_samples_split=5,
        random_state=42,
        n_jobs=-1
    )
    clf.fit(X_train, y_train)
    
    # Evaluation
    y_pred = clf.predict(X_test)
    y_prob = clf.predict_proba(X_test)[:, 1]
    
    report = classification_report(y_test, y_pred, output_dict=True)
    auc = roc_auc_score(y_test, y_prob)
    cm = confusion_matrix(y_test, y_pred)
    
    print("\n--- MODEL EVALUATION REPORT ---")
    print(f"ROC-AUC Score: {auc:.4f}")
    print(f"Accuracy: {report['accuracy']:.4f}")
    print(f"Precision (Class 1): {report['1']['precision']:.4f}")
    print(f"Recall (Class 1): {report['1']['recall']:.4f}")
    print(f"F1-Score (Class 1): {report['1']['f1-score']:.4f}")
    print(f"Confusion Matrix:\n{cm}")
    
    # Save artifacts
    model_artifact = {
        "model": clf,
        "features": features,
        "categories": CATEGORIES,
        "metrics": {
            "roc_auc": float(auc),
            "accuracy": float(report["accuracy"]),
            "precision": float(report["1"]["precision"]),
            "recall": float(report["1"]["recall"]),
            "f1_score": float(report["1"]["f1-score"]),
            "confusion_matrix": cm.tolist()
        },
        "dataset_provenance": (
            "Synthetic examples generated by generate_synthetic_dataset; "
            "labels sampled from a hand-written logistic probability formula."
        ),
        "metric_scope": (
            "80/20 random holdout from the generated synthetic dataset; "
            "not evidence of real-world performance."
        ),
        "training_scikit_learn_version": sklearn.__version__,
        "version": "1.0.0-rf",
        "algorithm": "RandomForestClassifier(n_estimators=100, max_depth=7)"
    }
    
    model_path = os.path.join(model_dir, "claim_predictor.joblib")
    joblib.dump(model_artifact, model_path)
    print(f"\n[4/4] Model artifact successfully saved to: {model_path}")

if __name__ == "__main__":
    train_model()
