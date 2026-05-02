// Variables globales
let datos = null;

// Cargar datos al iniciar
document.addEventListener('DOMContentLoaded', async () => {
    await cargarDatos();
    inicializarApp();
});

// Cargar datos desde el JSON
async function cargarDatos() {
    try {
        const response = await fetch('datos.json');
        datos = await response.json();
        console.log('Datos cargados:', datos);
        
        // Notificación de carga exitosa
        mostrarNotificacion('Sistema listo', 'Datos cargados correctamente. ¡Puede comenzar a trabajar!', 'exito');
    } catch (error) {
        console.error('Error al cargar datos:', error);
        mostrarNotificacion('Error crítico', 'No se pudieron cargar los datos. Por favor, recarga la página.', 'error');
    }
}

// Inicializar la aplicación
function inicializarApp() {
    if (!datos) return;
    
    // Llenar selectores de estudiantes
    llenarSelectEstudiantes('estudianteSelect_esp');
    llenarSelectEstudiantes('estudianteSelect_mat');
    
    // Llenar guías de códigos
    llenarGuiaCodigos();
    llenarGuiaCodigosMat();
    
    // Llenar listas desplegables de códigos
    llenarSelectsCodigos('seccionEspanol');
    llenarSelectsCodigos('seccionMatematica');
    
    // Llenar tabla de estudiantes
    llenarTablaEstudiantes();
    
    // Configurar navegación
    configurarNavegacion();
    
    // Configurar eventos de estudiantes
    configurarEventosEstudiantes();
    
    // Configurar eventos de códigos
    configurarEventosCodigos();
    
    // Configurar botones PDF y limpiar
    configurarBotones();
    
    // Establecer fecha actual
    actualizarFecha('esp');
    actualizarFecha('mat');
}

// Llenar selector de estudiantes
function llenarSelectEstudiantes(selectId) {
    const select = document.getElementById(selectId);
    if (!select) return;
    
    select.innerHTML = '<option value="">Seleccione un estudiante...</option>';
    
    datos.estudiantes.forEach(estudiante => {
        const option = document.createElement('option');
        option.value = estudiante.nombre;
        option.textContent = estudiante.nombre;
        option.dataset.seccion = estudiante.seccion;
        option.dataset.observaciones = estudiante.observaciones;
        select.appendChild(option);
    });
}

// Llenar guía de códigos (Español)
function llenarGuiaCodigos() {
    llenarListaCodigos('listaApoyosPersonales', datos.apoyos.personales);
    llenarListaCodigos('listaApoyosOrganizativos', datos.apoyos.organizativos);
    llenarListaCodigos('listaApoyosMateriales', datos.apoyos.materiales);
    llenarListaCodigos('listaApoyosCurriculares', datos.apoyos.curriculares);
    llenarListaCodigos('listaApoyosEvaluativos', datos.apoyos.evaluativos);
}

// Llenar guía de códigos (Matemática)
function llenarGuiaCodigosMat() {
    llenarListaCodigos('listaApoyosPersonales_mat', datos.apoyos.personales);
    llenarListaCodigos('listaApoyosOrganizativos_mat', datos.apoyos.organizativos);
    llenarListaCodigos('listaApoyosMateriales_mat', datos.apoyos.materiales);
    llenarListaCodigos('listaApoyosCurriculares_mat', datos.apoyos.curriculares);
    llenarListaCodigos('listaApoyosEvaluativos_mat', datos.apoyos.evaluativos);
}

// Llenar una lista de códigos
function llenarListaCodigos(containerId, apoyos) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = '';
    
    apoyos.forEach(apoyo => {
        const div = document.createElement('div');
        div.className = 'codigo-item';
        div.innerHTML = `<strong>${apoyo.codigo}</strong>${apoyo.descripcion}`;
        container.appendChild(div);
    });
}

// Llenar selects de códigos en los formularios
function llenarSelectsCodigos(seccionId) {
    const seccion = document.getElementById(seccionId);
    if (!seccion) return;
    
    const selectsPersonales = seccion.querySelectorAll('select[data-tipo="personales"]');
    selectsPersonales.forEach(select => {
        llenarSelectCodigos(select, datos.apoyos.personales);
    });
    
    const selectsOrganizativos = seccion.querySelectorAll('select[data-tipo="organizativos"]');
    selectsOrganizativos.forEach(select => {
        llenarSelectCodigos(select, datos.apoyos.organizativos);
    });
    
    const selectsMateriales = seccion.querySelectorAll('select[data-tipo="materiales"]');
    selectsMateriales.forEach(select => {
        llenarSelectCodigos(select, datos.apoyos.materiales);
    });
    
    const selectsCurriculares = seccion.querySelectorAll('select[data-tipo="curriculares"]');
    selectsCurriculares.forEach(select => {
        llenarSelectCodigos(select, datos.apoyos.curriculares);
    });
    
    const selectsEvaluativos = seccion.querySelectorAll('select[data-tipo="evaluativos"]');
    selectsEvaluativos.forEach(select => {
        llenarSelectCodigos(select, datos.apoyos.evaluativos);
    });
}

// Llenar un select individual con códigos
function llenarSelectCodigos(select, apoyos) {
    select.innerHTML = '<option value="">Seleccione...</option>';
    
    apoyos.forEach(apoyo => {
        const option = document.createElement('option');
        option.value = apoyo.codigo;
        option.textContent = apoyo.codigo;
        option.dataset.descripcion = apoyo.descripcion;
        select.appendChild(option);
    });
}

// Llenar tabla de estudiantes
function llenarTablaEstudiantes() {
    const tbody = document.getElementById('cuerpoTablaEstudiantes');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    datos.estudiantes.forEach((estudiante, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${index + 1}</td>
            <td>${estudiante.nombre}</td>
            <td>${estudiante.seccion}</td>
            <td>${estudiante.cedula}</td>
            <td>${estudiante.observaciones}</td>
        `;
        tbody.appendChild(tr);
    });
}

// Configurar navegación entre secciones
function configurarNavegacion() {
    const btnEspanol = document.getElementById('btnEspanol');
    const btnMatematica = document.getElementById('btnMatematica');
    const btnLista = document.getElementById('btnLista');
    
    btnEspanol.addEventListener('click', () => cambiarSeccion('seccionEspanol', btnEspanol));
    btnMatematica.addEventListener('click', () => cambiarSeccion('seccionMatematica', btnMatematica));
    btnLista.addEventListener('click', () => cambiarSeccion('seccionLista', btnLista));
}

// Cambiar de sección
function cambiarSeccion(seccionId, boton) {
    // Ocultar todas las secciones
    document.querySelectorAll('.seccion').forEach(s => s.classList.remove('active'));
    
    // Mostrar la sección seleccionada
    document.getElementById(seccionId).classList.add('active');
    
    // Actualizar botones
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    boton.classList.add('active');
}

// Configurar eventos de selección de estudiantes
function configurarEventosEstudiantes() {
    const selectEsp = document.getElementById('estudianteSelect_esp');
    const selectMat = document.getElementById('estudianteSelect_mat');
    
    selectEsp.addEventListener('change', () => actualizarInfoEstudiante('esp'));
    selectMat.addEventListener('change', () => actualizarInfoEstudiante('mat'));
}

// Actualizar información del estudiante seleccionado
function actualizarInfoEstudiante(tipo) {
    const select = document.getElementById(`estudianteSelect_${tipo}`);
    const selectedOption = select.options[select.selectedIndex];
    
    if (selectedOption.value) {
        const seccion = selectedOption.dataset.seccion;
        const observaciones = selectedOption.dataset.observaciones;
        
        document.getElementById(`seccionAuto_${tipo}`).textContent = seccion;
        document.getElementById(`nivelAuto_${tipo}`).textContent = observaciones;
    } else {
        document.getElementById(`seccionAuto_${tipo}`).textContent = '';
        document.getElementById(`nivelAuto_${tipo}`).textContent = '';
    }
}

// Configurar eventos de selección de códigos
function configurarEventosCodigos() {
    const selectsEsp = document.querySelectorAll('#seccionEspanol .codigo-select');
    const selectsMat = document.querySelectorAll('#seccionMatematica .codigo-select');
    
    selectsEsp.forEach(select => {
        select.addEventListener('change', (e) => actualizarDescripcionApoyo(e.target));
    });
    
    selectsMat.forEach(select => {
        select.addEventListener('change', (e) => actualizarDescripcionApoyo(e.target));
    });
}

// Actualizar descripción del apoyo seleccionado
function actualizarDescripcionApoyo(select) {
    const selectedOption = select.options[select.selectedIndex];
    const descripcionElement = select.parentElement.querySelector('.descripcion-apoyo');
    
    if (selectedOption.value && selectedOption.dataset.descripcion) {
        descripcionElement.textContent = selectedOption.dataset.descripcion;
    } else {
        descripcionElement.textContent = '';
    }
}

// Actualizar fecha actual
function actualizarFecha(tipo) {
    const fechaElement = document.getElementById(`fechaAuto_${tipo}`);
    const hoy = new Date();
    const opciones = { year: 'numeric', month: 'long', day: 'numeric' };
    fechaElement.textContent = hoy.toLocaleDateString('es-ES', opciones);
}

// Configurar botones de acción
function configurarBotones() {
    // Botones de generar PDF
    document.getElementById('btnGenerarPDF_esp').addEventListener('click', () => generarPDF('esp'));
    document.getElementById('btnGenerarPDF_mat').addEventListener('click', () => generarPDF('mat'));
    
    // Botones de limpiar
    document.getElementById('btnLimpiar_esp').addEventListener('click', () => limpiarFormulario('esp'));
    document.getElementById('btnLimpiar_mat').addEventListener('click', () => limpiarFormulario('mat'));
}

// Generar PDF con formato profesional (como el ejemplo)
async function generarPDF(tipo) {
    const boton = document.getElementById(`btnGenerarPDF_${tipo}`);
    
    // Validar que se haya seleccionado un estudiante
    const estudianteSelect = document.getElementById(`estudianteSelect_${tipo}`);
    if (!estudianteSelect.value) {
        mostrarNotificacion('Error', 'Por favor, seleccione un estudiante antes de generar el PDF.', 'error');
        return;
    }
    
    // Validar que se haya escrito la asignatura
    const asignatura = document.getElementById(`asignatura_${tipo}`).value.trim();
    if (!asignatura) {
        mostrarNotificacion('Error', 'Por favor, escriba el nombre de la asignatura antes de generar el PDF.', 'error');
        return;
    }
    
    // Mostrar loading
    boton.classList.add('loading');
    boton.disabled = true;
    
    try {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'letter'
        });
        
        // Configuración de márgenes y dimensiones
        const margen = 15;
        const anchoUtil = 185;
        let y = 20;
        
        // Obtener datos del formulario
        const institucion = document.getElementById(`institucion_${tipo}`).value;
        const circuito = document.getElementById(`circuito_${tipo}`).value;
        const nombreEstudiante = estudianteSelect.value;
        const seccion = document.getElementById(`seccionAuto_${tipo}`).textContent;
        const nivel = document.getElementById(`nivelAuto_${tipo}`).textContent;
        const fecha = document.getElementById(`fechaAuto_${tipo}`).textContent;
        const docente = document.getElementById(`docente_${tipo}`).value;
        const asignatura = document.getElementById(`asignatura_${tipo}`).value;
        const periodoSeleccionado = document.querySelector(`input[name="periodo_${tipo}"]:checked`).value;
        
        // ========== CARGAR Y AGREGAR IMAGEN DE ENCABEZADO ==========
        try {
            const response = await fetch('encabezado.png');
            const blob = await response.blob();
            const reader = new FileReader();
            
            await new Promise((resolve) => {
                reader.onloadend = () => {
                    const imgData = reader.result;
                    // Agregar imagen al PDF
                    pdf.addImage(imgData, 'PNG', margen, y, anchoUtil, 20);
                    resolve();
                };
                reader.readAsDataURL(blob);
            });
            
            y += 25;
        } catch (error) {
            console.warn('No se pudo cargar la imagen, usando texto:', error);
            // Fallback: texto si falla la imagen
            pdf.setLineWidth(0.5);
            pdf.rect(margen, y, anchoUtil, 20);
            pdf.setFillColor(0, 51, 153);
            pdf.rect(margen + 2, y + 2, 35, 16, 'F');
            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(6);
            pdf.setFont('helvetica', 'bold');
            pdf.text('MINISTERIO DE', margen + 4, y + 6);
            pdf.text('EDUCACIÓN PÚBLICA', margen + 4, y + 9);
            pdf.setTextColor(0, 0, 0);
            pdf.setFontSize(7);
            pdf.text('Dirección Regional de Educación de Coto', margen + 40, y + 5);
            pdf.setFontSize(6.5);
            pdf.text('Supervisión de Centros Educativos, Circuito 06', margen + 40, y + 9);
            pdf.text(`${institucion}`, margen + 40, y + 13);
            y += 25;
        }
        
        // Título principal centrado
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('ANEXO 2: REGISTRO DE APOYOS EDUCATIVOS', 108, y, { align: 'center' });
        y += 8;
        
        pdf.setFontSize(11);
        pdf.text('Curso lectivo 2025', 108, y, { align: 'center' });
        y += 10;
        
        // ========== TABLA DE INFORMACIÓN CON BORDES ==========
        pdf.setLineWidth(0.3);
        pdf.setDrawColor(0, 0, 0);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(9);
        
        // Fila 1: Institución y Circuito (con bordes)
        let alturaFila = 7;
        pdf.rect(margen, y, anchoUtil * 0.75, alturaFila);
        pdf.rect(margen + anchoUtil * 0.75, y, anchoUtil * 0.25, alturaFila);
        pdf.text('Institución:', margen + 2, y + 5);
        pdf.setFont('helvetica', 'normal');
        pdf.text(institucion, margen + 25, y + 5);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Circuito:', margen + anchoUtil * 0.75 + 2, y + 5);
        pdf.setFont('helvetica', 'normal');
        pdf.text(circuito, margen + anchoUtil * 0.75 + 18, y + 5);
        y += alturaFila;
        
        // Fila 2: Nombre del estudiante y Sección (con bordes)
        pdf.rect(margen, y, anchoUtil * 0.75, alturaFila);
        pdf.rect(margen + anchoUtil * 0.75, y, anchoUtil * 0.25, alturaFila);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Nombre del estudiante:', margen + 2, y + 5);
        pdf.setFont('helvetica', 'normal');
        const nombreCorto = nombreEstudiante.length > 35 ? nombreEstudiante.substring(0, 32) + '...' : nombreEstudiante;
        pdf.text(nombreCorto, margen + 45, y + 5);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Sección:', margen + anchoUtil * 0.75 + 2, y + 5);
        pdf.setFont('helvetica', 'normal');
        pdf.text(seccion, margen + anchoUtil * 0.75 + 18, y + 5);
        y += alturaFila;
        
        // Fila 3: Nivel de Funcionamiento y Fecha (con bordes)
        alturaFila = 12;
        pdf.rect(margen, y, anchoUtil * 0.75, alturaFila);
        pdf.rect(margen + anchoUtil * 0.75, y, anchoUtil * 0.25, alturaFila);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Nivel de Funcionamiento:', margen + 2, y + 5);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
        const lineasNivel = pdf.splitTextToSize(nivel, anchoUtil * 0.70);
        pdf.text(lineasNivel, margen + 2, y + 9);
        pdf.setFontSize(9);
        pdf.text(fecha, margen + anchoUtil * 0.75 + 2, y + 7, { align: 'left', maxWidth: anchoUtil * 0.24 });
        y += alturaFila;
        
        // Fila 4: Docente y Asignatura (con bordes)
        alturaFila = 7;
        pdf.rect(margen, y, anchoUtil * 0.60, alturaFila);
        pdf.rect(margen + anchoUtil * 0.60, y, anchoUtil * 0.40, alturaFila);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Docente responsable:', margen + 2, y + 5);
        pdf.setFont('helvetica', 'normal');
        pdf.text(docente, margen + 38, y + 5);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Asignatura:', margen + anchoUtil * 0.60 + 2, y + 5);
        pdf.setFont('helvetica', 'normal');
        pdf.text(asignatura, margen + anchoUtil * 0.60 + 22, y + 5);
        y += alturaFila;
        
        // Fila 5: Períodos (con bordes)
        alturaFila = 6;
        pdf.rect(margen, y, anchoUtil * 0.50, alturaFila);
        pdf.rect(margen + anchoUtil * 0.50, y, anchoUtil * 0.50, alturaFila);
        const marca1 = periodoSeleccionado === 'primero' ? 'X' : '  ';
        const marca2 = periodoSeleccionado === 'segundo' ? 'X' : '  ';
        pdf.setFont('helvetica', 'bold');
        pdf.text(`Primer Período ( ${marca1} )`, margen + 2, y + 4.5);
        pdf.text(`Segundo Período ( ${marca2} )`, margen + anchoUtil * 0.50 + 2, y + 4.5);
        y += alturaFila + 5;
        
        pdf.text('Descripción del funcionamiento del Estudiante:', margen, y);
        y += 7;
        
        // ========== FUNCIÓN PARA DIBUJAR TABLAS CON BORDES ==========
        function dibujarTablaApoyos(titulo) {
            // Verificar espacio
            if (y > 240) {
                pdf.addPage();
                y = 20;
            }
            
            // Dimensiones de columnas
            const col1Width = 20;
            const col2Width = anchoUtil - col1Width - 50;
            const col3Width = 50;
            
            // Encabezado de la tabla con fondo gris y bordes
            const alturaEncabezado = 7;
            pdf.setFillColor(220, 220, 220);
            pdf.rect(margen, y, col1Width, alturaEncabezado, 'FD');
            pdf.rect(margen + col1Width, y, col2Width, alturaEncabezado, 'FD');
            pdf.rect(margen + col1Width + col2Width, y, col3Width, alturaEncabezado, 'FD');
            
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(9);
            pdf.text('Código', margen + col1Width/2, y + 4.5, { align: 'center' });
            pdf.text(titulo, margen + col1Width + col2Width/2, y + 4.5, { align: 'center' });
            pdf.text('Resultados', margen + col1Width + col2Width + col3Width/2, y + 4.5, { align: 'center' });
            y += alturaEncabezado;
            
            // Obtener los apoyos seleccionados
            const seccionForm = tipo === 'esp' ? 'seccionEspanol' : 'seccionMatematica';
            const selects = document.querySelectorAll(`#${seccionForm} .seccion-apoyos h4`);
            let seccionActual = null;
            
            selects.forEach(h4 => {
                const textoH4 = h4.textContent.replace('●', '').trim();
                if (textoH4.includes(titulo.split('(')[0].trim())) {
                    seccionActual = h4.closest('.seccion-apoyos');
                }
            });
            
            if (!seccionActual) {
                // Si no hay apoyos, mostrar fila vacía con bordes
                const alturaFilaVacia = 8;
                pdf.rect(margen, y, col1Width, alturaFilaVacia);
                pdf.rect(margen + col1Width, y, col2Width, alturaFilaVacia);
                pdf.rect(margen + col1Width + col2Width, y, col3Width, alturaFilaVacia);
                y += alturaFilaVacia;
                return;
            }
            
            const codigoSelects = seccionActual.querySelectorAll('.codigo-select');
            let hayApoyos = false;
            
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(8);
            
            codigoSelects.forEach((select, index) => {
                const codigo = select.value;
                if (codigo) {
                    hayApoyos = true;
                    
                    // Verificar espacio
                    if (y > 250) {
                        pdf.addPage();
                        y = 20;
                    }
                    
                    const descripcion = select.options[select.selectedIndex].dataset.descripcion || '';
                    const resultado = seccionActual.querySelectorAll('.resultado textarea')[index]?.value || '';
                    
                    const lineasDesc = pdf.splitTextToSize(descripcion, col2Width - 4);
                    const lineasRes = pdf.splitTextToSize(resultado, col3Width - 4);
                    const alturaFila = Math.max(lineasDesc.length * 4 + 4, lineasRes.length * 4 + 4, 10);
                    
                    // Dibujar celdas con bordes
                    pdf.rect(margen, y, col1Width, alturaFila);
                    pdf.rect(margen + col1Width, y, col2Width, alturaFila);
                    pdf.rect(margen + col1Width + col2Width, y, col3Width, alturaFila);
                    
                    // Código (centrado y negrita)
                    pdf.setFont('helvetica', 'bold');
                    pdf.text(codigo, margen + col1Width/2, y + 6, { align: 'center' });
                    
                    // Descripción
                    pdf.setFont('helvetica', 'normal');
                    pdf.text(lineasDesc, margen + col1Width + 2, y + 5);
                    
                    // Resultados
                    if (resultado) {
                        pdf.text(lineasRes, margen + col1Width + col2Width + 2, y + 5);
                    }
                    
                    y += alturaFila;
                }
            });
            
            if (!hayApoyos) {
                const alturaFilaVacia = 8;
                pdf.rect(margen, y, col1Width, alturaFilaVacia);
                pdf.rect(margen + col1Width, y, col2Width, alturaFilaVacia);
                pdf.rect(margen + col1Width + col2Width, y, col3Width, alturaFilaVacia);
                y += alturaFilaVacia;
            }
            
            y += 3;
        }
        
        // Generar todas las secciones de apoyos con tablas
        dibujarTablaApoyos('Apoyos personales');
        dibujarTablaApoyos('Apoyos Organizativos (A.A)');
        dibujarTablaApoyos('Apoyos Materiales y Tecnológicos (A.A)');
        
        // Verificar si necesitamos nueva página
        if (y > 200) {
            pdf.addPage();
            y = 20;
        }
        
        dibujarTablaApoyos('Apoyos Curriculares (Metodología)(A.C.)');
        dibujarTablaApoyos('Apoyos Curriculares (Evaluación)(A.C)');
        
        // ========== SECCIÓN FINAL ==========
        if (y > 220) {
            pdf.addPage();
            y = 20;
        }
        
        y += 5;
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Marque con X los Apoyos Personales Específicos que recibe esta persona estudiante:', margen, y);
        y += 6;
        
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
        pdf.text('(   ) Terapia de Lenguaje', margen, y);
        pdf.text('(   ) Terapia Física', margen + 50, y);
        pdf.text('(   ) Problemas Emocionales', margen + 95, y);
        pdf.text('(   ) Discap. Visual', margen + 145, y);
        y += 5;
        pdf.text('(   ) Problemas de Aprendizaje', margen, y);
        y += 10;
        
        // Recomendaciones
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(9);
        pdf.text('Recomendaciones:', margen, y);
        y += 6;
        pdf.setFont('helvetica', 'normal');
        pdf.line(margen, y, margen + 85, y);
        pdf.line(margen + 100, y, margen + anchoUtil, y);
        y += 12;
        
        // Firmas
        pdf.setFontSize(8);
        pdf.text('Firma del Profesor (a)', margen + 15, y);
        pdf.text('VB. Comité de Apoyo', margen + 120, y);
        y += 2;
        pdf.line(margen, y, margen + 70, y);
        pdf.line(margen + 105, y, margen + anchoUtil, y);
        y += 8;
        
        pdf.text('Cc/ Expediente Único', margen, y);
        
        // Pie de página oficial
        pdf.setFontSize(6);
        pdf.setFont('helvetica', 'italic');
        pdf.text('Puntarenas, Coto Brus - Supervisión de Centros Educativos, Circuito 06', 108, 270, { align: 'center' });
        pdf.text(`${institucion}`, 108, 274, { align: 'center' });
        
        // Numeración de páginas con formato "-- 1 de 2 --"
        const totalPaginas = pdf.internal.pages.length - 1;
        for (let i = 1; i <= totalPaginas; i++) {
            pdf.setPage(i);
            pdf.setFontSize(8);
            pdf.setFont('helvetica', 'normal');
            pdf.text(`-- ${i} de ${totalPaginas} --`, 108, 278, { align: 'center' });
        }
        
        // Generar nombre del archivo
        const nombreArchivo = `Anexo2_${asignatura}_${nombreEstudiante.replace(/\s+/g, '_')}.pdf`;
        
        // Descargar PDF
        pdf.save(nombreArchivo);
        
        // Mensaje de éxito
        setTimeout(() => {
            mostrarNotificacion(
                '¡PDF Generado!', 
                `Formato oficial MEP descargado correctamente.`, 
                'exito'
            );
        }, 300);
        
    } catch (error) {
        console.error('Error al generar PDF:', error);
        mostrarNotificacion('Error', 'Ocurrió un error al generar el PDF. Por favor, intenta de nuevo.', 'error');
    } finally {
        // Quitar loading
        boton.classList.remove('loading');
        boton.disabled = false;
    }
}

// Limpiar formulario
function limpiarFormulario(tipo) {
    mostrarAlerta(
        '¿Confirmar limpieza?',
        '¿Está seguro de que desea limpiar el formulario? Se perderán todos los datos ingresados.',
        () => {
            // Limpiar selector de estudiante
            document.getElementById(`estudianteSelect_${tipo}`).value = '';
            document.getElementById(`seccionAuto_${tipo}`).textContent = '';
            document.getElementById(`nivelAuto_${tipo}`).textContent = '';
            
            // Limpiar todos los selects de códigos
            const seccion = tipo === 'esp' ? 'seccionEspanol' : 'seccionMatematica';
            const selects = document.querySelectorAll(`#${seccion} .codigo-select`);
            selects.forEach(select => {
                select.value = '';
                const descripcion = select.parentElement.querySelector('.descripcion-apoyo');
                if (descripcion) {
                    descripcion.textContent = '';
                }
            });
            
            // Limpiar todos los textareas de resultados
            const textareas = document.querySelectorAll(`#${seccion} .resultado textarea`);
            textareas.forEach(textarea => {
                textarea.value = '';
            });
            
            // Resetear periodo al primero
            const periodoRadios = document.getElementsByName(`periodo_${tipo}`);
            periodoRadios[0].checked = true;
            
            // Mostrar notificación de éxito
            mostrarNotificacion('Formulario limpio', 'El formulario ha sido limpiado correctamente.', 'exito');
        }
    );
}

// Función para mostrar notificaciones elegantes
function mostrarNotificacion(titulo, mensaje, tipo = 'info') {
    // Crear elemento de notificación
    const notif = document.createElement('div');
    notif.className = `notificacion ${tipo}`;
    
    const iconos = {
        'exito': '✅',
        'error': '❌',
        'info': 'ℹ️'
    };
    
    notif.innerHTML = `
        <div class="notificacion-icono">${iconos[tipo]}</div>
        <div class="notificacion-contenido">
            <h4>${titulo}</h4>
            <p>${mensaje}</p>
        </div>
    `;
    
    document.body.appendChild(notif);
    
    // Eliminar después de 3 segundos
    setTimeout(() => {
        notif.remove();
    }, 3000);
}

// Función para alertas personalizadas
function mostrarAlerta(titulo, mensaje, callback) {
    const overlay = document.createElement('div');
    overlay.className = 'alert-overlay';
    
    overlay.innerHTML = `
        <div class="alert-box">
            <h3>${titulo}</h3>
            <p>${mensaje}</p>
            <div class="alert-buttons">
                <button class="alert-btn alert-btn-secondary" onclick="this.closest('.alert-overlay').remove()">Cancelar</button>
                <button class="alert-btn alert-btn-primary">Aceptar</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Evento para el botón de aceptar
    overlay.querySelector('.alert-btn-primary').addEventListener('click', () => {
        overlay.remove();
        if (callback) callback();
    });
    
    // Cerrar al hacer clic fuera
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.remove();
        }
    });
}

// Utilidad: Formatear fecha
function formatearFecha(fecha) {
    const opciones = { year: 'numeric', month: 'long', day: 'numeric' };
    return fecha.toLocaleDateString('es-ES', opciones);
}

// Agregar efecto de scroll suave
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Mostrar mensaje de bienvenida en consola
console.log('%c🎓 ANEXO 2: Sistema de Registro de Apoyos Educativos', 'color: #2563eb; font-size: 16px; font-weight: bold;');
console.log('%cDesarrollado para GitHub Pages', 'color: #6b7280; font-size: 12px;');
