Estructura de proyecto

/scss
├── main.scss                  # Archivo principal que importa todos los demás
├── base
│   ├── _reset.scss            # Reset de CSS (para normalizar estilos entre navegadores)
│   ├── _variables.scss        # Variables de color, tipografía, tamaños, etc.
│   ├── _mixins.scss           # Mixins y funciones reutilizables
│   ├── _typography.scss       # Estilos de tipografía global
│   └── _global.scss           # Estilos globales aplicables en toda la app
├── layout
│   ├── _header.scss           # Estilos específicos del header y breadcrumb
│   ├── _sidebar.scss          # Estilos específicos del sidebar
│   ├── _content.scss          # Estilos para el contenedor principal de contenido
│   └── _footer.scss           # Estilos específicos del footer
├── components
│   ├── _preloader.scss        # Estilos del preloader (principal y content-body)
│   ├── _button.scss           # Estilos de botones reutilizables
│   ├── _breadcrumb.scss       # Estilos del breadcrumb en el header
│   └── _card.scss             # Estilos de tarjetas (card) dentro del content-body
├── utils
│   ├── _animations.scss       # Animaciones personalizadas (por ejemplo, para preloaders)
│   ├── _helpers.scss          # Clases auxiliares y utilidades (como espaciado o alineación)
│   └── _responsive.scss       # Media queries y estilos responsivos
└── themes
    ├── _dark.scss             # Tema oscuro
    └── _light.scss            # Tema claro (si se desea cambiar fácilmente entre temas)

Explicación de Cada Archivo y Carpeta
main.scss: Archivo principal que importa todos los demás archivos SCSS. Aquí solo incluyes las importaciones, y es el archivo que compilarás a CSS.
1. /base: Contiene los estilos globales y configuraciones
_reset.scss: Opcional, puedes incluir un reset CSS para garantizar consistencia entre navegadores.
_variables.scss: Aquí defines las variables de color, fuentes, espaciado, y cualquier otra configuración reutilizable.
_mixins.scss: Mixins y funciones (como mixins para media queries o animaciones reutilizables).
_typography.scss: Define la tipografía global y estilos de texto que se aplicarán en toda la aplicación.
_global.scss: Estilos globales básicos, como el estilo del body, contenedores principales, y el comportamiento de scroll.
2. /layout: Contiene estilos de la estructura principal
_header.scss: Estilos específicos del header y del breadcrumb dentro de content-header.
_sidebar.scss: Estilos específicos para el sidebar (sidebar-brand, sidebar-content, y sidebar-footer).
_content.scss: Estilos para el contenedor principal content y sub-secciones como content-header y content-body.
_footer.scss: Estilos del footer (app-footer) que se muestra al pie de la aplicación.
3. /components: Estilos para componentes reutilizables
_preloader.scss: Estilos para el preloader general y el preloader de content-body.
_button.scss: Estilos de botones, incluyendo botones como el de cerrar el sidebar o abrir configuración.
_breadcrumb.scss: Estilos específicos del breadcrumb para una apariencia consistente y accesible.
_card.scss: Estilos de las tarjetas (cards) que se muestran en el content-body.
4. /utils: Estilos auxiliares y de utilidades
_animations.scss: Define animaciones personalizadas, por ejemplo, para los preloaders.
_helpers.scss: Clases de ayuda como utilidades para espaciado, alineación o ajuste de visibilidad.
_responsive.scss: Media queries y estilos para adaptar la aplicación a diferentes tamaños de pantalla.
5. /themes: Opcional, estilos para diferentes temas
_dark.scss y _light.scss: Si planeas soportar un tema oscuro o claro, puedes incluir archivos de tema aquí para facilitar la personalización.