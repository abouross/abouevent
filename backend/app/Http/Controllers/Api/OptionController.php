<?php
/**
 * Created by PhpStorm.
 * User: abou
 * Date: 25/05/17
 * Time: 10:22
 */

namespace App\Http\Controllers\Api;


use App\Models\Option;

class OptionController extends CRUDController
{
    public function __construct()
    {
        $this->model = new Option();
        parent::__construct();
    }

    public function getOptionsTypes()
    {
        return Option::OPTIONS_NAMES;
    }
    public function getOptionsByName($name){
    	$query  = Option::query()->where('name',$name);
    	return $query->get();
    }
}