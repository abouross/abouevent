<?php

namespace App\Http\Controllers\Api;

use App\Models\Event;
use Illuminate\Http\Request;

class EventController extends CRUDController
{

    /**
     * EventController constructor.
     */
    public function __construct()
    {
        $this->model = new Event();
        parent::__construct();
    }

    public function publish($id)
    {
        $model = call_user_func([$this->model, 'findOrFail'], $id);
        if ($model->published)
            return $model;
        $model->published = true;
        $model->save();
        return $model;
    }

    public function groups(Request $request)
    {
        return forward_static_call([$this->model, 'getGroups'],
            $request->get('groups', ['created_at']),
            $request->get('filter', []),
            $request->get('search', '')
        );
    }
}