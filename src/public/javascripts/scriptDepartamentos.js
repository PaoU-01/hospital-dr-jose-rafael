document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('modalClasificacion');
    
    let currentEditId = null;
    window.openClasificacionModal = () => {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        resetForm();
    };

     const getRowValues = (row) => ({
        clasificacion: row.querySelector('.clasificacion').textContent.trim(),
        nombre: row.querySelector('.nombre').textContent.trim(),
        dependencia: row.querySelector('.dependencia').textContent.trim()
    });

    window.closeClasificacionModal = () => {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        currentEditId = null;
        resetForm();
    };

    function resetForm() {
        document.getElementById('formDepartamento').reset();
        document.querySelector('.modal-header h2').innerHTML = `
            <i class="fas fa-project-diagram"></i>
            Nueva Relación Institucional
        `;
    }

    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const row = e.currentTarget.closest('tr'); 
            currentEditId = row.dataset.id;
            const values = getRowValues(row);
            document.getElementById('clasificacion').value = values.clasificacion;
            document.getElementById('nombre').value = values.nombre;
            document.getElementById('dependencia').value = values.dependencia;
            document.querySelector('.modal-header h2').innerHTML = `
                <i class="fas fa-edit"></i>
                Editar Relación Institucional
            `;
            
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        });
    });


    document.getElementById('formDepartamento').addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = {
            clasificacion: document.getElementById('clasificacion').value,
            nombre: document.getElementById('nombre').value,
            dependencia: document.getElementById('dependencia').value
        };

        try {
            const url = currentEditId 
                ? `/departamentos/editar/${currentEditId}`
                : '/departamentos/agregar';

            const method = currentEditId ? 'POST' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                window.location.reload();
            } else {
                alert('Error al guardar los datos');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error de conexión');
        }
    });

    // Editar departamento


    // Eliminar departamento
    window.confirmDelete = async (id) => {
        if (confirm('¿Estás seguro de eliminar este departamento?')) {
            try {
                const response = await fetch(`/departamentos/eliminar/${id}`, {
                    method: 'POST'
                });
                
                if (response.ok) {
                    window.location.reload();
                } else {
                    alert('Error al eliminar el departamento');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Error de conexión');
            }
        }
    };

    // Event listeners para botones
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.closest('tr').dataset.id;
            window.openEditModal(id);
        });
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.closest('tr').dataset.id;
            window.confirmDelete(id);
        });
    });

    // Cerrar modal al hacer click fuera
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeClasificacionModal();
        }
    });
});
