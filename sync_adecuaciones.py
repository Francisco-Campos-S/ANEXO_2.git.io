import json

nums = {5, 6, 9, 13, 14, 16, 19, 23, 26, 30, 32, 33, 37, 38, 42, 50, 52, 55, 56, 62}
with open('datos.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

for est in data['estudiantes']:
    if est.get('numero') in nums:
        est['tipo_adecuacion'] = 'significativa'
    else:
        est['tipo_adecuacion'] = 'no_significativa'

with open('datos.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=4)

count = sum(1 for e in data['estudiantes'] if e['tipo_adecuacion'] == 'significativa')
print(f"Total marked as significativa: {count}")
