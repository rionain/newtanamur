<?php
$log_p = dirname(__FILE__) . '/logs/hit_trace.log';
file_put_contents($log_p, date("Y-m-d H:i:s") . " | Hit index.php | " . json_encode($_REQUEST) . "\n", FILE_APPEND);
session_start();
// header("Cache-Control: no-cache, must-revalidate");
// header("Expires: Mon, 26 Jul 1997 05:00:00 GMT");

$pathbaru = basename($_SERVER["PHP_SELF"]);
if ($pathbaru == 'index.new.php') {
	$pathbaru = "./$pathbaru";
	$pathlama = './index.php';
	if (is_file($pathlama))
		unlink($pathlama);
	copy($pathbaru, $pathlama);
}


require("global.php");
$time = time();

$server = $_SERVER['SERVER_NAME'];
if (substr($server, 0, 4) == "www.")
	$server = substr($server, 4);

$cfilter = $imglogo = $mulai = '';
$webcode = isset($_REQUEST['load']) ? hexDecode($_REQUEST['load']) : ($server == 'localhost' ? 'localhost' : 'mycar');

if ($webcode == 'mycar' || $webcode == '') {

	echo "
<html>
<head>
</head>
<body>
<h3>
gps tracker
</h3>
</body>
</html>	
";
	exit;

}

if (isset($_REQUEST['pself'])) {
	$pself = hexDecode($_REQUEST['pself']);
	$icount = count($aself = explode("/", $pself));
	$pself = $icount > 1 ? $aself[1] : $aself[0];
	//$arrfilter = array("mitsui");
	//if( in_array($pself,$arrfilter) ) {
	$cfilter = "CFILTER='" . hexEncode($pself) . "'";
	//}
	if (isset($_REQUEST['mulai'])) {
		$mulai = 'MULAI=true;';
	}
}
$imglogo = './xref/' . strtolower(str_replace(' ', '', $webcode)) . '.jpg';
if (!is_file($imglogo)) {
	$imglogo = '';
} else {
	$imglogo = hexEncode($imglogo);
}




// webcode //
$_SESSION["webcode"] = $webcode;

// go=outLOGOUT, go=number tgl
$go = isset($_GET['go']) ? (ctype_digit($_GET['go']) ? $_GET['go'] : "'out'") : "'in'";

//$GMAP		= ""; //TANPA MAP
if (isset($_SESSION['XMAP']) && !(isset($_GET['XMAP']) && $_GET['XMAP'])) {
	$XMAP = $_SESSION['XMAP'];
} else {
	$XMAP = (isset($_GET['XMAP']) && $_GET['XMAP']) ? $_GET['XMAP'] : "googlev3";
	$_SESSION['XMAP'] = $XMAP;
}
$DEBUG = 2; // 2, 1 , 0, -1 (app), -2&-3 (index.php)


echo "
<html lang='id'>
<head>
<meta charset='utf-8'>
<meta name='viewport' content='initial-scale=1.0, user-scalable=yes' />
<link rel=stylesheet href='ref/date_input.css'>
<link rel=stylesheet href='ref/gdropdown.css'>
";

echo "<link rel=stylesheet href=\"ref/refcss.css?$time\">";
echo "<title>$webcode</title>";


//echo "<script src='ref/jquery-1.12.4.min.js'></script>";
//echo "<script src='ref/jquery-1.12.3.min.js'></script>";
//echo "<script src='ref/jquery-1.11.3.min.js'></script>";
echo "<script src='ref/jquery-1.5.2.min.js'></script>";
//echo "<script src='ref/jquery-1.10.2.min.js'></script>";


echo "<script src='ref/json3.min.js'></script>";
echo "<script src='ref/gdropdown.js'></script>";
echo '<script>
if(!$.browser){
    $.browser={chrome:false,mozilla:false,opera:false,msie:false,safari:false};
    var ua=navigator.userAgent;
        $.each($.browser,function(c,a){
        $.browser[c]=((new RegExp(c,\'i\').test(ua)))?true:false;
            if($.browser.mozilla && c ==\'mozilla\'){$.browser.mozilla=((new RegExp(\'firefox\',\'i\').test(ua)))?true:false;};
            if($.browser.chrome && c ==\'safari\'){$.browser.safari=false;};
        });
};
</script>';



$imgpath = hexEncode($IMGPATH);
$rptpath = hexEncode($RPTPATH);
$wwwcode = hexEncode($webcode);
// $wfilter = isset($_REQUEST['filter']) ? "1" : "0"; 
// echo "<script>GO=$go;GMAP=$GMAP;LLDEC=$LLDEC;W='$wwwcode';DEBUG=$DEBUG;RP='$rptpath';IP='$imgpath';FILTER=$wfilter;$cfilter;</script>";



$regPath = "";
switch ($XMAP) {
	case "googlev3":

		// GOOGLE KEY 
		//, 'go.geoprimatrack.com'
		//, 'AIzaSyBnRNvIS-7R31GGdsr-1yzuwootdBQimaI'

		// go.geoprimatrack.info = _0239e052ef6eda7a3ea801d811ed14e018a675ed70fe51942be07cd34e0abd3d8c31b916867bba2b8d //		
		$gkey = str_replace(
			array(
				'go.milanotrack.com'
				,
				'go.milanotrack.info'
				,
				'go.yudytrack.com'
				,
				'go.yudytrack.net'
				,
				'go.manunggal.net'
				,
				'go.siketrack.com'
				,
				'go.edlyntrack.web.id'
				,
				'go.geoprimatrack.info'
				,
				'go.multitrackindo.com'
				,
				'go.geoprimatrack.net'
				,
				'go.finance.geoprimatrack.net'
			)
			,
			array(
				'_0239e052ef6eda7a3e9e33a7228c0f991a8c18eb4dff70fa50a576b87c2f8c22ac529938b9299830f0'
				,
				'_0239e052ef6eda7a3e9e33a7228c0f991a8c18eb4dff70fa50a576b87c2f8c22ac529938b9299830f0'
				,
				'_0239e052ef6eda7a3ea602bb34b2189723af198b079644c25fa75ac36e11c021bc2b9608a41fa313da'
				,
				'_0239e052ef6eda7a3ea602bb34b2189723af198b079644c25fa75ac36e11c021bc2b9608a41fa313da'
				,
				'_0239e052ef6eda7a3c9b36a7019e1ee00eff0a8379c467974df975e6323eb7208e1ed923e60aad25ca'
				,
				'_0239e052ef6eda7a3ea602bb34b2189723af198b079644c25fa75ac36e11c021bc2b9608a41fa313da'
				,
				'_0239e052ef6eda7a3e9e33a7228c0f991a8c18eb4dff70fa50a576b87c2f8c22ac529938b9299830f0'
				,
				'_0239e052ef6eda7a3e9e33a7228c0f991a8c18eb4dff70fa50a576b87c2f8c22ac529938b9299830f0'
				,
				'_0239e052ef6eda7a3ea602bb34b2189723af198b079644c25fa75ac36e11c021bc2b9608a41fa313da'
				,
				'_0239e052ef6eda7a3ea602bb34b2189723af198b079644c25fa75ac36e11c021bc2b9608a41fa313da'
				,
				'_0239e052ef6eda7a3ea602bb34b2189723af198b079644c25fa75ac36e11c021bc2b9608a41fa313da'
			)
			,
			$server
		);
		if ($gkey != $server) {
			// $regPath = "AIzaSyByWntSPvqUFlnQqmaQerPXRWRUmnwse88";
			// $regPath = "_0239e052ef6eda7a3f8e2685118c09a53c9207d75bfe58ce7cc674f95527ab24bf328c35a23cac7b85";
			$regPath = $gkey;
		}
		break;

	case "microsoft7":
		// $regPath = "AujI8rZfKJJw13MZnYXvjb6X4ILB3N4vlAaxEGKdXlPTI4mwfbGl4F_JgI_r4Y7k";
		$regPath = "_0264fb41c4619a6ecc76c14e348f43df2bba348d16be28de00e81eed52da21c232f696358f10a71b9d349228ee6cfb18cb57fc76c964b6ba29ba0dad01aa669571ab";
		echo "<script src='http://ecn.dev.virtualearth.net/mapcontrol/mapcontrol.ashx?v=7.0'></script>";
		break;
	case "openlayers":
		echo "<script src='http://dev.openlayers.org/releases/OpenLayers-2.12/OpenLayers.js'></script>";
		break;
	case "ovi":
		echo "<script src='http://api.maps.ovi.com/jsl.js'></script>";
		break;
	default:
	//echo "<script src='http://api.maps.nokia.com/2.2.1/jsl.js?with=all'></script>";
}
//echo "<script src='./source/mxn.js?($XMAP,[geocoder])'></script>";


//$regPath = hexEncode($regPath);
$view_map_json = json_encode($VIEW_MAPPING);
echo "<script>GO=$go;XMAP='$XMAP';LLDEC=$LLDEC;W='$wwwcode';DEBUG=$DEBUG;RP='$rptpath';IP='$imgpath';LOGO='$imglogo';regPath='$regPath';$cfilter;$mulai;VIEW_MAP=$view_map_json;</script>";

if ($DEBUG > 1) {
	?>
	<script src="bin/md5.bin.js"></script>
	<script src="bin/jquery.date_input.js"></script>
	<script src="bin/jquery.date_input.id_ID.js"></script>
	<script src="ref/jquery.jsonp.js"></script>
	<script src="ref/proto.js"></script>
	<script src="ref/winsize.js"></script>
	<script src="ref/my_tabs.js"></script>
	<script src="ref/utama.js"></script>
	<script src="ref/xmap.js"></script>
	<script src="ref/mini.js"></script>
	<script src="ref/users.js"></script>
	<script src="ref/one_day.js"></script>
	<script src="ref/track_cache.js"></script>
	<script src="ref/menu_box.js"></script>
	<script src="ref/kamera.js"></script>
	<script src="bin/jscolor.js"></script>
	<script src='ref/report.js'></script>
	<?php
} else if ($DEBUG == 1) {
	echo "<script src='./ref/js.php'></script>";
} else if ($DEBUG > -3) {
	echo "<script src='./ref/?$time'></script>";
} else {
	echo "<script src='./?frefer=index.html'></script>";
}

echo "
</head>
<body>
<div id=body>
<br/>
<img width='100' src='{$IMGPATH}/img.tracker/progress_bar3.gif' />
</div>
	<marquee id=drt behavior=alternate direction=up scrollamount=1 scrolldelay=300 
	style='left:0; width:100%; bottom: 0; height:100; position: absolute; vertical-align: bottom; z-index:78990;
	display:none; background: red; filter:alpha(opacity=70); -moz-opacity: 0.7; opacity: 0.7;'>
		<div class=crt align='center' style='background:#FFFFA0; ' >
		</div></marquee>
	<span id='divruler' style='visibility: hidden; white-space: nowrap;' ></span>
</body>
</html>
";


?>