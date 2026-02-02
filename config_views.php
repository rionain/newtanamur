<?php
// Centralized Mapping of Menu Components to View Files
// This allows index.php and frame.php to share a single source of truth for the UI structure.

$VIEW_MAPPING = [
    'idMainMap__' => 'view_map.php',
    'idMobPosisi__' => 'view_detail.php',
    'idMobTerakhir__' => 'view_mutakhir.php',
    'idMobReport__' => 'view_report.php',
    'idMobKode__' => 'view_armada.php',
    'idMUser__' => 'view_user.php',
    'idChangePwd__' => 'view_password.php',
    'idAboutMe__' => 'view_info.php'
];
?>