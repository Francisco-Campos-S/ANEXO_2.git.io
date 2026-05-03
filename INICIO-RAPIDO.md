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

## 🔑 Gemini (texto sugerido con IA)

**No pegues la clave en `index.html` en un repo público.** Usa una de estas formas:

### A) Automático en GitHub Pages (recomendado)

1. Crea o **rota** tu clave en [Google AI Studio](https://aistudio.google.com/apikey).
2. En el repo de GitHub: **Settings → Secrets and variables → Actions → New repository secret**
   - Nombre: `GEMINI_API_KEY`
   - Valor: tu clave (solo se usa en el servidor de Actions, no aparece en el código del branch).
3. **Settings → Pages → Build and deployment → Source: GitHub Actions** (no “Deploy from a branch” si quieres usar este flujo).
4. Haz **push** a `main` (o `master`). El workflow `.github/workflows/deploy-github-pages.yml` genera `gemini-config.js` al publicar y despliega el sitio.
5. Restringe la clave por **HTTP referrer** en Google: `https://TU-USUARIO.github.io/NOMBRE-DEL-REPO/*` y, si pruebas en local, `http://localhost:*` y `http://127.0.0.1:*`.

### B) Solo en tu PC

Copia `config.local.example.js` como `config.local.js`, pon la clave ahí (está en `.gitignore`).

### C) Sin archivo (navegador)

En la consola (F12): `localStorage.setItem('GEMINI_API_KEY','…');` y recarga.

### Orden de prioridad

`config.local.js` (si existe) sustituye lo demás al cargar; luego `gemini-config.js`; luego `localStorage`.

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
