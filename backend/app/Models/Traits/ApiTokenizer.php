<?php
/**
 * Created by PhpStorm.
 * User: abou
 * Date: 01/01/14
 * Time: 14:41
 */

namespace App\Models\Traits;


use App\Models\User;

trait ApiTokenizer
{
    public static function bootApiTokenizer()
    {
        static::extend(function ($model) {
            if ($model instanceof User)
                $model->bindEvent('saving', function () use ($model) {
                    $model->updateToken();
                });
        });
    }

    public function updateToken()
    {
        $token = bcrypt($this->email . '' . $this->id . '' . $this->password);
        $this->api_token = $token;
    }
}