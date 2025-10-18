/*SELECTORES Y CONFIGURACIÓN*/
const DB_NAME = 'gestion_tareas';
const STORE   = 'tareas';
const VERSION = 1;
const LISTA_SELECTOR = '#listaTareas';

let db;
let editId = null;
const listaEl = document.querySelector(LISTA_SELECTOR);

/*Abre o crea la bd, si no existe o tiene otra version ejecuta el upgrade, que este crea un campo ID en la tabla "tareas" y lo hace autoincrementable*/
async function abrirDB() {
    db = await idb.openDB(DB_NAME, VERSION, {
        upgrade(db) {
            if (!db.objectStoreNames.contains(STORE)) {
                db.createObjectStore(STORE, { keyPath: 'id', autoIncrement: true });
            }
        }
    });
}

/*En Este crud crea el dato que está ingresando*/
async function crearRegistro(datos) {
    const tx = db.transaction(STORE, 'readwrite');
    const id = await tx.store.add(datos);
    await tx.done;
    return id;
}
/*Lee y almacena los datos que introducimos */
async function leerTodos() {
    const tx = db.transaction(STORE, 'readonly');
    const tareas = await tx.store.getAll();
    await tx.done;
    return tareas;
}

/*Busca el campo por su ID */
async function leerPorId(id) {
    const tx = db.transaction(STORE, 'readonly');
    const tarea = await tx.store.get(id);
    await tx.done;
    return tarea;
}
/*Sobreescribe el dato que hayamos seleccionado */
async function actualizarRegistro(datos) {
    const tx = db.transaction(STORE, 'readwrite');
    await tx.store.put(datos);
    await tx.done;
}
/*Va a la bd a buscar y eliminar el dato por id */
async function borrarRegistro(id) {
    const tx = db.transaction(STORE, 'readwrite');
    await tx.store.delete(id);
    await tx.done;
}

/*PINTAR LA LISTA DE TAREAS es lo que va a mostrar en la tabla del html*/
async function pintarLista() {
    const tareas = await leerTodos();
    listaEl.innerHTML = '';

    tareas.forEach(t => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div>
                <strong>${t.titulo || ''}</strong><br>
                <span>${t.descripcion || ''}</span><br>
                <small>Fecha límite: ${t.fecha || 'No definida'}</small>
            </div>
        `;

        // Botón Editar
        const btnEdit = document.createElement('button');
        btnEdit.textContent = 'Editar';
        btnEdit.onclick = () => cargarFormulario(t);

        // Botón Borrar
        const btnBorrar = document.createElement('button');
        btnBorrar.textContent = 'Finalizada';
        btnBorrar.onclick = async () => {
            await borrarRegistro(t.id);
            await pintarLista();
        };

        li.appendChild(btnEdit);
        li.appendChild(btnBorrar);

        listaEl.appendChild(li);
    });
}

/*Acá toma los inputs del html insertados y con el submit los carga a la bd en sus respectivos campos*/
const formulario = document.querySelector('#formTareas');
const btnEnvio   = document.querySelector('#btnGuardar');
const campos = {
    titulo:      document.querySelector('#titulo'),
    descripcion: document.querySelector('#descripcion'),
    fecha:       document.querySelector('#fecha')
};

formulario.addEventListener('submit', async e => {
    e.preventDefault();

    const datos = {
        titulo:      campos.titulo.value.trim(),
        descripcion: campos.descripcion.value.trim(),
        fecha:       campos.fecha.value
    };

    if (editId) datos.id = editId;

    editId ? await actualizarRegistro(datos)
           : await crearRegistro(datos);

    editId = null;
    btnEnvio.textContent = '➕ Agregar tarea';
    formulario.reset();
    await pintarLista();
});

/*CARGA FORMULARIO EN MODO EDICIÓN */
function cargarFormulario(reg) {
    editId = reg.id;
    campos.titulo.value      = reg.titulo || '';
    campos.descripcion.value = reg.descripcion || '';
    campos.fecha.value       = reg.fecha || '';
    btnEnvio.textContent = '💾 Guardar cambios';
}

/*Una vez carga la pagina ejecuta la base de datos y carga los datos de la tabla*/
window.addEventListener('DOMContentLoaded', async () => {
    await abrirDB();
    await pintarLista();
});
