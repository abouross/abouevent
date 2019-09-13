<?php
/**
 * Created by PhpStorm.
 * User: abou
 * Date: 15/05/17
 * Time: 14:04
 */

namespace App\Http\Controllers\Api;


use App\Models\Lodging;

class LodgingController extends CRUDController
{
    public function __construct()
    {
        $this->model = new Lodging();
        parent::__construct();
    }

}