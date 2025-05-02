function openModal() {
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    currentEditId = null;
    document.querySelector('form').reset();
    document.querySelector('form').action = '/bienes/agregar';
    document.querySelector('.modal-header h2').innerHTML = `
<i class="fas fa-cube"></i>
Nuevo Bien
`;
}


document.getElementById('bienForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const formData = new FormData(this);
    const data = {};

    formData.forEach((value, key) => {
        data[key] = value;
    });

    try {
        const action = currentEditId
            ? `/bienes/editar/${currentEditId}`
            : '/bienes/agregar';

        const response = await fetch(action, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            location.reload();
        } else {
            const errorData = await response.json();
            alert(`Error: ${errorData.message || 'Datos inválidos'}`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error de conexión');
    }
});



let currentEditId = null;

function openEditModal(
    id, nombre, marca, modelo, grupo, subgrupo,
    numero_serie, incorporaciones, observaciones,
    seccion, concepto_movimiento, cantidad,
    numero_identificacion, departamento
) {
    currentEditId = id;

    // Rellena el formulario con los datos
    document.querySelector('input[name="nombre"]').value = nombre;
    document.querySelector('input[name="marca"]').value = marca;
    document.querySelector('input[name="modelo"]').value = modelo;
    document.querySelector('input[name="grupo"]').value = grupo;
    document.querySelector('input[name="subgrupo"]').value = subgrupo;
    document.querySelector('input[name="numero_serie"]').value = numero_serie;
    document.querySelector('textarea[name="incorporaciones"]').value = incorporaciones;
    document.querySelector('textarea[name="observaciones"]').value = observaciones;
    document.querySelector('input[name="seccion"]').value = seccion;
    document.querySelector('input[name="concepto_movimiento"]').value = concepto_movimiento;
    document.querySelector('input[name="cantidad"]').value = cantidad;
    document.querySelector('input[name="numero_identificacion"]').value = numero_identificacion;
    document.querySelector('select[name="departamento"]').value = departamento;

    // Cambia el título del modal
    document.querySelector('.modal-header h2').innerHTML = `
<i class="fas fa-edit"></i>
Editar Bien
`;

    document.querySelector('form').action = `/bienes/editar/${id}`;
    openModal();
}

function confirmDelete(id) {
    if (confirm('¿Estás seguro de eliminar este bien?')) {
        fetch(`/bienes/eliminar/${id}`, {
            method: 'POST'
        })
            .then(response => {
                if (response.ok) {
                    location.reload();
                } else {
                    alert('Error al eliminar el bien');
                }
            });
    }
}

