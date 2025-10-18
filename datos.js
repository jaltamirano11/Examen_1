/* SELECTORES Y CONFIGURACIÓN */
const DB_NAME = 'gestion_tareas';
const STORE   = 'tareas';
const VERSION = 1;
const LISTA_SELECTOR = '#tablaPendientes'; // tbody de la tabla en el HTML

let db;
const listaEl = document.querySelector(LISTA_SELECTOR);

/* ABRE O CREA LA BD */
async function abrirDB() {
    db = await idb.openDB(DB_NAME, VERSION, {
        upgrade(db) {
            if (!db.objectStoreNames.contains(STORE)) {
                db.createObjectStore(STORE, { keyPath: 'id', autoIncrement: true });
            }
        }
    });
}

/* LEER TODAS LAS TAREAS */
async function leerTodos() {
    const tx = db.transaction(STORE, 'readonly');
    const tareas = await tx.store.getAll();
    await tx.done;
    return tareas;
}

/* PINTAR LA TABLA DE TAREAS */
async function pintarTabla() {
    const tareas = await leerTodos();
    listaEl.innerHTML = '';

    tareas.forEach(t => {
        const tr = document.createElement('tr');

        tr.innerHTML = `
            <td>${t.titulo || ''}</td>
            <td>${t.descripcion || ''}</td>
            <td>${t.fecha || 'No definida'}</td>
            <td>Pendiente</td>
        `;

        listaEl.appendChild(tr);
    });
}

/* CARGAR DATOS AL INICIAR LA PÁGINA */
window.addEventListener('DOMContentLoaded', async () => {
    await abrirDB();
    await pintarTabla();
});
