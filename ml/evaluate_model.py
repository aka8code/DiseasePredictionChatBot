# ml/evaluate_model.py
#evaluates the dataset and model performance, also generates a confusion matrix for the top N most frequent diseases
import joblib
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import confusion_matrix
from sklearn.model_selection import train_test_split

# Load saved files
X, y_encoded = joblib.load("data/processed_dataset.pkl")
model = joblib.load("data/disease_prediction_model.pkl")
label_encoder = joblib.load("data/label_encoder.pkl")

# Reuse the same test split
X_train, X_test, y_train, y_test = train_test_split(
    X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
)

# Predict
y_pred = model.predict(X_test)

# Confusion matrix
cm = confusion_matrix(y_test, y_pred)
class_names = label_encoder.classes_

# Show top N most frequent diseases
N = 15
top_indices = np.argsort(np.bincount(y_test))[-N:]
filtered_cm = cm[np.ix_(top_indices, top_indices)]
filtered_labels = class_names[top_indices]

# Plot confusion matrix
plt.figure(figsize=(12, 8))
sns.heatmap(filtered_cm, annot=True, fmt="d", cmap="Blues",
            xticklabels=filtered_labels, yticklabels=filtered_labels)
plt.xlabel("Predicted")
plt.ylabel("True")
plt.title(f"Confusion Matrix (Top {N} Diseases)")
plt.xticks(rotation=45, ha="right")
plt.tight_layout()
plt.show()
