<?php

namespace App\Console\Commands;

use App\Models\Admin;
use Illuminate\Auth\Events\Registered;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use Symfony\Component\VarDumper\VarDumper;

class SuperAdmin extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'superadmin {name} {email} {password}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create a superadmin admin';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return mixed
     */
    public function handle()
    {
        try {
            $this->validator($this->arguments())->validate();
        } catch (ValidationException $e) {
            $this->error(trans($e->getMessage()));
            foreach ($e->errors() as $field => $errors) {
                $this->error('  * ' . $field . ' : ' . implode(' - ', $errors));
            }
            return;
        }
        $this->comment('creating admin ...');
        event(new Registered($user = $this->create($this->arguments())));
        $this->info("super admin created successfully ");
    }

    protected function create(array $data)
    {
        return Admin::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'is_superadmin' => true,
        ]);
    }

    protected function validator(array $data)
    {
        return Validator::make($data, [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'string', 'min:8'],
        ]);
    }
}
