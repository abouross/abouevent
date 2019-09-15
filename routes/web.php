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
\Illuminate\Support\Facades\Route::get('admin/password/reset/{token}', function () {
    throw new \Facade\FlareClient\Http\Exceptions\NotFound();
})->name('password.reset');
