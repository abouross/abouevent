<?php

use Illuminate\Database\Seeder;

class EventsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $faker = \Faker\Factory::create('fr');
        $availableColors = [
            '#1abc9c', '#16a085',
            '#2ecc71', '#27ae60',
            '#3498db', '#2980b9',
            '#9b59b6', '#8e44ad',
            '#34495e', '#2b3e50',
            '#f1c40f', '#f39c12',
            '#e67e22', '#d35400',
            '#e74c3c', '#c0392b',
            '#ecf0f1', '#bdc3c7',
            '#95a5a6', '#7f8c8d',
        ];

        \Illuminate\Support\Facades\DB::table('events')->truncate();


        for ($i = 0; $i < 10; $i++) {
            $date = $faker->dateTime;
            for ($j = 0; $j < random_int(1, 5); $j++) {
                $sdate = $faker->dateTimeBetween('-2 months', '3 months');
                $tz = $faker->timezone;

                $event = new \App\Models\Event([
                    'name' => $faker->sentences(2, true),
                    'short_name' => $faker->sentence(4),
                    'contact_email' => $faker->companyEmail,
                    'start_date' => $sdate,
                    'end_date' => \Carbon\Carbon::createFromTimestamp($sdate->getTimestamp(), $sdate->getTimezone())
                        ->addDays(random_int(3, 7)),
                    'timezone' => $tz,
                    'description' => $faker->text,
                    'public' => $faker->boolean,
                    'published' => $faker->boolean(70),

                    /***** splash page *****/
                    'splashpage_ticket_description' => $faker->text,
                    'splashpage_registration_description' => $faker->text,
                    'splashpage_sponsor_description' => $faker->text,
                    'splashpage_lodging_description' => $faker->text,
                    'splashpage_banner_description' => $faker->text,
                    'color' => [
                        'primary' => $faker->randomElement($availableColors),
                        'secondary' => $faker->randomElement($availableColors),
                        'accent' => $faker->randomElement($availableColors)
                    ]
                ]);
                $event->setCreatedAt($date);
                /*** Relation perform ****/
                if (count(VenuesTableSeeder::$venues) > 0 && count(LodgingsTableSeeder::$lodgings) > 0) {

                    // Venue
                    $venue = VenuesTableSeeder::$venues[array_rand(VenuesTableSeeder::$venues)];
                    $lod_key = $venue->address['country'] . '_' . $venue->address['city'];
                    $event->venues = [$venue];

                    // Lodgings
                    $lodgings = array_key_exists($lod_key, LodgingsTableSeeder::$lodgings) ? LodgingsTableSeeder::$lodgings[$lod_key] : [];
                    $event->lodgings = $lodgings;

                    // Image
                    $event->image = $faker->randomElement(ImagesTableSeeder::$Images);

                    // Options
                    $event->eventType = $faker->randomElement(OptionsTableSeeder::$options['event_type']);
                    $event->eventTheme = $faker->randomElement(OptionsTableSeeder::$options['event_theme']);
                }

                $event->save();
            }
        }
    }
}
