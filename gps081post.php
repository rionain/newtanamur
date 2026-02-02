<?php


	$_nerror	= 0;
	$mailFrom	= 'info.gps@gps.istana.web.id'; 
	$mailHead	= "From: $mailFrom\r\nReply-To: $mailFrom\r\n";
	

	function menit2kata($mm) {
		if($mm<60) return "$mm Menit";
		$menit	= $mm%60;
		$jj		= ($mm - $menit)/60;
		if($jj<24) return "$jj Jam, $menit Menit";
		$jam	= $jj%24;
		$hari	= ($jj - $jam)/24;
		return "$hari Hari, $jam Jam, $menit Menit";
	}

	function bacafile($fld) {
		$contents = false;
		if( !isset($_FILES[$fld]['tmp_name']) ) return $contents;
		if( $filename = $_FILES[$fld]['tmp_name'] ) {
			if( $fsend=fopen($filename,"r") ) {
				if(fseek($fsend,0,SEEK_END)==0) {
					$fsize  =  ftell($fsend);
					if($fsize>0) {
						rewind($fsend);
						// BUANG BACKSLASH
						$contents = stripslashes( fread($fsend, $fsize) );
					}
				}
				fclose($fsend);
			}
		} 
		return $contents;
	}
	
	function repair_rawdata(&$content) {
		$ii= $jj= $nn= $rr= 0;
		
		$arrdata = explode("\r\n", $content);
		$icount = count($arrdata)-1;
		if($icount<2) {
			return;
		}
		$baris = $arrdata[$icount];
		if( strpos($baris,'DATE_ADD') ) {
			$nn = 19;
			$rr = 2;
		} else {
			$nn = 18;
			$rr = 1;
		}
		$tanda = substr($baris,-3);
		if( substr_count($baris, ',')!=$nn || substr_count($baris, ')')!=$rr || $tanda !== ')  '  || substr($baris,0,2)!=="('" ) {
			unset( $arrdata[$icount] );
			//file_put_contents("./logs/gpspost.cek.txt","FAIL:  ($baris) \r\n<br/><br/>\r\n",FILE_APPEND);
		} else {
			$jj = substr_count($baris, "'");
			if($jj!=6) {
				if( $jj==5 && strpos($baris,"',INTERVAL")===false ) {
					$baris = str_replace(",INTERVAL","',INTERVAL",$baris);
					$jj = substr_count($baris, "'");
				}
				if($jj!=6) {
					unset( $arrdata[$icount] );
					//file_put_contents("./logs/gpspost.cek.txt","FAIL:  ($baris) \r\n<br/><br/>\r\n",FILE_APPEND);
				}
			}
		}
		for($ii=1; $ii<$icount; $ii++) {
			$baris = $arrdata[$ii];
			if( strpos($baris,'DATE_ADD') ) {
				$nn = 20;
				$rr = 2;
			} else {
				$nn = 19;
				$rr = 1;
			}
			$tanda = substr($baris,-4);
			if( substr_count($baris, ',')!=$nn || substr_count($baris, ')')!=$rr || $tanda !== ')  ,'  || substr($baris,0,2)!=="('" ) {
				unset( $arrdata[$ii] );
				//file_put_contents("./logs/gpspost.cek.txt","FAIL:  ($baris) \r\n<br/><br/>\r\n",FILE_APPEND);
			} else {
				$jj = substr_count($baris, "'");
				if($jj!=6) {
					if( $jj==5 && strpos($baris,"',INTERVAL")===false ) {
						$baris = str_replace(",INTERVAL","',INTERVAL",$baris);
						$jj = substr_count($baris, "'");
					}
					if($jj!=6) {
						unset( $arrdata[$ii] );
						//file_put_contents("./logs/gpspost.cek.txt","FAIL:  ($baris) \r\n<br/><br/>\r\n",FILE_APPEND);
					}
				}
			}
		}
		//$icount = count($arrdata)-1;
		//echo $icount;
		$content = implode("\r\n", $arrdata);
		$jj = strrpos($content,')');
		$content = substr($content,0,$jj+1);
	}

	function repair_receivertampung() {
		global $mysqli;
		$mysqli->query("repair table receivertampung");
		if( !$mysqli->query("select * from receivertampung") ) {
			$qry = "CREATE TABLE `receivertampung` (
			`gps_id` int(11) NOT NULL DEFAULT '0',
			`dtime` datetime NOT NULL DEFAULT '1980-01-01 00:00:00',
			`idate` mediumint(9) DEFAULT NULL,
			`latitude` decimal(8,5) NOT NULL DEFAULT '0.00000',
			`longitude` decimal(8,5) NOT NULL DEFAULT '0.00000',
			`speed` smallint(5) unsigned DEFAULT NULL,
			`kode` char(30) DEFAULT NULL,
			`ilat` int(9) unsigned NOT NULL DEFAULT '0',
			`ilon` int(9) unsigned NOT NULL DEFAULT '0',
			`alarm` smallint(5) unsigned DEFAULT NULL,
			`heading` tinyint(3) unsigned DEFAULT NULL,
			`variation` tinyint(3) DEFAULT NULL,
			`mobil_id` int(11) NOT NULL DEFAULT '-1',
			`sopir_id` int(11) DEFAULT NULL,
			`fuel` int(9) DEFAULT '-99',
			`fueltmp` int(11) DEFAULT NULL,
			`tengine` int(9) DEFAULT '-99',
			`tenvire` int(9) DEFAULT '0',
			`battery` int(9) DEFAULT '-99',
			`portid` smallint(6) DEFAULT NULL,
			`portok` smallint(6) DEFAULT NULL,
			`online` datetime DEFAULT NULL,
			`kelurahan_id` int(9) DEFAULT '0',
			`asal` char(1) NOT NULL DEFAULT 'z',
			`ilatlon` bigint(20) NOT NULL DEFAULT '0',
			`obdii` text,
			`tchange` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
			`xid` int(11) NOT NULL AUTO_INCREMENT,
			KEY `rp_dtime` (`dtime`),
			KEY `rp_mobil_id` (`mobil_id`),
			KEY `rp_kode` (`kode`),
			KEY `xid` (`xid`)
			)";			
			$mysqli->query("DROP table receivertampung");
			$mysqli->query($qry);
		}
	}
	
	function createtable_mypos_ymd($tblposx) {
		global $mysqli;
		// create here //			
		$qry	= "CREATE TABLE $tblposx (
			`gps_id` INT(11) DEFAULT '0',
			`mobil_id` INT(11) DEFAULT '0',
			`dtime` DATETIME,
			`gpsmet00` INT UNSIGNED DEFAULT '0',
			`gpsmeter` INT UNSIGNED DEFAULT '0',
			`odomet00` INT UNSIGNED DEFAULT '0',
			`odometer` INT UNSIGNED DEFAULT '0',
			`latitude` DECIMAL(8,5) DEFAULT '0.00000',
			`longitude` DECIMAL(8,5) DEFAULT '0.00000',
			`speed` SMALLINT(5) UNSIGNED DEFAULT '0',
			`ilat` INT(9) UNSIGNED DEFAULT '0',
			`ilon` INT(9) UNSIGNED DEFAULT '0',
			`alarm` SMALLINT(5) UNSIGNED DEFAULT '0',
			`heading` SMALLINT(5) UNSIGNED DEFAULT '0',
			`variation` TINYINT(3) DEFAULT '0',
			`sopir_id` INT(11) DEFAULT '0',
			`fuel` INT(5) UNSIGNED DEFAULT '0',
			`tengine` INT(5) UNSIGNED DEFAULT '0',
			`tenvire` INT(9) DEFAULT '0',
			`ilatlon` BIGINT(15) UNSIGNED NOT NULL DEFAULT '0',
			`portid` SMALLINT(5) UNSIGNED DEFAULT '0',
			`portok` SMALLINT(5) UNSIGNED DEFAULT '0',
			`online` DATETIME NULL,
			`kelurahan_id` int(9) DEFAULT '0',
			`nextid` INT(11) UNSIGNED NOT NULL DEFAULT '0',
			`asal` CHAR(1) NOT NULL DEFAULT 'z',
			`ket` CHAR(50) NOT NULL DEFAULT '',
			`obdii` text,
			tglstart datetime DEFAULT '3099-12-31',
			tglstop datetime DEFAULT '1970-01-01',
			skirim char(20) default NULL,
			sprovider char(5) default NULL,
			PRIMARY KEY (`gps_id`)
			, KEY `mobid` (`mobil_id`)
			, KEY `nextid` (`nextid`)
			, KEY `ilatlon` (`ilatlon`)
			, KEY tglstart (tglstart)
			, KEY tglstop (tglstop )
		)";
		
		
			
		if( $mysqli->query($qry) ) {
			$qry = "update list_table_pos set tbl='$tblposx' WHERE tbl<'$tblposx'";
			if( !$mysqli->query($qry) ) {
				file_put_contents("./logs/gpspost.err","FAIL:  $qry \r\n<br/><br/>\r\n",FILE_APPEND);
			}
		}
	}
	

	function sendBugs($subject, $body) {
		global $sendbugs;
		if($sendbugs) {
			file_put_contents("./logs/gpspost.err","$subject: $body\r\n\r\n",FILE_APPEND);
		}
	}
	
	// parameter $dir baiknya pakai suffix: '/'
	function delTree($dir) {
		$files = array_diff(scandir($dir), array('.','..'));
		foreach ($files as $file) {
			(is_dir("$dir/$file")) ? delTree2("$dir/$file") : unlink("$dir/$file");
		}
		return rmdir($dir);
	}

	function myErrorHandler($errno, $errstr, $errfile, $errline) {
		global $qry, $uniqid;
		$fatal = false;
		$msg = false;
	    switch ($errno) {
	    case E_USER_ERROR:
	    	$msg = "<b>My ERROR</b> [$errno] $errstr<br />\n"
	        	. "  Fatal error on line $errline in file $errfile"
	        	. ", PHP " . PHP_VERSION . " (" . PHP_OS . ")<br />\n"
	        	. "Aborting...<br />\n $qry";
	        $fatal = true;
	        break;

	    case E_USER_WARNING:
	        $msg = "<b>My WARNING</b> [$errno] $errstr<br />\n $qry";
	        break;

	    case E_USER_NOTICE:
	        $msg = "<b>My NOTICE</b> [$errno] $errstr<br />\n $qry";
	        break;

	    default:
	        $msg = "Unknown error type: [$errno] $errstr<br />\n $qry";
	        break;
    	}
		// sendBugs("error handle", $msg);
		file_put_contents("./logs/gpspost_myErrorHandler.txt","$msg \r\n<br/><br/>\r\n",FILE_APPEND);
		if($fatal) {
			file_put_contents('./logs/gpspost.err',"\r\n $uniqid FATAL",FILE_APPEND);
			exit(1);
		}
    	
    	/* Don't execute PHP internal error handler */
    	return true;
	}


	$rowInsert	= $webInsert = 0;
	$rawfile	= "./rawdata/rawdata.txt";
	$rawtemp	= "./rawdata/rawdata.tmp";
	$webfile	= "./rawdata/webdata.txt";
	$webtemp	= "./rawdata/webdata.tmp";
	if(is_file($rawtemp)) unlink($rawtemp);
	if(is_file($webtemp)) unlink($webtemp);
	if( is_file($rawtemp) || is_file($webtemp) ) {
		exit("nglawer00");
	}
	if( is_file($rawfile) ) {
		rename($rawfile,$rawtemp);
	}
	if( is_file($webfile) ) {
		rename($webfile,$webtemp);
	}

			
	set_error_handler("myErrorHandler");
	require("dbconnect4.php");
	
	if( is_file($rawtemp) ) {
		$qry=file_get_contents($rawtemp);
		repair_rawdata($qry);
		if( strpos($qry,'INSERT')===0 ) {
			if ($mysqli->multi_query($qry)) {
				do {
					$rowInsert += $mysqli->affected_rows;
				} while ($mysqli->more_results() && $mysqli->next_result());
			} else {
				// 
				$arsisi = explode( 'INSERT IGNORE INTO ', $qry );
				foreach ($arsisi as $qry) {
					if(strlen($qry)>9) {
						$qry = "INSERT IGNORE INTO {$qry}";
						$mysqli->query($qry);
					}
				}
			}
		} elseif ( strpos($qry,',')===0 ) {
			// INSERT IGNORE INTO `receivertampung`(kode,dtime,speed,latitude,longitude,ilat,ilon
			// ,alarm,heading,variation,fuel,tengine,tenvire,ilatlon,portid,kelurahan_id,obdii
			// ,asal,portok) VALUES 
			$qry = 'INSERT HIGH_PRIORITY IGNORE INTO receivertampung ' 
				. '(kode,dtime,speed,latitude,longitude,ilat,ilon,alarm,heading,variation'
				. ',fuel,tengine,tenvire,ilatlon,portid,kelurahan_id,obdii,asal,portok) VALUES '
				. substr($qry,1);
			if( $mysqli->query($qry) ) {
				$rowInsert=$mysqli->affected_rows;
			}
		}
		if($rowInsert<=0) {
			file_put_contents('./logs/gpspost.err',"\r\n gagal sisip: $qry",FILE_APPEND);
		}
	}
	
	if( is_file($webtemp) ) {
		$qry=file_get_contents($webtemp);
		repair_rawdata($qry);
		if( strpos($qry,'INSERT')===0 ) {
			if ($mysqli->multi_query($qry)) {
				do {
					$webInsert += $mysqli->affected_rows;
				} while ($mysqli->more_results() && $mysqli->next_result());
			} else {
				// 
				$arsisi = explode( 'INSERT IGNORE INTO ', $qry );
				foreach ($arsisi as $qry) {
					if(strlen($qry)>9) {
						$qry = "INSERT IGNORE INTO {$qry}";
						$mysqli->query($qry);
					}
				}
			}
		} elseif ( strpos($qry,',')===0 ) {
			// INSERT IGNORE INTO `receivertampung`(kode,dtime,speed,latitude,longitude,ilat,ilon
			// ,alarm,heading,variation,fuel,tengine,tenvire,ilatlon,portid,kelurahan_id,obdii
			// ,asal,portok) VALUES 
			$qry = 'INSERT HIGH_PRIORITY IGNORE INTO receivertampung ' 
				. '(kode,dtime,speed,latitude,longitude,ilat,ilon,alarm,heading,variation'
				. ',fuel,tengine,tenvire,ilatlon,portid,kelurahan_id,obdii,asal,portok) VALUES '
				. substr($qry,1);
			if( $mysqli->query($qry) ) {
				$webInsert=$mysqli->affected_rows;
			}
		}
		if($webInsert<=0) {
			file_put_contents('./logs/gpspost.err',"\r\n gagal sisip: $qry",FILE_APPEND);
		}
	}
	
	$rowInsert += $webInsert;
	if($rowInsert<=0) {
		repair_receivertampung();
		exit("nglawer02");
	}
		
			

	// SIAPKAN DATA BARU, LOW_PRIORITY //
	$mysqli->query("TRUNCATE TABLE receiverposition");
	
	// baca batas data yg akan diproses //
	$xidmax	= (($result=$mysqli->query("SELECT HIGH_PRIORITY max(xid) FROM receivertampung"))&&($row=$result->fetch_row())) ? $row[0] : -1;
	if( is_null($xidmax) ) {
		$xidmax = -1;
	}
	$qry = "INSERT LOW_PRIORITY IGNORE INTO receiverposition 
		SELECT r.* FROM receivertampung r 
		LEFT JOIN gps g ON r.kode=g.kode AND (g.abs_id=-1 OR g.abs_id=-3) 
		WHERE r.xid<=$xidmax AND g.id IS NULL";
	
	
		
	$rowInsert = -2;	
	if( $mysqli->query($qry) ) {
	
		if( ($rowInsert=$mysqli->affected_rows)==0 ) {
			$itlast		= time();
			$strtcek	= date( "i:s", $itlast );
			$gpspostlog	.= ", $strtcek #kosong (y) #" . ($itlast-$itnow);
			file_put_contents('./logs/gpspost.log', $gpspostlog, FILE_APPEND);
		} else {
		
			
			if(  $xidmax>=123456789 ) {
				$qry = 'TRUNCATE TABLE receivertampung';
			} ELSE {
				$qry = "DELETE FROM receivertampung where xid<=$xidmax";
			}
			if( !$mysqli->query($qry) ) {
				file_put_contents("./logs/gpspost.err","FAIL: $qry \r\n<br/><br/>\r\n",FILE_APPEND);
			}
			
		}
	}
	if(!$mysqli->query("INSERT HIGH_PRIORITY IGNORE INTO rp_log SELECT HIGH_PRIORITY * FROM receiverposition")) {
		//$mysqli->query("repair table rp_log");		
		//$mysqli->query("INSERT HIGH_PRIORITY IGNORE INTO rp_log SELECT HIGH_PRIORITY * FROM receiverposition");
	}
	// GAGAL //
	if( $rowInsert<=0 ) {
		file_put_contents('./logs/gpspost.err',"\r\n fail (rowInsert=$rowInsert) (uniqid=$uniqid): $qry",FILE_APPEND);
		exit("NONE\r\n");
	}

	// baca identity // 
	$nextAutoNum = -2;	
	if( $mysqli->query("INSERT INTO autonumber()  VALUES()") ) {
		$nextAutoNum = $mysqli->insert_id;
	}
	
	// SETEL tbltampung //
	$qry = "UPDATE receiverposition t 
		LEFT JOIN gps_zone z ON t.kode=z.kode 
		SET t.dtime = CASE 
			WHEN t.longitude=0 THEN IF( t.dtime>'2002-02-02', '2002-02-02', t.dtime) 
			WHEN (DATE_SUB(t.dtime,INTERVAL 29350 DAY)>NOW()) THEN (t.dtime - INTERVAL 29357 DAY)	
			WHEN (DATE_SUB(t.dtime,INTERVAL 7160 DAY)>NOW()) THEN (t.dtime - INTERVAL 7168 DAY)
			WHEN (DATEDIFF(NOW(), t.dtime) BETWEEN 7167 AND 7169) THEN (t.dtime + INTERVAL 7168 DAY)
			ELSE (t.dtime - INTERVAL IFNULL(z.iwaktu,0) HOUR) 
			END";
	if( !$mysqli->query($qry) ) {
		file_put_contents("./logs/gpspost.err","FAIL:  $qry \r\n<br/><br/>\r\n",FILE_APPEND);
	}
	
	// SETEL tbltampung LAGI, jangan digabung karena tgl hrs disetel dahulu //
	$qry = "UPDATE receiverposition SET fueltmp=fuel, idate=TO_DAYS(dtime)
		, online = DATE_ADD(UTC_TIMESTAMP,INTERVAL 7 HOUR)
		, alarm = alarm | CASE portid WHEN 1 THEN 2048+512 ELSE 0 END ";
	if( !$mysqli->query($qry) ) {
		file_put_contents("./logs/gpspost.err","FAIL:  $qry \r\n<br/><br/>\r\n",FILE_APPEND);
	}

// baru, by adi // 
/////////////////////////
	$qry		= "select HIGH_PRIORITY tbl from list_table_pos LIMIT 1";
	$tblpos1	= (($result=$mysqli->query($qry))&&($row=$result->fetch_row())) ? trim($row[0]) : ''; 
/////////////////////////	

	
	
	// $itblnlalu	= 2592000; // 30 hari // 60 * 60 * 24 * 30
	$itblnlalu	= 691200;  // 8 hari saja // 60 * 60 * 24 * 8
	$itmenit02	= 300; // toleransi 5 menit
	//  
	//$tblpos1	= "mypos_" . date("Y_m_d", $itnow);
	$tblpos2	= "mypos_" . date("Y_m_d", $itnow+$itmenit02); 
	$tblpos0	= "mypos_" . date("Y_m_d", $itnow-82800); // mundur 23 jam
	$tblposa	= "mypos_" . date("Y_m_d", $itnow-165600); // mundur 46 jam
	$tblposb	= "mypos_" . date("Y_m_d", $itnow-248400); // mundur 69 jam
	$tlower		= date("Y-m-d H:i:s", $itnow-$itblnlalu);
	$tupper		= date("Y-m-d H:i:s", $itnow+$itmenit02);
	$tjalan		= date("Y-m-d H:i:s", $itnow);
	$jam7salah	= date("Y-m-d H:i:s", $itnow+25200);
	//
	$strTgl2	= strtr(substr($tblpos2,6), '_', '-');
	$strTgl1	= strtr(substr($tblpos1,6), '_', '-');
	$strTgl0	= strtr(substr($tblpos0,6), '_', '-');
	$strTgla	= strtr(substr($tblposa,6), '_', '-');
	$strTglb	= strtr(substr($tblposb,6), '_', '-');
	//
	$itouch2 = $itouch1 = $itouch0 = $itoucha = $itouchb = 0;
	$atouch2 = $atouch1 = $atouch0 = $atoucha = $atouchb = array();

	$bikinTabelBaru = false; // CEK TABLE BARU
	if($tblpos2==$tblpos1) {
		// kurang dari pk 00:10:00
		$bKritis = (substr($tjalan,11) < '00:10:00') ? 3 : 0;
	} else {
		$bKritis = 2;
		if( !$mysqli->query("SHOW TABLES  LIKE '$tblpos2'") || !$mysqli->affected_rows ) {
			$bikinTabelBaru = true;
			createtable_mypos_ymd($tblpos2);
		} 
	}
	// BERI WAKTU TAMBAHAN //
	// if($bKritis>0) {set_time_limit(540);}
		
	
		
	// TABEL BARU PERLU DIISI //
	if( $bikinTabelBaru ) {
	
		$qry	= "INSERT HIGH_PRIORITY IGNORE INTO $tblpos2(
			`nextid`, `dtime`, gpsmet00, gpsmeter, odomet00, odometer, `gps_id`, mobil_id, `latitude`, `longitude`
			, `speed`,`ilat`,`ilon`,`alarm`,`heading`,`variation`,`sopir_id`
			, `fuel`,`tengine`,`tenvire`,`ilatlon`,`portid`,`online`,kelurahan_id,asal,ket,portok,tglstart,tglstop,skirim,sprovider)
			SELECT HIGH_PRIORITY nextid, dtime, gpsmeter, gpsmeter, odometer, odometer, gps_id, mobil_id, latitude, longitude
				, speed, ilat, ilon, alarm, heading, variation, sopir_id
				, fuel, tengine, tenvire, ilatlon, portid, online, kelurahan_id,asal,ket,portok,tglstart,tglstop,skirim,sprovider
			FROM $tblpos1";
		if( !$mysqli->query($qry) ) {
			$mysqli->query("repair table $tblpos1");
			if( !$mysqli->query($qry) ) {
				file_put_contents("./logs/gpspost.err","FAIL:  $qry \r\n<br/><br/>\r\n",FILE_APPEND);
			}
		}
		

		//$mysqli->query("DELETE FROM rp_log WHERE tchange<'$strTgla'");		
		$mysqli->query("TRUNCATE TABLE rp_log");
		$whreset = ($nextAutoNum%2);
	    switch ($whreset) {
	    case 0:
/* 		
			$tglbatas=$itnow-450*86400; // 450 hari yll //
			for( $ii=0; $ii<30; $ii++ ) {
				$tglbatas -= 86400;
				$qry	= 'DROP TABLE mypos_' . date("Y_m_d", $tglbatas); 
				$mysqli->query($qry);
			}
*/
			break;
	    default:
			// mobil yg lama gak dipakai //
			$sLikeIdate = '';
			//$iLikeIdate = 719163 + (int) (strtotime($tjalan)/86400);
			$iLikeIdate = 718433 + (int) (strtotime($tjalan)/86400);
			$qry	= "select HIGH_PRIORITY m.id, m.old_idate 
				from mobil m left join gps g on m.id=g.mobil_id
				where g.mobil_id is null and m.old_idate<$iLikeIdate
				order by m.old_idate LIMIT 30";
			if( $result=$mysqli->query($qry) ) {
				while( $row=$result->fetch_row() ) {
					$mobid	= $row[0];
					//
					$mysqli->query("DROP TABLE $DbRootGps.mobil_$mobid");
					$mysqli->query("DROP TABLE mobix_$mobid");
					$gpsdat_file_txt = GPSDAT_FILE.$mobid.'.txt';
					$gpsdat_file_rec = GPSDAT_FILE.$mobid.'.rec';
					if(is_file($gpsdat_file_txt)) unlink($gpsdat_file_txt);
					if(is_file($gpsdat_file_rec)) unlink($gpsdat_file_rec);
					
					$mysqli->query("DROP TABLE mobzz_$mobid");
					$mysqli->query("DROP TABLE mobwh_$mobid");
					$sLikeIdate .= ", $mobid";
				}
				if($sLikeIdate) {
					$qry = 'DELETE FROM mobil WHERE id IN (' . substr($sLikeIdate,1) . ')'; 
					if( !$mysqli->query($qry) ) {
						file_put_contents("./logs/gpspost.err","FAIL:  $qry \r\n<br/><br/>\r\n",FILE_APPEND);
					}
				}
			} else {
				file_put_contents("./logs/gpspost.err","FAIL:  $qry \r\n<br/><br/>\r\n",FILE_APPEND);
			}
    	}
	} else {
	
	
		// TIAP 120 DETIK, BACA SEMUA GPS //
		$qry	= "SELECT HIGH_PRIORITY IFNULL(MAX(UNIX_TIMESTAMP(tsend)),0), UNIX_TIMESTAMP('$tjalan'), COUNT(*) FROM mobil4sms";
		if( ($bKritis==0) && ($result=$mysqli->query($qry)) && ($row=$result->fetch_row()) ) {
			$smsused	= $row[2];
			if($smsused) {
				$smsonline	= $row[1];
				$smsontime	= ($smsonline>$row[0]);
				if($smsontime) {
					$qry = "UPDATE IGNORE mobil4sms SET tsend = DATE_ADD('$tjalan',INTERVAL 120 SECOND)";
					if($mysqli->query($qry)) {
						$bKritis = -1;
					} else {
						$smsontime = false;
						file_put_contents("./logs/gpspost.err","FAIL: $qry \r\n<br/><br/>\r\n",FILE_APPEND);
					}
				}
			}
		}
		
		
		// HAPUS DATA SEBELUMNYA //
		if($smsontime) {
			$fileaddr1	= './tmp.pos/address1.sql';
			$fileaddr2	= './tmp.pos/address2.sql';
			if( is_file($fileaddr1) ) {
				if( is_file($fileaddr2) ) unlink($fileaddr2);
				rename($fileaddr1,$fileaddr2);
				
				$mysqli->query("TRUNCATE TABLE $DbRootGps.addresstulis");
				$qry	= "INSERT HIGH_PRIORITY IGNORE INTO $DbRootGps.addresstulis(ilatlon,`txt`) values " . substr(file_get_contents($fileaddr2),1);
				if( $mysqli->query($qry) ) {
					$qry1	= "INSERT HIGH_PRIORITY IGNORE INTO addresstextbaca(`txt`) SELECT HIGH_PRIORITY DISTINCT `txt` FROM $DbRootGps.addresstulis"; 
					$qry2	= "INSERT HIGH_PRIORITY IGNORE INTO addressnumberbaca (ilatlon, address_id)
						SELECT HIGH_PRIORITY ats.ilatlon, atb.id FROM $DbRootGps.addresstulis ats
						INNER JOIN addresstextbaca atb ON ats.txt=atb.txt";
					if( (!$mysqli->query($qry1)) ||  (!$mysqli->query($qry2)) ) {
						file_put_contents("./logs/gpsaddrpost.err","FAIL:  $qry1 \r\n<br/>$qry2<br/>\r\n",FILE_APPEND);
					}
				} else {
					file_put_contents("./logs/gpsaddrpost.err","FAIL:  $qry<br/>\r\n",FILE_APPEND);
				}
			}
			
		} else {
			if( ($nextAutoNum%10)==0 ) {
				$mysqli->query("DELETE FROM autonumber WHERE id<$nextAutoNum");
			}
		}

	
	}
	
	// utk taxi "Eksekutif, company_id=27116", argo on jadi off, off jadi on //
	//	WHEN (g.swapfuel=32 OR g.company_id=27116) THEN (rp.alarm^64)
	///////////
	// UPDATE, gps_id, mobil_id, sopir_id, fuel & suhu
	// swapfuel: 32, sinyal PINTU utk AC {PENDINGIN}
	// swapfuel: 16, sinyal pintu DIBUANG, DATA SUHU & BB DIBUANG
	// swapfuel: 8, sinyal ALARM DIBUANG
	// swapfuel: 4, sinyal pintu DIBALIK (on jadi off, off jadi on)
	// swapfuel: 2, sinyal ALARM utk ACC-ON
	// swapfuel: 1024, sinyal ALARM utk AC {PENDINGIN}
	// swapfuel: 512, sinyal ALARM DIBALIK utk PINTU
	// swapfuel: 64, sinyal ALARM DIBALIK utk aki-lepas //
	// swapfuel: 128, sinyal PINTU DIBALIK utk aki-lepas //
	// swapfuel: 256, sinyal aki-lepas DIBUANG
	// swapfuel: 1, DATA suhu ditukar BB
	$qry = "UPDATE IGNORE receiverposition rp
		INNER JOIN gps g ON rp.kode=g.kode
		SET rp.gps_id=g.id, rp.mobil_id=g.mobil_id, rp.sopir_id=g.sopir_id
		, rp.fuel = CASE WHEN g.swapfuel&16 THEN 0 WHEN g.swapfuel&1 THEN rp.fuel ELSE rp.tengine END
		, rp.tengine = CASE WHEN g.swapfuel&16 THEN 0 WHEN g.swapfuel&1 THEN rp.tengine ELSE rp.fueltmp END
		, rp.alarm=CASE 
		WHEN (g.swapfuel=0) THEN rp.alarm WHEN (g.swapfuel=4) THEN (rp.alarm^4) 
		WHEN (g.swapfuel=8) THEN (rp.alarm&~2) WHEN (g.swapfuel=16) THEN (rp.alarm&~4) 
		WHEN (g.swapfuel=32) THEN  IF(rp.alarm&4,(-4+rp.alarm|4096),rp.alarm)
		WHEN (g.swapfuel=64) THEN  IF( rp.alarm&2, (rp.alarm&~2)&~8, rp.alarm|8 )
		WHEN (g.swapfuel=128) THEN  IF( rp.alarm&4, (rp.alarm&~4)&~8, rp.alarm|8 )
		WHEN (g.swapfuel=256) THEN (rp.alarm&~8) 
		WHEN (g.swapfuel=512) THEN  IF( rp.alarm&2, (rp.alarm&~2)&~4, rp.alarm|4 )
		WHEN (g.swapfuel=1024) THEN IF(rp.alarm&2,(-2+rp.alarm|4096),rp.alarm)
		ELSE IF( (g.swapfuel=2) && (rp.alarm&2), (-2+rp.alarm|64), rp.alarm ) END";
	if( !$mysqli->query($qry) ) {
		file_put_contents("./logs/gpspost.err","FAIL: $qry \r\n<br/><br/>\r\n",FILE_APPEND);
	}
	

	// CATAT FILE OBDII //
	$qry	= "select HIGH_PRIORITY mobil_id, obdii from receiverposition WHERE obdii IS NOT NULL ORDER BY 1";
	if( $result=$mysqli->query($qry) ) {
		$oldmobid = 0;
		$txtobdii = '';
		$fileobdii = '';
		while( $row=$result->fetch_row() ) {
			$newmobid	= $row[0];
			if( $oldmobid==$newmobid  ) {
				$txtobdii	.= $row[1];
			} else {
				if($txtobdii) {
					if( !is_dir('./tmp.obd') ) {
						mkdir( './tmp.obd' , 0777, true );
					}
					file_put_contents($fileobdii,$txtobdii,FILE_APPEND);
				}
				$txtobdii	= $row[1];
				$oldmobid	= $newmobid;
				$fileobdii	= "./tmp.obd/$oldmobid";
			}
		}
		if($txtobdii) {
			if( !is_dir('./tmp.obd') ) {
				mkdir( './tmp.obd' , 0777, true );
			}
			file_put_contents($fileobdii,$txtobdii,FILE_APPEND);
		}
	} else {
		file_put_contents("./logs/gpspost.err","FAIL:  $qry \r\n<br/><br/>\r\n",FILE_APPEND);
	}

	
	//,'VA'
	// SISIPKAN GPS YG BARU,: INGAT, portid HARUS LEBIH DARI NILAI 100
	// jika kuota habis, abs_id diisi dg MINUS portid, jika kuota ada, PLUS portid
	$qry = "INSERT HIGH_PRIORITY IGNORE INTO gps(kode,company_id,mobil_id,sopir_id,abs_id,styleid)
		SELECT HIGH_PRIORITY rp.kode,0,0,0
			, CASE WHEN LEFT(rp.kode,2) IN ('M3','DS','DX') THEN 0 
				WHEN IFNULL(a.kuota,9876)>a.kuotamin THEN rp.portid ELSE -rp.portid END
			, CASE WHEN LEFT(rp.kode,2) IN ('wh','TX') THEN -2 ELSE rp.tenvire END  
		FROM receiverposition rp
		INNER JOIN agen a ON rp.portid=a.portid AND ( rp.portid=8016 OR rp.portid=8024 OR IFNULL(a.kuota,9876)>a.kuotamin ) 
		WHERE rp.mobil_id<0 AND rp.longitude<>0 AND rp.longitude<=180 AND rp.longitude>=-180 
			AND rp.kode REGEXP '^[A-Za-z0-9.]+$' ";
			//AND ( rp.portok>8100 OR rp.portid=8020 OR rp.portid=8011 ) ";
	
	
	if( !$mysqli->query($qry) ) {
		// sendBugs("error: gps08post", "FAIL: $qry");
		file_put_contents("./logs/gpspost.err","FAIL: $qry \r\n<br/><br/>\r\n",FILE_APPEND);
	} else if($mysqli->affected_rows>0) {
		
		// by adi, sementara //
		//$qry = "UPDATE IGNORE gps g INNER JOIN gps x ON (x.abs_id<-99 OR x.abs_id>99) 
		//	AND x.kode LIKE 'VS%' AND g.kode LIKE 'VA%' AND right(g.kode,10)=right(x.kode,10)
		//	set g.kode=CONCAT('VX.',substring(x.kode,4))";
		//if( $mysqli->query($qry) && $mysqli->affected_rows>0 ) {
		//	$qry = "UPDATE IGNORE gps SET abs_id=-6 WHERE (abs_id<-99 OR abs_id>99) AND kode LIKE 'VS%'";
		//	$mysqli->query($qry);
		//}
			
		
	
		// KURANGI KUOTA AGEN // 
		$qry = "UPDATE IGNORE agen a
			INNER JOIN ( SELECT ABS(abs_id) AS abs_id, COUNT(*) as ibaru FROM gps 
			WHERE (abs_id<-99 OR abs_id>99) GROUP BY 1 ) AS g ON a.portid=g.abs_id
			SET a.kuota = a.kuota-g.ibaru";
		if( $mysqli->query($qry) ) {

			// SMS //
			$qry = "SELECT HIGH_PRIORITY ABS(g.abs_id)%100 AS xport
			, concat(left(g.kode,2),'~',substring(g.kode,-5)) as gkode
			, a.kuota, a.kuotamin+2 as kuotamin 
			FROM gps g
			INNER JOIN (SELECT DISTINCT kode, portid FROM receiverposition ) AS rp ON g.kode = rp.kode
			INNER JOIN agen a ON rp.portid=a.portid
			WHERE g.abs_id<-99 OR g.abs_id>99 ORDER BY 1";
			if( $result=$mysqli->query($qry) ) {
				//$hp='sms81515894717';
				$hp='sms8569816651';
				$sms=$smsagen=$smsyudy=$smsdede=$smsaji=$smsdeny=$smsbrian=$smsfirman=$sms0000='';
				$row0old = $row0new = 0;
				while( $row=$result->fetch_row() ) {
					$row0new = $row[0];
					if($row0old != $row0new) {
						$row0old = $row0new;
						$sms .= "\n$row0new($row[2])";
						switch($row0new) {
						case 12:
							$smsdeny = "GPS baru:";
							$smsagen = & $smsdeny;
							break;
						case 14:
							$smsyudy = "GPS baru:";
							$smsagen = & $smsyudy;
							break;
							//0818821849
						case 16:
							$smsaji = "GPS baru:";
							$smsagen = & $smsaji;
							break;
						case 17:
							$smsdede = "GPS baru:";
							$smsagen = & $smsdede;
							break;
						case 18:
							$smsbrian = "GPS baru:";
							$smsagen = & $smsbrian;
							break;
						case 24:
							$smsfirman = "GPS baru:";
							$smsagen = & $smsfirman;
							break;
						default:
							$smsagen = & $sms0000;
						}
						if( $row0new<>16 && $smsagen && ($row[3]>=$row[2]) ) {
							$smsagen = 'MOHON DIISI, SISA KUOTA='.$row[2] . "\n$smsagen";
						}
					}
					$sms .= "\n$row[1]";
					if($smsagen) $smsagen .= "\n$row[1]";
				}
				if($sms) {
					$sms = $mysqli->real_escape_string("$strtcek$sms");
					$qry = "INSERT HIGH_PRIORITY INTO sms_rec(`sms_to`,nomer,`msg`) VALUES";
					$mysqli->query("$qry('$hp',$nextAutoNum,'$sms')");
					

					if($smsyudy) {
						$smsyudy = $mysqli->real_escape_string($smsyudy);
						$mysqli->query("$qry('sms85694948556',$nextAutoNum,'$smsyudy')");
						$mysqli->query("$qry('sms8111772143',$nextAutoNum,'$smsyudy')");
					}
					//
					if($smsaji) {
						$smsaji = $mysqli->real_escape_string($smsaji);
						$mysqli->query("$qry('sms82366669044',$nextAutoNum,'$smsaji')");
					}
					
					if($smsdede) {
						$smsdede = $mysqli->real_escape_string($smsdede);
						$mysqli->query("$qry('sms87808257173',$nextAutoNum,'$smsdede')");
						$mysqli->query("$qry('sms8158843599',$nextAutoNum,'$smsdede')");
					}
					if($smsdeny) {
						$smsdeny = $mysqli->real_escape_string($smsdeny);
						$mysqli->query("$qry('sms816997798',$nextAutoNum,'$smsdeny')");
						$mysqli->query("$qry('sms8998287777',$nextAutoNum,'$smsdeny')");
					}
					if($smsbrian) {
						$smsbrian = $mysqli->real_escape_string($smsbrian);
						$mysqli->query("$qry('sms8161189639',$nextAutoNum,'$smsbrian')");
					}
					if($smsfirman) {
						$smsfirman = $mysqli->real_escape_string($smsfirman);
						$mysqli->query("$qry('sms81555747464',$nextAutoNum,'$smsfirman')");
					}
					
						
					
				}
			}
			// abs_id harus disetel lagi //
			$qry = "UPDATE gps SET abs_id=CASE WHEN abs_id>99 THEN 0 ELSE -6 END WHERE abs_id<-99 OR abs_id>99";
			if( !$mysqli->query($qry) ) {
				file_put_contents("./logs/gpspost.err","FAIL: $qry \r\n<br/><br/>\r\n",FILE_APPEND);
			}
			
		} else {
			file_put_contents("./logs/gpspost.err","FAIL: $qry \r\n<br/><br/>\r\n",FILE_APPEND);
		}

		// catat yg BARU, simple, ALARM=512=bad, TANPA FUEL //
		$qry = "INSERT HIGH_PRIORITY IGNORE INTO $tblpos2
			( nextid, gps_id, mobil_id, dtime
			, speed,latitude,longitude,ilat,ilon
			, heading, variation, alarm
			, tenvire,ilatlon,portid,online,kelurahan_id,asal,portok)
			SELECT HIGH_PRIORITY $nextAutoNum, g.id, g.mobil_id, CASE WHEN t.dtime<='$tupper' THEN t.dtime ELSE '2000-01-01' END
			, t.speed, t.latitude, t.longitude, t.ilat, t.ilon
			, t.heading, t.variation, 512
			, t.tenvire, t.ilatlon, t.portid, t.online, t.kelurahan_id, t.asal, t.portok
			FROM receiverposition t
			INNER JOIN gps g ON t.mobil_id<0 AND t.kode=g.kode  
			WHERE t.mobil_id<0 AND t.portid>=2 AND t.longitude<>0 AND t.longitude<=180 AND t.longitude>=-180 ";
			
		if( !$mysqli->query($qry) ) {
			$mysqli->query("repair table $tblpos2");
			if( !$mysqli->query($qry) ) {
				file_put_contents("./logs/gpspost.err","FAIL 2x: $qry \r\n<br/><br/>\r\n",FILE_APPEND);
			}
		}
	}
	
	
			
	// HAPUS DATA KEMBAR, AGAR SIMPLE !! (CEK) //
	$qry = "DELETE rp
		FROM receiverposition rp
		LEFT JOIN (SELECT mobil_id, MAX(dtime) AS dtime FROM receiverposition WHERE mobil_id>0 GROUP BY 1) AS rpm
			ON rp.mobil_id=rpm.mobil_id AND rp.dtime=rpm.dtime
		WHERE rpm.mobil_id IS NULL";
	if( !$mysqli->query($qry) ) {
		file_put_contents("./logs/gpspost.err","FAIL: $qry \r\n<br/><br/>\r\n",FILE_APPEND);
	}	


?>