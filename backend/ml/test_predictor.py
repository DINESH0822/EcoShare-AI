import json
import math
import subprocess
import sys
import unittest
from pathlib import Path

import predictor


class PredictorTests(unittest.TestCase):
    def test_valid_features_return_bounded_model_probability(self):
        result = predictor.predict({
            "distance_km": 4.5,
            "quantity": 80,
            "remaining_shelf_life_hours": 4.5,
            "ngo_capacity": 300,
            "category": "cooked_meals",
            "is_emergency": False,
            "requires_refrigeration": False,
        })
        self.assertTrue(result["success"])
        self.assertEqual(result["predictionSource"], "python-model")
        self.assertGreaterEqual(result["claimProbability"], 0)
        self.assertLessEqual(result["claimProbability"], 1)
        self.assertIn("datasetProvenance", result)

    def test_non_finite_features_are_rejected_by_predictor(self):
        with self.assertRaisesRegex(ValueError, "distance_km"):
            predictor.predict({"distance_km": math.nan})

    def test_invalid_boolean_is_reported_as_failed_cli_prediction(self):
        command = [
            sys.executable,
            str(Path(predictor.__file__).resolve()),
            json.dumps({"is_emergency": "false"}),
        ]
        completed = subprocess.run(command, check=True, capture_output=True, text=True)
        result = json.loads(completed.stdout)
        self.assertFalse(result["success"])
        self.assertIn("is_emergency", result["error"])


if __name__ == "__main__":
    unittest.main()
