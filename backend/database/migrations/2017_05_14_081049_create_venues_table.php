<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateVenuesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('venues', function (Blueprint $table) {
            $table->increments('id');
            $table->string('name');
            $table->string('address');
            $table->string('website')->nullable(true);
            $table->text('description')->nullable(true);
            $table->string('latitude')->nullable(true);
            $table->string('longitude')->nullable(true);
            $table->string('altitude')->nullable(true);
            $table->integer('image_id')->unsigned();
            $table->foreign('image_id')->references('id')->on('files')
                ->onDelete('restrict')
                ->onUpdate('restrict');
            $table->timestamps();
        });

        Schema::create('events_venues', function ($table) {
            $table->engine = 'InnoDB';
            $table->integer('event_id')->unsigned();
            $table->integer('venue_id')->unsigned();
            $table->foreign('event_id')->references('id')->on('events')
                ->onDelete('restrict')
                ->onUpdate('restrict');
            $table->foreign('venue_id')->references('id')->on('venues')
                ->onDelete('restrict')
                ->onUpdate('restrict');
//            $table->primary(['event_id', 'venue_id']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('venues');
        Schema::table('events_venues', function(Blueprint $table) {
            $table->dropForeign('events_venues_event_id_foreign');
            $table->dropForeign('events_venues_venue_id_foreign');
        });
        Schema::dropIfExists('events_venues');
    }
}
