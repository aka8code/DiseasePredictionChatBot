import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Paper,
  MenuItem,
  CircularProgress,
  Divider,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { getFuzzyMatch, getPrediction } from "../services/symptomService";

const SymptomInput: React.FC = () => {
  const [input, setInput] = useState("");
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [allSymptoms, setAllSymptoms] = useState<string[]>([]);
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/symptoms/")
      .then((res) => res.json())
      .then((data) => {
        setAllSymptoms(data.symptoms || []);
        console.log("Fetched symptoms:", data.symptoms);
      })
      .catch((err) => {
        console.error("Failed to load symptoms:", err);
      });
  }, []);

  const updateSuggestions = async (value: string) => {
    if (!value.trim()) {
      setSuggestions([]);
      return;
    }
    try {
      const results = await getFuzzyMatch(value);
      console.log("Backend suggestions:", results);
      setSuggestions(results);
    } catch (error) {
      console.error("Failed to fetch suggestions:", error);
      setSuggestions([]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);
    updateSuggestions(value);
  };

  const handleAddSymptom = (symptomToAdd?: string) => {
    const symptom = (symptomToAdd ?? input).trim();
    if (symptom && !symptoms.includes(symptom)) {
      setSymptoms([...symptoms, symptom]);
    }
    setInput("");
    setSuggestions([]);
  };

  const handleSubmit = async () => {
    if (symptoms.length === 0) return;
    setLoading(true);
    try {
      const disease = await getPrediction(symptoms);
      setResult(disease || "No prediction received");
    } catch (error) {
      console.error("Prediction failed:", error);
      setResult("Error occurred during prediction.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSymptom = (index: number) => {
    const newSymptoms = symptoms.filter((_, i) => i !== index);
    setSymptoms(newSymptoms);
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      // bgcolor="#f5f5f5"
    >
      <Box
        width="700px"
        p={4}
        component={Paper}
        elevation={5}
        borderRadius={4}
      >
        <Typography variant="h4" gutterBottom fontWeight="bold" align="center">
          🩺 Symptom Checker
        </Typography>

        <Box display="flex" gap={2} mb={2} position="relative">
          <TextField
            fullWidth
            value={input}
            onChange={handleInputChange}
            placeholder="Type a symptom (e.g., fever)"
            variant="outlined"
            label="Symptom"
            size="medium"
          />
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleAddSymptom()}
            disabled={!input.trim()}
            sx={{ minWidth: 100 }}
          >
            Add
          </Button>

          {suggestions.length > 0 && (
            <Paper
              elevation={3}
              sx={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                zIndex: 10,
                maxHeight: 200,
                overflowY: "auto",
              }}
            >
              {suggestions.map((s, idx) => (
                <MenuItem key={idx} onClick={() => handleAddSymptom(s)}>
                  {s}
                </MenuItem>
              ))}
            </Paper>
          )}
        </Box>

        {symptoms.length > 0 && (
          <>
            <Typography variant="h6" color="textSecondary" gutterBottom>
              Selected Symptoms:
            </Typography>
            <List dense>
              {symptoms.map((s, idx) => (
                <ListItem
                  key={idx}
                  sx={{
                    borderRadius: 2,
                    bgcolor: "#f3f4f6",
                    mb: 1,
                  }}
                  secondaryAction={
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => handleDeleteSymptom(idx)}
                    >
                      <DeleteIcon color="error" />
                    </IconButton>
                  }
                >
                  <ListItemText primary={s} />
                </ListItem>
              ))}
            </List>
          </>
        )}

        <Divider sx={{ my: 3 }} />

        <Button
          onClick={handleSubmit}
          variant="contained"
          color="success"
          disabled={loading || symptoms.length === 0}
          fullWidth
          size="large"
          sx={{ py: 1.5 }}
        >
          {loading ? <CircularProgress size={26} color="inherit" /> : "🔍 Predict Disease"}
        </Button>

        {result && (
          <Box mt={4} p={3} bgcolor="#e8f5e9" borderRadius={2}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              ✅ Predicted Disease:
            </Typography>
            <Typography variant="body1" fontSize={18}>
              {result}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default SymptomInput;
