/**
 * Created by abou on 30/05/17.
 */
(function () {
    angular.module('AbouEventAdmin')
        .factory('Settings', Settings);

    function Settings(Venue, Lodging, Media, Option) {
        return {
            venue: Venue,
            lodging: Lodging,
            media: Media,
            option: Option
        }
    }

    Settings.$inject = ['Venue', 'Lodging', 'Media', 'Option'];
})();