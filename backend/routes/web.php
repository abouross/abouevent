<?php

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function () {
    return view('welcome');
});

Route::get('/admin/',function(){
    return view('admin');
});

Route::get('/file/thumb/{id}/{width}/{height}', function ($id, $width, $height) {
    /** @var \App\Models\Attach\File $file */
    $file = \App\Models\Attach\File::find($id);
    if (!$file)
        throw new \Symfony\Component\HttpKernel\Exception\HttpException(404, 'File not found');
    return $file->responseThumb($width, $height);
})->where('id', '\d+')
    ->where('width', '\d+')
    ->where('height', '\d+');

Route::get('/file/download/{id}', function ($id) {
    /** @var \App\Models\Attach\File $file */
    $file = \App\Models\Attach\File::find($id);
    if (!$file)
        throw new \Symfony\Component\HttpKernel\Exception\HttpException(404, 'File not found');
    return $file->response('download');
})->where('id', '\d+');

Route::get('/file/broken', function () {
    $content = \App\Models\Attach\BrokenImage::get();
    return response($content, 200, [
        'Content-type' => 'image/png',
        'Content-Disposition' => 'inline; filename="Image not found"',
        'Cache-Control' => 'private',
        'Accept-Ranges' => 'bytes',
        'Content-Length' => mb_strlen($content, '8bit')
    ]);
});

Route::get('/file/{id}', function ($id) {
    /** @var \App\Models\Attach\File $file */
    $file = \App\Models\Attach\File::find($id);
    if (!$file) {
        throw new \Symfony\Component\HttpKernel\Exception\HttpException(404, 'File not found');
    }
    return $file->response();
})->where('id', '\d+');

