import json

# List of student numbers with significativa adecuacion
significativa_numbers = {5, 6, 9, 13, 14, 16, 19, 23, 26, 30, 32, 33, 37, 38, 42, 50, 52, 55, 56, 62}

# Paths
json_path = 'datos.json'

# Read JSON
with open(json_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

updated_count = 0
estudiantes = data.get('estudiantes', [])

for est in estudiantes:
    num = est.get('numero')
    if num in significativa_numbers:
        est['tipo_adecuacion'] = "significativa"
        updated_count += 1
    else:
        est['tipo_adecuacion'] = "no_significativa"

# Save JSON
with open(json_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=4)

print(f"Total updated to 'significativa': {updated_count}")
