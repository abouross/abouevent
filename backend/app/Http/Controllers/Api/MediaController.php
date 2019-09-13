<?php
/**
 * Created by PhpStorm.
 * User: abou
 * Date: 22/05/17
 * Time: 11:07
 */

namespace app\Http\Controllers\Api;


use App\Http\Controllers\Controller;
use App\Models\Attach\File;
use App\Models\Image;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpException;

class MediaController extends Controller
{

    protected $fileTypes = null;
    protected $mimeTypes = null;

    /**
     * MediaController constructor.
     */
    public function __construct()
    {
        $this->fileTypes = implode(',', File::$imageExtensions);

        if ($this->fileTypes) {
            $mimeTypes = [];
            foreach (File::$imageExtensions as $ext) {
                $mimeTypes[] = 'image/' . $ext;
            }
            $this->mimeTypes = implode(',', $mimeTypes);
        }

    }


    public function index(Request $request)
    {
        return Image::all();
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        if ($request->files->count() <= 0)
            throw new HttpException(404, 'File missing from request');

        $validationRules = ['max:' . File::getMaxFilesize()];
        $validationRules[] = 'image';
        if ($this->mimeTypes) {
            $validationRules[] = 'mimetypes:' . $this->mimeTypes;
        }
        $imgs = [];
        foreach ($request->allFiles() as $file) {
            $validation = $this->getValidationFactory()->make(
                ['file_data' => $file],
                ['file_data' => $validationRules]
            );

            if ($validation->fails()) {
                throw new ValidationException($validation);
            }

            if (!$file->isValid()) {
                throw new HttpException(402, 'File is not valid');
            }
            $img = new Image();
            $img->fromPost($file);
            $img->is_public = true;
            $img->save();
            $imgs[] = $img;
        }
        return $imgs;
    }

    /**
     * Display the specified resource.
     *
     * @param  Mixed $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        return $this->findOrFail($id);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request $request
     * @param  Mixed $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $file = $this->findOrFail($id);
        $file->fill($request->all());

        if ($request->files->count() > 0) {
            if ($request->files->count() > 1 && !$request->file('file_data'))
                throw new HttpException(402, 'Many files are sended');
            elseif ($request->file('file_data'))
                $data = $request->file('file_data');
            else
                $data = $request->allFiles()[0];

            $validationRules = ['max:' . File::getMaxFilesize()];
            $validationRules[] = 'image';
            if ($this->mimeTypes) {
                $validationRules[] = 'mimetypes:' . $this->mimeTypes;
            }

            $validation = $this->getValidationFactory()->make(
                ['file_data' => $data],
                ['file_data' => $validationRules]
            );

            if ($validation->fails()) {
                throw new ValidationException($validation);
            }

            if (!$data->isValid()) {
                throw new HttpException(402, 'File is not valid');
            }

            $file->fromPost($data);
        }

        $file->save();
        return $file;
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  Mixed $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $file = $this->findOrFail($id);
        $file->delete();
        return $file;
    }


    /**
     * @param $id
     * @return Image
     */
    protected function findOrFail($id)
    {
        $file = Image::find($id);
        if (!$file)
            throw new HttpException(404, 'File not found');
        return $file;
    }

}