<?php
// file: ignitionApp.php

require_once('class_fs.php');

// Configuración de claves API y permisos
$API_KEYS = [
    'cliente1_key' => ['create_node', 'get_node', 'save_file'], // Cliente 1 puede crear y obtener nodos
    'cliente2_key' => ['get_node'],               // Cliente 2 solo puede obtener nodos
];

// Secreto compartido para validar JWT (opcional para el futuro)
$SECRET = 'mi_secreto_compartido';

/**
 * Valida la clave API y verifica los permisos para una operación específica.
 */
function validarClaveAPI($apiKey, $operation, $keys) {
    if (!isset($keys[$apiKey])) {
        throw new InvalidArgumentException("Clave API no válida.");
    }

    $permisos = $keys[$apiKey];
    if (!in_array($operation, $permisos)) {
        throw new InvalidArgumentException("Permiso insuficiente para realizar la operación: $operation.");
    }

    return true; // Clave y permisos válidos
}

/**
 * Valida un token JWT (implementación futura).
 */
function validarJWT($token, $secret, $requiredPermission) {
    // TODO: Implementar lógica JWT cuando sea necesario.
    throw new Exception("Validación JWT aún no implementada.");
}

/**
 * Procesa las solicitudes HTTP y valida el esquema de autenticación.
 */
function procesarAutenticacion($request, $keys, $secret) {
    // Verifica si se usa una clave API
    $apiKey = $_SERVER['HTTP_X_API_KEY'] ?? $request['apiKey'] ?? null;
    if ($apiKey) {
        validarClaveAPI($apiKey, $request['operation'], $keys);
        return;
    }

    // Verifica si se usa un token JWT
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (strpos($authHeader, 'Bearer ') === 0) {
        $jwt = substr($authHeader, 7);
        validarJWT($jwt, $secret, $request['operation']);
        return;
    }

    // Ningún esquema de autenticación válido proporcionado
    throw new InvalidArgumentException("No se proporcionó un esquema de autenticación válido.");
}

/**
 * Realiza la operación solicitada sobre el sistema de archivos.
 */
function realizarOperacion($request) {
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
function validarDatos($request) {
    if (!isset($request['operation']) || !is_string($request['operation'])) {
        throw new InvalidArgumentException("La operación es requerida y debe ser una cadena.");
    }

    if (isset($request['id']) && !is_string($request['id'])) {
        throw new InvalidArgumentException("El campo 'id' debe ser una cadena.");
    }

    if (isset($request['folder']) && !is_string($request['folder'])) {
        throw new InvalidArgumentException("El campo 'folder' debe ser una cadena.");
    }

    if (isset($request['type']) && !is_string($request['type'])) {
        throw new InvalidArgumentException("El campo 'type' debe ser una cadena.");
    }
}

/**
 * Obtiene configuraciones específicas en formato JSON.
 */
function obtenerConfiguracionJson($fs, $text, $settingsDir, $id) {
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
function get_children($dir, $sort = true) {
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
function enviarRespuesta($status, $data) {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

// Leer y procesar la solicitud
$body = trim(file_get_contents("php://input"));
$decoded = json_decode($body, true) ?? [];
$defaults = [
    'operation' => "test",
    'id' => "",
    'folder' => "",
    'text' => "",
    'content' => "",
    'type' => "",
    'parent' => "",
];
$request = array_merge($defaults, $_REQUEST, $decoded);

try {
    validarDatos($request);
    procesarAutenticacion($request, $API_KEYS, $SECRET);
    enviarRespuesta(200, realizarOperacion($request));
} catch (InvalidArgumentException $e) {
    enviarRespuesta(403, ['error' => $e->getMessage()]);
} catch (Exception $e) {
    enviarRespuesta(500, ['error' => $e->getMessage()]);
}
