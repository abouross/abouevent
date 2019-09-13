<?php

/**
 * Laravel - A PHP Framework For Web Artisans
 *
 * @package  Laravel
 * @author   Taylor Otwell <taylor@laravel.com>
 */

$uri = urldecode(
    parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH)
);

if ($uri === '/admin') {
//    http_redirect($_SERVER['REQUEST_URI'].'/');
    header('Location: '.$_SERVER['REQUEST_URI'].'/');
}

// This file allows us to emulate Apache's "mod_rewrite" functionality from the
// built-in PHP web server. This provides a convenient way to test a Laravel
// application without having installed a "real" web server software here.
if ($uri !== '/' && $uri !== '/admin/' && file_exists(__DIR__ . '/public' . $uri)) {
    return false;
}

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    $headers = [
        'Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE',
        'Access-Control-Allow-Headers: content-Type, accept, authorization, access-control-allow-origin',
        'Access-Control-Allow-Origin: *'
    ];
    foreach ($headers as $header) {
        header($header);
    }
    echo 'ok';
    return true;
}
require_once __DIR__ . '/public/index.php';
