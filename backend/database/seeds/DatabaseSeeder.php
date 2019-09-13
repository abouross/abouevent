<?php

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $this->call(UsersTableSeeder::class);
        $this->call(ImagesTableSeeder::class);
        $this->call(VenuesTableSeeder::class);
        $this->call(LodgingsTableSeeder::class);
        $this->call(OptionsTableSeeder::class);
        $this->call(EventsTableSeeder::class);
    }
}
