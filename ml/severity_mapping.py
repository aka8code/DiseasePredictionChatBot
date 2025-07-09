SYMPTOM_SEVERITY = {
    'fever': ['low', 'medium', 'high'],
    'headache': ['mild', 'moderate', 'severe'],
    'cough': ['dry', 'wet'],
    'fatigue': ['mild', 'severe'],
 
}

def get_severity_levels(symptom):
    return SYMPTOM_SEVERITY.get(symptom.lower(), [])
