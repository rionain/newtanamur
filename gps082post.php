<?php
		// catat alarm //
		$alarm = $v_alarm;

		
		// mobil baru //
		if($v_old_idate==0 && $v_portid>=2) {

			// CREATE TABEL mobil_nnn // 
			createtable_mobil_nnn( $v_id );
		
		} else if($smsontime ) {
		// cek sms jika perlu // 

		
			// TIDAK KIRIM DATA //
			if($v_portid<0) {
				
				// GSM BELUM DICATAT GAGAL //
				if(($v_old_alarm&16384)==0) {
				
					$mailto = trim($v_mail_gsmfail);
					$smsto  = trim($v_sms_gsmfail);
					if( $mailto || $smsto ) {
						
						$jeda = floor(($smsonline-$v_last_online)/60);
						if( $jeda > $v_minute_gsmfail ) {
						
							$alarm	= $v_old_alarm | (16384+8192);
							$jeda	= menit2kata($jeda);
							$pesan	= "GSM tidak kirim data selama: $jeda";
							$msgyes	= true;
							
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
				
			// KIRIM SINYAL, PULIHKAN //
			} else if($v_old_alarm&16384) {
				
				$mailto = trim($v_mail_gsmfail);
				$smsto  = trim($v_sms_gsmfail);
				
				if( $mailto || $smsto ) {
				
					// BERITAHU, SINYAL SUDAH DAPAT //
					if( $v_portid<2 ) {
						$alarm	 	= $v_old_alarm-16384; // PULIHKAN ALARM //
						$pesan	= "GSM kirim sinyal, tetapi data GPS masih kosong $mail_eol(mungkin sinyal satelit terhalang)";
					} else {
						$pesan	= "GSM sudah berhasil kirim data lagi";
					} 
					$msgyes	= true;
					
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
				
			// KIRIM SINYAL KOSONG //
			} else if($v_portid<2) {
				

				// GPS BELUM DICATAT KOSONG //
				if(($v_old_alarm&8192)==0) {
				
					$mailto = trim($v_mail_gpsfail);
					$smsto  = trim($v_sms_gpsfail);
					if( $mailto || $smsto ) {
					
						$jeda = floor(($smsonline-$v_last_valid)/60);
						if( $jeda > $v_minute_gpsfail ) {
							$alarm		= $v_old_alarm | 8192;
							$jeda		= menit2kata($jeda);
							$pesan		= "GSM kirim sinyal, tetapi data GPS kosong $mail_eol(mungkin sinyal satelit terhalang)";
							$msgyes	= true;
							
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
				
			// RECOVERY //
			} else if($v_old_alarm&8192) {
				
				$mailto = trim($v_mail_gpsfail);
				$smsto  = trim($v_sms_gpsfail);
				if( $mailto || $smsto ) {
				
					// BERITAHU, SINYAL SUDAH DAPAT //
					$pesan = "GSM sudah berhasil kirim data lagi,";
					$msgyes	= true;
					
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