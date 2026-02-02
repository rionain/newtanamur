<?php

// error_reporting(0);
@header("Connection: Close");

// batasi ? //
set_time_limit(0);

$rowInsert	= -1;
$uniqid		= '['.substr(uniqid(),-3).']';
$gpspostlog = '';
$itnow		= time();
$strtcek	= date( "Y-m-d H:i:s", $itnow );
file_put_contents('./logs/gpspost.log',"\r\n $uniqid $strtcek",FILE_APPEND);

	// bugs //
	$sendbugs	= 1;
	
	// mail eol
	$mail_eol = "~.~";
	// autonumber dari mypos_yyyy_mm_dd
	$autonum = 0;
	$bKritis = 1; // jika TRUE maka tidak boleh cek sms 
	

	// query
	$qry = "";
	$smsused	= false;
	$smsontime	= false; // jika true, berarti membaca semua armada (left join) //
	$smsonline	= false;
	// 
	$mailKirim	= true;

	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	require("web_create_new_mobil.php");
	require("gps081post.php");


	//////////////////////////////////////////////////////////////////////
	// BACA DATA 														//
	// portid>=2 VALID, 1 STATUS_ONLY, 0 ONLINE_ONLY, -1 TIDAK KIRIM	//
	//////////////////////////////////////////////////////////////////////

	if($smsontime) {
		$mobjoins	= "LEFT JOIN";
		$mobwhere	= "WHERE m.old_online>'$tlower' OR !ISNULL(rp.kode)";
	} else {
		$mobjoins	= "INNER JOIN";
		$mobwhere	= "";
	}
	$qry = "SELECT HIGH_PRIORITY m.*

		, CONCAT('mypos_',DATE_FORMAT(rp.dtime, '%Y_%m_%d')) AS mypos_ymd

		, rp.gps_id as gpsid
		, IFNULL(rp.portid,-1) as portid
		, rp.portok
		, IFNULL(rp.alarm,0) as alarm
		, IFNULL(rp.fuel,0) as fuel
		, IFNULL(rp.tengine,0) as suhu

		, UNIX_TIMESTAMP(m.old_online) as last_online
		, UNIX_TIMESTAMP(m.old_valid) as last_valid
		, UNIX_TIMESTAMP(rp.dtime)-UNIX_TIMESTAMP(m.old_dtime) as tjeda
		, CASE WHEN IFNULL(rp.portid,-1)<=1 THEN m.last_lat ELSE rp.latitude END AS latitude
		, CASE WHEN IFNULL(rp.portid,-1)<=1 THEN m.last_lon ELSE rp.longitude END AS longitude
		, rp.dtime, rp.idate
		, rp.speed, rp.online, rp.sopir_id as sopirid
		, rp.ilat, rp.ilon, rp.heading, rp.variation
		, rp.tenvire, rp.ilatlon, rp.kelurahan_id, rp.asal
		, rp.kode as kodegps

		FROM mobil m
		$mobjoins receiverposition rp ON m.id=rp.mobil_id
		
		$mobwhere 
		ORDER BY m.company_id DESC
		";

	
	$result = $mysqli->query($qry);
	if($result) {
		// catat jumlah record  //
		$gpspostlog .= ', @' . $mysqli->affected_rows;	
	} else {
		$mysqli->query("repair table mobil");		
		$mysqli->query("repair table receiverposition");		
		file_put_contents("./logs/gpspost.err","FAIL: $qry \r\n<br/><br/>\r\n",FILE_APPEND);
		exit($qry);
	}
	
	
	
	
	
// SIAPKAN VARIABEL QUERY //	
$sqry_tblposa = $sqry_tblposb = $sqry_tblpos0 = $sqry_tblpos1 = $sqry_tblpos2 = $sqry_tblstatus = 
$sqry_smsrec = $sqry_mobil_yes = $sqry_mobil_bad = $sqry_mobil_alm = $sqry_mobil_onl = $sqry_gps_idate = '';

	$nn = 0;
	$gpsobdii = array('PM');
	while ( $myRow=$result->fetch_assoc() ) {


		extract( $myRow, EXTR_PREFIX_ALL, "v" );
		if( is_null($v_old_odomt) ) $v_old_odomt=0;
		if( is_null($v_old_odotm) ) $v_old_odotm=0;
		if( is_null($v_old_gpsmt) ) $v_old_gpsmt=0;


		++$nn;

		$sms7an		= array();
		$mail7an	= array();

		$mailto = $smsto = $msgyes = $pesan = $mesinon = false;
		$validate = $jarak = 0;
		$txtobdii = '';

		//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		require("gps082post.php");

		// onstate, catat mesin on //
		$onstate	= ($v_alarm & 64) ? $nextAutoNum : 0;
		
		// coba cara baru //
		//$badsignal =  ( $v_portid<2 );
		
		// cek bad signal // 
		// $badsignal =  ( $v_alarm & 512 || $v_portid<2 );
		//$badsignal =  ( ($v_alarm & 2048) || $v_portid<2 );
		
		$badsignal =  ($v_alarm & 2048);
		

		// data tidak valid
		if( $v_portid<=0 || $v_dtime<$tlower || $v_dtime>$tupper ) {

		// mobil baru //
		} else if($v_old_idate==0) {

			$validate	= 1;
			$v_tjeda	= 0;
			$gpsspeed	= 0;

		// data ada dan valid
		} else if($v_tjeda>=1) {

			if( !$badsignal && $v_longitude<>0 && $v_old_lon<>0 ) {
				$jarak	= 111319.4 * sqrt( pow( $v_latitude-($v_old_lat) ,2) + pow( ($v_longitude-($v_old_lon))*cos($v_latitude/57.3) ,2) );
			}
			$gpsspeed	= round(360 * $jarak/$v_tjeda);

			// max speed 25o km/h
			if($gpsspeed<25000) {
				
				// jika jarak > 1000 km //
				if($jarak>1000000) {
					file_put_contents('./logs/jarak.log', "$v_dtime (v_kodegps,v_old_gpsmt,jarak)($v_kodegps,$v_old_gpsmt,$jarak) = 111319.4 * sqrt( pow( $v_latitude-($v_old_lat) ,2) + pow( ($v_longitude-($v_old_lon))*cos($v_latitude/57.3) ,2) ) \r\n<br/>", FILE_APPEND);
					$jarak = 0;
				}

				require("gps083post.php");

				$validate		= 2;
				// JIKA JEDA <= 30 MENIT, DAN MESIN ON //
				$mesinon		= ($v_tjeda<=1800) && ($v_alarm & 64 & $v_old_alarm);

				if($mesinon) {
					$v_old_odotm	+= $v_tjeda;
					$v_old_odomt 	+= $jarak;
					// mesin masih on, catat nomor sebelumnya //
					if($v_old_onstate>0) {
						$onstate		= $v_old_onstate;
					}
				}
				$v_old_gpsmt	+= $jarak;
			}
		}


		// DATA VALID //
		if( $validate>0 ) {
		
			if ( in_array(substr($v_kodegps,0,2),$gpsobdii) ) {
				$fileobdii	= "./tmp.obd/$v_id";
				if( is_file($fileobdii) ) {
					if( ($txtobdii=file_get_contents($fileobdii)) ) {
						$txtobdii = $mysqli->real_escape_string($txtobdii);
					} else {
						$txtobdii = '';
					}
					unlink($fileobdii);
				}
			}
			// CATAT company_id
			if($itouch2!=$v_company_id) {
				$atouch2[] = $itouch2 = $v_company_id;
			}
			
			
			// jika tgl berganti, pindah data //
			// idate=735941 => 2014-12-09
			if( $v_idate > $v_old_idate ) {
				$sqry_gps_idate .= ",$v_id";
				createtable_mobil_nnn($v_id);
				gpsdat_file_writeto_tbl($v_id);
				
				$sqltunda = '';
				$sqlwhouse = "INSERT HIGH_PRIORITY IGNORE INTO $DbRootGps.mobil_$v_id(gps_id,idate,dtime,latitude,longitude
					, posid, speed, gpsmeter, odometer, odotimer, ilatlon
					, jarak, waktu, onstate, gpsspeed, alarm, heading, fuel, suhu, kelurahan_id, obdii)
					SELECT HIGH_PRIORITY m.gps_id, m.idate, m.dtime, m.latitude, m.longitude
					, m.posid, m.speed, m.gpsmeter, m.odometer, m.odotimer, m.ilatlon
					, m.jarak, m.waktu, m.onstate, m.gpsspeed, m.alarm, m.heading, m.fuel, m.suhu, m.kelurahan_id, obdii
					FROM mobix_$v_id m LEFT JOIN mobzz_$v_id x ON m.id=x.id WHERE m.dtime<'$v_dtime' AND x.id IS NULL  
					ORDER BY m.dtime";
				$sqltunda .= "$sqlwhouse(<(*EOL*)>)REPAIR TABLE $DbRootGps.mobil_$v_id;REPAIR TABLE mobix_$v_id;REPAIR TABLE mobzz_$v_id(<(*EOL*)>)TRUNCATE TABLE mobzz_$v_id(<(*EOL*)>)";
			
				// $mysqli->query( "TRUNCATE TABLE mobix_$v_id");
				$sqlwhouse = "DELETE FROM mobix_$v_id WHERE dtime<'$v_dtime'";
				$sqltunda .= "$sqlwhouse(<(*EOL*)>)REPAIR TABLE mobix_$v_id(<(*EOL*)>)";

				// HAPUS DATA, 1 TAHUN LALU, tiap 50 hari //
				if( ($v_idate%50) == ($v_id%50) ) {
					$sqlwhouse = "DELETE from $DbRootGps.mobil_$v_id WHERE idate<" . ($v_idate-400);
					$sqltunda .= "$sqlwhouse(<(*EOL*)>)";
				}
			
				$v_ket = $mysqli->real_escape_string($v_ket);
				// TGL LAMA //
				$oldodomt = $mesinon ? ($v_old_odomt-$jarak) : $v_old_odomt;
				$oldodotm = $mesinon ? ($v_old_odotm-$v_tjeda) : $v_old_odotm;
				$sqlwhouse = "UPDATE IGNORE mobwh_$v_id SET 
					dtimemax='$v_old_dtime', gpsmeter2=$v_old_gpsmt-$jarak
					, odometer2=$oldodomt, odotimer2=$oldodotm
					, speedmax=$v_maxspeed, ket='$v_ket'  
					WHERE idate=$v_old_idate LIMIT 1";
				$sqltunda .= "$sqlwhouse(<(*EOL*)>)REPAIR TABLE mobwh_$v_id(<(*EOL*)>)";
				
				// TGL BARU //
				$sqlwhouse = "INSERT HIGH_PRIORITY IGNORE INTO mobwh_$v_id(idate, dtimemin, dtimemax, gpsmeter1, gpsmeter2
					, odometer1, odometer2, odotimer1, odotimer2, speedmax, ket)
					VALUES($v_idate,'$v_dtime','$v_dtime',$v_old_gpsmt,$v_old_gpsmt
					, $v_old_odomt,$v_old_odomt, $v_old_odotm,$v_old_odotm, $v_speed, '$v_ket')";
				$sqltunda .= "$sqlwhouse(<(*EOL*)>)(<(*END*)>)";
				file_put_contents("./logs/sqlwait.sql",$sqltunda,FILE_APPEND);
			}
			
		
			$sqlupdymd = ",( $nextAutoNum, $v_gpsid, $v_id, '$v_dtime', $v_old_gpsmt, $v_old_odomt, $v_sopirid
					, $v_speed, $v_latitude, $v_longitude, $v_ilat, $v_ilon
					, $v_alarm, $v_heading, $v_variation
					, $v_fuel, $v_suhu, $v_tenvire, $v_ilatlon, $v_portid, $v_portok, '$v_online', $v_kelurahan_id, '$v_asal', '$txtobdii' )";
					
			// INSERT INTO mypos_ymd //
			if($v_portid>=2){
				$sqry_tblpos2 .= $sqlupdymd;
				if( $tblpos1>=$v_mypos_ymd ) {
					if($tblpos1<$tblpos2) {
						$sqry_tblpos1 .= $sqlupdymd;
						if($itouch1!=$v_company_id) {
							$atouch1[] = $itouch1 = $v_company_id;
						}
					}
					if( $tblpos0>=$v_mypos_ymd ) {
						if($tblpos0<$tblpos1) {
							$sqry_tblpos0 .= $sqlupdymd;
							if($itouch0!=$v_company_id) {
								$atouch0[] = $itouch0 = $v_company_id;
							}
						}
						if( $tblposa>=$v_mypos_ymd ) {
							if($tblposa<$tblpos0) {
								$sqry_tblposa .= $sqlupdymd;
								if($itoucha!=$v_company_id) {
									$atoucha[] = $itoucha = $v_company_id;
								}
							}
							if( $tblposb>=$v_mypos_ymd ) {
								if($tblposb<$tblposa) {
									$sqry_tblposb .= $sqlupdymd;
									if($itouchb!=$v_company_id) {
										$atouchb[] = $itouchb = $v_company_id;
									}
								}
							}
						}
					}
				}
			} else if( $v_portid==1 ) {
				// STATUS ONLY //
				$sqry_tblstatus .= $sqlupdymd;
			}
			


/*
			// INSERT INTO mobil_nnn //
			$qrymobix = "INSERT HIGH_PRIORITY IGNORE INTO mobix_$v_id(gps_id,idate,dtime,latitude,longitude
				, posid, speed, gpsmeter, odometer, odotimer, ilatlon
				, jarak, waktu, onstate, gpsspeed, alarm, heading, fuel, suhu, kelurahan_id, obdii)
				VALUES( $v_gpsid, $v_idate, '$v_dtime'
				, $v_latitude, $v_longitude
				, 0, $v_speed, $v_old_gpsmt, $v_old_odomt, $v_old_odotm, $v_ilatlon
				, $jarak, $v_tjeda, $onstate, $gpsspeed, $v_alarm, $v_heading, $v_fuel, $v_suhu, $v_kelurahan_id, '$txtobdii' )";
			if( $mysqli->query($qrymobix) ) {
			} else {
				createtable_mobil_nnn($v_id);
				if( !$mysqli->query($qrymobix) ) {
					$mysqli->query("repair table mobix_$v_id");
					if( !$mysqli->query($qrymobix) ) {
						createtable_mobil_nnn($v_id,true);
						if( !$mysqli->query($qrymobix) ) {
							file_put_contents("./logs/gpspost.err","$qrymobix\r\n<br/>(X)<br/>\r\n",FILE_APPEND);
						}
					}
				}
			}
*/

			$mobval = ",( $v_gpsid, $v_idate, '$v_dtime', $v_latitude, $v_longitude"
			. ", 0, $v_speed, $v_old_gpsmt, $v_old_odomt, $v_old_odotm, $v_ilatlon"
			. ", $jarak, $v_tjeda, $onstate, $gpsspeed, $v_alarm, $v_heading, $v_fuel, $v_suhu, $v_kelurahan_id, '$txtobdii' )";
			gpsdat_str_writeto_file( $v_id, $mobval );
				

			if( $smsused && (!$msgyes) && ($v_old_alarm >=8192) ) {

				$pesan = ($mailto=trim($v_mail_gsmfail)) || ($mailto=trim($v_mail_gpsfail));
				$pesan = ($smsto=trim($v_sms_gsmfail))   || ($smsto=trim($v_sms_gpsfail));

				if( $mailto || $smsto )  {
					$msgyes = true;
					$pesan = "GSM sudah berhasil kirim data lagi.";

					if($mailto) {
						if( isset($mail7an["$mailto"]) )
							$mail7an["$mailto"] .= "$mail_eol$pesan";
						else
							$mail7an["$mailto"] = "$pesan";
					}
					if($smsto) {
						if( isset($sms7an["$smsto"]) )
							$sms7an["$smsto"] .= "$mail_eol$pesan";
						else
							$sms7an["$smsto"] = "$pesan";
					}
				}
			}

			if($validate>0) {
			//	$sqry_mobil_bad .= ",( $v_id, $v_idate, $alarm, $onstate, '$v_online', $v_fuel, $v_suhu, $v_latitude, $v_longitude )";
			//
			// } else {
				$sqry_mobil_yes .= ",( $v_id, $v_old_gpsmt, $v_idate, $v_old_odomt, $v_old_odotm
					, $alarm, $onstate, '$v_dtime', '$v_online', '$v_online', $v_fuel, $v_suhu, $v_latitude, $v_longitude, $v_speed )";
				
			}
			// RESET //
			//$v_id = 0;
			
		}

		if($smsused) {
			
			$glokasi = "http://maps.google.com/?q=$v_latitude,$v_longitude";

			// kirim email jika perlu //
			if( $mailKirim && (count($mail7an)>0) ) {
			
				// MAIL //
				$str_mail = '';
				foreach ($mail7an as $k => $v) {
					$sbj	= "$v_kode, $tjalan WIB";
					$pesan	= "$v_kode $mail_eol$tjalan WIB $mail_eol$v$mail_eol$glokasi";
					
					if( filter_var($k, FILTER_VALIDATE_EMAIL) ) {
					
						// cara lama //
						$str_mail .= "$k\t$sbj\t$pesan\tinfogps.$v_company_id@server_domain_dot_com\n";
						
						// cara baru //
						/*
						$mailHead	= "From: infogps.$v_company_id@gps.istana.web.id\r\n";
						$pesan = str_replace($mail_eol, "\r\n", $pesan);					
						mail($k, $sbj, $pesan, $mailHead, 'O DeliveryMode=b');
						*/
					}
				}
				if($str_mail) {
					//if( isset( $_SERVER['DOCUMENT_ROOT'] )  ) {
					//	$docroot = $_SERVER['DOCUMENT_ROOT'];
					//} else {
					//	$docroot = '../..';
					//}
					//file_put_contents("{$docroot}/gps.tmp/mail.tab",$str_mail,FILE_APPEND);
					file_put_contents("../../gps.tmp/mail.tab",$str_mail,FILE_APPEND); 
					
					//$mailpath	=  "$docroot/gps.bin/mailto.bat";
					//$mailtemp	= "mail.0" . ($nextAutoNum%10);
					//$mailtask	= "$mailpath mail.tab  $mailtemp >> /tmp/mailto.log 2>> /tmp/mailto.err &";
					//exec($mailtask);
				}
				
			}
			
			if(count($sms7an)) {
				// SMS // 081251708989 //
				foreach ($sms7an as $k => $v) {
					if( substr($k,-11)=='81251708989' ) {
						$k = 'sms81251708989';
					}
					$smsto	= addslashes($k);
					$sbj	= addslashes( "$v_kode, $tjalan WIB" );
					$pesan	= addslashes( "$v_kode \r$tjalan WIB \r$v\r$glokasi" );
					$sqry_smsrec .= ",('$smsto',$v_id,'$pesan')";
				}
			}
			
		}


		// setel sisa data //
		if( $validate<=0 ) {
			if($msgyes) $sqry_mobil_alm .= ",( $v_id, $alarm, $onstate)";
			// ingat: >=2 valid, 1 statusonly, 0 online, -1 no data //
			if($v_portid>=0) $sqry_mobil_onl .= ",( $v_id, $v_gpsid, '$v_online', '$v_asal')";
		}
	}

	
	
	
	
////////////////////////////////////
	$bkirimkan = false;
	$arr_sqry_tblpos = array($sqry_tblposb,$sqry_tblposa,$sqry_tblpos0,$sqry_tblpos1,$sqry_tblpos2,$sqry_tblstatus);
	$arr_tblpos = array($tblposb,$tblposa,$tblpos0,$tblpos1,$tblpos2,$tblpos2);
	for($ii=0; $ii<=5; $ii++) {
		$sqrytblpos = $arr_sqry_tblpos[$ii];
		if($sqrytblpos) {
			$sqrytblpos = substr($sqrytblpos,1);
			$tblpos		= $arr_tblpos[$ii];
			// 
			$mysqli->query("TRUNCATE TABLE tabel_pos_tmp");
			$qry = "INSERT HIGH_PRIORITY IGNORE INTO tabel_pos_tmp
				( nextid, gps_id, mobil_id, dtime, gpsmeter, odometer, sopir_id
				, speed, latitude, longitude, ilat, ilon
				, alarm, heading, variation
				, fuel,tengine,tenvire,ilatlon,portid,portok,online,kelurahan_id,asal, obdii )
				VALUES $sqrytblpos ";
			if( !$mysqli->query($qry) ) {
				file_put_contents("./logs/gpspost.err","FAIL: $qry \r\n<br/><br/>\r\n",FILE_APPEND);
			} else {
				
				if($ii==5) {
					// STATUS ONLY //
					$qry = "UPDATE IGNORE $tblpos p INNER JOIN tabel_pos_tmp t ON p.gps_id=t.gps_id AND p.dtime<t.dtime
						SET p.nextid=t.nextid, p.mobil_id=t.mobil_id, p.dtime=t.dtime
						, p.sopir_id=-21, p.alarm=t.alarm, p.portok=t.portok
						, p.fuel=t.fuel, p.tengine=t.tengine, p.tenvire=t.tenvire
						, p.online=t.online, p.asal=t.asal, p.obdii=t.obdii
						";
						//, p.onalarm=t.alarm, p.onfuel=t.fuel, p.onsuhu=t.tengine
				} else {
					$bkirimkan = true;
					$qry = "UPDATE IGNORE $tblpos p INNER JOIN tabel_pos_tmp t ON p.gps_id=t.gps_id AND p.dtime<t.dtime
						SET p.nextid=t.nextid, p.mobil_id=t.mobil_id, p.dtime=t.dtime
						, p.gpsmet00 = CASE DAYOFMONTH(p.dtime) WHEN DAYOFMONTH(t.dtime) THEN p.gpsmet00 ELSE t.gpsmeter END
						, p.odomet00 = CASE DAYOFMONTH(p.dtime) WHEN DAYOFMONTH(t.dtime) THEN p.odomet00 ELSE t.odometer END
						, p.gpsmeter=t.gpsmeter, p.odometer=t.odometer
						, p.sopir_id=t.sopir_id, p.speed=t.speed, p.latitude=t.latitude, p.longitude=t.longitude
						, p.ilat=t.ilat, p.ilon=t.ilon, p.alarm=t.alarm, p.heading=t.heading, p.variation=t.variation
						, p.fuel=t.fuel, p.tengine=t.tengine, p.tenvire=t.tenvire, p.ilatlon=t.ilatlon
						, p.portid=IF(t.portid>=2,t.portid,p.portid), p.portok=t.portok
						, p.online=t.online, p.kelurahan_id=t.kelurahan_id, p.asal=t.asal, p.obdii=t.obdii
						";
						//, p.onalarm=t.alarm, p.onfuel=t.fuel, p.onsuhu=t.tengine
				}
				if( !$mysqli->query($qry) ) {
					$mysqli->query("repair table $tblpos");
					if( !$mysqli->query($qry) ) {
						file_put_contents("./logs/gpspost.err","FAIL, $ii: $qry \r\n<br/><br/>\r\n",FILE_APPEND);
					}
				}
			}
		}		
	}
	if($bkirimkan) {
		$sqlkirim = "INSERT HIGH_PRIORITY ignore INTO invoicelog 
			( invoice, kirimke 
			, sprovider, mobil_id, mobkode, dtime, latitude, longitude
			, speed, gpsmeter, alarm, heading, suhu )
			SELECT p.skirim, CASE p.skirim WHEN 'sierad' THEN 'sierad' ELSE 'unilever' END
			, p.sprovider, p.mobil_id, m.kode, p.dtime, p.latitude, p.longitude
			, p.speed, p.gpsmeter, p.alarm, p.heading, p.tengine
			FROM $tblpos2 p INNER JOIN mobil m ON p.mobil_id=m.id
			WHERE p.nextid=$nextAutoNum AND (p.dtime BETWEEN p.tglstart AND p.tglstop) 
				AND p.skirim IS NOT NULL AND p.sopir_id<>-21";
		if( !$mysqli->query($sqlkirim) ) {
			file_put_contents("./logs/gpspost.err","FAIL, $sqlkirim \r\n<br/><br/>\r\n",FILE_APPEND);
		}
	}
	
	
	
//////////////////////////////////////
	if($sqry_mobil_yes ) {
		$sqry_mobil_yes = substr($sqry_mobil_yes,1);
	
		$mysqli->query("TRUNCATE TABLE tabel_mob_yes");
		$qry = "INSERT HIGH_PRIORITY IGNORE INTO tabel_mob_yes ( 
		`id`, old_gpsmt, old_idate, old_odomt, old_odotm
		, old_alarm, old_onstate, old_dtime, old_online, old_valid 
		, old_fuel, old_suhu, old_lat, old_lon, speed ) 
		VALUES $sqry_mobil_yes ";
		
		if( !$mysqli->query($qry) ) {
			file_put_contents("./logs/gpspost.err","FAIL: $qry \r\n<br/><br/>\r\n",FILE_APPEND);
		} else {

			$qry = "UPDATE IGNORE mobil m INNER JOIN tabel_mob_yes t ON m.id=t.id AND m.old_idate<=t.old_idate
				SET m.old_gpsmt=t.old_gpsmt
				, m.old_odomt=t.old_odomt, m.old_odotm=t.old_odotm
				, m.old_alarm=t.old_alarm, m.old_onstate=t.old_onstate, m.old_dtime=t.old_dtime
				, m.old_online=t.old_online, m.old_valid=t.old_valid
				, m.old_fuel=t.old_fuel, m.old_suhu=t.old_suhu, m.old_lat=t.old_lat, m.old_lon=t.old_lon
				, m.last_lat=t.old_lat, m.last_lon=t.old_lon
				, m.maxspeed=CASE WHEN m.old_idate<>t.old_idate OR m.maxspeed<t.speed THEN t.speed ELSE m.maxspeed END
				, m.old_idate=t.old_idate
				";
			if( !$mysqli->query($qry) ) {
				$mysqli->query("repair table mobil");
				if( !$mysqli->query($qry) ) {
					file_put_contents("./logs/gpspost.err","FAIL 2x: $qry \r\n<br/><br/>\r\n",FILE_APPEND);
				}
			}
		}
	}
	
	if($sqry_mobil_bad ) {
		$sqry_mobil_bad = substr($sqry_mobil_bad,1);
		
		$mysqli->query("TRUNCATE TABLE tabel_mob_bad");
		$qry = "INSERT HIGH_PRIORITY IGNORE INTO tabel_mob_bad ( 
		`id`, old_idate, old_alarm, old_onstate, old_online, old_fuel, old_suhu, last_lat, last_lon ) 
		VALUES $sqry_mobil_bad ";
		if( !$mysqli->query($qry) ) {
			file_put_contents("./logs/gpspost.err","FAIL: $qry \r\n<br/><br/>\r\n",FILE_APPEND);
		} else {
			$qry = "UPDATE IGNORE mobil m INNER JOIN tabel_mob_bad t ON m.id=t.id 
				SET m.old_idate=t.old_idate, m.old_alarm=t.old_alarm, m.old_onstate=t.old_onstate
				, m.old_online=t.old_online
				, m.old_fuel=t.old_fuel, m.old_suhu=t.old_suhu
				, m.last_lat=t.last_lat, m.last_lon=t.last_lon 
				";
			if( $mysqli->query($qry) ) {
				// file_put_contents("./logs/gpsgood.txt","mob_bad\t\t". $mysqli->affected_rows ."\r\n<br/><br/>\r\n",FILE_APPEND);
			} else {
				$mysqli->query("repair table mobil");
				if( !$mysqli->query($qry) ) {
					file_put_contents("./logs/gpspost.err","FAIL 2x: $qry \r\n<br/><br/>\r\n",FILE_APPEND);
				}
			}
		}
	}


			
//////////////////////////////////////
	if($sqry_mobil_alm ) {
		$sqry_mobil_alm = substr($sqry_mobil_alm,1);
	
		$mysqli->query("TRUNCATE TABLE tabel_mob_alm");
		$qry = "INSERT HIGH_PRIORITY IGNORE INTO tabel_mob_alm(`id`,old_alarm,old_onstate) VALUES $sqry_mobil_alm ";
		if( !$mysqli->query($qry) ) {
			file_put_contents("./logs/gpspost.err","FAIL: $qry \r\n<br/><br/>\r\n",FILE_APPEND);
		} else {
			$qry = "UPDATE IGNORE mobil m INNER JOIN tabel_mob_alm t ON m.id=t.id 
				SET m.old_alarm=t.old_alarm, m.old_onstate=t.old_onstate";
			if( $mysqli->query($qry) ) {
				// file_put_contents("./logs/gpsgood.txt","mob_alm\t\t". $mysqli->affected_rows ."\r\n<br/><br/>\r\n",FILE_APPEND);
			} else {
				$mysqli->query("repair table mobil");
				if( !$mysqli->query($qry) ) {
					file_put_contents("./logs/gpspost.err","FAIL 2x: $qry \r\n<br/><br/>\r\n",FILE_APPEND);
				}
			}
		}
	}
	
	//
	if($sqry_mobil_onl) {
		$sqry_mobil_onl = substr($sqry_mobil_onl,1);

		$mysqli->query("TRUNCATE TABLE tabel_mob_onl");
		$qry = "INSERT HIGH_PRIORITY IGNORE INTO tabel_mob_onl(`id`,gps_id,old_online,asal) VALUES $sqry_mobil_onl ";
		if( !$mysqli->query($qry) ) {
			file_put_contents("./logs/gpspost.err","FAIL: $qry \r\n<br/><br/>\r\n",FILE_APPEND);
		} else {
			$qry = "UPDATE IGNORE mobil m INNER JOIN tabel_mob_onl t ON m.id=t.id SET m.old_online=t.old_online";
			if( !$mysqli->query($qry) ) {
				$mysqli->query("repair table mobil");
				if( !$mysqli->query($qry) ) {
					file_put_contents("./logs/gpspost.err","FAIL 2x: $qry \r\n<br/><br/>\r\n",FILE_APPEND);
				}
			}
			$qry = "UPDATE IGNORE $tblpos2 p INNER JOIN tabel_mob_onl t ON p.gps_id=t.gps_id SET p.mobil_id=t.id, p.online=t.old_online, p.asal=t.asal";
			if( !$mysqli->query($qry) ) {
				file_put_contents("./logs/gpspost.err","FAIL: $qry \r\n<br/><br/>\r\n",FILE_APPEND);
			}
		}
	}

	
	if($sqry_smsrec) {
		$sqry_smsrec = substr($sqry_smsrec,1);
		$qry = "INSERT HIGH_PRIORITY IGNORE INTO sms_rec(`sms_to`,mobil_id,`msg`) VALUES $sqry_smsrec ";
		if( !$mysqli->query($qry) ) {
			$mysqli->query("repair table sms_rec");
			if( !$mysqli->query($qry) ) {
				file_put_contents("./logs/gpspost.err","FAIL 2x: $qry \r\n<br/><br/>\r\n",FILE_APPEND);
			}
		}
	}
	
	

	if($sqry_gps_idate) {
	
		
		//
		$sqry_gps_idate = substr($sqry_gps_idate,1);
		$qry = "UPDATE gps g INNER JOIN mobil m ON g.mobil_id IN ($sqry_gps_idate) AND g.mobil_id=m.id SET g.idate=m.old_idate";
		if( !$mysqli->query($qry) ) {
			file_put_contents("./logs/gpspost.err","FAIL 2x: $qry \r\n<br/><br/>\r\n",FILE_APPEND);
		}
	}
	
	// hapus temporary file 
	if(is_file('./logs/sqlwait.tmp')) unlink('./logs/sqlwait.tmp');
	
	// JIKA HARI BERGANTI //
	$loaddir="./tmp.pos/$strTgl2";
	if( $strTgl2!=$strTgl1 || !is_dir($loaddir) ) {
		if( !is_dir($loaddir) ) mkdir( $loaddir , 0777, true );
		// BY ADI, HAPUS DIREKTORI LAMA LINUX //
		$itahun = -1+(int)substr($strTgl2,0,4);
		// utk bulan sebelum juli, hapus 2 tahun yll //  
		if( substr($strTgl2,5,2)<'07' ) --$itahun;
		for($ii=0; $ii<4; $ii++) {
			//$pathdel = "rm -rf ./tmp.pos/$itahun*";
			//system($pathdel, $retval);
			delTree("./tmp.pos/$itahun");
			--$itahun;
		}
		if( !is_dir($loaddir="./tmp.pos/$strTgl1") ) mkdir( $loaddir , 0777, true );
		if( !is_dir($loaddir="./tmp.pos/$strTgl0") ) mkdir( $loaddir , 0777, true );
		if( !is_dir($loaddir="./tmp.pos/$strTgla") ) mkdir( $loaddir , 0777, true );
		if( !is_dir($loaddir="./tmp.pos/$strTglb") ) mkdir( $loaddir , 0777, true );
		
		// hapus tabel sms_ok
		// $itnow
		$xxtgl 	= $itnow%$SMS_DIV;				// baca sisa // $SMS_DIV
		$xxtgl	= ($itnow-$xxtgl)/$SMS_DIV ;	//
		--$xxtgl;
		$qry	= "DELETE FROM sms_ok WHERE xtgl<$xxtgl";
		if( !$mysqli->query($qry) ) {
			file_put_contents("./logs/gpspost.err","FAIL: $qry \r\n<br/><br/>\r\n",FILE_APPEND);
		}
		
		
	} else if( is_file('./logs/sqlwait.sql') &&  rename('./logs/sqlwait.sql','./logs/sqlwait.tmp') && ($sqltunda=file_get_contents('./logs/sqlwait.tmp')) ) {
	
/*	
		include './threads.php';
		$arrcomand = array();
*/
		$ii = $jj = 0;
		$ijumlah	= 10;
		$arrtunda	= explode('(<(*END*)>)',$sqltunda);
		$cnttunta	= count($arrtunda);
		for($ii=0; ($ii<$cnttunta && $ii<$ijumlah) ; $ii++) {
			$arrsql	= explode( '(<(*EOL*)>)', $arrtunda[$ii] );
			//$onecomand = '';
			$qrynew = $qryold = false;
			foreach ($arrsql as $qrynew) {
				if( strlen($qrynew=trim($qrynew))<=0 ) {
					continue;
				}
				// perintah old //
				if( strpos($qrynew,'REPAIR TABLE')===0 ) {
					if($qryold) {
						$arrrepair	= explode(';',$qrynew);
						foreach ($arrrepair as $txtrepair) {
							if( strlen($txtrepair=trim($txtrepair))>0 ) {
								$mysqli->query($txtrepair);
							}
						}
						if( !$mysqli->query($qryold) ) {
							file_put_contents('./logs/tunda.err',"FAIL qryold:  $qryold \r\n<br/><br/>\r\n",FILE_APPEND);
						}
						$qryold=false;
					}
					continue;
				}
				
				if( $mysqli->query($qrynew) ) {
					$qryold=false;
				} else {
					$qryold=$qrynew;
				}
				//++$jj;
				//$onecomand .= str_replace(array("\n","\r","\t"),' ', "$qrynew;" );
			}
			//if( strlen($onecomand)>0 ) {
			//	$arrcomand[] = "/usr/bin/mysql -u\"$dbuser\" -p\"$dbpass\" -D\"$dbname\" -e\"$onecomand select $jj as baris;\"";
			//}
		}
		// jika masih sisa, rekam kembali 
		if($ii<$cnttunta) {
			$arrtunda = array_slice($arrtunda,$ii);
			$sqltunda = implode('(<(*END*)>)',$arrtunda);
			file_put_contents('./logs/sqlwait.sql',$sqltunda . '(<(*END*)>)',FILE_APPEND);			
		}
		
/*
		$kk = count($arrcomand);
		if( $kk>0 ) {
			$threads = new Multithread( $arrcomand );
			$threads->run();
			//$sqltunda = "$strtcek ($kk) :<br/>\n";
			foreach ( $threads->commands as $key=>$command ) {
				$tr_out	= $threads->output[$key];
				$tr_err	= $threads->error[$key];
				if( strlen($tr_err)>0 ) {
					$tr_err	= "\n error: $tr_err<br/>";
				}
				//$sqltunda .= "command: $command<br/>\n output: $tr_out<br/>$tr_err<br/>\n\n";
			}
			// file_put_contents('./logs/sqlwait.cek',$sqltunda,FILE_APPEND);
		}
*/
		
	}
	
	
	foreach ($atouch2 as $value) {
		touch("./tmp.pos/$strTgl2/company_$value.txt");
	}
	foreach ($atouch1 as $value) {
		touch("./tmp.pos/$strTgl1/company_$value.txt");
	}
	foreach ($atouch0 as $value) {
		touch("./tmp.pos/$strTgl0/company_$value.txt");
	}
	foreach ($atoucha as $value) {
		touch("./tmp.pos/$strTgla/company_$value.txt");
	}
	foreach ($atouchb as $value) {
		touch("./tmp.pos/$strTglb/company_$value.txt");
	}
	echo "($nn)" . $mysqli->error;

	$itlast		= time();
	$strtcek	= date( "i:s", $itlast );
	$gpspostlog	.= ", $strtcek #$rowInsert ($bKritis) #" . ($itlast-$itnow);
	file_put_contents('./logs/gpspost.log', $gpspostlog, FILE_APPEND);

?>