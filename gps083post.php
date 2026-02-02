<?php
	
	// ALARM: BIT (0,1,2,3,4,5,6,?,8,?,10,11) 
	// => FUNCTION ( 0:SOS, 1:ALARM, 2:PINTU, 3:GPS-POWER, 4:LOW-BATTERY, 5:SLEEP-MODE
	// , 6:ENGINE-POWER, 7:geofence, 8:OLD-TGL, 9:bad-signal, 10:POSISI TERAKHIR, 11:NO-SIGNAL, 12: AC{pendingin, belum diaplikasikan} )


	if($smsused) {
	
		// SOS //
		if($v_alarm&1) {

			$mailto = trim( $v_mail_sos );
			$smsto  = trim( $v_sms_sos );
			if( $mailto || $smsto ) {
				$pesan = "tombol SOS diaktifkan";
				
				if($mailto){
					if( isset($mail7an["$mailto"]) )
						$mail7an["$mailto"] .= "$mail_eol$pesan"; 
					else 
						$mail7an["$mailto"] = "$pesan"; 
				}
				if($smsto){
					if( isset($sms7an["$smsto"]) )
						$sms7an["$smsto"] .= "$mail_eol$pesan"; 
					else 
						$sms7an["$smsto"] = "$pesan"; 
				}
					
			}
		}

		
		// ALARM //
		if( ($v_alarm&2) != ($v_old_alarm&2) ) {
			
			$mailto = trim( $v_mail_alarm );
			$smsto  = trim( $v_sms_alarm );
			if( $mailto || $smsto ) {
			
				$pesan = "alarm " . ( ($v_alarm&2) ? "ON"  : "OFF" );

				if($mailto){
					if( isset($mail7an["$mailto"]) )
						$mail7an["$mailto"] .= "$mail_eol$pesan"; 
					else 
						$mail7an["$mailto"] = "$pesan"; 
				}
				if($smsto){
					if( isset($sms7an["$smsto"]) )
						$sms7an["$smsto"] .= "$mail_eol$pesan"; 
					else 
						$sms7an["$smsto"] = "$pesan"; 
				}
					
			}
		}
		

		// PINTU //
		if( ($v_alarm&4) != ($v_old_alarm&4) ) {
			
			$mailto = trim( $v_mail_door );
			$smsto  = trim( $v_sms_door );
			if( $mailto || $smsto ) {
			
				$pesan = "Pintu " . ( ($v_alarm&4) ? "dibuka"  : "ditutup" );
				
				if($mailto){
					if( isset($mail7an["$mailto"]) )
						$mail7an["$mailto"] .= "$mail_eol$pesan"; 
					else 
						$mail7an["$mailto"] = "$pesan"; 
				}
				if($smsto){
					if( isset($sms7an["$smsto"]) )
						$sms7an["$smsto"] .= "$mail_eol$pesan"; 
					else 
						$sms7an["$smsto"] = "$pesan"; 
				}
					
			}
		}


		// GPS-POWER //
		if( ($v_alarm&8) != ($v_old_alarm&8) ) {
			
			$mailto = trim( $v_mail_gsmfail );
			$smsto  = trim( $v_sms_gsmfail );
			if( $mailto || $smsto ) {

				$pesan = "Aki " . ( ($v_alarm&8) ? "Terlepas"  : "Tersambung" );

				if($mailto){
					if( isset($mail7an["$mailto"]) )
						$mail7an["$mailto"] .= "$mail_eol$pesan"; 
					else 
						$mail7an["$mailto"] = "$pesan"; 
				}
				if($smsto){
					if( isset($sms7an["$smsto"]) )
						$sms7an["$smsto"] .= "$mail_eol$pesan"; 
					else 
						$sms7an["$smsto"] = "$pesan"; 
				}

					
			}
		}


		// KECEPATAN //
		if( ($ncek=round($v_speed/100)) > $v_speedy ) {
			
			$mailto = trim( $v_mail_speedy );
			$smsto  = trim( $v_sms_speedy );
			if( $mailto || $smsto ) {
			
				$pesan = "kecepatan $ncek Km/H melampaui batas($v_speedy Km/H)";
				
				if($mailto){
					if( isset($mail7an["$mailto"]) )
						$mail7an["$mailto"] .= "$mail_eol$pesan"; 
					else 
						$mail7an["$mailto"] = "$pesan"; 
				}
				if($smsto){
					if( isset($sms7an["$smsto"]) )
						$sms7an["$smsto"] .= "$mail_eol$pesan"; 
					else 
						$sms7an["$smsto"] = "$pesan"; 
				}
					
				//file_put_contents("./logs/speedy.txt"," $smsto: ($ncek=round($v_speed/100)) > $v_speedy: $pesan \r\n<br/><br/>\r\n",FILE_APPEND);
			}
		}
		
		
		
		// MESIN ON&FF //
		if( ($v_alarm&64) != ($v_old_alarm&64) ) {
			
			$mailto = trim( $v_mail_engine );
			$smsto  = trim( $v_sms_engine );
			if( $mailto || $smsto ) {
			
				$pesan = ($v_filtered>=0 ? 'Mesin' : 'Argo') . ( ($v_alarm&64) ? ' ON'  : ' OFF' );
				
				if($mailto){
					if( isset($mail7an["$mailto"]) )
						$mail7an["$mailto"] .= "$mail_eol$pesan"; 
					else 
						$mail7an["$mailto"] = "$pesan"; 
				}
				if($smsto){
					if( isset($sms7an["$smsto"]) )
						$sms7an["$smsto"] .= "$mail_eol$pesan"; 
					else 
						$sms7an["$smsto"] = "$pesan"; 
				}

			}
			
		}
		


		// GEOFENCE //
		if( ($v_alarm&128) != ($v_old_alarm&128) ) {
			
			$mailto = trim( $v_mail_geofence ); 
			$smsto  = trim( $v_sms_geofence ); 
			if( $mailto || $smsto ) {
			
				$pesan =  ( ($v_alarm&128) ? "Masuk"  : "Keluar" ) . " Wilayah(Geofence) ";
				
				if($mailto){
					if( isset($mail7an["$mailto"]) )
						$mail7an["$mailto"] .= "$mail_eol$pesan"; 
					else 
						$mail7an["$mailto"] = "$pesan"; 
				}
				if($smsto){
					if( isset($sms7an["$smsto"]) )
						$sms7an["$smsto"] .= "$mail_eol$pesan"; 
					else 
						$sms7an["$smsto"] = "$pesan"; 
				}

			}
			
		}
		
		
	}


?>