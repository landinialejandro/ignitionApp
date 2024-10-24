<?php

require_once('class_fs.php');

// Leer y decodificar el cuerpo de la solicitud JSON
$body = trim(file_get_contents("php://input"));
$decoded = json_decode($body, true) ?? [];

// Valores predeterminados para la solicitud
$defaults = [
    'operation' => "test",
    'id' => "",
    'folder' => "",
    'text' => "",
    'content' => "",
    'type' => "",
    'parent' => "",
];

// Mezclar los datos recibidos con los valores predeterminados
$request = array_merge($defaults, $_REQUEST, $decoded);

try {
    validarDatos($request); // Aplicamos validación
    enviarRespuesta(200, realizarOperacion($request));
} catch (InvalidArgumentException $e) {
    enviarRespuesta(400, ['error' => $e->getMessage()]);
} catch (Exception $e) {
    enviarRespuesta(500, ['error' => $e->getMessage()]);
}

//////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////

/**
 * Realiza la operación solicitada sobre el sistema de archivos.
 */
function realizarOperacion($request)
{
    // Desestructurar los valores del request
    [
        'operation' => $operation,
        'id' => $id,
        'folder' => $folder,
        'text' => $text,
        'content' => $content,
        'type' => $type,
        'parent' => $parent,
    ] = $request;

    $id = $id && $id !== '#' ? $id : '/';
    $settingsDir = dirname(__FILE__) . "/settings/";
    $fs = new fs($folder);

    switch ($operation) {
        case 'get_node':
            return $fs->lst($id, $id === '/');
        case 'get_content':
            return $fs->data($id);
        case 'create_node':
            return $fs->create($id, $text, $type !== 'file', $content);
        case 'rename_node':
            return $fs->rename($id, $text);
        case 'delete_node':
            return $fs->remove($id);
        case 'move_node':
            return $fs->move($id, $parent ?: '/');
        case 'copy_node':
            return $fs->copy($id, $parent ?: '/');
        case 'save_file':
            return $fs->create($id, null, false, $content);
        case 'get_json':
            return obtenerConfiguracionJson($fs, $text, $settingsDir, $id);
        case 'test':
            return ['id' => $id, 'content' => $text ?: 'TEST'];
        default:
            throw new InvalidArgumentException("Operación no soportada: {$operation}");
    }
}

/**
 * Valida los datos recibidos en el request.
 */
function validarDatos($request)
{
    // Validamos que la operación sea una cadena no vacía
    if (!isset($request['operation']) || !is_string($request['operation'])) {
        throw new InvalidArgumentException("La operación es requerida y debe ser una cadena.");
    }

    // Validamos que 'id' y 'folder' sean cadenas
    if (isset($request['id']) && !is_string($request['id'])) {
        throw new InvalidArgumentException("El campo 'id' debe ser una cadena.");
    }

    if (isset($request['folder']) && !is_string($request['folder'])) {
        throw new InvalidArgumentException("El campo 'folder' debe ser una cadena.");
    }

    // Validamos que 'type' sea cadena
    if (isset($request['type']) && !is_string($request['type'])) {
        throw new InvalidArgumentException("El campo 'type' debe ser una cadena.");
    }

    // Si hubiera más campos críticos, añadir más validaciones aquí...
}

/**
 * Obtiene configuraciones específicas en formato JSON.
 */
function obtenerConfiguracionJson($fs, $text, $settingsDir, $id)
{
    switch ($text) {
        case 'field-settings':
            return get_children($settingsDir . "field");
        case 'project-settings':
            return get_children($settingsDir . "project");
        case 'group-settings':
            return get_children($settingsDir . "group");
        case 'table':
        case 'group':
            return [
                'text' => ucfirst($text) . " Settings",
                'type' => "{$text}-settings",
                'children' => get_children($settingsDir . $text)
            ];
        case 'file':
            return json_decode($fs->getContent($id), true);
        default:
            throw new InvalidArgumentException("Operación JSON no soportada: {$text}");
    }
}

/**
 * Obtiene los elementos hijos de un directorio específico.
 */
function get_children($dir, $sort = true)
{
    $fs = new fs($dir);
    $files = array_diff(scandir($dir), ['.', '..']);
    $result = [];

    foreach ($files as $file) {
        if (pathinfo($file, PATHINFO_EXTENSION) === 'json') {
            $data = $fs->data("$dir/$file");
            $data['data']['filesetting'] = $file;
            $data['data']['filesettingdir'] = $dir;
            $result[] = $data;
        }
    }

    if ($sort) {
        array_multisort(array_column($result, 'order'), SORT_ASC, $result);
    }

    return $result;
}

/**
 * Envía una respuesta HTTP en formato JSON.
 */
function enviarRespuesta($status, $data)
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    // Codificación mejorada para manejar caracteres Unicode correctamente
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}
