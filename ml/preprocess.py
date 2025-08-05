#loading and exploring the dataset
import pandas as pd

def load_dataset():
    df = pd.read_csv('data/disease_symptoms.csv')
    return df

def explore_dataset(df):
    print("------------------ First 5 rows of dataset:")
    print(df.head())
    
    print("\n------------------Columns in dataset:")
    print(df.columns)
    
    print("\n------------------Dataset info:")
    print(df.info())
    
    print("\n------------------Sample diseases:")
    print(df['diseases'].unique()[:10]) 

if __name__ == "__main__":
    df = load_dataset()
    explore_dataset(df)
