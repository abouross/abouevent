<?php

\Illuminate\Support\Facades\Route::post('login', 'Auth\LoginController@login');
\Illuminate\Support\Facades\Route::get('profile/me', 'ProfileController@me');
\Illuminate\Support\Facades\Route::post('profile/reset', 'ProfileController@resetPassword');
\Illuminate\Support\Facades\Route::post('password/email', 'Auth\ForgotPasswordController@sendResetLinkEmail')->name('password.email');
\Illuminate\Support\Facades\Route::post('password/reset', 'Auth\ResetPasswordController@reset')->name('password.update');
