<?php

namespace App\Models;

use App\Models\Traits\Validation;
use Illuminate\Validation\ValidationException;

class Lodging extends Model
{
    use Validation;

    protected $casts = ['address' => 'json'];
    static protected $filtrable = ['name'];
    static protected $sortable = ['created_at', 'updated_at', 'name'];
    static protected $defaultSort = ['created_at' => 'desc'];
    static protected $searchable = ['name', 'description', 'address'];

    protected $guarded = ['created_at', 'updated_at', 'id'];

    public $rules = [
        'name' => 'required|min:2',
        'address' => 'array',
        'website' => 'required|url',
        'image_id' => 'required'
    ];

    public $addressRules = [
        'address' => 'required|min:10',
        'country' => 'required',
        'city' => 'required',
    ];

    private $addressValidator = null;


    protected $appends = ['events_count', 'image'];

    // Relations
    public function image()
    {
        return $this->belongsTo(Image::class);
    }

    public function events()
    {
        return $this->belongsToMany(Event::class, 'events_lodgings');
    }


    public function beforeValidate()
    {
        $this->addressValidator = static::makeValidator(
            $this->getAttribute('address'),
            $this->addressRules, [], [], null
        );
    }

    public function afterValidate()
    {
        if ($this->validationErrors->count() <= 0 && $this->addressValidator !== null) {
            $success = $this->addressValidator->passes();
            if (!$success) {
                throw new ValidationException($this->addressValidator);
            }
        }
    }

    public function getEventsCountAttribute()
    {
        return $this->events()->count();
    }

    public function getImageAttribute()
    {
        return $this->image()->getResults();
    }

    public function setImageAttribute($value)
    {
        $this->image()->associate($value);
    }

}
