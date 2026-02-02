<?php
	

	require("global.php");
	$callback	= $_REQUEST['callback'];

	// baca tgl //
	$itnow		= time();
	$snow		= date("Y-m-d H:i:s", $itnow);
	$aret		= array($snow);
	
	if( !isset($_REQUEST['req']) ) exit(jsonret($aret,$callback));
	$req = json_decode( hexDecode( $_REQUEST['req'] ) , true);
	
	if( !isset($req['cid']) ) exit(jsonret($aret,$callback));
	$companyid	= (int) $req['cid'];
	
	// baca identitas terakhir //
	$fmtold		= isset($req['fmt']) ?  (int)$req['fmt'] : -1;
	if($fmtold>=0) {
		$fmtnew = 0;
		$loaddir	= "./tmp.pos/" . substr($snow,0,10);
		$loadfile	= "$loaddir/company_$companyid.txt";
		if( is_file($loadfile) ) {
			$fmtnew = filemtime($loadfile);
			if( $fmtold>0 && $fmtold==$fmtnew) {
				exit(jsonret($aret,$callback));
			}
		} else {
			if( !is_dir($loaddir) ) mkdir( $loaddir , 0777, true );
			touch($loadfile,7654321);
		}
		$aret = array(array($snow,$fmtnew));
	}
	
	
	//$local		= ($req['W']=="localhost");
	//$access		= $req['ac'];
	//$akses		= $access=="~" ? false : split("#", $access);
	require("dbconnect4.php");
	
////////////////////////////////////////////////////////////////////////////
	$fmitsui	= 0;
	$access		= "~";
	$join2		= "";
	$where3		= "";
	$username	= isset($req['u']) ? $req['u'] : "" ;
	$userid		= isset($req['uid']) ? (int)$req['uid'] : -1 ;
	
	if($userid>0) {
		$fileUsrAccess	= "./access/userid/$userid.txt";
		if(file_exists($fileUsrAccess)) {
			$access		= file_get_contents($fileUsrAccess);
			$row		= explode("\t", $access);
			$fmitsui	= (int)$row[0];
			$access		= $row[1];
		} else {
			$userid = -2;
		}
	}
	
	if( $userid<0 && $username ) {
	
		$cek1 = " SELECT u.accesscode, c.filtered, u.id
			FROM usr u
			INNER JOIN company c ON u.company_id = c.id
			WHERE u.company_id=$companyid AND u.nama='$username'";

		if( ($result=$mysqli->query($cek1)) && ($row=$result->fetch_row()) ) {
			$access		= trim($row[0]);
			$fmitsui	= $row[1];
			$userid		= $row[2];
			$fileUsrAccess	= "./access/userid/$userid.txt";
			if( $access!="~" ) {
				$access	= str_replace( "#", ",", substr($access,1) );
			}
			file_put_contents($fileUsrAccess,"$fmitsui\t$access");
		}
	}
	if( $access!="~" ) {
		if($fmitsui) {
			$join2	= "and g2.info_markt = '$username'";
		} else {
			if($access) 
				$where3 = " AND g2.mobil_id IN ($access)";
			else
				$where3 = " AND 0 ";
		}
	}
	$filterExpr = getSqlFilter($req);
	
	
	// HEADER //  
	//header('Content-Description: File Transfer');
	header("Content-type: application/javascript");

	
	$mytbl1	= "mypos_" . date("Y_m_d", $itnow);
	$expr = "SELECT m.kode AS mobkode, p.dtime
		, p.latitude AS lat, p.longitude AS lon
		, p.speed
		, p.nextid, p.alarm
		, IFNULL(adt.txt,'') as alamat
		, m.id as mid, m.color, m.jenis
		, p.fuel, p.tengine
		, IF(DATE_ADD(p.dtime,INTERVAL 5 MINUTE)>p.online,p.dtime,p.online) AS d2time
		, IF( g2.styleid<0, g2.styleid, p.tenvire ) as gjenis
		, g2.info_markt, g2.info_sales, g2.info_custm, g2.info_showr, g2.info_merek, g2.info_tipes
		, p.ket
		, IFNULL(an.address_id,0) as naddr
		, p.obdii
		FROM $mytbl1 p
			inner join gps g2 on g2.company_id=$companyid AND p.gps_id=g2.id AND (g2.abs_id>=-1 OR g2.abs_id=-3) 
			$where3 $join2 $filterExpr  
			inner join mobil m on m.company_id=$companyid AND p.mobil_id=m.id   
			LEFT JOIN addressnumberbaca an ON p.ilatlon = an.ilatlon
			LEFT JOIN addresstextbaca adt ON an.address_id=adt.id
			ORDER BY 2 DESC";
		//	LEFT JOIN addressnumberbaca an ON 100000000000*(180+ROUND(p.longitude,$LLDEC)) + 10000*(90+ROUND(p.latitude,$LLDEC)) = an.ilatlon

	$failQuery = true;
	if( ($result=$mysqli->query($expr)) ) {
		$failQuery = false;
	} else {
		$cek2 = "SELECT tbl FROM list_table_pos";
		if( ($result=$mysqli->query($cek2)) && ($row=$result->fetch_row()) ) {
			$mytbl2 = trim($row[0]);
			$expr = str_replace($mytbl1, $mytbl2, $expr);			
			if( ($result=$mysqli->query($expr)) ) {
				$failQuery = false;
			} else {
				file_put_contents("../tracker.main/logs/gpspost.err","FAIL:  $expr \r\n<br/><br/>\r\n",FILE_APPEND);				
			}
		}
	}
	if($failQuery) {
		$aret[0] = "error baca tabel";
		exit(jsonret($aret,$callback));
	}		
	
	if( ($ncount=$result->num_rows)<=0 ) {
		$aret[0] = "data kosong";
		exit(jsonret($aret,$callback));
	}
	while ($row = $result->fetch_row())
		$aret[] = $row;
	
	$result->close();
	exit(jsonret($aret,$callback));
