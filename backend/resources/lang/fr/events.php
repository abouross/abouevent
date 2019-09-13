<?php

return [
    'plugin' => [
        'name' => 'AbouEvent',
        'description' => 'Une plateforme de gestion des événement.'
    ],
    'nav' => [
        'title' => 'Événement'
    ],
    'dashboard' => [
        'dashboard' => 'Tableau de Bord'
    ],
    'events' => [
        'new_event' => 'Nouvel Événement',
        'update_event' => 'Modifier Événement',
        'events' => 'Événements',
        'list' => 'Liste des Événements'
    ],
    'event' => [
        'name' => 'Nom complét de l\'événement',
        'short_name' => 'Nom de l\'événement',
        'slug' => 'adresse url',
        'save_and_publish' => 'Publier',
        'venue' => 'Lieu de rencontre',
        'tabs' => [
            'general' => 'Générale',
            'splashpage' => 'Page web et couleur'
        ],
        'start_date' => 'Date du début',
        'end_date' => 'Date de la fin',
        'status' => [
            'not_published'=>'Non publié',
            'label' => 'Status',
            'not_started' => 'Prochainement',
            'running' => 'En cours',
            'finished' => 'Terminé'
        ],
        'runtime' => 'Durée'
    ],
    'venue' => [
        'venues' => 'Lieux de rencontre',
        'new' => 'Ajouter un lieu',
        'name' => 'Nom du lieu',
        'not_found' => 'Lieu Introuvable. Veuillez rafraichir la page.',
        'create_successful' => 'Lieu créé avec succés',
        'update_successful' => 'Lieu mis à jour avec succés',
        'delete_successful' => 'Lieu supprimé avec succés',
        'website' => 'Site web',
        'no_website_available' => 'Pas de site web disponible.',
        'description' => 'Description du lieu',
        'no_description_available' => 'Pas de details disponible',
        'events_count' => 'Événement(s)',
        'address' => [
            'label' => 'Adresse',
            'country' => 'Pays',
            'country_placeholder' => 'Sélectionner un pays',
            'city' => 'Ville',
            'city_placeholder' => 'Saisir une ville',
            'address_placeholder' => 'Saisir une adresse.'
        ],
        'tabs' => [
            'general' => 'Générale',
            'location' => 'Géolocalisation'
        ],
        'website_placeholder'=>'Ex: http://aboudev.me'
    ],
    'parameters' => 'Paramétres',
    'lodgings' => 'Logéments'
];
