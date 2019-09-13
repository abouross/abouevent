<?php

use Illuminate\Database\Seeder;

class VenuesTableSeeder extends Seeder
{
    static public $venue_countries = [];
    static public $venues = [];

    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $faker = \Faker\Factory::create('fr');

        \Illuminate\Support\Facades\DB::table('venues')->truncate();
        for ($i = 0; $i < 16; $i++) {
            $c = strtoupper($faker->countryCode);
            $ct = $faker->city;
            $venue = new \App\Models\Venue([
                'name' => $faker->company,
                'website' => 'http://' . $faker->domainName,
                'address' => [
                    'country' => $c,
                    'city' => $ct,
                    'address' => $faker->streetAddress
                ],
                'latitude' => $faker->latitude,
                'longitude' => $faker->longitude
            ]);

            /*** Relation perform ****/
            if (count(ImagesTableSeeder::$Images) > 0) {
                $image = ImagesTableSeeder::$Images[array_rand(ImagesTableSeeder::$Images)];
                $venue->image = $image;
            }

            $venue->save();

            self::$venue_countries[$c] = $ct;
            self::$venues[] = $venue;
        }
    }
}
