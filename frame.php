<?php
file_put_contents('d:/OneDrive/REPOSITORY/PROJECTS/tanamur/tanamur1/tracker.main/logs/hit_trace.log', date("Y-m-d H:i:s") . " | Hit frame.php | " . json_encode($_REQUEST) . "\n", FILE_APPEND);

session_start();
require("global.php");

function clear()
{
	unset($_SESSION['chk_all_session']);
	exit('cls');
}

if (!isset($_POST['pos']))
	clear();
$pos = json_decode(hexDecode($_POST['pos']), true);
if (!$pos)
	clear();

if (!isset($pos['chk_all_session'])) {
	foreach ($pos as $varname => $varvalue) {
		$_SESSION[$varname] = $varvalue;
	}
	$_SESSION['chk_all_session'] = "saved";
	exit("done");
}


$page = (int) $pos['chk_all_session'];
if ($page == 1) {



	$lokasi = array(

		// dari variabel global //
		"root" => $rootaddr

		,
		"read_tbl" => "web_ReadTbl.php"
		,
		"read_tbl20" => "web_ReadTbl.php"

		,
		"login" => "web_logon.php"


		,
		"tbl_master" => "web_getmaster.php"
		,
		"lastpos" => "web_LastPos.php"

		,
		"change_pwd" => "upd_pwdChange.php"
		,
		"change_mob" => "upd_mobChange.php"
		,
		"change_mob20" => "upd_mobChange.php"
		,
		"change_usr" => "upd_user.php"

		,
		"addressget" => "addr03get.php"
		,
		"addressset" => "addr03set.php"

		,
		"webreport" => "web_report.php"

		,
		"fileapp" => "trackapp.php"
	);
	if (isset($_SESSION['chk_all_session']))
		$lokasi += $_SESSION;
	exit(hexEncode(json_encode($lokasi)));
}


$filebin = false;
$idebug = (int) $pos['D'];

// Determine which view to load
if ($page == 0) {
	$view = "frame_main.php";
	$bin = "frame.bin";
} else if ($page > 0) {
	$view = "view_panel.php";
	$bin = "panel.bin";
} else {
	$view = "view_mini.php";
	$bin = "mini.bin";
}

if ($idebug <= 0) {
	$filebin = $bin;
	if (file_exists($filebin)) {
		exitOK(file_get_contents($filebin));
	}
}

// Assemble the UI from components
ob_start();
$view_path = dirname(__FILE__) . "/views/" . $view;
if (file_exists($view_path)) {
	$MAP = $VIEW_MAPPING;
	include($view_path);
} else {
	// Fallback if component missing (should not happen in prod)
	echo "View $view not found";
}
$str = ob_get_clean();

// Process and Encode
$ipos = strpos($str, "<");
$txt = ($ipos !== false) ? substr($str, $ipos) : $str;
$txt .= str_repeat(" ", 400); // Standard padding
$str = binEncode($txt);

if ($filebin) {
	file_put_contents($filebin, $str);
}

exitOK($str);
//exit;

?>