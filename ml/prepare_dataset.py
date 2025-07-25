import pandas as pd
import joblib
from sklearn.preprocessing import LabelEncoder

def preprocess_symptom_data():
    df = pd.read_csv('data/disease_symptoms.csv')

    # Group by disease and filter out those with fewer than 15 instances
    df = df.groupby('diseases').filter(lambda x: len(x) >= 15)

    # Display first few rows to ensure it's loaded correctly
    print(df.head())

    # Separate features (X) and target (y)
    X = df.drop(columns=['diseases'])
    y = df['diseases']

    # Encode the disease labels
    le = LabelEncoder()
    y_encoded = le.fit_transform(y)

    # Save processed data
    joblib.dump((X, y_encoded), 'data/processed_dataset.pkl')
    joblib.dump(le, 'data/label_encoder.pkl')

    print("✅ Dataset processed and saved!")

if __name__ == '__main__':
    preprocess_symptom_data()
