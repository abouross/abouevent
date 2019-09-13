<?php

use Illuminate\Database\Seeder;

class UsersTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        \Illuminate\Support\Facades\DB::table('users')->truncate();
        \App\Models\User::create([
            'name' => 'Admin',
            'email' => 'admin@mail.dev',
            'password' => bcrypt('admin'),
        ]);
    }
}
