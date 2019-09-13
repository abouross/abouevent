<?php

namespace App\Models;

use App\Exceptions\ValidationException;
use App\Models\Traits\Validation;

class Option extends Model
{
    use Validation;

    const OPTIONS_NAMES = [
        'event_type' => 'Type d\'événement',
        'event_theme' => 'Théme d\'événement'
    ];

    public $table = 'options';

    public $timestamps = false;

    static protected $filtrable = ['name'];
    static protected $sortable = ['id', 'name'];
    static protected $defaultSort = ['id' => 'desc'];
    static protected $searchable = ['value'];

    protected $guarded = ['id'];
    protected $fillable = ['name', 'value'];

    public $rules = [
        'name' => 'required',
        'value' => 'required'
    ];

    protected $isNameValid = true;

    public function beforeValidate()
    {
        if (!array_key_exists($this->name, self::OPTIONS_NAMES))
            $this->isNameValid = false;
    }

    public function afterValidate()
    {
        if ($this->validationErrors->count() <= 0 && !$this->isNameValid) {
            throw new ValidationException(['name' => 'Name invalide']);
        }
    }

}
