# 🚀 Guía de Despliegue en GitHub Pages

## Paso 1: Preparar el Repositorio Local

```bash
# Navegar al directorio del proyecto
cd "C:\Users\Personal\Desktop\PROFE ARTIFICAIL 2025\GENERADORES 2025\ANEXO 2\ANEXO 2 CON LISTA\ANEXO 2"

# Inicializar Git (si no está inicializado)
git init

# Agregar todos los archivos
git add .

# Crear el primer commit
git commit -m "Initial commit: Sistema web Anexo 2"
```

## Paso 2: Crear Repositorio en GitHub

1. Ve a https://github.com
2. Click en el botón **"New"** (nuevo repositorio)
3. Nombre sugerido: `anexo-2-apoyos-educativos`
4. Descripción: `Sistema web para registro de apoyos educativos - Anexo 2`
5. Selecciona **Public** para que GitHub Pages funcione gratis
6. NO inicialices con README (ya tenemos uno)
7. Click en **"Create repository"**

## Paso 3: Conectar y Subir

```bash
# Conectar tu repositorio local con GitHub
git remote add origin https://github.com/TU-USUARIO/anexo-2-apoyos-educativos.git

# Renombrar rama a main (si es necesario)
git branch -M main

# Subir el código
git push -u origin main
```

## Paso 4: Activar GitHub Pages

1. En tu repositorio de GitHub, ve a **Settings**
2. En el menú lateral, busca **Pages**
3. En **Source**, selecciona:
   - Branch: `main`
   - Folder: `/ (root)`
4. Click en **Save**
5. Espera 1-2 minutos

## Paso 5: Acceder a tu Sitio

Tu sitio estará disponible en:
```
https://TU-USUARIO.github.io/anexo-2-apoyos-educativos/
```

## 📋 Checklist de Verificación

Antes de desplegar, verifica que tengas estos archivos:

- ✅ `index.html` - Página principal
- ✅ `styles.css` - Estilos
- ✅ `app.js` - Lógica JavaScript
- ✅ `datos.json` - Base de datos
- ✅ `README.md` - Documentación
- ✅ `.gitignore` - Archivos a ignorar
- ✅ `test.html` - Página de pruebas

## 🧪 Probar Localmente Primero

```bash
# Opción 1: Python
python -m http.server 8000

# Opción 2: Node.js
npx http-server

# Opción 3: PHP
php -S localhost:8000
```

Luego abre: `http://localhost:8000`

## 🔧 Solución de Problemas

### Problema: "La página muestra 404"
**Solución:** 
- Verifica que el archivo se llame exactamente `index.html` (no `Index.html`)
- Espera 2-3 minutos después de activar Pages
- Limpia la caché del navegador (Ctrl + F5)

### Problema: "Los datos no se cargan"
**Solución:**
- Verifica que `datos.json` esté en la raíz del repositorio
- Abre la consola del navegador (F12) para ver errores
- Verifica que no haya errores de CORS

### Problema: "El PDF no se genera"
**Solución:**
- Usa Google Chrome (recomendado)
- Verifica tu conexión a internet (necesaria para las librerías CDN)
- Selecciona un estudiante antes de generar

## 📱 Probar en Diferentes Dispositivos

Una vez desplegado, prueba en:
- ✅ Computadora de escritorio
- ✅ Tablet
- ✅ Smartphone
- ✅ Diferentes navegadores (Chrome, Firefox, Safari, Edge)

## 🔄 Actualizar el Sitio

Cuando hagas cambios:

```bash
# Agregar cambios
git add .

# Crear commit
git commit -m "Descripción de los cambios"

# Subir a GitHub
git push
```

Los cambios aparecerán en 1-2 minutos.

## 🎨 Personalización

### Cambiar el nombre de la institución
Edita `index.html`, líneas 88-94

### Cambiar colores
Edita `styles.css`, líneas 14-18 (variables CSS)

### Actualizar estudiantes
1. Modifica `ANEXO 2.xlsx`
2. Ejecuta: `python extract_data.py`
3. Commit y push los cambios

## 📊 Uso de GitHub Pages Gratis

- ✅ Almacenamiento: 1 GB
- ✅ Ancho de banda: 100 GB/mes
- ✅ Actualizaciones: Ilimitadas
- ✅ HTTPS: Incluido y automático

## 🔐 Seguridad

- No incluyas contraseñas en el código
- Los datos en `datos.json` son públicos
- No agregues información sensible de estudiantes
- El archivo `.gitignore` excluye archivos temporales

## 📞 Recursos Adicionales

- [Documentación de GitHub Pages](https://docs.github.com/pages)
- [Guía de Git](https://git-scm.com/doc)
- [Video tutorial incluido](https://youtu.be/wF6TR_aaiRc)

---

## ⚡ Comando Rápido (Todo en Uno)

```bash
git init
git add .
git commit -m "Sistema Anexo 2 completo"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/anexo-2-apoyos-educativos.git
git push -u origin main
```

Luego activa Pages en Settings > Pages > Source: main

---

**¡Tu sistema está listo para el mundo! 🌍**
