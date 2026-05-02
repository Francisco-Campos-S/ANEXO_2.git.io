import openpyxl
import json

wb = openpyxl.load_workbook('ANEXO 2.xlsx', data_only=True)

# Extraer lista de estudiantes
ws_estudiantes = wb['LISTA DE ESTUDIANTES']
estudiantes = []

for row in ws_estudiantes.iter_rows(min_row=2, max_row=102, values_only=True):
    if row[1]:
        estudiantes.append({
            "numero": row[0],
            "nombre": row[1],
            "seccion": row[2] if row[2] else "",
            "cedula": row[3] if row[3] else "",
            "observaciones": row[4] if row[4] else ""
        })

# Extraer códigos de apoyos personales (A.P.)
ws_espanol = wb['ESPAÑOL ']
apoyos_personales = []

for row in ws_espanol.iter_rows(min_row=6, max_row=18, values_only=True):
    if row[0] and row[1]:
        apoyos_personales.append({
            "codigo": row[0],
            "descripcion": row[1]
        })

# Extraer códigos de apoyos organizativos (A.A.)
apoyos_organizativos = []

for row in ws_espanol.iter_rows(min_row=20, max_row=30, values_only=True):
    if row[0] and row[1]:
        apoyos_organizativos.append({
            "codigo": row[0],
            "descripcion": row[1]
        })

# Extraer apoyos materiales y tecnológicos
apoyos_materiales = []

for row in ws_espanol.iter_rows(min_row=33, max_row=49, values_only=True):
    if row[0] and row[1]:
        apoyos_materiales.append({
            "codigo": row[0],
            "descripcion": row[1]
        })

# Extraer apoyos curriculares
apoyos_curriculares = []

for row in ws_espanol.iter_rows(min_row=53, max_row=87, values_only=True):
    if row[0] and row[1]:
        apoyos_curriculares.append({
            "codigo": row[0],
            "descripcion": row[1]
        })

# Extraer apoyos evaluativos
apoyos_evaluativos = []

for row in ws_espanol.iter_rows(min_row=90, max_row=104, values_only=True):
    if row[0] and row[1]:
        apoyos_evaluativos.append({
            "codigo": row[0],
            "descripcion": row[1]
        })

# Crear el archivo JSON con todos los datos
datos = {
    "estudiantes": estudiantes,
    "apoyos": {
        "personales": apoyos_personales,
        "organizativos": apoyos_organizativos,
        "materiales": apoyos_materiales,
        "curriculares": apoyos_curriculares,
        "evaluativos": apoyos_evaluativos
    }
}

with open('datos.json', 'w', encoding='utf-8') as f:
    json.dump(datos, f, ensure_ascii=False, indent=2)

print("OK - Datos extraidos exitosamente a datos.json")
print(f"OK - {len(estudiantes)} estudiantes")
print(f"OK - {len(apoyos_personales)} apoyos personales")
print(f"OK - {len(apoyos_organizativos)} apoyos organizativos")
print(f"OK - {len(apoyos_materiales)} apoyos materiales")
print(f"OK - {len(apoyos_curriculares)} apoyos curriculares")
print(f"OK - {len(apoyos_evaluativos)} apoyos evaluativos")
