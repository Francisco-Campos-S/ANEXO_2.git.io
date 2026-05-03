# Guía de Inicio Rápido - ANEXO 2

## 🚀 Para empezar en 3 pasos:

### 1. Probar localmente
```bash
# Abre index.html en tu navegador
# o usa un servidor local:
python -m http.server 8000
```

### 2. Subir a GitHub
```bash
git init
git add .
git commit -m "Initial commit: Anexo 2 Sistema Web"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/anexo-2.git
git push -u origin main
```

### 3. Activar GitHub Pages
1. Ve a tu repositorio en GitHub
2. Settings > Pages
3. Source: main branch
4. ¡Listo! Tu sitio estará en: `https://TU-USUARIO.github.io/anexo-2/`

## 📺 Tutorial de Uso

Mira el video de demostración: https://youtu.be/wF6TR_aaiRc

## 💡 Consejos

- **Chrome** es el navegador recomendado para generar PDFs
- Revisa el archivo **README.md** para documentación completa
- Los datos se cargan desde **datos.json**

## 🔧 Personalizar

Para cambiar la información institucional, edita estos campos en `index.html`:
- Línea ~90: Institución
- Línea ~93: Circuito
- Línea ~106: Docente responsable

Para actualizar estudiantes o apoyos, edita `datos.json` o ejecuta:
```bash
python extract_data.py
```

## 📞 Ayuda

¿Problemas? Revisa que todos estos archivos existan:
- ✅ index.html
- ✅ styles.css
- ✅ app.js
- ✅ datos.json

---
**¡Listo para usar!** 🎉
