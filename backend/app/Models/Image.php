<?php
/**
 * Created by PhpStorm.
 * User: abou
 * Date: 22/05/17
 * Time: 10:04
 */

namespace App\Models;


use App\Models\Attach\File;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\File as FileHelper;

class Image extends File
{

    protected $appends = ['path', 'extension', 'string_size'];

    /**
     * If working with local storage, determine the absolute local path.
     */
    protected function getLocalRootPath()
    {
        return Config::get('filesystems.disks.local.root', storage_path('app'));
    }

    /**
     * Define the public address for the storage path.
     */
    public function getPublicPath()
    {
        $uploadsPath = '/uploads';

        if ($this->isPublic()) {
            $uploadsPath .= '/public';
        } else {
            $uploadsPath .= '/protected';
        }

        return $uploadsPath;
    }

    /**
     * Define the internal storage path.
     */
    public function getStorageDirectory()
    {
        return $this->getPublicPath() . '/';
    }

    public function getStringSizeAttribute()
    {
        $size = $this->file_size;
        $unit = 'O';

        if ($size / 1024 > 0.5) {
            $unit = 'Ko';
            $size /= 1024;
        }

        if ($size / 1024 > 0.5) {
            $unit = 'Mo';
            $size /= 1024;
        }

        return $size . ' ' . $unit;
    }

    public static function all($columns = ['*'])
    {
        return (new static)
            ->newQuery()
            ->orderBy('created_at', 'desc')
            ->get(
                is_array($columns) ? $columns : func_get_args()
            );
    }

}