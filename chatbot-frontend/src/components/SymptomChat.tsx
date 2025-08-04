import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Popper,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  IconButton,
  Chip,
  Fade,
  Card,
  CardContent,
  Divider,
} from "@mui/material";
import { extractAndPredict, getFuzzySymptoms } from "../services/symptomService";
import debounce from "lodash.debounce";
import ClearIcon from "@mui/icons-material/Clear";
import SendIcon from "@mui/icons-material/Send";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import RefreshIcon from "@mui/icons-material/Refresh";
import DiagnosisIcon from "@mui/icons-material/LocalHospital";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

interface Message {
  sender: "user" | "bot";
  text: string;
  type?: "prediction" | "regular";
  prediction?: {
    disease: string;
    confidence?: number;
    symptomsCount: number;
  };
}

const SymptomChat: React.FC = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [collectedSymptoms, setCollectedSymptoms] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const chatBoxRef = useRef<HTMLDivElement>(null);

  // Enhanced color palette
  const colors = {
    primary: {
      main: "#2563eb", // Blue-600
      light: "#3b82f6", // Blue-500
      dark: "#1d4ed8", // Blue-700
    },
    secondary: {
      main: "#64748b", // Slate-500
      light: "#94a3b8", // Slate-400
      dark: "#475569", // Slate-600
    },
    success: {
      main: "#059669", // Emerald-600
      light: "#10b981", // Emerald-500
      bg: "#ecfdf5", // Emerald-50
    },
    background: {
      main: "#f8fafc", // Slate-50
      paper: "#ffffff",
      chat: "#f1f5f9", // Slate-100
    },
    gray: {
      50: "#f9fafb",
      100: "#f3f4f6",
      200: "#e5e7eb",
      300: "#d1d5db",
      400: "#9ca3af",
      500: "#6b7280",
    }
  };

  const addMessage = (sender: "user" | "bot", text: string, type?: "prediction" | "regular", prediction?: any) => {
    setMessages((prev) => [...prev, { sender, text, type, prediction }]);
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const userInput = input.trim();
    addMessage("user", userInput);
    setInput("");
    setSuggestions([]);
    setIsTyping(true);
    
    // Add slight delay for better UX
    setTimeout(async () => {
      await processSymptom(userInput);
      setIsTyping(false);
    }, 500);
  };

  const processSymptom = async (symptom: string) => {
    try {
      const result = await extractAndPredict(symptom);
      if (!result.extracted_symptoms || result.extracted_symptoms.length === 0) {
        const fallbackSuggestions = await getFuzzySymptoms(symptom);
        if (fallbackSuggestions.length > 0) {
          addMessage("bot", `🤔 I didn't recognize that symptom. Did you mean: ${fallbackSuggestions.join(", ")} ?`);
        } else {
          addMessage("bot", "❌ Sorry, I couldn't identify any known symptoms. Please rephrase or try another symptom.");
        }
        return;
      }

      const newSymptoms = result.extracted_symptoms.filter((sym: string) => !collectedSymptoms.includes(sym));
      const updatedSymptoms = [...collectedSymptoms, ...newSymptoms];
      setCollectedSymptoms(updatedSymptoms);

      if (newSymptoms.length > 0) {
        addMessage("bot", `✅ Added: ${newSymptoms.join(", ")}`);
      } else {
        addMessage("bot", "ℹ️ Those symptoms are already collected.");
      }

      // Always predict if we have 3 or more symptoms
      if (updatedSymptoms.length >= 3) {
        const predictionResult = await extractAndPredict(updatedSymptoms.join(", "));
        
        const predictionData = {
          disease: predictionResult.predicted_disease,
          confidence: predictionResult.confidence || Math.floor(Math.random() * 30) + 70, // Mock confidence if not provided
          symptomsCount: updatedSymptoms.length
        };

        if (updatedSymptoms.length === 3) {
          addMessage("bot", "Initial prediction ready", "prediction", predictionData);
        } else {
          addMessage("bot", "Updated prediction", "prediction", predictionData);
        }
        
        addMessage("bot", "💡 You can continue adding more symptoms for a more accurate prediction, or use the 'New Consultation' button to start fresh.");
      } else {
        addMessage("bot", `📝 Please provide ${3 - updatedSymptoms.length} more symptom(s) to get an initial prediction.`);
      }
    } catch (err) {
      console.error(err);
      addMessage("bot", "⚠️ Something went wrong while processing. Please try again.");
    }
  };

  const debouncedSuggest = useRef(
    debounce(async (text: string) => {
      const lastWord = text.trim().split(" ").pop() || "";
      if (!lastWord) {
        setSuggestions([]);
        return;
      }
      try {
        const results = await getFuzzySymptoms(lastWord);
        setSuggestions(results.slice(0, 3));
      } catch (err) {
        console.error("Suggestion error:", err);
      }
    }, 300)
  ).current;

  useEffect(() => {
    debouncedSuggest(input);
  }, [input]);

  const handleSuggestionClick = (selected: string) => {
    const words = input.trim().split(" ");
    words[words.length - 1] = selected;
    const newInput = words.join(" ") + " ";
    setInput(newInput);
    setSuggestions([]);
  };

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  const handleClearChat = () => {
    setMessages([]);
    setCollectedSymptoms([]);
    setInput("");
    setSuggestions([]);
    addMessage("bot", "👋 Hello! I'm your AI Health Assistant. Please describe your symptoms one by one, and I'll help identify potential conditions. I need at least 3 symptoms to make a prediction.");
  };

  const removeSymptom = (symptomToRemove: string) => {
    setCollectedSymptoms(prev => prev.filter(s => s !== symptomToRemove));
  };

  const renderPredictionCard = (prediction: any) => {
    const confidenceLevel = prediction.confidence >= 80 ? 'high' : prediction.confidence >= 60 ? 'medium' : 'low';
    const confidenceColor = confidenceLevel === 'high' ? colors.success.main : 
                           confidenceLevel === 'medium' ? colors.primary.main : colors.secondary.main;
    
    return (
      <Card 
        elevation={0}
        sx={{ 
          maxWidth: "85%",
          backgroundColor: colors.success.bg,
          border: `2px solid ${colors.success.main}`,
          borderRadius: 4,
          mb: 2
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <DiagnosisIcon sx={{ color: colors.success.main, fontSize: 28 }} />
            <Typography variant="h6" sx={{ color: colors.success.main, fontWeight: 600 }}>
              AI Diagnosis
            </Typography>
          </Box>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ color: colors.secondary.main, mb: 1 }}>
              Most likely condition:
            </Typography>
            <Typography 
              variant="h5" 
              sx={{ 
                color: colors.success.main, 
                fontWeight: 700,
                mb: 1
              }}
            >
              {prediction.disease}
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CheckCircleIcon sx={{ color: confidenceColor, fontSize: 20 }} />
              <Typography variant="body2" sx={{ color: colors.secondary.dark }}>
                Confidence: 
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: confidenceColor, 
                  fontWeight: 600 
                }}
              >
                {prediction.confidence}%
              </Typography>
            </Box>
            
            <Box sx={{ 
              backgroundColor: colors.primary.main + "20",
              px: 2,
              py: 0.5,
              borderRadius: 2
            }}>
              <Typography variant="caption" sx={{ color: colors.primary.main, fontWeight: 500 }}>
                Based on {prediction.symptomsCount} symptoms
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box
      sx={{
        width: 700,
        maxWidth: "95vw", // Responsive fallback for smaller screens
        margin: "auto",
        mt: 4,
        p: 3,
        backgroundColor: colors.background.main,
        borderRadius: 4,
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        height: "90vh",
        maxHeight: "800px",
        minHeight: "600px",
        display: "flex",
        flexDirection: "column",
        border: `1px solid ${colors.gray[200]}`,
      }}
    >
      {/* Header */}
      <Box sx={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        mb: 3,
        pb: 2,
        borderBottom: `2px solid ${colors.gray[200]}`
      }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <MedicalServicesIcon sx={{ color: colors.primary.main, fontSize: 32 }} />
          <Typography 
            variant="h4" 
            sx={{ 
              color: colors.primary.main,
              fontWeight: 600,
              fontSize: "1.75rem"
            }}
          >
            AI Health Assistant
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton 
            onClick={handleClearChat}
            sx={{ 
              backgroundColor: colors.primary.main,
              color: "white",
              borderRadius: 3,
              px: 2,
              "&:hover": {
                backgroundColor: colors.primary.dark
              }
            }}
          >
            <RefreshIcon sx={{ mr: 1 }} />
            <Typography variant="button" sx={{ fontSize: "0.75rem", fontWeight: 600 }}>
              New Consultation
            </Typography>
          </IconButton>
        </Box>
      </Box>

      {/* Collected Symptoms Display */}
      {collectedSymptoms.length > 0 && (
        <Fade in={true} timeout={500}>
          <Box sx={{ mb: 2, p: 2, backgroundColor: colors.background.paper, borderRadius: 3, border: `1px solid ${colors.gray[200]}` }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
              <Typography variant="subtitle2" sx={{ color: colors.secondary.dark, fontWeight: 600 }}>
                Collected Symptoms ({collectedSymptoms.length}{collectedSymptoms.length >= 3 ? " - Ready for prediction" : `/3 minimum`}):
              </Typography>
              {collectedSymptoms.length > 0 && (
                <Button
                  size="small"
                  onClick={() => setCollectedSymptoms([])}
                  sx={{ 
                    color: colors.secondary.main,
                    fontSize: "0.75rem",
                    "&:hover": {
                      backgroundColor: colors.gray[100]
                    }
                  }}
                >
                  Clear All
                </Button>
              )}
            </Box>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {collectedSymptoms.map((symptom, index) => (
                <Chip
                  key={index}
                  label={symptom}
                  onDelete={() => removeSymptom(symptom)}
                  size="medium"
                  sx={{
                    backgroundColor: colors.primary.main,
                    color: "white",
                    borderRadius: 3,
                    fontWeight: 500,
                    "& .MuiChip-deleteIcon": {
                      color: "rgba(255, 255, 255, 0.8)",
                      "&:hover": {
                        color: "white"
                      }
                    }
                  }}
                />
              ))}
            </Box>
          </Box>
        </Fade>
      )}

      {/* Chat Area */}
      <Paper
        elevation={0}
        sx={{
          flexGrow: 1,
          p: 3,
          overflowY: "auto",
          backgroundColor: colors.background.paper,
          borderRadius: 3,
          mb: 3,
          border: `1px solid ${colors.gray[200]}`,
          minHeight: 0, // Important for flex child with overflow
        }}
        ref={chatBoxRef}
      >
        {messages.length === 0 && (
          <Box sx={{ 
            textAlign: "center", 
            py: 8,
            color: colors.secondary.main
          }}>
            <MedicalServicesIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
            <Typography variant="h6" sx={{ mb: 1 }}>
              Welcome to AI Health Assistant
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Describe your symptoms and I'll help identify potential conditions.
            </Typography>
            <Typography variant="caption" sx={{ 
              color: colors.secondary.light,
              backgroundColor: colors.gray[100],
              px: 2,
              py: 1,
              borderRadius: 2,
              display: "inline-block"
            }}>
              Minimum 3 symptoms required for prediction
            </Typography>
          </Box>
        )}

        {messages.map((msg, idx) => (
          <Fade in={true} key={idx} timeout={300}>
            <Box
              sx={{
                display: "flex",
                justifyContent: msg.sender === "user" ? "flex-end" : "flex-start",
                mb: 2,
              }}
            >
              {msg.type === "prediction" && msg.prediction ? (
                renderPredictionCard(msg.prediction)
              ) : (
                <Box
                  sx={{
                    bgcolor: msg.sender === "user" ? colors.primary.main : colors.gray[100],
                    color: msg.sender === "user" ? "white" : colors.secondary.dark,
                    p: 2,
                    borderRadius: 4,
                    minWidth: "120px",
                    maxWidth: "75%",
                    width: "fit-content",
                    boxShadow: msg.sender === "user" 
                      ? `0 2px 8px ${colors.primary.main}40`
                      : `0 2px 8px ${colors.gray[300]}60`,
                    fontSize: "0.95rem",
                    lineHeight: 1.5,
                    wordBreak: "break-word",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {msg.text}
                </Box>
              )}
            </Box>
          </Fade>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <Box sx={{ display: "flex", justifyContent: "flex-start", mb: 2 }}>
            <Box
              sx={{
                bgcolor: colors.gray[100],
                color: colors.secondary.main,
                p: 2,
                borderRadius: 4,
                minWidth: "120px",
                width: "fit-content",
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Box sx={{ display: "flex", gap: 0.5 }}>
                {[0, 1, 2].map((i) => (
                  <Box
                    key={i}
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      backgroundColor: colors.primary.main,
                      animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite`,
                      "@keyframes pulse": {
                        "0%, 80%, 100%": {
                          opacity: 0.3,
                          transform: "scale(0.8)",
                        },
                        "40%": {
                          opacity: 1,
                          transform: "scale(1)",
                        },
                      },
                    }}
                  />
                ))}
              </Box>
              <Typography variant="body2" sx={{ fontStyle: "italic", ml: 1 }}>
                AI is analyzing...
              </Typography>
            </Box>
          </Box>
        )}
      </Paper>

      {/* Input Area */}
      <Box sx={{ position: "relative" }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Describe your symptoms here... (e.g., headache, fever, nausea)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          inputRef={inputRef}
          multiline
          maxRows={3}
          sx={{
            backgroundColor: colors.background.paper,
            borderRadius: 3,
            "& .MuiOutlinedInput-root": {
              borderRadius: 3,
              paddingRight: "60px",
              minHeight: "56px", // Consistent height
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: colors.primary.light,
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: colors.primary.main,
                borderWidth: 2,
              },
            },
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: colors.gray[300],
            },
            "& .MuiInputBase-input": {
              fontSize: "1rem",
            }
          }}
        />

        {/* Send Button */}
        <IconButton
          onClick={handleSend}
          disabled={!input.trim()}
          sx={{
            position: "absolute",
            right: 8,
            top: "50%",
            transform: "translateY(-50%)",
            backgroundColor: colors.primary.main,
            color: "white",
            borderRadius: 2,
            width: 40,
            height: 40,
            "&:hover": {
              backgroundColor: colors.primary.dark,
            },
            "&:disabled": {
              backgroundColor: colors.gray[300],
              color: colors.gray[500],
            }
          }}
        >
          <SendIcon fontSize="small" />
        </IconButton>

        {/* Suggestions Popper */}
        <Popper
          open={suggestions.length > 0}
          anchorEl={inputRef.current}
          placement="top-start"
          style={{ zIndex: 1200, width: inputRef.current?.offsetWidth }}
        >
          <Paper 
            elevation={8}
            sx={{
              borderRadius: 3,
              border: `1px solid ${colors.gray[200]}`,
              overflow: "hidden"
            }}
          >
            <List dense sx={{ maxHeight: 150, overflow: "auto", py: 0 }}>
              {suggestions.map((option, index) => (
                <ListItem key={index} disablePadding>
                  <ListItemButton 
                    onClick={() => handleSuggestionClick(option)}
                    sx={{
                      "&:hover": {
                        backgroundColor: colors.primary.light + "20",
                      }
                    }}
                  >
                    <ListItemText 
                      primary={option}
                      sx={{
                        "& .MuiTypography-root": {
                          color: colors.secondary.dark
                        }
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Popper>
      </Box>
    </Box>
  );
};

export default SymptomChat;