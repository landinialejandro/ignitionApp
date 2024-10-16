<?php
require_once('class_fs_.php');

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

// Verificar si se especificó una operación
if (!$operation) {
    enviarRespuesta(400, ['error' => 'Operación no especificada.']);
    exit;
}

try {
    $fs = new fs($folder);
    $id = $id && $id !== '#' ? $id : '/';
    $resultado = realizarOperacion($fs, $operation, $id, $text, $content, $type, $parent);
    enviarRespuesta(200, $resultado);
} catch (Exception $e) {
    enviarRespuesta(500, ['error' => $e->getMessage()]);
}

/**
 * Realiza la operación solicitada sobre el sistema de archivos.
 */
function realizarOperacion($fs, $operation, $id, $text, $content, $type, $parent)
{
    $settingsDir = dirname(__FILE__) . "/settings/";

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
        case 'settings-data':
            $data = $fs->data("settings/settings.json");
            $content = json_decode($data['content'], true);
            return ['id' => $id, 'content' => $content];
        case 'test':
            return ['id' => $id, 'content' => $text ?: 'TEST'];
        default:
            throw new Exception("Operación no soportada: {$operation}");
    }
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
            throw new Exception("Operación JSON no soportada: {$text}");
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
    echo json_encode($data);
    exit;
}
