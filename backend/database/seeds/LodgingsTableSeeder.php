<?php

use Illuminate\Database\Seeder;

class LodgingsTableSeeder extends Seeder
{
    static public $lodgings = [];

    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $faker = \Faker\Factory::create('fr');

        \Illuminate\Support\Facades\DB::table('lodgings')->truncate();

        foreach (VenuesTableSeeder::$venue_countries as $country => $city) {
            $key = $country . '_' . $city;
            if (!array_key_exists($key, self::$lodgings))
                self::$lodgings[$key] = [];
            for ($i = 0; $i < random_int(3, 5); $i++) {
                $lodging = new \App\Models\Lodging([
                    'name' => $faker->company,
                    'website' => 'http://' . $faker->domainName,
                    'description' => $faker->paragraph(5),
                    'address' => [
                        'country' => $country,
                        'city' => $city,
                        'address' => $faker->streetAddress
                    ]
                ]);

                /*** Relation perform ****/
                if (count(ImagesTableSeeder::$Images) > 0) {
                    $image = ImagesTableSeeder::$Images[array_rand(ImagesTableSeeder::$Images)];
                    $lodging->image = $image;
                }

                $lodging->save();
                self::$lodgings[$key][] = $lodging;
            }
        }
    }
}
