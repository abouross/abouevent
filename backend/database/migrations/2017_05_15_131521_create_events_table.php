<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateEventsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('events', function (Blueprint $table) {
            $table->increments('id');

            /*** Globale ****/
            $table->string('name');
            $table->string('short_name');
            $table->string('slug');
            $table->string('contact_email');
            $table->dateTimeTz('start_date');
            $table->dateTimeTz('end_date');
            $table->string('timezone')->default('UTC');
            $table->integer('image_id')->unsigned();
            $table->foreign('image_id')->references('id')->on('files')
                ->onDelete('restrict')
                ->onUpdate('restrict');
            $table->integer('event_type_id')->unsigned();
            $table->foreign('event_type_id')->references('id')->on('options')
                ->onDelete('restrict')
                ->onUpdate('restrict');
            $table->integer('event_theme_id')->unsigned();
            $table->foreign('event_theme_id')->references('id')->on('options')
                ->onDelete('restrict')
                ->onUpdate('restrict');
            $table->text('description');
            $table->text('description_html')->nullable();
            $table->boolean('cfp_open')->default(false);
            $table->boolean('registration_open')->default(false);
            $table->boolean('published')->default(false);
            $table->boolean('public')->default(true);
            $table->integer('registration_limit', false, true)->default(0);

            /*** Splash Page *****/
            $table->boolean('splashpage_public')->default(true);
            $table->boolean('splashpage_include_tracks')->default(true);
            $table->boolean('splashpage_include_program')->default(true);
            $table->boolean('splashpage_include_social_media')->default(true);
            $table->boolean('splashpage_include_banner')->default(true);
            $table->boolean('splashpage_include_venue')->default(true);
            $table->boolean('splashpage_include_tickets')->default(true);
            $table->text('splashpage_ticket_description')->nullable();
            $table->boolean('splashpage_include_registrations')->default(true);
            $table->text('splashpage_registration_description')->nullable();
            $table->boolean('splashpage_include_sponsors')->default(true);
            $table->text('splashpage_sponsor_description')->nullable();
            $table->boolean('splashpage_include_lodgings')->default(true);
            $table->text('splashpage_lodging_description')->nullable();
            $table->text('color');
            $table->text('splashpage_banner_description')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('events');
    }
}
