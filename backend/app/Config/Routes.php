<?php

use CodeIgniter\Router\RouteCollection;

/**
 * @var RouteCollection $routes
 */
$routes->get('/', 'Home::index');

$routes->group('api', ['namespace' => 'App\Controllers\Api'], function ($routes) {
    $routes->get('logon', 'AuthController::login');
    $routes->get('lastpos', 'TrackingController::lastPos');
    $routes->get('readtbl', 'TrackingController::readTable');
    $routes->get('dashboard/metrics', 'DashboardController::getMetrics');
    $routes->match(['get', 'post'], 'vehicles/add', 'VehicleController::create');
    $routes->match(['get', 'post'], 'pulse', 'GpsPulseController::receive');
    $routes->get('debug/encode', 'AuthController::debugEncode');
    $routes->get('geofences', 'GeofenceController::index');
    $routes->post('geofences/save', 'GeofenceController::save');
    $routes->post('geofences/delete', 'GeofenceController::delete');
});
