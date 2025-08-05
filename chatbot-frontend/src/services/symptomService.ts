// functions to interact with the backend for symptom-related operations.
// src/services/symptomService.ts
import axios from "axios";

export const getFuzzySymptoms = async (query: string): Promise<string[]> => {
  const response = await axios.post("http://localhost:8000/fuzzy_symptoms/", {
    query,
  });
  return response.data.matches || [];
};

export interface ExtractPredictResponse {
  extracted_symptoms: string[];
  predicted_disease?: string;
}

export async function extractAndPredict(sentence: string): Promise<ExtractPredictResponse> {
  const response = await fetch("http://localhost:8000/extract_and_predict/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sentence }),
  });

  if (!response.ok) {
    throw new Error("Failed to extract and predict");
  }

  return response.json();
}
