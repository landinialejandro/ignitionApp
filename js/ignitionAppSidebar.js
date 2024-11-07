// Script para alternar el sidebar y expandir el contenido principal
document.getElementById('toggleSidebar').addEventListener('click', function () {
    var mainContainer = document.getElementById('mainContainer');
    mainContainer.classList.toggle('sidebar-collapsed');
});

// Script para manejar la rotación del chevron
document.querySelectorAll('[data-bs-toggle="collapse"]').forEach(function (item) {
    item.addEventListener('click', function () {
        this.classList.toggle('submenu-expanded');
        this.classList.toggle('submenu-collapsed');
    });
});
