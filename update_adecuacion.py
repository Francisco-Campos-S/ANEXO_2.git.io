import pandas as pd
import json
from fuzzywuzzy import process
from unidecode import unidecode
import os

def clean_text(text):
    if not isinstance(text, str):
        return ""
    # Normalize to remove accents and special characters
    return unidecode(text).strip().lower()

# Paths
excel_path = "ANEXO 10.xlsx"
json_path = "datos.json"

# Read Excel
df = pd.read_excel(excel_path)
excel_names = df['Estudiante'].dropna().astype(str).tolist()
cleaned_excel_names = [clean_text(name) for name in excel_names]

# Read JSON
with open(json_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

updated_count = 0
estudiantes = data.get('estudiantes', [])

# Map cleaned names to original objects for easier access if needed, 
# but we will just iterate over JSON students.

json_names_cleaned = [clean_text(est['nombre']) for est in estudiantes]

for i, est in enumerate(estudiantes):
    name_json_cleaned = json_names_cleaned[i]
    
    # Check if this student is in the Excel list using fuzzy matching
    # We look for the best match for the current JSON student among all Excel names
    match, score = process.extractOne(name_json_cleaned, cleaned_excel_names)
    
    if score >= 90:  # Threshold for "fuzzy" match
        est['tipo_adecuacion'] = "significativa"
        updated_count += 1
    else:
        est['tipo_adecuacion'] = "no_significativa"

# Save JSON
with open(json_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=4)

print(f"Total updated to 'significativa': {updated_count}")
