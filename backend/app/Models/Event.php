<?php

namespace App\Models;


use App\Helpers\DatetimeHelper;
use App\Models\Traits\Sluggable;
use App\Models\Traits\Validation;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model as BaseModel;
use Illuminate\Database\Query\Expression;
use Illuminate\Mail\Markdown;
use Illuminate\Support\HtmlString;
use Illuminate\Database\Eloquent\Collection as CollectionBase;
use Symfony\Component\VarDumper\VarDumper;

class Event extends Model
{
    use Validation;
    use Sluggable;

    static protected $filtrable = ['event_type_id', 'event_theme_id', 'published', 'public', 'start_date', 'end_date'];
    static protected $sortable = ['created_at', 'updated_at', 'name', 'short_name', 'id', 'start_date', 'end_date'];
    static protected $defaultSort = ['created_at' => 'desc', 'id' => 'desc'];
    static protected $searchable = ['name', 'short_name', 'description'];

    protected $guarded = ['created_at', 'updated_at', 'id', 'slug', 'published', 'timezone'];
    protected $hidden = ['image_id', 'event_type_id', 'event_theme_id'];

    protected $casts = [
        'color' => 'json',
        'cfp_open' => 'boolean',
        'registration_open' => 'boolean',
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'timezone' => 'json',
        'published' => 'boolean',
        'public' => 'boolean',
        'registration_limit' => 'integer',
        'splashpage_public' => 'boolean',
        'splashpage_include_tracks' => 'boolean',
        'splashpage_include_program' => 'boolean',
        'splashpage_include_social_media' => 'boolean',
        'splashpage_include_banner' => 'boolean',
        'splashpage_include_venue' => 'boolean',
        'splashpage_include_tickets' => 'boolean',
        'splashpage_include_registrations' => 'boolean',
        'splashpage_include_sponsors' => 'boolean',
        'splashpage_include_lodgings' => 'boolean'
    ];
    protected $slugs = ['slug' => 'name'];

    /*
     * Validation
     */
    public $rules = [
        'short_name' => 'required|min:2|max:180',
        'name' => 'required|min:2',
        'start_date' => 'required|date',
        'end_date' => 'required|date',
        'description' => 'required|min:10',
        'contact_email' => 'required|email'
    ];

    protected $relations = ['lodgings', 'venues'];

    protected $appends = ['image', 'eventType', 'eventTheme', 'status', 'status_code'];

    public function beforeSave()
    {
        $formated = self::formatHtml($this->description);
        $this->description_html = $formated;
    }


    public static function formatHtml($input, $preview = false)
    {
        /** @var HtmlString $result */
        $result = Markdown::parse(trim($input));
        $result = $result->toHtml();

        if ($preview) {
            $result = str_replace('<pre>', '<pre class="prettyprint">', $result);
        }

        return $result;
    }

    static public function getGroups($groups = [], $filter = [])
    {
        $result = [
        ];
        $groups = count($groups) > 0 ? $groups : ['created_at'];

        $select = [];
        foreach ($groups as $i => $field) {
            $instance = new static;
            if ($instance->isDateAttribute($field)) {
                $select[] = new Expression('Date(' . $field . ') as f' . $field);
                $groups[$i] = 'f' . $field;
            }
        }
        $query = self::query();
        $query = $query->getQuery();
        $query->select([]);
        $query->selectRaw('COUNT(id) as count');
        $query->addSelect($select);
        $query->groupBy($groups);

        /*** Filter ***/
        if (is_array($filter) && count($filter) > 0)
            $query = self::scopeFilter($query, $filter);

        $result['data'] = $query->get();

        if (count($filter) > 0)
            $result['filter'] = $filter;
        $result['groups'] = $groups;

        return $result;
    }

    // scopes
    public function scopeIsPublished($query)
    {
        return $query
            ->whereNotNull('published')
            ->where('published', true);
    }

    /**
     * Lists posts for the front end
     * @param  array $options Display options
     * @return self
     */
    public function scopeListFrontEnd($query, $options)
    {
        /*
         * Default options
         */
        extract(array_merge([
            'page' => 1,
            'perPage' => 30,
            'sort' => 'created_at',
            'search' => '',
            'published' => true,
        ], $options));

        if ($published) {
            $query->isPublished();
        }


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

        /*
         * Search
         */
        $search = trim($search);
        if (strlen($search)) {
            $query->search($search, static::$searchable);
        }

        return $query->paginate($perPage, $page);
    }

    // Relations

    public function lodgings()
    {
        return $this->belongsToMany('App\Models\Lodging', 'events_lodgings');
    }

    public function venues()
    {
        return $this->belongsToMany('App\Models\Venue', 'events_venues');
    }

    public function image()
    {
        return $this->belongsTo(Image::class);
    }

    public function eventType()
    {
        return $this->belongsTo(Option::class);
    }

    public function eventTheme()
    {
        return $this->belongsTo(Option::class);
    }

    // Getters and setters
    public function setLodgingsAttribute($value)
    {
        $relation = $this->lodgings();
        $relationModel = $this->lodgings()->getRelated();

        /*
         * Nulling the relationship
         */
        if (!$value) {
            // Disassociate in memory immediately
            $this->setRelation($relation->getRelationName(), $relationModel->newCollection());

            // Perform sync when the model is saved
            $this->bindEventOnce('afterSave', function () use ($value) {
                $this->lodgings()->detach();
            });
            return;
        }

        /*
         * Convert models to keys
         */
        if ($value instanceof BaseModel) {
            $value = $value->getKey();
        } elseif (is_array($value)) {
            foreach ($value as $_key => $_value) {
                if ($_value instanceof Model) {
                    $value[$_key] = $_value->getKey();
                }
            }
        }

        if (is_string($value)) {
            $value = [$value];
        }

        /*
         * Setting the relationship
         */
        $relationCollection = $value instanceof CollectionBase
            ? $value
            : $relationModel->whereIn($relationModel->getKeyName(), $value)->get();

        // Associate in memory immediately
        $this->setRelation($relation->getRelationName(), $relationCollection);

        // Perform sync when the model is saved
        $this->bindEventOnce('afterSave', function () use ($value) {
            $this->lodgings()->sync($value);
        });
    }

    public function getLodgingsAttribute()
    {
        return $this->lodgings()->get();
    }

    public function setVenuesAttribute($value)
    {
        $relation = $this->venues();
        $relationModel = $relation->getRelated();

        /*
         * Nulling the relationship
         */
        if (!$value) {
            // Disassociate in memory immediately
            $this->setRelation($relation->getRelationName(), $relationModel->newCollection());

            // Perform sync when the model is saved
            $this->bindEventOnce('afterSave', function () use ($value, $relation) {
                $relation->detach();
            });
            return;
        }

        /*
         * Convert models to keys
         */
        if ($value instanceof BaseModel) {
            $value = $value->getKey();
        } elseif (is_array($value)) {
            foreach ($value as $_key => $_value) {
                if ($_value instanceof Model) {
                    $value[$_key] = $_value->getKey();
                }
            }
        }

        if (is_string($value)) {
            $value = [$value];
        }

        /*
         * Setting the relationship
         */
        $relationCollection = $value instanceof CollectionBase
            ? $value
            : $relationModel->whereIn($relationModel->getKeyName(), $value)->get();

        // Associate in memory immediately
        $this->setRelation($relation->getRelationName(), $relationCollection);

        // Perform sync when the model is saved
        $this->bindEventOnce('afterSave', function () use ($value, $relation) {
            $relation->sync($value);
        });
    }

    public function getVenuesAttribute()
    {
        return $this->venues()->get();
    }

    public function getImageAttribute()
    {
        return $this->image()->getResults();
    }

    public function setImageAttribute($value)
    {
        $this->image()->associate($value);
    }

    public function setEventTypeAttribute($value)
    {
        $this->eventType()->associate($value);
    }

    public function getEventTypeAttribute()
    {
        return $this->eventType()->getResults();
    }

    public function getEventTypeTextAttribute()
    {
        $result = $this->eventType()->getResults();
        return ($result && $result instanceOf Option) ? $result->value : $result;
    }

    public function setEventThemeAttribute($value)
    {
        $this->eventTheme()->associate($value);
    }

    public function getEventThemeAttribute()
    {
        $result = $this->eventTheme()->getResults();
        return $result;
    }

    public function getEventThemeTextAttribute()
    {
        $result = $this->eventTheme()->getResults();
        return ($result && $result instanceOf Option) ? $result->value : $result;
    }

    public function getStatusAttribute()
    {
        if (!$this->published)
            return trans('events.event.status.not_published');
        $now = Carbon::now();
        $sdate = DatetimeHelper::makeCarbon($this->start_date);
        $edate = DatetimeHelper::makeCarbon($this->end_date);
        if ($now->lessThanOrEqualTo($sdate))
            return trans('events.event.status.not_started') . ' ( ' .
            DatetimeHelper::timeSince($sdate) .
            ' )';
        if (!$now->lessThanOrEqualTo($sdate) && $now->lessThanOrEqualTo($edate))
            return trans('events.event.status.running') . ' ( ' .
            DatetimeHelper::timeSince($sdate, 'start_date') .
            ' )';
        if (!$now->lessThanOrEqualTo($edate))
            return trans('events.event.status.finished') . ' ( ' .
            DatetimeHelper::timeSince($edate, 'end_date') .
            ' )';
        return null;
    }

    public function getStatusCodeAttribute()
    {
        if (!$this->published)
            return -1;
        $now = Carbon::now();
        $sdate = DatetimeHelper::makeCarbon($this->start_date);
        $edate = DatetimeHelper::makeCarbon($this->end_date);
        if ($now->lessThanOrEqualTo($sdate))
            return 0;
        if (!$now->lessThanOrEqualTo($sdate) && $now->lessThanOrEqualTo($edate))
            return 1;
        if (!$now->lessThanOrEqualTo($edate))
            return 2;
        return null;
    }

    public function setStartDateAttribute($value)
    {
        $this->attributes['start_date'] = $date = DatetimeHelper::validateDateTime($value);
        $this->setAttribute('timezone', $date->timezone);
        return $this;
    }

    public function setEndDateAttribute($value)
    {
        $this->attributes['end_date'] = $date = DatetimeHelper::validateDateTime($value);
        return $this;
    }
}
