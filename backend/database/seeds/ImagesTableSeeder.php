<?php

use Illuminate\Database\Seeder;

class ImagesTableSeeder extends Seeder
{
    static $Images = [];

    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        foreach (\App\Models\Image::all() as $img) {
            $img->delete();
        }

        \Illuminate\Support\Facades\DB::table('files')->truncate();
        for ($i = 0; $i < random_int(10, 20); $i++) {
            $path = \Faker\Provider\File::file(__DIR__ . '/images');
            $img = new App\Models\Image();
            $img->fromFile($path);
            if (!$img->isImage())
                continue;
            $img->is_public = true;
            $img->save();
            self::$Images[] = $img;
        }

    }
}
