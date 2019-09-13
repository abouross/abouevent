<?php
/**
 * Created by PhpStorm.
 * User: abou
 * Date: 15/05/17
 * Time: 12:59
 */

namespace App\Http\Controllers\Api;


use App\Http\Controllers\Controller;
use App\Models\Model;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Symfony\Component\VarDumper\VarDumper;

class CRUDController extends Controller
{
    protected $model = null;
    protected $model_class = null;

    /**
     * CRUDController constructor.
     */
    public function __construct()
    {
        if ($this->model === null) {
            throw new ModelNotFoundException('Model must be defined in CRUD Controller');
        }
        if (!$this->model instanceof Model) {
            throw new \Exception(get_class($this->model) . ' must extend ' . Model::class);
        }
        $this->model_class = get_class($this->model);
    }


    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        if ($request->get('all', false))
            return forward_static_call([$this->model, 'all']);

        return forward_static_call([$this->model, 'getPaginate'],
            $request->get('pagination', []),
            $request->get('filter', []),
            $request->get('sort', []),
            $request->get('search', ''),
            $request->get('relation', null),
            $request->get('fields', ['*'])
        );
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        /** @var Model $model */
        $model = new $this->model_class;
        $model->fill($request->all());
        $model->save();
        return $model;
    }

    /**
     * Display the specified resource.
     *
     * @param  Mixed $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $model = call_user_func([$this->model, 'findOrFail'], $id);
        return $model;
    }


    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request $request
     * @param  Mixed $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $model = call_user_func([$this->model, 'findOrFail'], $id);
        $model->fill($request->all());
        $model->save();
        return $model;
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  Mixed $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $model = call_user_func([$this->model, 'findOrFail'], $id);
        $model->delete();
        return $model;
    }

    public function count(Request $request)
    {
        return forward_static_call([$this->model, 'getCount'],
            $request->get('filter', []),
            $request->get('search', '')
        );
    }
}