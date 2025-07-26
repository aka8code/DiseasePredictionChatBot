import pandas as pd
from sklearn.model_selection import train_test_split
from xgboost import XGBClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import joblib
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

def main():
    # Load preprocessed data and label encoder
    X, y_encoded = joblib.load("data/processed_dataset.pkl")
    le = joblib.load("data/label_encoder.pkl")

    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
    )

    # Initialize model
    model = XGBClassifier(
        objective='multi:softmax',
        num_class=len(le.classes_),
        eval_metric='mlogloss',
        n_estimators=30,
        max_depth=5,
        learning_rate=0.1,
        n_jobs=2,
        early_stopping_rounds=10,
        tree_method='hist'
    )

    # Train model with eval set for early stopping
    model.fit(
        X_train, y_train,
        eval_set=[(X_test, y_test)],
        verbose=True
    )

    # Predict
    y_pred = model.predict(X_test)

    # Print accuracy and classification report

    print("----------------------")
    print("Accuracy:", accuracy_score(y_test, y_pred))
    print("\nClassification Report:\n")
    print(classification_report(
        y_test, y_pred,
        labels=np.unique(y_test),
        target_names=le.inverse_transform(np.unique(y_test)),
        zero_division=0
    ))

    # Save model
    joblib.dump(model, "data/disease_prediction_model.pkl")

    # --- Plot confusion matrix for top frequent diseases ---

    TOP_N = 15  

    # Get frequencies of classes in y_test
    unique, counts = np.unique(y_test, return_counts=True)
    class_counts = dict(zip(unique, counts))

    # Sort classes by frequency
    top_classes = sorted(class_counts, key=class_counts.get, reverse=True)[:TOP_N]

    # Filter indices for y_test belonging to top classes
    indices = [i for i, label in enumerate(y_test) if label in top_classes]

    # Filter y_test and y_pred for top classes only
    y_test_top = y_test[indices]
    y_pred_top = y_pred[indices]

    # Compute confusion matrix for top classes
    cm_top = confusion_matrix(y_test_top, y_pred_top, labels=top_classes)

    # Convert label indices to original class names
    top_class_names = le.inverse_transform(top_classes)

    # Plot confusion matrix heatmap
    plt.figure(figsize=(12, 10))
    sns.heatmap(cm_top, annot=True, fmt='d', cmap='Blues',
                xticklabels=top_class_names, yticklabels=top_class_names)
    plt.xlabel('Predicted')
    plt.ylabel('True')
    plt.title(f'Confusion Matrix for Top {TOP_N} Frequent Diseases')
    plt.show()

    # Save the symptom index for prediction mapping
    symptom_index = {symptom: idx for idx, symptom in enumerate(X.columns)}
    joblib.dump(symptom_index, "data/symptom_index.pkl")
    feature_list = list(X.columns)
    joblib.dump(feature_list, "data/feature_list.pkl")
    print("DONNNNNEEEEE")
if __name__ == "__main__":
    main()
