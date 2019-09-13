<?php
/**
 * Created by PhpStorm.
 * User: abou
 * Date: 27/05/17
 * Time: 16:47
 */

namespace App\Helpers;


use Carbon\Carbon;
use DateTime as PhpDateTime;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Lang;
use Symfony\Component\Translation\Loader\ArrayLoader;
use Symfony\Component\Translation\Translator;

class DatetimeHelper
{

    /**
     * @param $value
     * @param $column
     * @return Carbon
     * @throws \Exception
     */
    public static function validateDateTime($value)
    {
        $value = self::makeCarbon($value, false);

        if (!$value instanceof Carbon) {
            throw new \Exception(Lang::get(
                'Datetime invalid'
            ));
        }

        return $value;
    }

    public static function timeSince($value)
    {
        $locale = Config::get('locale', 'fr');
        $dateTime = static::validateDateTime($value);

        if (Carbon::getTranslator() === null) {

            $translator = new Translator($locale);
            $translator->addLoader('array', new ArrayLoader());
            Carbon::setTranslator($translator);
            Carbon::setLocale($locale);
        } elseif (Carbon::getLocale() != $locale) {
            Carbon::getTranslator()->setLocale($locale);
            Carbon::setLocale($locale);
        }

        $value = $dateTime->diffForHumans();

        return $value;
    }

    public static function timeTense($datetime)
    {
        $locale = Config::get('locale', 'fr');
        if (Carbon::getTranslator() === null) {

            $translator = new Translator($locale);
            $translator->addLoader('array', new ArrayLoader());
            Carbon::setTranslator($translator);
            Carbon::setLocale($locale);
        } elseif (Carbon::getLocale() != $locale) {
            Carbon::getTranslator()->setLocale($locale);
            Carbon::setLocale($locale);
        }

        $datetime = self::validateDateTime($datetime);
        $yesterday = $datetime->subDays(1);
        $tomorrow = $datetime->addDays(1);
        $time = $datetime->format('H:i');
        $date = $datetime->format('j M Y');

        if ($datetime->isToday()) {
            $date = 'Today';
        } elseif ($datetime->isYesterday()) {
            $date = 'Yesterday';
        } elseif ($datetime->isTomorrow()) {
            $date = 'Tomorrow';
        }

        return $date . ' at ' . $time;
    }

    public static function timeSinceOrTense($value)
    {
        $dateTime = static::validateDateTime($value);

        if ($dateTime->isToday()) {
            $value = self::timeTense($dateTime);

            return $value;
        }
        $value = self::timeSince($dateTime);

        return $value;
    }

    /**
     * @param $value
     * @param bool $throwException
     * @return Carbon
     * @throws \InvalidArgumentException
     */
    public static function makeCarbon($value, $throwException = true)
    {
        if ($value instanceof Carbon) {
            // Do nothing
        } elseif ($value instanceof PhpDateTime) {
            $value = Carbon::instance($value);
        } elseif (is_numeric($value)) {
            $value = Carbon::createFromTimestamp($value);
        } elseif (preg_match('/^(\d{4})-(\d{2})-(\d{2})$/', $value)) {
            $value = Carbon::createFromFormat('Y-m-d', $value)->startOfDay();
        } else {
            try {
                $value = Carbon::parse($value);
            } catch (\Exception $ex) {
            }
        }

        if (!$value instanceof Carbon && $throwException) {
            throw new \InvalidArgumentException('Invalid date value supplied to DateTime helper.');
        }

        return $value;
    }

    public static function dateTime($dateTime, $options = [])
    {
        extract(array_merge([
            'defaultValue' => '',
            'format' => null,
            'formatAlias' => null,
            'jsFormat' => null,
            'timeTense' => false,
            'timeSince' => false,
        ], $options));

        $carbon = self::makeCarbon($dateTime);

        if ($jsFormat !== null) {
            $format = $jsFormat;
        } else {
            $format = DateTimeHelper::momentFormat($format);
        }

        $attributes = [
            'datetime' => $carbon,
            'data-datetime-control' => 1,
        ];

        if ($timeTense) {
            $attributes['data-time-tense'] = 1;
        } elseif ($timeSince) {
            $attributes['data-time-since'] = 1;
        } elseif ($format) {
            $attributes['data-format'] = $format;
        } elseif ($formatAlias) {
            $attributes['data-format-alias'] = $formatAlias;
        }

        return '<time' . Htm::attributes($attributes) . '>' . e($defaultValue) . '</time>' . PHP_EOL;
    }
}