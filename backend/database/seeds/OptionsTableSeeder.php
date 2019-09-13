<?php

use Illuminate\Database\Seeder;

class OptionsTableSeeder extends Seeder
{
    static public $options = [
        'event_type' => [],
        "event_theme" => []
    ];

    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        \Illuminate\Support\Facades\DB::table('options')->truncate();
        foreach (\App\Models\Option::OPTIONS_NAMES as $key => $value) {
            if ($key == 'event_type') {
                $types = ['Forum', 'Conférence'];
                foreach ($types as $type) {
                    $option = new \App\Models\Option([
                        'name' => 'event_type',
                        'value' => $type
                    ]);
                    self::$options['event_type'][] = $option;
                    $option->save();
                }
            }
            if ($key == 'event_theme') {
                $themes = ['Technologies', 'Bouff'];
                foreach ($themes as $theme) {
                    $option = new \App\Models\Option([
                        'name' => 'event_theme',
                        'value' => $theme
                    ]);
                    self::$options['event_theme'][] = $option;
                    $option->save();
                }
            }
        }
    }
}
