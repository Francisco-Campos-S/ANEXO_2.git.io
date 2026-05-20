import json
import re
from pathlib import Path

import openpyxl


BASE_DIR = Path(__file__).resolve().parent


def cargar_estudiantes_anexo2(raw_path):
    estudiantes = []
    contenido = raw_path.read_text(encoding='utf-8').splitlines()

    for linea in contenido:
        if not linea.strip():
            continue

        partes = [p.strip() for p in linea.split('\t')]
        if len(partes) < 3:
            continue

        numero = int(partes[0])
        nombre = partes[1]
        seccion = partes[2]

        # En Anexo 2 no se carga nivel de funcionamiento ni observaciones en el JSON.
        resto = []
        cedula = ''
        observaciones = ''

        if len(partes) > 3 and partes[3]:
            primero = partes[3]
            if re.search(r'\d', primero) or primero.upper().startswith('YR'):
                cedula = primero

        estudiantes.append({
            'numero': numero,
            'nombre': nombre,
            'seccion': seccion,
            'cedula': cedula,
            'tipo_adecuacion': 'no_significativa',
            'observaciones': '',
        })

    return estudiantes


def cargar_estudiantes_significativos(raw_path):
    estudiantes = []
    contenido = raw_path.read_text(encoding='utf-8').splitlines()

    for linea in contenido:
        if not linea.strip():
            continue

        partes = [p.strip() for p in linea.split('\t')]
        if len(partes) < 7:
            continue

        estudiantes.append({
            'numero': int(partes[0]),
            'nombre': partes[1],
            'seccion': partes[2],
            'cedula': partes[3],
            'genero': partes[4],
            'tipo_adecuacion': 'significativa',
            'observaciones': f"{partes[5]} {partes[6]}".strip(),
        })

    return estudiantes


def extraer_apoyos(excel_path):
    wb = openpyxl.load_workbook(excel_path, data_only=True)
    ws_espanol = wb['ESPAÑOL ']

    def leer_bloque(min_row, max_row):
        items = []
        for row in ws_espanol.iter_rows(min_row=min_row, max_row=max_row, values_only=True):
            if row[0] and row[1]:
                items.append({
                    'codigo': row[0],
                    'descripcion': row[1],
                })
        return items

    return {
        'personales': leer_bloque(6, 18),
        'organizativos': leer_bloque(20, 30),
        'materiales': leer_bloque(33, 49),
        'curriculares': leer_bloque(53, 87),
        'evaluativos': leer_bloque(90, 104),
    }


def main():
    anexo2_path = BASE_DIR / 'anexo2_101_raw.txt'
    anexo10_path = BASE_DIR / 'anexo10_37_raw.txt'
    apoyos_path = BASE_DIR / 'ANEXO 2.xlsx'
    json_path = BASE_DIR / 'datos.json'

    estudiantes = cargar_estudiantes_anexo2(anexo2_path)
    estudiantes.extend(cargar_estudiantes_significativos(anexo10_path))
    apoyos = extraer_apoyos(apoyos_path)

    datos = {
        'estudiantes': estudiantes,
        'apoyos': apoyos,
    }

    with json_path.open('w', encoding='utf-8') as f:
        json.dump(datos, f, ensure_ascii=False, indent=2)

    print('OK - Datos extraidos exitosamente a datos.json')
    print(f'OK - {len(estudiantes)} estudiantes')
    print(f"OK - {sum(1 for e in estudiantes if e['tipo_adecuacion'] == 'significativa')} significativos")
    print(f"OK - {len(apoyos['personales'])} apoyos personales")
    print(f"OK - {len(apoyos['organizativos'])} apoyos organizativos")
    print(f"OK - {len(apoyos['materiales'])} apoyos materiales")
    print(f"OK - {len(apoyos['curriculares'])} apoyos curriculares")
    print(f"OK - {len(apoyos['evaluativos'])} apoyos evaluativos")


if __name__ == '__main__':
    main()
