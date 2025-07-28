//API LOGIC
const BASE_URL = "http://127.0.0.1:8000" //Django server

export const getFuzzyMatch = async (input: string): Promise<string[]> => {
    //send user input to fuzzy endpoint
    const response = await fetch(`${BASE_URL}/fuzzy_symptoms/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: input }), // use 'query' key to match backend
    });
    //receives an array 
    const data = await response.json();
    // returns string[] of suggestions
    return data.matches || []; // updated to match backend response structure
};

export const getPrediction = async (symptoms: string[]): Promise<string> => {
    // sends array of symptoms to predict
    console.log("Sending symptoms to /predict/:", symptoms); // debug
    const response = await fetch(`${BASE_URL}/predict/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptoms }),
    });
    //receives an array 
    const data = await response.json();
    console.log("Prediction response: ",data)
    return data.predicted_disease;
}
