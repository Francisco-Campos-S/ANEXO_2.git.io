# 📚 ANEXO 2: Registro de Apoyos Educativos

Sistema web para generar informes de registro de apoyos educativos basado en el Anexo 2 del Ministerio de Educación de Costa Rica. Desarrollado para GitHub Pages.

## 🌟 Características

- ✅ **Gestión de Estudiantes**: Lista completa de 63 estudiantes con información detallada
- 📝 **Formularios Interactivos**: Dos formularios reutilizables para cualquier materia
- ✏️ **Materia Flexible**: Escribe el nombre de cualquier asignatura (no limitado a Español/Matemática)
- 🎯 **Sistema de Códigos**: Más de 90 códigos de apoyos educativos organizados por categoría:
  - Apoyos Personales (A.P.)
  - Apoyos Organizativos (A.A.)
  - Apoyos Materiales y Tecnológicos
  - Apoyos Curriculares
  - Apoyos Evaluativos
- 📄 **Generación de PDF**: Exporta informes completos en formato PDF
- 📱 **Diseño Responsivo**: Funciona perfectamente en computadoras, tablets y móviles
- 🎨 **Interfaz Moderna**: Diseño limpio y profesional con animaciones suaves

## 🚀 Demo en Vivo

Visita la aplicación en: `https://[tu-usuario].github.io/[nombre-repositorio]/`

## 📋 Requisitos

- Navegador web moderno (Chrome, Firefox, Edge, Safari)
- Conexión a internet (solo para la primera carga)

## 🛠️ Instalación Local

1. Clona el repositorio:
```bash
git clone https://github.com/[tu-usuario]/[nombre-repositorio].git
cd [nombre-repositorio]
```

2. Abre el archivo `index.html` en tu navegador o usa un servidor local:
```bash
# Con Python
python -m http.server 8000

# Con Node.js (http-server)
npx http-server

# Con PHP
php -S localhost:8000
```

3. Accede a `http://localhost:8000` en tu navegador

## 📖 Uso

### 1. Seleccionar Asignatura
Usa los botones de navegación superior para cambiar entre:
- Formulario 1
- Formulario 2
- Lista de Estudiantes

**Nota:** Puedes usar cualquier formulario para cualquier materia. Solo escribe el nombre de la asignatura en el campo correspondiente.

### 2. Seleccionar Estudiante
1. En el formulario, selecciona un estudiante del menú desplegable
2. La información del estudiante se autocompletará automáticamente:
   - Sección
   - Nivel de Funcionamiento
   - Fecha actual

### 3. Agregar Apoyos
1. Consulta la guía de códigos en el panel izquierdo
2. Selecciona códigos de apoyo en cada categoría
3. La descripción del apoyo se mostrará automáticamente
4. Escribe los resultados obtenidos en cada área

### 4. Completar Información
- Verifica o modifica la información institucional
- **Escribe el nombre de la materia** en el campo "Asignatura"
- Confirma el nombre del docente responsable
- Selecciona el período correspondiente (Primero o Segundo)

### 5. Generar PDF
1. Revisa que toda la información esté completa
2. Haz clic en el botón "📄 Generar PDF"
3. El archivo PDF se descargará automáticamente con el formato:
   `Anexo2_[Asignatura]_[NombreEstudiante].pdf`

### 6. Limpiar Formulario
- Usa el botón "🔄 Limpiar Formulario" para resetear todos los campos
- Se solicitará confirmación antes de borrar los datos

## 📁 Estructura del Proyecto

```
ANEXO 2/
├── index.html          # Página principal
├── styles.css          # Estilos CSS
├── app.js              # Lógica JavaScript
├── datos.json          # Base de datos (estudiantes y códigos)
├── README.md           # Documentación
├── extract_data.py     # Script para extraer datos del Excel
└── analyze_excel.py    # Script de análisis del Excel
```

## 🔧 Tecnologías Utilizadas

- **HTML5**: Estructura semántica
- **CSS3**: Estilos modernos con Grid y Flexbox
- **JavaScript (ES6+)**: Lógica de la aplicación
- **jsPDF**: Generación de archivos PDF
- **html2canvas**: Captura de contenido HTML para PDF

## 🎯 Categorías de Apoyos

### Apoyos Personales (A.P.)
13 estrategias para el apoyo individual del estudiante

### Apoyos Organizativos (A.A.)
11 estrategias para la organización del aula

### Apoyos Materiales y Tecnológicos
17 recursos y herramientas de apoyo

### Apoyos Curriculares
35 adaptaciones al currículo

### Apoyos Evaluativos
15 modificaciones en la evaluación

## 📊 Datos Incluidos

- **63 estudiantes** de diferentes secciones (7-1, 7-2, 8-1, 8-2, 9-1, 9-2)
- **91 códigos de apoyo** organizados en 5 categorías
- Información institucional: CTP Sabalito, Circuito 06
- **Formularios flexibles** para cualquier materia

## 🎨 Características del Diseño

- Paleta de colores profesional
- Tipografía legible (Segoe UI)
- Animaciones suaves
- Feedback visual en interacciones
- Scrollbar personalizado
- Modo de impresión optimizado

## 📱 Compatibilidad

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Dispositivos móviles iOS y Android

## 🔄 Actualizar Datos

Para actualizar la lista de estudiantes o códigos:

1. Modifica el archivo Excel `ANEXO 2.xlsx`
2. Ejecuta el script de extracción:
```bash
python extract_data.py
```
3. El archivo `datos.json` se actualizará automáticamente

## 📄 Licencia

Este proyecto es de uso educativo para el Colegio Nocturno La Cuesta.

## 👥 Créditos

- **Docente Responsable**: Gerardo Ramirez Rojas
- **Institución**: CTP Sabalito (Colegio Técnico Profesional Agropecuario de Sabalito)
- **Circuito**: 06
- **Año**: 2025

## 📞 Soporte

Para dudas o sugerencias sobre el uso del sistema, contacta con el departamento de orientación del colegio.

## 🚀 Despliegue en GitHub Pages

### Opción 1: Desde la Interfaz Web

1. Ve a tu repositorio en GitHub
2. Click en `Settings` > `Pages`
3. En `Source`, selecciona `main` branch
4. Click en `Save`
5. Tu sitio estará disponible en unos minutos

### Opción 2: Desde la Terminal

```bash
# Inicializar repositorio (si no existe)
git init
git add .
git commit -m "Versión inicial del Anexo 2"

# Crear repositorio en GitHub y conectar
git remote add origin https://github.com/[tu-usuario]/[nombre-repo].git
git branch -M main
git push -u origin main

# Habilitar GitHub Pages desde Settings > Pages
```

## 📝 Notas Importantes

- Los datos se almacenan localmente en el navegador durante la sesión
- No se envía información a ningún servidor externo
- Los PDF se generan completamente en el navegador del usuario
- Se recomienda usar Google Chrome para la mejor experiencia de generación de PDF

## 🔮 Futuras Mejoras

- [ ] Persistencia de datos con LocalStorage
- [ ] Exportar a Excel
- [ ] Imprimir directamente sin PDF
- [ ] Modo oscuro
- [ ] Multi-idioma
- [ ] Búsqueda y filtrado de estudiantes
- [ ] Estadísticas de apoyos utilizados

---

**Desarrollado con ❤️ para la educación inclusiva**
