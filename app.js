// Variables globales
let datos = null;
/** Observadores IntersectionObserver de la guía lateral (solo sección visible) */
let observersScrollGuias = [];

function desconectarObservadoresScrollGuias() {
    observersScrollGuias.forEach((obs) => obs.disconnect());
    observersScrollGuias = [];
}

// Cargar datos al iniciar
document.addEventListener('DOMContentLoaded', async () => {
    await cargarDatos();
    inicializarApp();
    
    // Crear partículas flotantes decorativas
    crearParticulasFlotantes();
    
    // Ocultar el loader después de cargar
    setTimeout(() => {
        const loader = document.querySelector('.page-loader');
        if (loader) {
            loader.style.display = 'none';
        }
    }, 2000);
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
    
    poblarOpcionesFiltroSeccionGlobal();
    
    // Llenar guías de códigos
    llenarGuiaCodigos();
    llenarGuiaCodigosMat();
    
    // Tablas Anexo 2 y Anexo 10 usan los mismos selectores (.codigo-select-anexo10)
    llenarSelectsCodigosAnexo10();
    
    // Configurar navegación y filtro de sección (solo pantalla)
    configurarNavegacion();
    configurarFiltroSeccionGlobal();
    
    // Configurar eventos de estudiantes
    configurarEventosEstudiantes();
    
    configurarEventosCodigosAnexo10();
    
    // Configurar botones PDF y limpiar
    configurarBotones();
    
    // Configurar botón para agregar indicadores
    configurarBotonAgregarIndicador();
    
    // Configurar botones para eliminar filas
    configurarBotonesEliminarFila();
    
    // Configurar buscador de códigos
    configurarBuscadorCodigos();
    
    // Iniciar sistema de autoguardado
    iniciarAutoguardado();
    configurarPersistenciaDocenteAsignatura();
    
    // Configurar confirmación antes de salir
    configurarConfirmacionSalida();
    
    // Establecer fecha actual
    actualizarFecha('esp');
    actualizarFecha('mat');
    
    // Configurar animación de scroll para mostrar códigos
    configurarAnimacionScroll();
    
    // Configurar barra de progreso
    configurarBarraProgreso();

    document.getElementById('estudianteSelect_esp')?.dispatchEvent(new Event('change'));
    document.getElementById('estudianteSelect_mat')?.dispatchEvent(new Event('change'));
    
    // Configurar contadores de códigos
    configurarContadores();
}

/** Normaliza sección (guiones tipográficos, espacios) para filtrar en pantalla. No afecta el PDF. */
function normalizarClaveSeccion(str) {
    return String(str || '')
        .replace(/[\u2013\u2014\u2212]/g, '-')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();
}

/** Clave de filtro seleccionada (como está en data-clave; vacío = todas). */
function obtenerClaveFiltroSeccionActiva() {
    const pressed = document.querySelector('#filtroSeccionBotones .filtro-seccion-btn[aria-pressed="true"]');
    if (!pressed) return '';
    const raw = pressed.getAttribute('data-clave');
    return raw === null ? '' : String(raw).trim();
}

function marcarFiltroSeccionActivo(valorSeleccionado = '') {
    const cont = document.getElementById('filtroSeccionBotones');
    if (!cont) return;
    const normObj = valorSeleccionado ? normalizarClaveSeccion(valorSeleccionado) : '';

    cont.querySelectorAll('.filtro-seccion-btn').forEach((btn) => {
        const raw = btn.getAttribute('data-clave');
        const k = raw === null ? '' : String(raw);
        const normBtn = k ? normalizarClaveSeccion(k) : '';
        const activo = normObj === '' ? normBtn === '' : normBtn === normObj;
        btn.setAttribute('aria-pressed', activo ? 'true' : 'false');
    });
}

// Llenar selector de estudiantes (opcional: filtroClaveNorm = clave de sección del filtro global)
function llenarSelectEstudiantes(selectId, filtroClaveNorm = '') {
    const select = document.getElementById(selectId);
    if (!select || !datos?.estudiantes) return;

    const nombrePrevio = select.value;
    const filtro = filtroClaveNorm ? normalizarClaveSeccion(filtroClaveNorm) : '';

    select.innerHTML = '<option value="">Seleccione un estudiante...</option>';

    datos.estudiantes.forEach((estudiante) => {
        if (filtro && normalizarClaveSeccion(estudiante.seccion) !== filtro) return;
        const option = document.createElement('option');
        option.value = estudiante.nombre;
        option.textContent = estudiante.nombre;
        option.dataset.seccion = estudiante.seccion;
        option.dataset.observaciones = estudiante.observaciones;
        select.appendChild(option);
    });

    const sigue = Array.from(select.options).some((o) => o.value === nombrePrevio);
    if (sigue) {
        select.value = nombrePrevio;
    } else {
        select.value = '';
        const tipo = selectId.includes('_mat') ? 'mat' : 'esp';
        const autoS = document.getElementById(`seccionAuto_${tipo}`);
        const autoN = document.getElementById(`nivelAuto_${tipo}`);
        if (autoS) autoS.textContent = '';
        if (autoN) autoN.textContent = '';
    }
}

function poblarOpcionesFiltroSeccionGlobal() {
    const cont = document.getElementById('filtroSeccionBotones');
    if (!cont || !datos?.estudiantes) return;

    const prev = obtenerClaveFiltroSeccionActiva();
    cont.innerHTML = '';

    const btnTodas = document.createElement('button');
    btnTodas.type = 'button';
    btnTodas.className = 'filtro-seccion-btn';
    btnTodas.setAttribute('data-clave', '');
    btnTodas.textContent = 'Todas';
    cont.appendChild(btnTodas);

    const unicas = new Map();
    datos.estudiantes.forEach((e) => {
        const clave = normalizarClaveSeccion(e.seccion);
        if (!clave) return;
        if (!unicas.has(clave)) unicas.set(clave, String(e.seccion || '').trim());
    });

    [...unicas.entries()]
        .sort((a, b) => a[1].localeCompare(b[1], 'es', { numeric: true, sensitivity: 'base' }))
        .forEach(([clave, etiqueta]) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'filtro-seccion-btn';
            btn.setAttribute('data-clave', clave);
            btn.title = etiqueta || clave;
            btn.textContent = etiqueta || clave;
            cont.appendChild(btn);
        });

    if (prev && unicas.has(prev)) marcarFiltroSeccionActivo(prev);
    else marcarFiltroSeccionActivo('');

    aplicarFiltroSeccionSoloListas(obtenerClaveFiltroSeccionActiva());
}

/** Solo rellena listas/tablas sin eventos (útil antes de registrar listeners). */
function aplicarFiltroSeccionSoloListas(filtroClaveNorm = '') {
    llenarSelectEstudiantes('estudianteSelect_esp', filtroClaveNorm);
    llenarSelectEstudiantes('estudianteSelect_mat', filtroClaveNorm);
    llenarTablaEstudiantes(filtroClaveNorm);
}

/** Refresca selects + tabla y actualiza estado del formulario (solo interfaz). */
function refrescarListasEstudiantesPorFiltroActual() {
    aplicarFiltroSeccionSoloListas(obtenerClaveFiltroSeccionActiva());
    document.getElementById('estudianteSelect_esp')?.dispatchEvent(new Event('change'));
    document.getElementById('estudianteSelect_mat')?.dispatchEvent(new Event('change'));
    actualizarBarraProgresoConPorcentaje();
}

function configurarFiltroSeccionGlobal() {
    const cont = document.getElementById('filtroSeccionBotones');
    if (!cont || cont.dataset.filtroSeccionAttached) return;
    cont.dataset.filtroSeccionAttached = '1';
    cont.addEventListener('click', (e) => {
        const btn = e.target.closest('.filtro-seccion-btn');
        if (!btn || !cont.contains(btn)) return;
        const clave = btn.getAttribute('data-clave') === null ? '' : String(btn.getAttribute('data-clave')).trim();
        marcarFiltroSeccionActivo(clave);
        refrescarListasEstudiantesPorFiltroActual();
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

// Llenar una lista de códigos con badge de cantidad
function llenarListaCodigos(containerId, apoyos) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = '';
    
    // Agregar badge con cantidad total
    const parent = container.closest('.guia-seccion');
    if (parent) {
        const h4 = parent.querySelector('h4');
        if (h4 && !h4.querySelector('.badge-contador')) {
            const badge = document.createElement('span');
            badge.className = 'badge-contador';
            badge.textContent = apoyos.length;
            h4.appendChild(badge);
        }
    }
    
    apoyos.forEach((apoyo, index) => {
        const div = document.createElement('div');
        div.className = 'codigo-item';
        div.style.animationDelay = `${index * 0.05}s`;
        div.innerHTML = `<strong>${apoyo.codigo}</strong>${apoyo.descripcion}`;
        
        // Agregar tooltip con el código completo
        div.setAttribute('title', `${apoyo.codigo}: ${apoyo.descripcion}`);
        
        container.appendChild(div);
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

// Llenar tabla de estudiantes (opcional filtro como en los selects)
function llenarTablaEstudiantes(filtroClaveNorm = '') {
    const tbody = document.getElementById('cuerpoTablaEstudiantes');
    if (!tbody || !datos?.estudiantes) return;

    const filtro = filtroClaveNorm ? normalizarClaveSeccion(filtroClaveNorm) : '';
    tbody.innerHTML = '';

    let num = 0;
    datos.estudiantes.forEach((estudiante) => {
        if (filtro && normalizarClaveSeccion(estudiante.seccion) !== filtro) return;
        num++;
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${num}</td>
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

    // IntersectionObserver no funciona bien con panel en display:none hasta que se muestra esta pestaña
    requestAnimationFrame(() => configurarAnimacionScroll());
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

// Resaltar código en la guía lateral
function resaltarCodigoEnGuia(codigo, tipo) {
    // Determinar qué guía usar basado en la sección activa
    const seccionActiva = document.querySelector('.seccion.active').id;
    const sufijo = seccionActiva === 'seccionEspanol' ? '' : '_mat';
    
    const mapaTipos = {
        'personales': `listaApoyosPersonales${sufijo}`,
        'organizativos': `listaApoyosOrganizativos${sufijo}`,
        'materiales': `listaApoyosMateriales${sufijo}`,
        'curriculares': `listaApoyosCurriculares${sufijo}`,
        'evaluativos': `listaApoyosEvaluativos${sufijo}`
    };
    
    const guiaId = mapaTipos[tipo];
    if (!guiaId) return;
    
    const guia = document.getElementById(guiaId);
    if (!guia) return;
    
    // Buscar y resaltar el código
    const codigosItems = guia.querySelectorAll('.codigo-item');
    codigosItems.forEach(item => {
        const strong = item.querySelector('strong');
        if (strong && strong.textContent.trim() === codigo) {
            // Agregar clase de resaltado temporal
            item.classList.add('codigo-seleccionado');
            item.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Remover después de 3 segundos
            setTimeout(() => {
                item.classList.remove('codigo-seleccionado');
            }, 3000);
        }
    });
}

// Verificar si una sección de apoyos está completa
function verificarSeccionCompleta(select) {
    const seccionApoyo = select.closest('.seccion-apoyos') || select.closest('.seccion-apoyos-anexo10');
    if (!seccionApoyo) return;
    
    const selects = seccionApoyo.querySelectorAll('.codigo-select-anexo10, .codigo-select');
    const completados = Array.from(selects).filter(s => s.value).length;
    
    if (completados === selects.length) {
        // Animación de completado
        seccionApoyo.classList.add('seccion-completada');
        
        // Mostrar notificación
        const textoH = seccionApoyo.querySelector('h4').textContent;
        const titulo = textoH.includes('●') ? textoH.split('●')[1].trim() : textoH.replace('●', '').trim();
        mostrarNotificacion(
            '¡Sección Completada!',
            `Has completado "${titulo}"`,
            'exito'
        );
    } else {
        seccionApoyo.classList.remove('seccion-completada');
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
        if (tipo === 'mat') {
            // Generar PDF ANEXO 10
            await generarPDFAnexo10(asignatura);
        } else {
            // Generar PDF ANEXO 2 (formato original)
            await generarPDFAnexo2(tipo, asignatura);
        }
        
        // Mensaje de éxito con confetti
        setTimeout(() => {
            const nombreAnexo = tipo === 'mat' ? 'ANEXO 10' : 'ANEXO 2';
            mostrarNotificacion(
                '¡PDF Generado!', 
                `${nombreAnexo} descargado correctamente.`, 
                'exito'
            );
            crearConfetti();
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

/** Nombre institución en varias líneas para el PDF (métricas según fuente actual). */
function lineasInstitucionPdf(pdf, institucion, maxWidthMm, opciones = {}) {
    const fontSize = opciones.fontSize ?? 8;
    const fuente = opciones.estiloFuente ?? 'normal';
    pdf.setFont('helvetica', fuente);
    pdf.setFontSize(fontSize);
    return pdf.splitTextToSize(String(institucion || '').trim(), maxWidthMm);
}

/** Solo numeración de página en cada hoja (sin texto de supervisión ni institución al final). */
function aplicarPiePaginasAnexoPdf(pdf) {
    const totalPaginas = pdf.internal.pages.length - 1;
    for (let i = 1; i <= totalPaginas; i++) {
        pdf.setPage(i);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
        pdf.text(`-- ${i} de ${totalPaginas} --`, 108, 278, { align: 'center' });
    }
}

// Generar PDF para ANEXO 2 (formato original)
async function generarPDFAnexo2(tipo, asignatura) {
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
    const estudianteSelect = document.getElementById(`estudianteSelect_${tipo}`);
    const institucion = document.getElementById(`institucion_${tipo}`).value;
    const circuito = document.getElementById(`circuito_${tipo}`).value;
    const nombreEstudiante = estudianteSelect.value;
    const seccion = document.getElementById(`seccionAuto_${tipo}`).textContent;
    const nivel = document.getElementById(`nivelAuto_${tipo}`).textContent;
    const fecha = document.getElementById(`fechaAuto_${tipo}`).textContent;
    const docente = document.getElementById(`docente_${tipo}`).value;
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
        const xCabInst = margen + 39;
        const anchoCabInst = Math.max(40, margen + anchoUtil - xCabInst - 2);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(5.5);
        const lineasCabInst = pdf.splitTextToSize(String(institucion || '').trim(), Math.max(40, anchoCabInst));
        let yyCab = y + 13;
        lineasCabInst.forEach((ln) => {
            pdf.text(ln, xCabInst, yyCab);
            yyCab += 3.1;
        });
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
    
    // Fila 1: Institución y Circuito — altura dinámica (nombre completo institución)
    const xValorInst = margen + 28;
    const anchoValorInst = Math.max(55, margen + anchoUtil * 0.75 - xValorInst - 2);
    const lineasInstTabla = lineasInstitucionPdf(pdf, institucion, anchoValorInst);
    const lhInst = 3.95;
    let alturaFila = Math.max(7.5, 5.5 + lineasInstTabla.length * lhInst);
    pdf.setFontSize(9);
    pdf.rect(margen, y, anchoUtil * 0.75, alturaFila);
    pdf.rect(margen + anchoUtil * 0.75, y, anchoUtil * 0.25, alturaFila);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Institución:', margen + 2, y + 5);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.text(lineasInstTabla, xValorInst, y + 5);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    const yCircuit = y + alturaFila / 2 + 2;
    pdf.text('Circuito:', margen + anchoUtil * 0.75 + 2, yCircuit);
    pdf.setFont('helvetica', 'normal');
    pdf.text(String(circuito || ''), margen + anchoUtil * 0.75 + 18, yCircuit);
    y += alturaFila;
    
    // Fila 2: Nombre del estudiante y Sección (con bordes)
    alturaFila = 7;
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
    
    // Fila 3: Nivel de Funcionamiento y Fecha (altura dinámica + margen inferior para no cortar texto)
    const anchoTxtNivel = anchoUtil * 0.72;
    pdf.setFontSize(8);
    const lineasNivel = nivel && String(nivel).trim()
        ? pdf.splitTextToSize(String(nivel), anchoTxtNivel)
        : [''];
    const lineHeightTxt = 4.5;
    const padSuperiorNF = 3;
    const padInferiorNF = 7;
    const etiquetaDelta = 4.5;
    alturaFila = Math.max(
        18,
        padSuperiorNF + etiquetaDelta + Math.max(lineasNivel.length, 1) * lineHeightTxt + padInferiorNF
    );

    pdf.setFontSize(9);
    pdf.rect(margen, y, anchoUtil * 0.75, alturaFila);
    pdf.rect(margen + anchoUtil * 0.75, y, anchoUtil * 0.25, alturaFila);

    pdf.setFont('helvetica', 'bold');
    pdf.text('Nivel de Funcionamiento:', margen + 2, y + padSuperiorNF + 4);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    const yIniNivel = y + padSuperiorNF + etiquetaDelta + 4;
    pdf.text(lineasNivel, margen + 2, yIniNivel);

    pdf.setFontSize(9);
    const anchoTxtFecha = anchoUtil * 0.22;
    const lineasFecha = fecha && String(fecha).trim()
        ? pdf.splitTextToSize(String(fecha), anchoTxtFecha)
        : [''];
    const lhFecha = 4.5;
    let yIniFecha = y + Math.max((alturaFila - lineasFecha.length * lhFecha) / 2 + lhFecha - 1, padSuperiorNF + lhFecha);
    pdf.text(lineasFecha, margen + anchoUtil * 0.75 + 2, yIniFecha);

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
    
    const seccionFormIdAnexo2 = 'seccionEspanol';
    // ========== FUNCIÓN PARA DIBUJAR TABLAS CON BORDES ==========
    /** Encuentra el bloque HTML de apoyos que corresponde al título usado en el PDF */
    function encontrarSeccionApoyoDom(tituloPdf) {
        const h4s = document.querySelectorAll(`#${seccionFormIdAnexo2} .seccion-apoyos h4, #${seccionFormIdAnexo2} .seccion-apoyos-anexo10 h4`);
        let candidato = null;
        const t = tituloPdf.toLowerCase();

        function palabrasClaveEnH4(txt) {
            const h = txt.toLowerCase();
            // PDF antiguo: "Evaluación" → HTML "Apoyos Evaluativos"
            if (t.includes('evaluaci'))
                return h.includes('evaluativo');
            if (t.includes('metodolog'))
                return h.includes('curricular') && !h.includes('evaluativo');
            if (t.includes('personales'))
                return h.includes('personales') || h.includes('personal');
            if (t.includes('organizativos'))
                return h.includes('organizativ');
            if (t.includes('materiales') || t.includes('tecnológicos') || t.includes('tecnologicos'))
                return h.includes('material') || h.includes('tecnológ') || h.includes('tecnolog');
            if (t.includes('curricular'))
                return h.includes('curricular');
            return false;
        }

        h4s.forEach(h4 => {
            const textoH4 = h4.textContent.replace('●', '').trim();
            if (palabrasClaveEnH4(textoH4))
                candidato = h4.closest('.seccion-apoyos') || h4.closest('.seccion-apoyos-anexo10');
        });
        return candidato;
    }

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
        
        const seccionActual = encontrarSeccionApoyoDom(titulo);
        
        if (!seccionActual) {
            // Si no hay apoyos, mostrar fila vacía con bordes
            const alturaFilaVacia = 8;
            pdf.rect(margen, y, col1Width, alturaFilaVacia);
            pdf.rect(margen + col1Width, y, col2Width, alturaFilaVacia);
            pdf.rect(margen + col1Width + col2Width, y, col3Width, alturaFilaVacia);
            y += alturaFilaVacia;
            return;
        }
        
        const codigoSelects = seccionActual.querySelectorAll('.codigo-select-anexo10, .codigo-select');
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
                const resultado = seccionActual.querySelectorAll('tbody tr textarea')[index]?.value || '';
                
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
    dibujarTablaApoyos('Apoyos personales aplicados');
    dibujarTablaApoyos('Apoyos Organizativos (A.A)');
    dibujarTablaApoyos('Apoyos Materiales y Tecnológicos (A.A)');
    
    // Verificar si necesitamos nueva página
    if (y > 200) {
        pdf.addPage();
        y = 20;
    }
    
    dibujarTablaApoyos('Apoyos Curriculares (Metodología)(A.C.)');
    dibujarTablaApoyos('Apoyos Evaluativos (A.C.)');
    
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
    // Dibujar líneas primero
    pdf.line(margen, y, margen + 70, y);
    pdf.line(margen + 105, y, margen + anchoUtil, y);
    y += 5;
    // Textos debajo de las líneas
    pdf.text('Firma del Profesor (a)', margen + 15, y);
    pdf.text('VB. Comité de Apoyo', margen + 120, y);
    y += 8;
    
    pdf.text('Cc/ Expediente Único', margen, y);
    
    aplicarPiePaginasAnexoPdf(pdf);
    
    // Generar nombre del archivo
    const nombreArchivo = `Anexo2_${asignatura}_${nombreEstudiante.replace(/\s+/g, '_')}.pdf`;
    
    // Descargar PDF
    pdf.save(nombreArchivo);
}

// Generar PDF para ANEXO 10 (con tabla de indicadores)
async function generarPDFAnexo10(asignatura) {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'letter'
    });
    
    const margen = 15;
    const anchoUtil = 185;
    let y = 20;
    const tipo = 'mat';
    
    // Obtener datos del formulario
    const estudianteSelect = document.getElementById(`estudianteSelect_${tipo}`);
    const institucion = document.getElementById(`institucion_${tipo}`).value;
    const circuito = document.getElementById(`circuito_${tipo}`).value;
    const nombreEstudiante = estudianteSelect.value;
    const seccion = document.getElementById(`seccionAuto_${tipo}`).textContent;
    const nivel = document.getElementById(`nivelAuto_${tipo}`).textContent;
    const fecha = document.getElementById(`fechaAuto_${tipo}`).textContent;
    const docente = document.getElementById(`docente_${tipo}`).value;
    const periodoSeleccionado = document.querySelector(`input[name="periodo_${tipo}"]:checked`).value;
    
    // ========== CARGAR Y AGREGAR IMAGEN DE ENCABEZADO ==========
    try {
        const response = await fetch('encabezado.png');
        const blob = await response.blob();
        const reader = new FileReader();
        
        await new Promise((resolve) => {
            reader.onloadend = () => {
                const imgData = reader.result;
                pdf.addImage(imgData, 'PNG', margen, y, anchoUtil, 20);
                resolve();
            };
            reader.readAsDataURL(blob);
        });
        y += 25;
    } catch (error) {
        console.warn('No se pudo cargar la imagen, usando texto:', error);
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
        const xCabInst10 = margen + 39;
        const anchoCabInst10 = Math.max(40, margen + anchoUtil - xCabInst10 - 2);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(5.5);
        const lineasCabInst10 = pdf.splitTextToSize(String(institucion || '').trim(), anchoCabInst10);
        let yyCab10 = y + 13;
        lineasCabInst10.forEach((ln) => {
            pdf.text(ln, xCabInst10, yyCab10);
            yyCab10 += 3.1;
        });
        y += 25;
    }
    
    // Título principal
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('ANEXO 10: INFORME DE CONTROL DE AVANCE POR PERÍODO', 108, y, { align: 'center' });
    y += 5;
    pdf.setFontSize(10);
    pdf.text('(APOYO CURRICULAR SIGNIFICATIVO)', 108, y, { align: 'center' });
    y += 6;
    pdf.setFontSize(11);
    pdf.text('Curso lectivo 2025', 108, y, { align: 'center' });
    y += 10;
    
    // ========== INFORMACIÓN BÁSICA ==========
    pdf.setLineWidth(0.3);
    pdf.setDrawColor(0, 0, 0);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    
    // Institución y Circuito (altura dinámica)
    const xValorInst10 = margen + 28;
    const anchoValorInst10 = Math.max(55, margen + anchoUtil * 0.75 - xValorInst10 - 2);
    const lineasInstTabla10 = lineasInstitucionPdf(pdf, institucion, anchoValorInst10);
    const lhInst10 = 3.95;
    let alturaFila = Math.max(7.5, 5.5 + lineasInstTabla10.length * lhInst10);
    pdf.setFontSize(9);
    pdf.rect(margen, y, anchoUtil * 0.75, alturaFila);
    pdf.rect(margen + anchoUtil * 0.75, y, anchoUtil * 0.25, alturaFila);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Institución:', margen + 2, y + 5);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.text(lineasInstTabla10, xValorInst10, y + 5);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    const yCircuit10 = y + alturaFila / 2 + 2;
    pdf.text('Circuito:', margen + anchoUtil * 0.75 + 2, yCircuit10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(String(circuito || ''), margen + anchoUtil * 0.75 + 18, yCircuit10);
    y += alturaFila;
    
    // Estudiante y Sección
    alturaFila = 7;
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
    
    // Nivel de funcionamiento y Fecha (altura dinámica + margen para no cortar texto)
    const anchoTxtNivel10 = anchoUtil * 0.72;
    pdf.setFontSize(8);
    const lineasNivel = nivel && String(nivel).trim()
        ? pdf.splitTextToSize(String(nivel), anchoTxtNivel10)
        : [''];
    const lineHeightTxt10 = 4.5;
    const padSuperiorNF10 = 3;
    const padInferiorNF10 = 7;
    const etiquetaDelta10 = 4.5;
    alturaFila = Math.max(
        18,
        padSuperiorNF10 + etiquetaDelta10 + Math.max(lineasNivel.length, 1) * lineHeightTxt10 + padInferiorNF10
    );

    pdf.setFontSize(9);
    pdf.rect(margen, y, anchoUtil * 0.75, alturaFila);
    pdf.rect(margen + anchoUtil * 0.75, y, anchoUtil * 0.25, alturaFila);

    pdf.setFont('helvetica', 'bold');
    pdf.text('Nivel de Funcionamiento:', margen + 2, y + padSuperiorNF10 + 4);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    const yIniNivel10 = y + padSuperiorNF10 + etiquetaDelta10 + 4;
    pdf.text(lineasNivel, margen + 2, yIniNivel10);

    pdf.setFontSize(9);
    const anchoTxtFecha10 = anchoUtil * 0.22;
    const lineasFecha10 = fecha && String(fecha).trim()
        ? pdf.splitTextToSize(String(fecha), anchoTxtFecha10)
        : [''];
    const lhFecha10 = 4.5;
    let yIniFecha10 = y + Math.max((alturaFila - lineasFecha10.length * lhFecha10) / 2 + lhFecha10 - 1, padSuperiorNF10 + lhFecha10);
    pdf.text(lineasFecha10, margen + anchoUtil * 0.75 + 2, yIniFecha10);

    y += alturaFila;
    
    // Docente y Asignatura
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
    
    // Períodos
    alturaFila = 6;
    pdf.rect(margen, y, anchoUtil * 0.50, alturaFila);
    pdf.rect(margen + anchoUtil * 0.50, y, anchoUtil * 0.50, alturaFila);
    const marca1 = periodoSeleccionado === 'primero' ? 'X' : '  ';
    const marca2 = periodoSeleccionado === 'segundo' ? 'X' : '  ';
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Primer Período ( ${marca1} )`, margen + 2, y + 4.5);
    pdf.text(`Segundo Período ( ${marca2} )`, margen + anchoUtil * 0.50 + 2, y + 4.5);
    y += alturaFila + 5;
    
    // Título de aprendizajes
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Aprendizajes Logrados según Operacionalización de la PEI:', margen, y);
    y += 7;
    
    // ========== TABLA DE INDICADORES ==========
    const tablaIndicadores = document.getElementById('tablaIndicadores_mat');
    if (tablaIndicadores) {
        const filas = tablaIndicadores.querySelectorAll('tr');
        
        // Anchos de columnas
        const colIndicador = 70;
        const colNivel = 22;
        const colResultados = anchoUtil - colIndicador - (colNivel * 3);
        
        // Encabezado
        pdf.setFillColor(220, 220, 220);
        pdf.setFontSize(7);
        pdf.setFont('helvetica', 'bold');
        
        const alturaEncabezado = 6;
        pdf.rect(margen, y, colIndicador, alturaEncabezado, 'FD');
        pdf.rect(margen + colIndicador, y, colNivel, alturaEncabezado, 'FD');
        pdf.rect(margen + colIndicador + colNivel, y, colNivel, alturaEncabezado, 'FD');
        pdf.rect(margen + colIndicador + colNivel * 2, y, colNivel, alturaEncabezado, 'FD');
        pdf.rect(margen + colIndicador + colNivel * 3, y, colResultados, alturaEncabezado, 'FD');
        
        pdf.text('Indicador', margen + 2, y + 4);
        pdf.text('INICIAL', margen + colIndicador + 2, y + 4);
        pdf.text('INTERMEDIO', margen + colIndicador + colNivel + 2, y + 4);
        pdf.text('AVANZADO', margen + colIndicador + colNivel * 2 + 2, y + 4);
        pdf.text('Resultados', margen + colIndicador + colNivel * 3 + 2, y + 4);
        y += alturaEncabezado;
        
        // Filas de datos
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(7);
        
        filas.forEach((fila) => {
            const indicador = fila.querySelector('.input-indicador')?.value || '';
            const checkboxes = fila.querySelectorAll('.checkbox-nivel');
            const resultados = fila.querySelector('td:last-child textarea')?.value || '';
            
            // Solo incluir filas con contenido
            if (indicador.trim() || resultados.trim()) {
                if (y > 250) {
                    pdf.addPage();
                    y = 20;
                }
                
                const lineasIndicador = pdf.splitTextToSize(indicador, colIndicador - 4);
                const lineasResultados = pdf.splitTextToSize(resultados, colResultados - 4);
                const alturaFila = Math.max(lineasIndicador.length * 4 + 3, lineasResultados.length * 4 + 3, 8);
                
                // Dibujar celdas
                pdf.rect(margen, y, colIndicador, alturaFila);
                pdf.rect(margen + colIndicador, y, colNivel, alturaFila);
                pdf.rect(margen + colIndicador + colNivel, y, colNivel, alturaFila);
                pdf.rect(margen + colIndicador + colNivel * 2, y, colNivel, alturaFila);
                pdf.rect(margen + colIndicador + colNivel * 3, y, colResultados, alturaFila);
                
                // Indicador
                pdf.text(lineasIndicador, margen + 2, y + 4);
                
                // Checkboxes (X si está marcado)
                pdf.setFont('helvetica', 'bold');
                if (checkboxes[0]?.checked) {
                    pdf.text('X', margen + colIndicador + colNivel/2 - 1, y + alturaFila/2 + 1);
                }
                if (checkboxes[1]?.checked) {
                    pdf.text('X', margen + colIndicador + colNivel + colNivel/2 - 1, y + alturaFila/2 + 1);
                }
                if (checkboxes[2]?.checked) {
                    pdf.text('X', margen + colIndicador + colNivel * 2 + colNivel/2 - 1, y + alturaFila/2 + 1);
                }
                pdf.setFont('helvetica', 'normal');
                
                // Resultados
                pdf.text(lineasResultados, margen + colIndicador + colNivel * 3 + 2, y + 4);
                
                y += alturaFila;
            }
        });
        
        y += 5;
    }
    
    // ========== TABLAS DE APOYOS ANEXO 10 ==========
    function dibujarTablaApoyosAnexo10(titulo, idTabla) {
        if (y > 240) {
            pdf.addPage();
            y = 20;
        }
        
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        pdf.text(titulo, margen, y);
        y += 5;
        
        // Anchos de columnas
        const colCodigo = 20;
        const colDescripcion = 95;
        const colResultados = anchoUtil - colCodigo - colDescripcion;
        
        // Encabezado
        const alturaEncabezado = 6;
        pdf.setFillColor(240, 240, 240);
        pdf.rect(margen, y, colCodigo, alturaEncabezado, 'FD');
        pdf.rect(margen + colCodigo, y, colDescripcion, alturaEncabezado, 'FD');
        pdf.rect(margen + colCodigo + colDescripcion, y, colResultados, alturaEncabezado, 'FD');
        
        pdf.setFontSize(8);
        pdf.text('Código', margen + 2, y + 4);
        pdf.text('Descripción', margen + colCodigo + 2, y + 4);
        pdf.text('Resultados', margen + colCodigo + colDescripcion + 2, y + 4);
        y += alturaEncabezado;
        
        // Obtener datos de la tabla
        const tbody = document.getElementById(idTabla);
        if (tbody) {
            const filas = tbody.querySelectorAll('tr');
            let hayDatos = false;
            
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(7);
            
            filas.forEach(fila => {
                const select = fila.querySelector('.codigo-select-anexo10');
                const codigo = select?.value || '';
                const descripcion = fila.querySelector('.descripcion-apoyo-anexo10')?.textContent || '';
                const resultados = fila.querySelector('textarea')?.value || '';
                
                if (codigo) {
                    hayDatos = true;
                    
                    if (y > 250) {
                        pdf.addPage();
                        y = 20;
                    }
                    
                    const lineasDesc = pdf.splitTextToSize(descripcion, colDescripcion - 4);
                    const lineasRes = pdf.splitTextToSize(resultados, colResultados - 4);
                    const alturaFila = Math.max(lineasDesc.length * 4 + 3, lineasRes.length * 4 + 3, 8);
                    
                    // Dibujar celdas
                    pdf.rect(margen, y, colCodigo, alturaFila);
                    pdf.rect(margen + colCodigo, y, colDescripcion, alturaFila);
                    pdf.rect(margen + colCodigo + colDescripcion, y, colResultados, alturaFila);
                    
                    // Código
                    pdf.setFont('helvetica', 'bold');
                    pdf.text(codigo, margen + colCodigo/2, y + alturaFila/2 + 1, { align: 'center' });
                    
                    // Descripción
                    pdf.setFont('helvetica', 'normal');
                    pdf.text(lineasDesc, margen + colCodigo + 2, y + 4);
                    
                    // Resultados
                    pdf.text(lineasRes, margen + colCodigo + colDescripcion + 2, y + 4);
                    
                    y += alturaFila;
                }
            });
            
            if (!hayDatos) {
                const alturaVacia = 8;
                pdf.rect(margen, y, colCodigo, alturaVacia);
                pdf.rect(margen + colCodigo, y, colDescripcion, alturaVacia);
                pdf.rect(margen + colCodigo + colDescripcion, y, colResultados, alturaVacia);
                y += alturaVacia;
            }
        }
        
        y += 3;
    }
    
    // Generar todas las tablas de apoyos
    dibujarTablaApoyosAnexo10('Apoyos personales aplicados', 'tablaApoyosPersonales_mat');
    dibujarTablaApoyosAnexo10('Apoyos Organizativos (A.A)', 'tablaApoyosOrganizativos_mat');
    
    if (y > 200) {
        pdf.addPage();
        y = 20;
    }
    
    dibujarTablaApoyosAnexo10('Apoyos Materiales y Tecnológicos (A.A)', 'tablaApoyosMateriales_mat');
    dibujarTablaApoyosAnexo10('Apoyos Curriculares (Metodología)(A.C.)', 'tablaApoyosCurriculares_mat');
    
    if (y > 200) {
        pdf.addPage();
        y = 20;
    }
    
    dibujarTablaApoyosAnexo10('Apoyos Evaluativos (A.C.)', 'tablaApoyosEvaluativos_mat');
    
    // ========== FIRMAS ==========
    if (y > 250) {
        pdf.addPage();
        y = 20;
    }
    
    y += 10;
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    // Dibujar líneas primero
    pdf.line(margen, y, margen + 70, y);
    pdf.line(margen + 105, y, margen + anchoUtil, y);
    y += 5;
    // Textos debajo de las líneas
    pdf.text('Firma del Profesor (a)', margen + 20, y);
    pdf.text('VB. Comité de Apoyo', margen + 120, y);
    y += 8;
    
    pdf.text('Cc/ Expediente Único', margen, y);
    
    aplicarPiePaginasAnexoPdf(pdf);
    
    // Descargar PDF
    const nombreArchivo = `Anexo10_${asignatura}_${nombreEstudiante.replace(/\s+/g, '_')}.pdf`;
    pdf.save(nombreArchivo);
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
            
            if (tipo === 'esp') {
                const seccion = 'seccionEspanol';
                document.querySelectorAll(`#${seccion} .codigo-select-anexo10`).forEach((select) => {
                    select.value = '';
                    const row = select.closest('tr');
                    const descripcion = row?.querySelector('.descripcion-apoyo-anexo10');
                    if (descripcion) descripcion.textContent = '';
                });
                
                // Limpiar todos los textareas de resultados
                const textareas = document.querySelectorAll(`#${seccion} textarea`);
                textareas.forEach(textarea => {
                    textarea.value = '';
                });
            } else if (tipo === 'mat') {
                // Limpiar ANEXO 10 (formato tabla)
                
                // Limpiar tabla de indicadores
                const tablaIndicadores = document.getElementById('tablaIndicadores_mat');
                if (tablaIndicadores) {
                    const filas = tablaIndicadores.querySelectorAll('tr');
                    // Mantener solo 3 filas y limpiar su contenido
                    filas.forEach((fila, index) => {
                        if (index < 3) {
                            const textarea = fila.querySelector('.input-indicador');
                            const checkboxes = fila.querySelectorAll('.checkbox-nivel');
                            const resultados = fila.querySelector('td:last-child textarea');
                            
                            if (textarea) textarea.value = '';
                            checkboxes.forEach(cb => cb.checked = false);
                            if (resultados) resultados.value = '';
                        } else {
                            // Eliminar filas adicionales
                            fila.remove();
                        }
                    });
                }
                
                const selects = document.querySelectorAll('#seccionMatematica .codigo-select-anexo10');
                selects.forEach(select => {
                    select.value = '';
                    const row = select.closest('tr');
                    if (row) {
                        const descripcion = row.querySelector('.descripcion-apoyo-anexo10');
                        const resultado = row.querySelector('textarea');
                        if (descripcion) descripcion.textContent = '';
                        if (resultado) resultado.value = '';
                    }
                });
            }
            
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

// Configurar animación de scroll para mostrar códigos automáticamente
function configurarAnimacionScroll() {
    desconectarObservadoresScrollGuias();

    const seccionVisible = document.querySelector('.seccion.active');
    if (!seccionVisible || seccionVisible.id === 'seccionLista') {
        return;
    }

    configurarScrollSeccion(seccionVisible.id);
}

function resolverGuiaIdPorTitulo(seccionId, titulo) {
    const t = (titulo || '').toLowerCase();
    const sufijo = seccionId === 'seccionEspanol' ? '' : '_mat';
    // ANEXO 10 puede usar títulos distintos; se resuelve por palabras clave
    if (t.includes('personales')) return `listaApoyosPersonales${sufijo}`;
    if (t.includes('organizativos')) return `listaApoyosOrganizativos${sufijo}`;
    if (t.includes('materiales') || t.includes('tecnológicos') || t.includes('tecnologicos'))
        return `listaApoyosMateriales${sufijo}`;
    if (t.includes('evaluativos')) return `listaApoyosEvaluativos${sufijo}`;
    if (t.includes('curriculares')) return `listaApoyosCurriculares${sufijo}`;
    return null;
}

function configurarScrollSeccion(seccionId) {
    const seccion = document.getElementById(seccionId);
    if (!seccion || !seccion.classList.contains('active')) return;
    
    // ANEXO 2 usa .seccion-apoyos-anexo10; algunas vistas antiguas usaban .seccion-apoyos
    const seccionesApoyos = seccion.querySelectorAll('.seccion-apoyos, .seccion-apoyos-anexo10');
    
    // Crear observador de intersección
    const observerOptions = {
        root: null,
        rootMargin: '-12% 0px -18% 0px',
        threshold: [0.08, 0.22, 0.45]
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const h4 = entry.target.querySelector('h4');
                if (!h4) return;
                const titulo = h4.textContent.replace('●', '').trim();
                const guiaId = resolverGuiaIdPorTitulo(seccionId, titulo);
                
                if (guiaId) {
                    // Resaltar la sección correspondiente en la guía
                    resaltarGuiaCodigos(guiaId);
                    
                    // Animar los códigos
                    animarCodigosGuia(guiaId);
                }
            }
        });
    }, observerOptions);
    
    // Observar cada sección de apoyos
    seccionesApoyos.forEach(seccionApoyo => {
        observer.observe(seccionApoyo);
    });
    observersScrollGuias.push(observer);
}

// Resaltar la sección de la guía cuando se hace scroll
function resaltarGuiaCodigos(guiaId) {
    // Remover highlight previos
    const todasLasGuias = document.querySelectorAll('.lista-codigos');
    todasLasGuias.forEach(guia => {
        guia.classList.remove('guia-activa');
        const parent = guia.closest('.guia-seccion');
        if (parent) {
            parent.classList.remove('seccion-activa');
        }
    });
    
    // Agregar highlight a la sección actual
    const guiaActual = document.getElementById(guiaId);
    if (guiaActual) {
        guiaActual.classList.add('guia-activa');
        const parent = guiaActual.closest('.guia-seccion');
        if (parent) {
            parent.classList.add('seccion-activa');
            
            // Hacer scroll suave hacia la guía resaltada
            parent.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest'
            });
        }
    }
}

// Animar los códigos en la guía
function animarCodigosGuia(guiaId) {
    const guia = document.getElementById(guiaId);
    if (!guia) return;
    
    const codigos = guia.querySelectorAll('.codigo-item');
    
    // Remover animación previa si existe
    codigos.forEach(codigo => {
        codigo.classList.remove('codigo-animado');
    });
    
    // Aplicar animación con delay progresivo
    codigos.forEach((codigo, index) => {
        setTimeout(() => {
            codigo.classList.add('codigo-animado');
        }, index * 100);
    });
}

// Configurar barra de progreso del formulario
function configurarBarraProgreso() {
    function actualizarProgreso(tipo) {
        const seccion = tipo === 'esp' ? 'seccionEspanol' : 'seccionMatematica';
        const estudiante = document.getElementById(`estudianteSelect_${tipo}`).value;
        const asignatura = document.getElementById(`asignatura_${tipo}`).value;
        
        let camposCompletados = 0;
        let totalCampos = 2; // estudiante + asignatura
        
        if (estudiante) camposCompletados++;
        if (asignatura) camposCompletados++;
        
        // Contar códigos seleccionados
        const codigosSelects = document.querySelectorAll(`#${seccion} .codigo-select-anexo10`);
        const codigosCompletados = Array.from(codigosSelects).filter(s => s.value).length;
        
        totalCampos += codigosSelects.length;
        camposCompletados += codigosCompletados;
        
        const porcentaje = (camposCompletados / totalCampos) * 100;
        
        const progressBar = document.getElementById('progressBar');
        if (progressBar) {
            progressBar.style.width = porcentaje + '%';
            // Actualizar el texto del porcentaje
            actualizarBarraProgresoConPorcentaje();
        }
        
        return porcentaje;
    }
    
    // Escuchar cambios en ambos formularios
    ['esp', 'mat'].forEach(tipo => {
        const estudiante = document.getElementById(`estudianteSelect_${tipo}`);
        const asignatura = document.getElementById(`asignatura_${tipo}`);
        
        if (estudiante) {
            estudiante.addEventListener('change', () => {
                actualizarProgreso(tipo);
                estudiante.classList.add('completado');
            });
        }
        
        if (asignatura) {
            asignatura.addEventListener('input', () => {
                actualizarProgreso(tipo);
                if (asignatura.value) {
                    asignatura.classList.add('completado');
                } else {
                    asignatura.classList.remove('completado');
                }
            });
        }
        
        const seccion = tipo === 'esp' ? 'seccionEspanol' : 'seccionMatematica';
        const codigosSelects = document.querySelectorAll(`#${seccion} .codigo-select-anexo10`);
        
        codigosSelects.forEach(select => {
            select.addEventListener('change', () => {
                actualizarProgreso(tipo);
            });
        });
    });
}

// Configurar contadores de códigos por sección
function configurarContadores() {
    ['esp', 'mat'].forEach(tipo => {
        const seccion = tipo === 'esp' ? 'seccionEspanol' : 'seccionMatematica';
        const seccionElement = document.getElementById(seccion);
        
        if (!seccionElement) return;
        
        const seccionesApoyos = seccionElement.querySelectorAll('.seccion-apoyos, .seccion-apoyos-anexo10');
        
        seccionesApoyos.forEach(seccionApoyo => {
            const selects = seccionApoyo.querySelectorAll('.codigo-select-anexo10, .codigo-select');
            const titulo = seccionApoyo.querySelector('h4');
            
            function actualizarContador() {
                const completados = Array.from(selects).filter(s => s.value).length;
                const total = selects.length;
                
                if (titulo) {
                    // Actualizar el contador en el ::after via un data attribute
                    titulo.setAttribute('data-contador', `${completados}/${total}`);
                    
                    // Actualizar estilos basado en el progreso
                    if (completados === total) {
                        titulo.style.background = 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)';
                    } else if (completados > 0) {
                        titulo.style.background = 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)';
                    }
                }
            }
            
            selects.forEach(select => {
                select.addEventListener('change', actualizarContador);
            });
            
            actualizarContador();
        });
    });
}

// Crear efecto confetti
function crearConfetti() {
    const colores = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
    const confettiCount = 100;
    
    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.backgroundColor = colores[Math.floor(Math.random() * colores.length)];
        confetti.style.animationDelay = Math.random() * 3 + 's';
        confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
        confetti.style.animation = 'confetti-fall ' + confetti.style.animationDuration + ' linear';
        
        document.body.appendChild(confetti);
        
        setTimeout(() => {
            confetti.remove();
        }, 5000);
    }
}

// Crear partículas flotantes decorativas
function crearParticulasFlotantes() {
    const numParticulas = 15;
    const colores = ['#2563eb', '#3b82f6', '#10b981', '#ec4899', '#f97316'];
    
    for (let i = 0; i < numParticulas; i++) {
        const particula = document.createElement('div');
        particula.className = 'floating-particle';
        
        // Posición aleatoria
        particula.style.left = Math.random() * 100 + '%';
        particula.style.top = Math.random() * 100 + '%';
        
        // Color aleatorio
        particula.style.background = colores[Math.floor(Math.random() * colores.length)];
        
        // Tamaño aleatorio
        const size = Math.random() * 6 + 2;
        particula.style.width = size + 'px';
        particula.style.height = size + 'px';
        
        // Animación con duración aleatoria
        particula.style.animation = `float ${Math.random() * 10 + 5}s ease-in-out infinite`;
        particula.style.animationDelay = Math.random() * 5 + 's';
        
        document.body.appendChild(particula);
    }
}

// Animación de entrada para elementos al hacer scroll
function observarElementos() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeIn 0.8s ease forwards';
            }
        });
    }, {
        threshold: 0.1
    });
    
    // Observar todos los campos y secciones
    document.querySelectorAll('.campo, .seccion-apoyos, .seccion-apoyos-anexo10, .guia-seccion').forEach(el => {
        observer.observe(el);
    });
}

// Mostrar mensaje de bienvenida en consola
console.log('%c🎓 ANEXO 2: Sistema de Registro de Apoyos Educativos', 'color: #2563eb; font-size: 16px; font-weight: bold;');
console.log('%cDesarrollado para GitHub Pages', 'color: #6b7280; font-size: 12px;');
console.log('%c✨ Versión mejorada con animaciones y efectos visuales', 'color: #10b981; font-size: 12px;');
console.log('%c🎨 UI/UX Design: Gradientes, animaciones y microinteracciones', 'color: #ec4899; font-size: 12px;');

// ========== FUNCIONES ESPECÍFICAS PARA ANEXO 10 ==========

// Llenar selectores de códigos para el ANEXO 10
function llenarSelectsCodigosAnexo10() {
    const selectsPersonales = document.querySelectorAll('.codigo-select-anexo10[data-tipo="personales"]');
    selectsPersonales.forEach(select => {
        llenarSelectCodigos(select, datos.apoyos.personales);
    });
    
    const selectsOrganizativos = document.querySelectorAll('.codigo-select-anexo10[data-tipo="organizativos"]');
    selectsOrganizativos.forEach(select => {
        llenarSelectCodigos(select, datos.apoyos.organizativos);
    });
    
    const selectsMateriales = document.querySelectorAll('.codigo-select-anexo10[data-tipo="materiales"]');
    selectsMateriales.forEach(select => {
        llenarSelectCodigos(select, datos.apoyos.materiales);
    });
    
    const selectsCurriculares = document.querySelectorAll('.codigo-select-anexo10[data-tipo="curriculares"]');
    selectsCurriculares.forEach(select => {
        llenarSelectCodigos(select, datos.apoyos.curriculares);
    });
    
    const selectsEvaluativos = document.querySelectorAll('.codigo-select-anexo10[data-tipo="evaluativos"]');
    selectsEvaluativos.forEach(select => {
        llenarSelectCodigos(select, datos.apoyos.evaluativos);
    });
}

// Configurar eventos para los selectores del ANEXO 10
function configurarEventosCodigosAnexo10() {
    const selects = document.querySelectorAll('.codigo-select-anexo10');
    
    selects.forEach(select => {
        select.addEventListener('change', (e) => actualizarDescripcionApoyoAnexo10(e.target));
    });
}

// Actualizar descripción del apoyo (Anexo 2 y Anexo 10, misma tabla)
function actualizarDescripcionApoyoAnexo10(select) {
    const selectedOption = select.options[select.selectedIndex];
    const row = select.closest('tr');
    const descripcionElement = row?.querySelector('.descripcion-apoyo-anexo10');
    if (!descripcionElement) return;
    
    if (selectedOption.value && selectedOption.dataset.descripcion) {
        descripcionElement.style.animation = 'none';
        setTimeout(() => {
            descripcionElement.textContent = selectedOption.dataset.descripcion;
            descripcionElement.style.animation = 'fadeIn 0.5s ease';
        }, 10);
        select.classList.add('completado');
        resaltarCodigoEnGuia(selectedOption.value, select.dataset.tipo);
        verificarSeccionCompleta(select);
    } else {
        descripcionElement.textContent = '';
        select.classList.remove('completado');
        verificarSeccionCompleta(select);
    }
}

// Configurar botón para agregar indicadores
function configurarBotonAgregarIndicador() {
    const btnAgregar = document.getElementById('btnAgregarIndicador_mat');
    if (!btnAgregar) return;
    
    btnAgregar.addEventListener('click', () => {
        const tbody = document.getElementById('tablaIndicadores_mat');
        if (!tbody) return;
        
        const nuevaFila = document.createElement('tr');
        nuevaFila.innerHTML = `
            <td><textarea class="input-indicador" rows="2" placeholder="Escriba el indicador..."></textarea></td>
            <td><input type="checkbox" class="checkbox-nivel"></td>
            <td><input type="checkbox" class="checkbox-nivel"></td>
            <td><input type="checkbox" class="checkbox-nivel"></td>
            <td><textarea rows="4" placeholder="Resultados..."></textarea></td>
            <td><button class="btn-eliminar-fila" title="Eliminar fila">✕</button></td>
        `;
        
        tbody.appendChild(nuevaFila);
        
        // Configurar evento para el botón de eliminar
        configurarBotonesEliminarFila();
        
        // Animar la nueva fila
        nuevaFila.style.animation = 'fadeIn 0.5s ease';
        
        // Scroll suave hacia la nueva fila
        nuevaFila.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        mostrarNotificacion('Indicador agregado', 'Se ha agregado una nueva fila para indicadores.', 'exito');
    });
}

// ========== NUEVAS FUNCIONALIDADES ==========

// Configurar botones para eliminar filas de indicadores
function configurarBotonesEliminarFila() {
    const botones = document.querySelectorAll('.btn-eliminar-fila');
    
    botones.forEach(boton => {
        // Remover eventos previos
        boton.replaceWith(boton.cloneNode(true));
    });
    
    // Volver a obtener los botones y agregar eventos
    document.querySelectorAll('.btn-eliminar-fila').forEach(boton => {
        boton.addEventListener('click', (e) => {
            const fila = e.target.closest('tr');
            const tbody = fila.closest('tbody');
            
            // No permitir eliminar si solo hay 1 fila
            if (tbody.querySelectorAll('tr').length <= 1) {
                mostrarNotificacion('No se puede eliminar', 'Debe mantener al menos una fila en la tabla.', 'error');
                return;
            }
            
            // Animación de salida
            fila.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => {
                fila.remove();
                mostrarNotificacion('Fila eliminada', 'La fila ha sido eliminada correctamente.', 'exito');
            }, 300);
        });
    });
}

// Configurar buscador de códigos
function configurarBuscadorCodigos() {
    ['esp', 'mat'].forEach(tipo => {
        const buscador = document.getElementById(`buscadorCodigos_${tipo}`);
        const resultadosSpan = document.getElementById(`resultadosBusqueda_${tipo}`);
        
        if (!buscador) return;
        
        buscador.addEventListener('input', (e) => {
            const termino = e.target.value.toLowerCase().trim();
            const sufijo = tipo === 'esp' ? '' : '_mat';
            
            // Obtener todas las listas de códigos de esta sección
            const listas = [
                `listaApoyosPersonales${sufijo}`,
                `listaApoyosOrganizativos${sufijo}`,
                `listaApoyosMateriales${sufijo}`,
                `listaApoyosCurriculares${sufijo}`,
                `listaApoyosEvaluativos${sufijo}`
            ];
            
            let totalResultados = 0;
            let totalCodigos = 0;
            
            listas.forEach(listaId => {
                const lista = document.getElementById(listaId);
                if (!lista) return;
                
                const items = lista.querySelectorAll('.codigo-item');
                
                items.forEach(item => {
                    totalCodigos++;
                    const texto = item.textContent.toLowerCase();
                    
                    if (termino === '' || texto.includes(termino)) {
                        item.classList.remove('oculto');
                        if (termino !== '') {
                            item.classList.add('destacado');
                            totalResultados++;
                        } else {
                            item.classList.remove('destacado');
                        }
                    } else {
                        item.classList.add('oculto');
                        item.classList.remove('destacado');
                    }
                });
            });
            
            // Actualizar contador de resultados
            if (termino === '') {
                resultadosSpan.textContent = '';
            } else {
                resultadosSpan.textContent = `${totalResultados} de ${totalCodigos} códigos encontrados`;
            }
        });
    });
}

// Sistema de autoguardado
let datosFormulario = {
    esp: {},
    mat: {}
};
let intervaloAutoguardado = null;
let hayCambiosSinGuardar = false;

function iniciarAutoguardado() {
    // Guardar cada 30 segundos
    intervaloAutoguardado = setInterval(() => {
        if (hayCambiosSinGuardar) {
            guardarEnLocalStorage();
        }
    }, 30000);
    
    // Cargar datos guardados al inicio
    cargarDesdeLocalStorage();
    
    // Marcar campos como modificados
    document.querySelectorAll('input, textarea, select').forEach(campo => {
        campo.addEventListener('input', () => {
            hayCambiosSinGuardar = true;
            campo.classList.add('campo-modificado');
        });
    });
}

/** Docente y asignatura: guardado al salir del campo (sin mensaje repetitivo). */
function configurarPersistenciaDocenteAsignatura() {
    ['esp', 'mat'].forEach((tipo) => {
        ['docente_', 'asignatura_'].forEach((pref) => {
            const id = pref + tipo;
            const el = document.getElementById(id);
            if (!el) return;
            el.addEventListener('blur', () => {
                hayCambiosSinGuardar = true;
                guardarEnLocalStorage({ silent: true });
            });
        });
    });
}

function guardarEnLocalStorage(opciones = {}) {
    const silent = opciones.silent === true;
    try {
        // Guardar datos de ambos formularios
        ['esp', 'mat'].forEach(tipo => {
            datosFormulario[tipo] = {
                estudiante: document.getElementById(`estudianteSelect_${tipo}`)?.value || '',
                docente: document.getElementById(`docente_${tipo}`)?.value?.trim() || '',
                asignatura: document.getElementById(`asignatura_${tipo}`)?.value?.trim() || '',
                periodo: document.querySelector(`input[name="periodo_${tipo}"]:checked`)?.value || 'primero',
                timestamp: new Date().toISOString()
            };
        });
        
        // Guardar indicadores del ANEXO 10
        const tablaIndicadores = document.getElementById('tablaIndicadores_mat');
        if (tablaIndicadores) {
            const indicadores = [];
            tablaIndicadores.querySelectorAll('tr').forEach(fila => {
                const indicador = fila.querySelector('.input-indicador')?.value || '';
                const checkboxes = Array.from(fila.querySelectorAll('.checkbox-nivel')).map(cb => cb.checked);
                const resultados = fila.querySelector('td:last-child textarea')?.value || '';
                
                if (indicador || resultados) {
                    indicadores.push({ indicador, niveles: checkboxes, resultados });
                }
            });
            datosFormulario.mat.indicadores = indicadores;
        }
        
        localStorage.setItem('anexo_formularios', JSON.stringify(datosFormulario));
        hayCambiosSinGuardar = false;
        
        if (!silent) {
            mostrarIndicadorAutoguardado('✓ Guardado automáticamente', 'exito');
        }
    } catch (error) {
        console.error('Error al guardar:', error);
        if (!silent) {
            mostrarIndicadorAutoguardado('✕ Error al guardar', 'error');
        }
    }
}

function cargarDesdeLocalStorage() {
    try {
        const datosGuardados = localStorage.getItem('anexo_formularios');
        if (!datosGuardados) return;
        
        datosFormulario = JSON.parse(datosGuardados);
        
        // Restaurar datos de ambos formularios
        ['esp', 'mat'].forEach(tipo => {
            const datos = datosFormulario[tipo];
            if (!datos) return;
            
            const selectEstudiante = document.getElementById(`estudianteSelect_${tipo}`);
            if (selectEstudiante && datos.estudiante) {
                selectEstudiante.value = datos.estudiante;
                if (!selectEstudiante.value && obtenerClaveFiltroSeccionActiva()) {
                    marcarFiltroSeccionActivo('');
                    aplicarFiltroSeccionSoloListas('');
                    selectEstudiante.value = datos.estudiante;
                }
                selectEstudiante.dispatchEvent(new Event('change'));
            }
            
            const inputDocente = document.getElementById(`docente_${tipo}`);
            if (inputDocente && datos.docente) {
                inputDocente.value = datos.docente;
            }
            
            const inputAsignatura = document.getElementById(`asignatura_${tipo}`);
            if (inputAsignatura && datos.asignatura) {
                inputAsignatura.value = datos.asignatura;
            }
            
            if (datos.periodo) {
                const radioPeriodo = document.querySelector(`input[name="periodo_${tipo}"][value="${datos.periodo}"]`);
                if (radioPeriodo) radioPeriodo.checked = true;
            }
        });
        
        // Restaurar indicadores del ANEXO 10
        if (datosFormulario.mat?.indicadores) {
            // Implementar restauración de indicadores si es necesario
        }
        
        hayCambiosSinGuardar = false;
    } catch (error) {
        console.error('Error al cargar:', error);
    }
}

function mostrarIndicadorAutoguardado(mensaje, tipo) {
    let indicador = document.querySelector('.autoguardado-indicator');
    
    if (!indicador) {
        indicador = document.createElement('div');
        indicador.className = 'autoguardado-indicator';
        document.body.appendChild(indicador);
    }
    
    indicador.textContent = mensaje;
    indicador.className = `autoguardado-indicator ${tipo} show`;
    
    setTimeout(() => {
        indicador.classList.remove('show');
    }, 3000);
}

// Actualizar barra de progreso con porcentaje
function actualizarBarraProgresoConPorcentaje() {
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    
    if (!progressBar || !progressText) return;
    
    // Obtener porcentaje actual del ancho
    const porcentaje = parseInt(progressBar.style.width) || 0;
    progressText.textContent = porcentaje + '%';
    
    // Cambiar color según el progreso
    if (porcentaje === 100) {
        progressBar.style.background = 'linear-gradient(90deg, #10b981, #059669)';
        // Animación de celebración
        setTimeout(() => crearConfetti(), 300);
    } else if (porcentaje >= 75) {
        progressBar.style.background = 'linear-gradient(90deg, #3b82f6, #2563eb)';
    } else if (porcentaje >= 50) {
        progressBar.style.background = 'linear-gradient(90deg, #f59e0b, #d97706)';
    }
}

// Confirmación antes de salir
function configurarConfirmacionSalida() {
    window.addEventListener('beforeunload', (e) => {
        if (hayCambiosSinGuardar) {
            e.preventDefault();
            e.returnValue = '';
            return '';
        }
    });
}

// Animación fadeOut
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        from { opacity: 1; transform: scale(1); }
        to { opacity: 0; transform: scale(0.8); }
    }
`;
document.head.appendChild(style);
