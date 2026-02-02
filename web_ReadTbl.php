<?php
$log_p = dirname(__FILE__) . '/logs/hit_trace.log';
file_put_contents($log_p, date("Y-m-d H:i:s") . " | Hit web_ReadTbl.php | " . json_encode($_REQUEST) . "\n", FILE_APPEND);

// CEK 
if (!isset($_REQUEST['callback']) || !isset($_REQUEST['req'])) {
	exit;
}

// awalan //
//ob_start();
require("global.php");


$expr = '';
$callback = $_REQUEST['callback'];
$req = json_decode(hexDecode($_REQUEST['req']), true);

$arrResults = array("fail");
if (!isset($req['tname'])) {
	exit(jsonret($arrResults, $callback));
}

$companyid = isset($req['cid']) ? ((int) $req['cid']) : 0;
$log_str = date("Y-m-d H:i:s") . " | cid: $companyid | u: " . ($req['u'] ?? 'na') . " | tname: " . ($req['tname'] ?? 'na') . "\n";
file_put_contents(dirname(__FILE__) . '/logs/direct_debug.log', $log_str, FILE_APPEND);
$rekamfile = false;
require("dbconnect4.php");
require_once("debug_helper.php");
dbg_log("web_ReadTbl call - tname: " . ($req['tname'] ?? 'none') . " | cid: " . ($req['cid'] ?? 'none') . " | u: " . ($req['u'] ?? 'none'));
require("web_create_new_mobil.php");


// $imtime: 0=file, 1=array, 2...= array disave   //
function Quit($msg = 0)
{
	global $callback, $arrResults, $rekamfile;
	if ($msg)
		$arrResults[0] = $msg;
	$sret = json_encode($arrResults);
	//echo "$callback( $sret );\r\n\r\n\r\n\r\n";
	if ($rekamfile) {
		$folderfile = dirname($rekamfile);
		if (is_dir($folderfile) || mkdir($folderfile, 0777, true)) {
			file_put_contents($rekamfile, $sret);
		}
	}
	exitOK("$callback( $sret );");
	//exit;
}



// BACA PARAMETER //

// utk baca terfilter //
$fmitsui = 0;
$access = "~";
$join2 = "";
$where2 = "";
$username = isset($req['u']) ? $req['u'] : "";
$userid = isset($req['uid']) ? (int) $req['uid'] : -1;
if ($userid > 0) {
	$fileUsrAccess = "./access/userid/$userid.txt";
	if (file_exists($fileUsrAccess)) {
		$access = file_get_contents($fileUsrAccess);
		$row = explode("\t", $access);
		$fmitsui = (int) $row[0];
		$access = $row[1];
	} else {
		$userid = -2;
	}
}
if ($userid < 0 && $username) {

	$cek1 = " SELECT u.accesscode, c.filtered, u.id
			FROM usr u
			INNER JOIN company c ON u.company_id = c.id
			WHERE u.company_id=$companyid AND u.nama='$username'";

	if (($result = $mysqli->query($cek1)) && ($row = $result->fetch_row())) {
		$access = trim($row[0]);
		$fmitsui = $row[1];
		$userid = $row[2];

		$fileUsrAccess = "./access/userid/$userid.txt";
		if ($access != "~") {
			$access = str_replace("#", ",", substr($access, 1));
		}
		file_put_contents($fileUsrAccess, "$fmitsui\t$access");
	}
}



$tname = $req['tname'];
$ilast = $newlast = isset($req['ilast']) ? (int) $req['ilast'] : 0;
// tgl yg dipilih oleh user
$sdate = isset($req['sdate']) ? $req['sdate'] : "";
$plimit = 24000;


// HEADER, by isa adi mulia //
//header('Content-Description: File Transfer');
header("Content-type: application/javascript");
$bposition = $tname == "position";


if ($access != "~") {

	if ($fmitsui) {
		$join2 = "and g2.info_markt = '$username'";
	} else {
		if ($access) {
			$where2 = " AND g2.mobil_id IN ($access)";
		} else
			$where2 = " AND 0 ";

	}
}


// LOGGER //
/*	
	$logBrowserAccess	= "./access/browser/$companyid.log";
	if(isset($strRealIpAddr)) file_put_contents($logBrowserAccess,"$strRealIpAddr\t$username\t$sdate\r\n",FILE_APPEND);
*/

$mytbl = '';
if ($sdate == "") {
	$cek2 = "SELECT tbl FROM list_table_pos";
	if (($result = $mysqli->query($cek2)) && ($row = $result->fetch_row()))
		$mytbl = trim($row[0]);
	$mytime = time();
} else {
	$mytime = strtotime($sdate);
	$mytbl = "mypos_" . date("Y_m_d", $mytime);
}



// QUERY //
// $arrResults[0] = "go";

$bacapertama = false;
if ($bposition) {
	// ALARM: BIT (0,1,2,3,4,5,6,7,8,9,10,11) => FUNCTION ( 
	// 0:SOS, 1:ALARM, 2:PINTU, 3:GPS-POWER, 4:LOW-BATTERY, 5:SLEEP-MODE, 6:ACC-ON, 7:GEOFENCE
	// , 8:OLD-TGL, 9:BAD-SIGNAL, 10:POSISI TERAKHIR, 11:NO-SIGNAL, 12:AC-ON {PENDINGIN} )
	// 256 artinya kemarin //


	// baca identitas terakhir //
	$lasttime = isset($req['lasttime']) ? $req['lasttime'] : '';
	if (substr($lasttime, -8) == '23:59:59') {
		$bacapertama = true;
	}
	$fmtold = ($bacapertama || !isset($req['fmt'])) ? -1 : (int) $req['fmt'];


	$fmtnew = 0;
	if ($fmtold >= 0) {
		$loaddir = "./tmp.pos/" . date("Y-m-d", $mytime);
		$loadfile = "$loaddir/company_$companyid.txt";
		if (is_file($loadfile)) {
			$fmtnew = filemtime($loadfile);
			if ($fmtold > 0 && $fmtold == $fmtnew) {
				Quit("notupdated");
			}
		} else if (is_dir($loaddir) || mkdir($loaddir, 0777, true)) {
			touch($loadfile, 87654321);
		}
	}

	$filterExpr = getSqlFilter($req); // BACA FILTER YG DIINGINKAN ( di MITSUI): $req['fc']
	$mobid = isset($req['mobid']) ? (int) $req['mobid'] : 0;
	$bacarute = (isset($req['rute']) && $req['rute'] == 'yes') ? true : false;



	// file_put_contents("./logs/TEST_app_debug.txt","mobid: $mobid, bacarute: $bacarute \r\n<br/><br/>\r\n",FILE_APPEND);
	// jika cek jarak, pastikan mobil yg dicek jaraknya ikut terbaca //


	$where1 = ($bacarute && $bacapertama) ? "(p.nextid>$ilast OR (g2.mobil_id=$mobid and p.dtime>'$lasttime' ) )" : "p.nextid>$ilast";
	if ($ilast > 0) {
		$expr = "SELECT p.mobil_id AS mobid
			, p.dtime, p.latitude AS lat, p.longitude AS lon
			, p.speed, p.nextid, p.alarm | IF(p.dtime<'$sdate',256,0) AS alarm
			, IFNULL(ax.txt,'') as alamat
			, concat( RPAD(p.odometer,14,'N'),p.odomet00) as odometer
			, p.fuel, p.tengine
			, concat( RPAD(p.gpsmeter,14,'N'),p.gpsmet00) as gpsmeter
			, IFNULL(an.address_id,0) as naddr
			, p.heading
			, IF( g2.styleid<0, g2.styleid, p.tenvire ) as gjenis
			, -983 as swapfuel
			, p.obdii
			, p.ket
			, FROM_DAYS(g2.idate) as cdate
			FROM $mytbl p
			INNER JOIN gps g2 ON g2.company_id=$companyid AND g2.mobil_id>0 AND p.mobil_id=g2.mobil_id 
			AND (g2.abs_id>=-1 OR g2.abs_id=-3) $where2 $join2 $filterExpr 
			LEFT JOIN addressnumberbaca an ON p.ilatlon = an.ilatlon 
			LEFT JOIN addresstextbaca ax ON an.address_id=ax.id
			WHERE $where1 
			ORDER BY p.nextid DESC";
	} else {
		$expr = "SELECT p.mobil_id AS mobid
			, p.dtime, p.latitude AS lat, p.longitude AS lon
			, p.speed, p.nextid, p.alarm | IF(p.dtime<'$sdate',256,0) AS alarm
			, IFNULL(ax.txt,'') as alamat
			, concat( RPAD(p.odometer,14,'N'),p.odomet00) as odometer
			, p.fuel, p.tengine
			, concat( RPAD(p.gpsmeter,14,'N'),p.gpsmet00) as gpsmeter
			, IFNULL(an.address_id,0) as naddr
			, p.heading
			, IF( g2.styleid<0, g2.styleid, p.tenvire ) as gjenis
			, -983 as swapfuel
			, p.obdii
			, p.ket
			, FROM_DAYS(g2.idate) as cdate
			FROM $mytbl p
			INNER JOIN gps g2 ON g2.company_id=$companyid AND g2.mobil_id>0 AND p.mobil_id=g2.mobil_id 
			AND (g2.abs_id>=-1 OR g2.abs_id=-3) $where2 $join2 $filterExpr 
			LEFT JOIN addressnumberbaca an ON p.ilatlon = an.ilatlon 
			LEFT JOIN addresstextbaca ax ON an.address_id=ax.id
			WHERE $where1 
			ORDER BY p.nextid DESC";
	}

	/*
		if( $companyid==24274  && $mytbl == 'mypos_2015_11_22' && $mobid==27788 ) {
			file_put_contents("./logs/web_ReadTbl_test.txt"
			,"mobid:$mobid, ilast:$ilast, lasttime:$lasttime \r\n 
			$expr \r\n <br/><br/>\r\n",FILE_APPEND);
		}
	*/


} else if ($tname == "mobil") {


	$filterExpr = getSqlFilter($req);

	// cek //
	$filterMob = trim("$where2 $join2 $filterExpr");
	//$rekamfile	= './tmp.pos/mob/' . $companyid . '._.' . ($filterMob==''?'':md5($filterMob));
	//if ( file_exists($rekamfile) && (($sret = file_get_contents($rekamfile))!==false) ) {
	//	echo "$callback( $sret );\r\n\r\n\r\n\r\n";
	//	exit;
	//}

	$expr = "SELECT m.id, m.kode, RIGHT(HEX(m.color),6) as color, m.jenis 
		, 900 AS maxfuel, 900 AS maxtengine 
		, g2.styleid 
		, IF( m.bb_name='FAN' 
			, CONCAT(m.bb_volt1/10,'~',m.bb_volt2/10/POW(2,m.bb_liter2),'~',m.bb_liter2) 
			, IF(ABS(m.bb_volt2-m.bb_volt1)<150 
				,m.bb_name 
				,CONCAT(m.bb_liter1,'~',m.bb_volt1/10,'~',10*(m.bb_liter2-m.bb_liter1)/(m.bb_volt2-m.bb_volt1),'~',m.bb_name)) 
			) 
		, IF(ABS(m.sh_volt2-m.sh_volt1)<150,m.sh_unit,CONCAT(m.sh_level1,'~',m.sh_volt1/10,'~',10*(m.sh_level2-m.sh_level1)/(m.sh_volt2-m.sh_volt1),'~',m.sh_unit)) 
		, IFNULL(CONCAT(m.bb_name,'|',m.bb_volt1,'|',m.bb_liter1,'|',m.bb_volt2,'|',m.bb_liter2,'|',m.sh_unit,'|',m.sh_volt1,'|',m.sh_level1,'|',m.sh_volt2,'|',m.sh_level2,'|',m.mail_sos,'|',m.sms_sos,'|',m.mail_alarm,'|',m.sms_alarm,'|',m.mail_door,'|',m.sms_door,'|',m.speedy,'|',m.mail_speedy,'|',m.sms_speedy,'|',m.minute_stop,'|',m.mail_stop,'|',m.sms_stop,'|',m.mail_engine,'|',m.sms_engine,'|',m.minute_engine_of,'|',m.mail_engine_of,'|',m.sms_engine_of,'|',m.minute_engine_on,'|',m.mail_engine_on,'|',m.sms_engine_on,'|',m.minute_engine_onday,'|',m.mail_engine_onday,'|',m.sms_engine_onday,'|',m.minute_gpsfail,'|',m.mail_gpsfail,'|',m.sms_gpsfail,'|',m.minute_gsmfail,'|',m.mail_gsmfail,'|',m.sms_gsmfail,'|',m.litre_oil,'|',m.mail_oil,'|',m.sms_oil,'|',m.degree_suhu,'|',m.mail_suhu,'|',m.sms_suhu),'||||||||||||||||||||||||||||||||||||||||||||||||||||') 
		, m.mail_geofence, m.sms_geofence  
		, g2.info_sales, g2.info_custm, g2.info_showr, g2.info_merek, g2.info_tipes, g2.info_markt
		, IFNULL(m.ket,'')	
		FROM mobil m 
		INNER JOIN gps g2 ON m.id=g2.mobil_id AND (g2.abs_id>=-1 OR g2.abs_id=-3) $filterMob 
		WHERE m.company_id=$companyid ORDER BY m.kode";
	// ORDER BY m.old_dtime DESC


} else if ($tname == "fuelhis") {

	gpsdat_file_writeto_tbl($ilast);
	$expr = "SELECT dtime, fuel*10 as fuel, suhu*10 as suhu FROM mobix_$ilast
		WHERE (fuel=0 AND suhu>10) OR (suhu=0 AND fuel>10) OR (fuel>0 AND suhu>0)
		union all
		SELECT dtime, fuel*10 as fuel, suhu*10 as suhu FROM $DbRootGps.mobil_$ilast
		WHERE (fuel=0 AND suhu>10) OR (suhu=0 AND fuel>10) OR (fuel>0 AND suhu>0)
		ORDER BY 1 DESC LIMIT 1000";

} else if ($tname == "poi") {


	$uname = $req['uname'];
	$rekamfile = './tmp.pos/poi/' . $companyid . '._.' . urlencode($uname);
	if (file_exists($rekamfile) && (($sret = file_get_contents($rekamfile)) !== false)) {
		//echo "$callback( $sret );\r\n\r\n\r\n\r\n";
		//exit;
		exitOK("$callback( $sret );");
	}
	$uname = addslashes($uname);
	$expr = "SELECT id, nama, alamat, lat, lon, warna 
		FROM poi p WHERE p.company_id=$companyid AND (p.grup='' OR INSTR('$uname', p.grup)=1) ORDER BY 1";

} else if ($tname == "poi_read") {

	$rekamfile = './tmp.pos/poi/' . $companyid . '._.';
	if (file_exists($rekamfile) && (substr($sret = file_get_contents($rekamfile), 0, 9) == '["kosong"')) {
		//echo "$callback( $sret );\r\n\r\n\r\n\r\n";
		//exit;
		exitOK("$callback( $sret );");
	}
	$expr = "SELECT p.id, p.grup, p.nama, p.alamat, p.lat, p.lon, p.warna 
		FROM poi p WHERE p.company_id=$companyid ORDER BY 2,3";


} else if ($tname == "poi_dele") {

	$poiid = (int) $req['poiid'];
	$expr = "DELETE LOW_PRIORITY FROM poi WHERE company_id=$companyid AND id=$poiid";
	$result = $mysqli->query($expr);
	if (!$result) {
		Quit("mysql error");
	} else {

		// HAPUS CACHE //
		$folderfile = './tmp.pos/poi/';
		if (is_dir($folderfile)) {
			$rekammask = $folderfile . $companyid . '.*';
			array_map("unlink", glob($rekammask));
		}

		$arrResults[] = "done";
		Quit();
	}

} else if ($tname == "poi_save") {

	$poiid = (int) $req['poiid'];
	$poigrup = addslashes(trim($req['poigrup']));
	$poinama = addslashes(trim($req['poinama']));
	$poialamat = addslashes(trim($req['poialamat']));
	$poilat = $req['poilat'];
	$poilon = $req['poilon'];
	$warna = $req['warna'];
	if ($poiid != 0) {
		$expr = "UPDATE LOW_PRIORITY poi SET `grup`='$poigrup', `nama`='$poinama', `alamat`='$poialamat'
			, `lat`=$poilat, `lon`=$poilon, warna=$warna
			WHERE `company_id`=$companyid AND `id`=$poiid";
	} else {
		$expr = "INSERT LOW_PRIORITY INTO poi(`grup`,`nama`,`alamat`,`lat`,`lon`,`company_id`,warna) 
			VALUES('$poigrup','$poinama','$poialamat',$poilat,$poilon,$companyid,$warna)";
	}
	$result = $mysqli->query($expr);
	if (!$result) {
		Quit("nama '$poinama' sudah ada");
	} else if ($mysqli->affected_rows < 1) {
		Quit("data belum berubah");
	} else {

		// HAPUS CACHE //
		$folderfile = './tmp.pos/poi/';
		if (is_dir($folderfile)) {
			$rekammask = $folderfile . $companyid . '.*';
			array_map("unlink", glob($rekammask));
		}

		$arrResults[] = $poiid ? $poiid : $mysqli->insert_id;
		Quit();
	}


	///////////////////////////////////////////////////////////////////////////////////////////////////		

} else if ($tname == "geo_read") {


	$expr = "SELECT gf.id, gf.nama, gf.poligon, IFNULL(g.mobil_id,0)
		FROM geofence gf
		LEFT JOIN gps g ON gf.id = g.geofence_id
		LEFT JOIN mobil m ON g.mobil_id = m.id
		WHERE gf.company_id=$companyid ORDER BY 2";

	$result = $mysqli->query($expr);
	if (!$result)
		Quit("mysql error");
	$arrResults[0] = "kosong"; // HARUS DIISI 'kosong' !! //
	$lastgeoid = -1;
	$maxrow = 0;
	while ($row = $result->fetch_row()) {
		$id_mobil = $row[3];
		if ($lastgeoid != $row[0]) {
			$lastgeoid = $row[0];
			++$maxrow;
			$row[3] = "~$id_mobil~";
			$arrResults[] = $row;
		} else {
			$arrResults[$maxrow][3] .= "~$id_mobil~";
		}
	}
	Quit();


} else if ($tname == "geo_fence") {

	require("web_Geofence.php");



} else if ($tname == "sopir") {

	$expr = "SELECT s.id, s.kode, s.nama
		FROM sopir s WHERE s.company_id=$companyid AND s.abs_id>0 ORDER BY s.id";

} else if ($tname == "gps") {
	// imei, not used //
	$expr = "SELECT m.id, 0 as imei, m.kode, m.company_id, m.abs_id FROM gps m
		INNER JOIN ( SELECT MAX(ABS(abs_id)) AS absmax, id
			FROM gps WHERE company_id=$companyid AND ABS(abs_id)>$ilast GROUP BY id) AS _
			ON m.id=_.id AND ABS(m.abs_id)=_.absmax";
} else if ($tname == "mobil4sopir") {
	$expr = "SELECT m.id, m.sopir_id, m.mobil_id, m.tgl, m.abs_id FROM mobil4sopir m
		INNER JOIN ( SELECT MAX(ABS(ms.abs_id)) AS absmax, ms.id
			FROM mobil4sopir ms INNER JOIN mobil m on ms.mobil_id=m.id
			WHERE m.company_id=$companyid AND ABS(ms.abs_id)>$ilast GROUP BY ms.id) AS _
		ON m.id=_.id AND ABS(m.abs_id)=_.absmax";
} else if ($tname == "mobil4gps") {
	$expr = "SELECT m.id, m.gps_id, m.mobil_id, m.tgl, m.abs_id FROM mobil4gps m
		INNER JOIN ( SELECT MAX(ABS(mg.abs_id)) AS absmax, mg.id
			FROM mobil4gps mg INNER JOIN mobil m on mg.mobil_id=m.id
			WHERE m.company_id=$companyid AND ABS(mg.abs_id)>$ilast GROUP BY mg.id) AS _
		ON m.id=_.id AND ABS(m.abs_id)=_.absmax";
} else {
	Quit("no expression");
}
// exit($expr);


if (!$bposition) {

	if (!($result = $mysqli->query($expr))) {
		Quit("mysql error.");
	}
	$arrResults[0] = "kosong"; // HARUS DIISI 'kosong' !! //
	while ($row = $result->fetch_row())
		$arrResults[] = $row;

	Quit();
}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////                          CARA BACA TERBARU                                   /////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
$SCRIPT_VERSION = 6;

$itnow = time();
$dnow = date("Y-m-d", $itnow);

$aalamat = array(); // daftar alamat //

$arrResults = array(array($dnow, $fmtnew, $ilast, $lasttime, 0, $SCRIPT_VERSION, $mobid));

//file_put_contents("./logs/cek2.txt","username=$username, dnow=$dnow, fmtnew=$fmtnew, ilast=$ilast, lasttime=$lasttime \r\n $expr \r\n <br/><br/>\r\n",FILE_APPEND);


$result = $mysqli->query($expr);
if (!$result)
	Quit("Error 001"); // jangan diganti //
$ncount = $result->num_rows;

/* // test by adi //
if( isset($_REQUEST['isa']) ) {
	file_put_contents("./logs/web_ReadTbl_test.txt","expr = $expr \r\n <br/><br/>\r\n",FILE_APPEND);
}
 */

$odometer0 = $gpsmeter0 = '0NNNNNNNNNNNNN0';
$mobbelum = true;
$xcount = $nextid = $lastmob = 0;
$UseOldTabel = $cstanggal = null;
$nexttime = $lasttime;
if ($ncount > 0) {
	while ($row = $result->fetch_row()) {
		$lastmob = $row[0];
		// if($lastmob == $imob) continue; // kembar //

		// buang alamat yg double //
		$alamat = $row[12];
		if ($alamat) {
			if (in_array($alamat, $aalamat))
				$row[7] = "";
			else
				$aalamat[] = $alamat;
		}

		if ($xcount == 0) {
			$arrResults[0][2] = $newlast = $row[5]; // $ilast, id terakhir, (data descending)
			if ($mobid == 0) {
				$arrResults[0][6] = $mobid = $lastmob; // pilihkan mobil (select)
			}
			// periksa gpsmeter //
			$odometer0 = $row[8];
			$gpsmeter0 = $row[11];
		}

		if ($mobbelum && ($lastmob == $mobid)) {
			$mobbelum = false;
			// catat waktu awal berikutnya, NEXT lasttime //
			$arrResults[0][3] = $nexttime = $row[1];
			// harus !!, cstanggal = tgl terakhir gps update //
			$cstanggal = $row[18];
			$nextid = $row[5];
		}

		// HASIL //
		$arrResults[] = $row;
		++$xcount;
	}
	$arrResults[0][4] = $xcount;
}

if (is_null($cstanggal)) {
	Quit();
}
// tanpa rute, CATAT GPSMETER //
if (!$bacarute) {
	/*	
			if($cekjarak) {
				$minjarak = null;
				$sqlrute = "SELECT `gpsmeter1` FROM mobwh_$mobid WHERE idate = TO_DAYS('$sdate') LIMIT 1";
				if( ($result=$mysqli->query($sqlrute)) && ($row = $result->fetch_row()) ) {
					$minjarak = $row[0];
				}
				$arrResults[0][3] = $minjarak;
			}
	*/
	Quit();
}

// BACA FILE CACHE  JIKA ADA 
$sRetCache = $arrContent = false;
$loaddir = "./tmp.pos/$sdate";
$mobiltbl = "$DbRootGps.mobil_$mobid";
$loadfile = "$loaddir/$mobiltbl.$nextid.txt";
$mobil000 = "mobzz_" . $mobid;
$mobixtbl = "mobix_$mobid";

/* 	
if($mobid==36226) {
	file_put_contents("./logs/web_ReadTbl_0005.txt"
	, "\r\nloaddir=$loaddir<br/>\r\nloadfile=$loadfile<br/>"
	, FILE_APPEND);
}
 */

$sRetCache = $UseOldTabel = false;
if ($sdate < $cstanggal) {
	if (file_exists($loadfile) && ($sRetCache = file_get_contents($loadfile))) {
		// 
		if (strlen($sRetCache) >= 1023) {

			//$arrResults[0][3] = $nexttime;
			$sret = json_encode($arrResults);

			// GABUNGKAN STRING JSON // 
			$sret = substr($sret, 0, -1) . "," . substr($sRetCache, 1);

			/* 			
			if($mobid==36226) {
				file_put_contents("./logs/web_ReadTbl_0005.txt"
				, "\r\nstrlen(sRetCache)=" .strlen($sRetCache). "<br/>\r\nstrlen(sret)=" .strlen($sret). "<br/>"  
				, FILE_APPEND);
			} */

			exitOK("$callback( $sret );");

		}
	}

	$sqlrute = "SELECT p.id
			, p.dtime, p.latitude AS lat, p.longitude AS lon
			, p.speed, p.posid , p.alarm | IF(p.dtime<'$sdate',256,0) AS alarm
			, IFNULL(ax.txt,'') as alamat
			, p.odometer
			, p.fuel, p.suhu
			, p.gpsmeter
			, IFNULL(an.address_id,0) as naddr
			, p.heading
			, CASE WHEN g.styleid<0 THEN g.styleid WHEN LEFT(g.kode,2) IN ('JA','G.') THEN -1 ELSE 1 END as gjenis
			, g.swapfuel, p.obdii, 0 as ket
			FROM $mobiltbl p
			INNER JOIN gps g ON g.mobil_id = $mobid
			LEFT JOIN addressnumberbaca an ON p.ilatlon = an.ilatlon 
			LEFT JOIN addresstextbaca ax ON an.address_id=ax.id
			WHERE p.dtime>'$lasttime' AND p.dtime<='$nexttime' 
			ORDER BY 2 LIMIT $plimit";

	if (($result = $mysqli->query($sqlrute)) && ($ncount = $result->num_rows) > 0) {
		$UseOldTabel = true;
		/* 			
		if($mobid==36226) {
			file_put_contents("./logs/web_ReadTbl_0005.txt"
			, "\r\nUseOldTabel=$UseOldTabel<br/>"
			, FILE_APPEND);
		}
		 */

	}
}



//$besok 		= date("Y-m-d", 86400+$mytime);
// p.dtime<'$besok', diganti p.dtime<='$nexttime'
if ($UseOldTabel == false) {
	gpsdat_file_writeto_tbl($mobid);
	if ($bacapertama) {
		$sqlrute = "SELECT p.id
				, p.dtime, p.latitude AS lat, p.longitude AS lon
				, p.speed, p.posid , p.alarm | IF(p.dtime<'$sdate',256,0) AS alarm
				, IFNULL(ax.txt,'') as alamat
				, p.odometer
				, p.fuel, p.suhu
				, p.gpsmeter
				, IFNULL(an.address_id,0) as naddr
				, p.heading
				, CASE WHEN g.styleid<0 THEN g.styleid WHEN LEFT(g.kode,2) IN ('JA','G.') THEN -1 ELSE 1 END as gjenis
				, g.swapfuel, p.obdii, 0 as ket
				FROM $mobixtbl p
				INNER JOIN gps g ON g.mobil_id = $mobid
				LEFT JOIN $mobil000 zdel ON p.id=zdel.id
				LEFT JOIN addressnumberbaca an ON p.ilatlon = an.ilatlon 
				LEFT JOIN addresstextbaca ax ON an.address_id=ax.id
				WHERE p.dtime>'$lasttime' AND p.dtime<='$nexttime' 
				AND zdel.id IS NULL 
				ORDER BY 2 LIMIT $plimit";
	} else {
		$sqlrute = "SELECT p.id
				, p.dtime, p.latitude AS lat, p.longitude AS lon
				, p.speed, p.posid , p.alarm | IF(p.dtime<'$sdate',256,0) AS alarm
				, IFNULL(ax.txt,'') as alamat
				, p.odometer
				, p.fuel, p.suhu
				, p.gpsmeter
				, IFNULL(an.address_id,0) as naddr
				, p.heading
				, CASE WHEN g.styleid<0 THEN g.styleid WHEN LEFT(g.kode,2) IN ('JA','G.') THEN -1 ELSE 1 END as gjenis
				, g.swapfuel, p.obdii, 0 as ket
				FROM $mobixtbl p
				INNER JOIN gps g ON g.mobil_id = $mobid
				LEFT JOIN $mobil000 zdel ON p.id=zdel.id
				LEFT JOIN addressnumberbaca an ON p.ilatlon = an.ilatlon 
				LEFT JOIN addresstextbaca ax ON an.address_id=ax.id
				WHERE p.dtime>'$lasttime' AND p.dtime<='$nexttime' 
				AND zdel.id IS NULL 
				ORDER BY 2 LIMIT $plimit";
	}

}
if (!($result = $mysqli->query($sqlrute)) || ($ncount = $result->num_rows) <= 0) {

	/* 		
	if($mobid==36226) {
		file_put_contents("./logs/web_ReadTbl_0005.txt"
		, "\r\nQuit<br/>"
		, FILE_APPEND);
	} */

	Quit();
}



/*
if( $companyid==24274  && $mytbl == 'mypos_2015_11_22' && $mobid==27788 ) {
	file_put_contents("./logs/web_ReadTbl_0000.txt"
	,"\r\n mobid:$mobid, ilast:$ilast, lasttime:$lasttime \r\n 
	$sqlrute \r\n <br/><br/>\r\n",FILE_APPEND);
}
*/

$ijumlah = $lastid = 0;
$newalarm = $oldalarm = -1234567;
$oldjarak = -1234567;
$newdtime = $olddtime = $lasttime;

// SUHU & FUEL //
$newfuel = $oldfuel = $newsuhu = $oldsuhu = -1;

$chapus = $xhapus = $sqlkoreksi = $sstest = '';
$nhapus = 0;
$arrContent = array();
$oldrow = false;

////////////////////////////////////////////////////////////////
while ($row = $result->fetch_row()) {
	--$ncount;
	$lastid = $row[0];
	// dtime //
	$newdtime = $row[1];
	if ($newdtime <= $olddtime) {
		$newdtime = $olddtime;
		$chapus .= $UseOldTabel ? ",$lastid" : ",($lastid)";
		++$nhapus;
		continue;
	} else if ($row[2] == 0 && $row[3] == 0) {
		// LAT & LON KOSONG, JANGAN DITAMPILKAN & JANGAN DIHAPUS //
		continue;
	}

	$newalarm = $row[6];
	$newfuel = $row[9];
	$newsuhu = $row[10];
	//$speed	= $row[4];

	/*

			// if( $ncount>0 && $oldalarm==$newalarm && ($newfuel<20 || $oldfuel==$newfuel) && ( $newsuhu<20 || $oldsuhu==$newsuhu ) && $row[4]<100 ) {
			if( $ncount>0 && ($oldalarm==$newalarm) && ($newfuel<20) && ( $newsuhu<20 ) && ($row[4]<100) ) {

				if( $row[11] - $oldjarak<50 ) {
						if($oldrow) {
							$chapus	.= $xhapus;
							++$nhapus;
						}
						$oldrow	= $row;
						$xhapus = $UseOldTabel ? ",$lastid" : ",($lastid)" ;
						continue;
				}
			}

	*/


	//$oddalarm	= $oldalarm;
	$oldalarm = $newalarm;
	//$oddfuel	= $oldfuel;
	$oldfuel = $newfuel;
	//$oddsuhu	= $oldsuhu;				
	$oldsuhu = $newsuhu;
	$oldjarak = $row[11];
	$olddtime = $newdtime;

	for ($ii = 0; $ii < 2; $ii++) {
		$adata = ($ii == 0) ? $oldrow : $row;
		if (!$adata)
			continue;

		// buang alamat yg double //
		$alamat = $adata[12];
		if ($alamat) {
			if (in_array($alamat, $aalamat))
				$adata[7] = "";
			else
				$aalamat[] = $alamat;
		}

		// periksa gpsmeter //
		if (++$ijumlah == 1 && $mobid > 0) {

			$odometer1 = $adata[8];
			$gpsmeter1 = $adata[11];
			$odometerx = (int) substr($odometer0, 14);
			$gpsmeterx = (int) substr($gpsmeter0, 14);

			if ($bacapertama && ($odometerx > $odometer1 || $gpsmeterx > $gpsmeter1)) {
				$sqlkoreksi = "UPDATE $mytbl set odomet00=$odometer1, gpsmet00=$gpsmeter1 where mobil_id=$mobid";
				$arrkoreksi = &$arrResults[1];

				$arrkoreksi[8] = str_pad(substr($odometer0, 0, strpos($odometer0, 'N')), 14, 'N') . $odometer1;
				$arrkoreksi[11] = str_pad(substr($gpsmeter0, 0, strpos($gpsmeter0, 'N')), 14, 'N') . $gpsmeter1;
			}
		}
		// HASIL //
		$arrContent[] = $adata;
	}
	$oldrow = false;
}


//$arrResults[0][3] = $newdtime;
$sRetCache = json_encode($arrContent);

//if( $mobid==26181 && !file_exists("./logs/webread_26181.txt") ) {
//	file_put_contents("./logs/webread_26181.txt", $sRetCache);
//}

// KOREKSI JIKA PERLU //
if ($sqlkoreksi) {
	if ($mysqli->query($sqlkoreksi)) {
		//	file_put_contents("./logs/webread_baik.txt","\r\n ($odometerx>$odometer1 || $gpsmeterx>$gpsmeter1)\r\n$sqlkoreksi\r\n<br/><br/>\r\n",FILE_APPEND);
		//} else {
		//	file_put_contents("./logs/webread_fail.txt","\r\n GAGAL=$sqlkoreksi\r\n<br/><br/>\r\n",FILE_APPEND);
	}
}

// DIREKAM JIKA PERLU //
if ($UseOldTabel) {
	$bdirekam = false;
	if (is_dir($loaddir) || mkdir($loaddir, 0777, true)) {
		$bdirekam = true;
		file_put_contents($loadfile, $sRetCache);
	}
}



// ok, isa adi mulia //
if ($nhapus > 14) {
	$chapus = substr($chapus, 1);
	// SISIPKAN TABEL KHUSUS //
	if ($UseOldTabel) {
		$sqlOld = "DELETE LOW_PRIORITY IGNORE FROM $mobiltbl WHERE id IN ( $chapus )";
	} else {
		$sqlOld = "INSERT LOW_PRIORITY IGNORE INTO $mobil000(id) VALUES $chapus;";
	}
	if (!$mysqli->query($sqlOld)) {
		file_put_contents("./logs/webread.txt", "$sqlOld\r\n<br/><br/>\r\n", FILE_APPEND);
	}
}


$sret = json_encode($arrResults);
if (strlen($sRetCache) >= 10) {
	// GABUNGKAN STRING JSON // 
	$sret = substr($sret, 0, -1) . "," . substr($sRetCache, 1);
}
//echo "$callback( $sret );\r\n\r\n\r\n\r\n";
//exit;	
exitOK("$callback( $sret );");

