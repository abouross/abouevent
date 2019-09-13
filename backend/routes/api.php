<?php

use Illuminate\Http\Request;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::post('login','Api\LoginController@login');
Route::middleware('auth:api')->get('/user', function (Request $request) {
    return $request->user();
});
Route::resource('venues', Api\VenueController::class);
Route::resource('lodgings', Api\LodgingController::class);

Route::get('events/publish/{id}','Api\EventController@publish');
Route::get('events/count','Api\EventController@count');
Route::get('events/groups','Api\EventController@groups');
Route::resource('events', Api\EventController::class);

Route::resource('medias',Api\MediaController::class);

Route::get('options/options_types','Api\OptionController@getOptionsTypes');
Route::get('options/options_by_name/{name}','Api\OptionController@getOptionsByName');
Route::resource('options',Api\OptionController::class);

