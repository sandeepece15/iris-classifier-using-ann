const form = document.getElementById("predictionForm");
const result = document.getElementById("result");
const errorBox = document.getElementById("error");
const predictBtn = document.getElementById("predictBtn");
const sampleBtn = document.getElementById("sampleBtn");

const fields = ["sepal_length", "sepal_width", "petal_length", "petal_width"];

sampleBtn.addEventListener("click", () => {
    document.getElementById("sepal_length").value = "5.1";
    document.getElementById("sepal_width").value = "3.5";
    document.getElementById("petal_length").value = "1.4";
    document.getElementById("petal_width").value = "0.2";
    errorBox.classList.add("hidden");
});

function setBar(name, value) {
    const percent = (value * 100).toFixed(1);
    document.getElementById(`${name}Val`).textContent = `${percent}%`;
    document.getElementById(`${name}Bar`).style.width = `${percent}%`;
}

form.addEventListener("submit", async (event) => {
    event.preventDefault();
    errorBox.classList.add("hidden");

    const payload = {};
    for (const field of fields) {
        payload[field] = Number(document.getElementById(field).value);
    }

    predictBtn.disabled = true;
    predictBtn.querySelector("span:first-child").textContent = "Predicting...";

    try {
        const response = await fetch("/predict", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || "Prediction failed.");
        }

        document.getElementById("species").textContent = data.prediction;
        document.getElementById("confidence").textContent =
            `${(data.confidence * 100).toFixed(1)}%`;

        setBar("setosa", data.probabilities["Iris-setosa"]);
        setBar("versicolor", data.probabilities["Iris-versicolor"]);
        setBar("virginica", data.probabilities["Iris-virginica"]);

        result.classList.remove("hidden");
        result.scrollIntoView({ behavior: "smooth", block: "nearest" });
    } catch (error) {
        errorBox.textContent = error.message;
        errorBox.classList.remove("hidden");
        result.classList.add("hidden");
    } finally {
        predictBtn.disabled = false;
        predictBtn.querySelector("span:first-child").textContent = "Predict species";
    }
});
