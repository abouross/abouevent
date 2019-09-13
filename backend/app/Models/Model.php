<?php
/**
 * Created by PhpStorm.
 * User: abou
 * Date: 14/05/17
 * Time: 09:32
 */

namespace App\Models;

use App\Extension\ExtendableTrait;
use App\Support\Traits\Emitter;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model as EloquentModel;
use Illuminate\Database\Query\Expression;
use Illuminate\Support\Str;
use Prophecy\Exception\Doubler\MethodNotFoundException;
use Carbon\Carbon;
use Symfony\Component\VarDumper\VarDumper;


class Model extends EloquentModel
{
    use ExtendableTrait;
    use Emitter;

    static public $allowPaginationExtra = false;

    static protected $pagination = [
        'page' => 1,
        'perPage' => 10,
        'pageName' => 'pagination[page]'
    ];

    static protected $filtrable = [];
    static protected $sortable = [];
    static protected $defaultSort = [];
    static protected $searchable = [];


    public static function setExtendableStaticMethods($extendableStaticMethods)
    {
        self::$extendableStaticMethods = $extendableStaticMethods;
    }

    public function __construct(array $attributes = [])
    {
        parent::__construct($attributes);
        $this->extendableConstruct();
    }

    public function save(array $options = [])
    {
        if ($this->fireEvent('saving', [$this->attributes, $options], true) === false) {
            return false;
        }
        if (method_exists($this, 'beforeSave'))
            call_user_func([$this, 'beforeSave']);

        $result = parent::save($options);

        if (method_exists($this, 'afterSave'))
            call_user_func([$this, 'afterSave']);

        $this->fireEvent('afterSave', [$this->attributes, $options], true);

        return $result;
    }

    static public function getPaginate($pagination = [], $filter = [], $sort = [], $search = '', $with = null, $columns = ['*'])
    {
        $data = self::scopePagination(self::query(), $pagination, $filter, $sort, $search, $with, $columns);
        extract($data);
        $result = $query->paginate($perPage, $columns, $pageName, $page);
        $result = $result->toArray();

        if (is_array($result) && self::$allowPaginationExtra === false) {
            unset($result['next_page_url']);
            unset($result['prev_page_url']);
            unset($result['from']);
            unset($result['to']);
        }
        if (count($filter) > 0)
            $result['filter'] = $filter;

        $result['sort'] = $sort;

        if (!empty($search))
            $result['search'] = $search;

        return $result;
    }


    static public function getCount($filter = [], $search = '')
    {
        $result = [
        ];

        $query = self::query();

        /*** Filter ***/
        if (is_array($filter) && count($filter) > 0)
            $query = $query->filter($filter);

        /*** Search ******/
        if (!empty($search))
            $query = $query->search($search, static::$searchable);

        $result['count'] = $query->count();

        if (count($filter) > 0)
            $result['filter'] = $filter;

        if (!empty($search))
            $result['search'] = $search;


        return $result;
    }

    static public function scopePagination($query, $pagination = [], $filter = [], $sort = [], $search = '', $with = null, $columns = ['*'])
    {
        if (!is_array($pagination))
            $pagination = self::$pagination;
        else
            $pagination = array_merge(self::$pagination, $pagination);

        extract($pagination);

        $query = $query instanceOf Builder ? $query : self::query();

        if ($with !== null)
            $query = $query->with($with);

        /*** Filter ***/
        if (is_array($filter) && count($filter) > 0)
            $query = self::scopeFilter($query, $filter);

        /*** Sort ****/
        if (!is_array($sort) && is_string($sort)) {
            $sort = [$sort => 'desc'];
        }
        if (count($sort) <= 0)
            $sort = is_array(static::$defaultSort) ? static::$defaultSort : [static::$defaultSort => 'desc'];

        foreach ($sort as $sort_by => $direction) {
            if (in_array($sort_by, static::$sortable)) {
                $query->orderBy($sort_by, $direction);
            }
        }

        /*** Search ******/
        if (!empty($search))
            $query = self::scopeSearch($query, $search, static::$searchable);

        return [
            'query' => $query,
            'perPage' => $perPage,
            'pageName' => $pageName,
            'page' => $page
        ];
    }

    static public function scopeFilter($query, $filter = array())
    {
        foreach ($filter as $field => $data) {
            if (!in_array($field, static::$filtrable))
                continue;
            if (is_array($data) && (!array_key_exists('value', $data) || empty(trim($data['value']))))
                continue;
            if (!is_string($data) && !is_array($data))
                continue;
            elseif (is_string($data)) {
                $data = ['value' => $data];
            }

            $instance = (new static);
            $model = $instance->getModel();
            if ($model->hasGetMutator($field)) {
                $rawMethod = sprintf('raw%sAttribute', Str::studly($field));
                if (!method_exists($model, $rawMethod))
                    throw new MethodNotFoundException('Method "' . $rawMethod . '"" must be defined in ' . get_class($model),
                        get_class($model), $rawMethod);
                $field = call_user_func([$model, $rawMethod]);
            }
            if (!array_key_exists('op', $data)) {
                $query->where($field, $data['value']);
                continue;
            }

            $query->where($field, $data['op'], $data['value']);
        }
        return $query;
    }

    static public function scopeSearch($query, $term, $columns = [])
    {
        $words = explode(' ', $term);

        $query->where(function ($query) use ($query, $columns, $words) {
            if (count($words) == 1 && !strlen($words[0])) return;
            $i = 0;
            foreach ($columns as $field) {

                $wordBoolean = $i == 0 ? 'and' : 'or';
                if (count($words) == 1) {
                    $fieldSql = $query->getQuery()->raw(sprintf("lower(%s)", $field));
                    $wordSql = '%' . trim(mb_strtolower($words[0])) . '%';
                    $query->where($fieldSql, 'LIKE', $wordSql, $wordBoolean);
                } elseif (count($words) > 1)
                    $query->Where(function ($query) use ($query, $field, $words, $wordBoolean) {
                        foreach ($words as $word) {
                            if (!strlen($word)) continue;
                            $fieldSql = $query->getQuery()->raw(sprintf("lower(%s)", $field));
                            $wordSql = '%' . trim(mb_strtolower($word)) . '%';
                            $query->where($fieldSql, 'LIKE', $wordSql, $wordBoolean);
                        }
                    });

                $i++;
            }
        });
        return $query;
    }


    public function findOrFail($id, $column = ['*'])
    {
        $relations = $this->getRelations();
        return $this->newQuery()
            ->with($relations)
            ->findOrFail($id, $column);
    }

    public function find($id, $column = ['*'])
    {
        $relations = $this->getRelations();
        return $this->newQuery()
            ->with($relations)
            ->find($id, $column);
    }

    /**
     * Extend this object properties upon construction.
     */
    public
    static function extend(\Closure $callback)
    {
        self::extendableExtendCallback($callback);
    }


//// Magic //////
    public function __call($method, $parameters)
    {
        return $this->extendableCall($method, $parameters);
    }

    public static function __callStatic($method, $parameters)
    {
        return static::extendableCallStatic($method, $parameters);
    }

}