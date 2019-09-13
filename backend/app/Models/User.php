<?php

namespace App\Models;

use App\Extension\ExtendableTrait;
use App\Models\Traits\ApiTokenizer;
use App\Support\Traits\Emitter;
use Illuminate\Notifications\Notifiable;
use Illuminate\Foundation\Auth\User as Authenticatable;

class User extends Authenticatable
{
    use Notifiable;
    use ExtendableTrait;
    use ApiTokenizer;
    use Emitter;

    public function __construct(array $attributes = [])
    {
        parent::__construct($attributes);
        $this->extendableConstruct();
    }


    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'name', 'email', 'password',
    ];

    /**
     * The attributes that should be hidden for arrays.
     *
     * @var array
     */
    protected $hidden = [
        'password', 'remember_token', 'api_token'
    ];


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

        return $result;
    }

    /**
     * Extend this object properties upon construction.
     */
    public static function extend(\Closure $callback)
    {
        self::extendableExtendCallback($callback);
    }

    /// Magic
    public function __call($method, $parameters)
    {
        return $this->extendableCall($method, $parameters);
    }

    public static function __callStatic($method, $parameters)
    {
        if ($method == 'create')
            return (new static)->$method(...$parameters);
        return static::extendableCallStatic($method, $parameters);
    }


}
