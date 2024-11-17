<?php
/**
 * Clase `fs` para la gestión de archivos y directorios.
 * Proporciona métodos para crear, listar, mover, copiar, renombrar y eliminar archivos y carpetas,
 * así como para obtener el contenido de archivos específicos.
 * Esta clase garantiza que todas las operaciones se realicen dentro de un directorio base seguro.
 *
 * @package FileSystemManager
 * @author Alejandro Landini
 * @version 1.0
 */

class fs
{
    protected $base;

    /**
     * Constructor de la clase `fs`.
     * Inicializa el directorio base y verifica que exista.
     *
     * @param string $base Ruta del directorio base.
     * @throws Exception Si el directorio base no existe.
     */
    public function __construct($base)
    {
        $this->base = $this->resolvePath($base);
        if (!$this->base) {
            throw new Exception('El directorio base no existe.');
        }
    }

    /**
     * Resuelve un path de manera segura sin crear nada.
     *
     * @param string $path Ruta a resolver.
     * @return string Ruta resuelta.
     * @throws Exception Si el path no existe o está fuera del directorio base.
     */
    protected function resolvePath($path)
    {
        $resolvedPath = realpath($path);
        if (!$resolvedPath) {
            throw new Exception("El path no existe: {$path}");
        }
        if (strpos($resolvedPath, $this->base) !== 0) {
            throw new Exception("Path fuera del directorio base: {$resolvedPath}");
        }
        return $resolvedPath;
    }

    /**
     * Genera un path a partir de un ID.
     *
     * @param string $id ID del archivo o directorio.
     * @return string Ruta generada.
     */
    protected function getPath($id)
    {
        $id = trim(str_replace('/', DIRECTORY_SEPARATOR, $id), DIRECTORY_SEPARATOR);
        return $this->resolvePath($this->base . DIRECTORY_SEPARATOR . $id);
    }

    /**
     * Lista archivos y directorios de un directorio específico.
     *
     * @param string $id ID del directorio a listar.
     * @param bool $withRoot Indica si debe incluir la raíz.
     * @return array Lista de archivos y directorios.
     */
    public function lst($id, $withRoot = false)
    {
        $dir = $this->getPath($id);
        $items = array_diff(scandir($dir), ['.', '..']);

        $result = array_map(function ($item) use ($dir, $id) {
            $itemPath = $dir . DIRECTORY_SEPARATOR . $item;
            return [
                'caption' => ucfirst($item),
                'url' => $this->getId($itemPath),
                'type' => is_dir($itemPath) ? 'folder' : 'file',
                'a_class' => is_dir($itemPath) ? 'folder-page' : 'file-page',
                'icon' => is_dir($itemPath) ? 'bi bi-folder' : 'bi bi-file-earmark',
                'children' => is_dir($itemPath) ? $this->lst($this->getId($itemPath)) : false,
            ];
        }, $items);

        if ($withRoot && $this->getId($dir) === '/') {
            return [[
                'caption' => basename($this->base),
                'url' => '/',
                'icon' => 'bi bi-house',
                'menu_open' => true,
                'children' => $result,
            ]];
        }

        return $result;
    }

    /**
     * Obtiene el contenido de un archivo o la referencia de un directorio.
     *
     * @param string $id ID del archivo o directorio.
     * @return array Contenido o referencia.
     * @throws Exception Si la selección no es válida.
     */
    public function data($id)
    {
        $path = $this->getPath($id);
        if (is_dir($path)) {
            return [
                'type' => 'folder',
                'content' => $id
            ];
        }
        if (is_file($path)) {
            return [
                'type' => pathinfo($path, PATHINFO_EXTENSION),
                'content' => $this->getFileContent($path)
            ];
        }
        throw new Exception("Selección no válida: {$id}");
    }

    /**
     * Obtiene el contenido de un archivo según su tipo.
     *
     * @param string $path Ruta del archivo.
     * @return string Contenido del archivo o Base64 de imagen.
     */
    protected function getFileContent($path)
    {
        return match (pathinfo($path, PATHINFO_EXTENSION)) {
            'jpg', 'jpeg', 'png', 'gif' => $this->imageToBase64($path),
            default => file_get_contents($path),
        };
    }

    /**
     * Convierte una imagen a formato Base64.
     *
     * @param string $path Ruta de la imagen.
     * @return string Imagen en formato Base64.
     */
    private function imageToBase64($path)
    {
        $mimeType = finfo_file(finfo_open(FILEINFO_MIME_TYPE), $path);
        return "data:{$mimeType};base64," . base64_encode(file_get_contents($path));
    }

    /**
     * Crea un archivo o directorio.
     *
     * @param string $id ID del directorio base.
     * @param string $name Nombre del archivo o directorio.
     * @param bool $isDir Indica si es un directorio.
     * @param string $content Contenido del archivo.
     * @return array ID del nuevo elemento.
     */
    public function create($id, $name = '', $isDir = false, $content = "")
    {
        // Generar la ruta completa
        $path = $this->getPath($id) . ($name ? DIRECTORY_SEPARATOR . $name : '');
        
        // Verificar si es directorio o archivo
        if ($isDir) {
            // Crear el directorio
            if (!mkdir($path, 0777, true) && !is_dir($path)) {
                throw new Exception("Error al crear el directorio: {$path}");
            }
        } else {
            // Crear el archivo con contenido
            if (file_put_contents($path, $content) === false) {
                throw new Exception("Error al crear el archivo: {$path}");
            }
        }
        
        // Retornar el ID del archivo o directorio creado
        return ['id' => $this->getId($path)];
    }
    

    /**
     * Renombra un archivo o directorio.
     *
     * @param string $id ID del archivo o directorio.
     * @param string $newName Nuevo nombre.
     * @return array Nuevo ID.
     */
    public function rename($id, $newName)
    {
        $path = $this->getPath($id);
        $newPath = dirname($path) . DIRECTORY_SEPARATOR . $newName;
        rename($path, $newPath) or throw new Exception("Error al renombrar: {$path}");
        return ['id' => $this->getId($newPath)];
    }

    /**
     * Elimina un archivo o directorio.
     *
     * @param string $id ID del archivo o directorio.
     * @return array Estado de la operación.
     */
    public function remove($id)
    {
        $path = $this->getPath($id);
        is_dir($path) ? rmdir($path) : unlink($path);
        return ['status' => 'OK'];
    }

    /**
     * Mueve un archivo o directorio.
     *
     * @param string $id ID del archivo o directorio.
     * @param string $parent ID del directorio destino.
     * @return array Nuevo ID.
     */
    public function move($id, $parent)
    {
        $newPath = $this->getPath($parent) . DIRECTORY_SEPARATOR . basename($this->getPath($id));
        rename($this->getPath($id), $newPath) or throw new Exception("Error al mover: {$id}");
        return ['id' => $this->getId($newPath)];
    }

    /**
     * Copia un archivo o directorio.
     *
     * @param string $id ID del archivo o directorio.
     * @param string $parent ID del directorio destino.
     * @return array Nuevo ID.
     */
    public function copy($id, $parent)
    {
        $newPath = $this->getPath($parent) . DIRECTORY_SEPARATOR . basename($this->getPath($id));
        is_dir($this->getPath($id)) ? mkdir($newPath) : copy($this->getPath($id), $newPath);
        return ['id' => $this->getId($newPath)];
    }

    /**
     * Obtiene el ID relativo de un path.
     *
     * @param string $path Ruta del archivo o directorio.
     * @return string ID relativo.
     */
    protected function getId($path)
    {
        $relativePath = str_replace($this->base, '', $this->resolvePath($path));
        return trim(str_replace(DIRECTORY_SEPARATOR, '/', $relativePath), '/') ?: '/';
    }
}
