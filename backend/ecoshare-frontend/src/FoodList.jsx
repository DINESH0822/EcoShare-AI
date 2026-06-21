import { useEffect, useState } from "react";
import axios from "axios";

function FoodList() {
  const [foods, setFoods] = useState([]);

  useEffect(() => {
    axios
      .get("https://ecoshare-ai.onrender.com/api/food")
      .then((res) => setFoods(res.data))
      .catch((err) => console.log(err));
  }, []);

  return (
    <div>
      <h2>Available Food Donations</h2>

      {foods.map((food) => (
        <div className="food-card" key={food._id}>
          <h3>{food.foodName}</h3>

          <p>
            <strong>Quantity:</strong> {food.quantity}
          </p>

          <p>
            <strong>Location:</strong> {food.location}
          </p>

          <p>
            <strong>Status:</strong> {food.status}
          </p>

          <button className="claim-btn">
            Claim Food
          </button>
        </div>
      ))}
    </div>
  );
}

export default FoodList;