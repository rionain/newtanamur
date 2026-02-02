<?php
function exitOK($msg = "", $ispace = 0)
{
	ob_start();
	echo $msg;
	if ($ispace > 0) {
		echo str_repeat(" ", $ispace);
	}
	header('Content-Length: ' . ob_get_length());
	ob_end_flush();
	exit;
}

function makepath($path, $file = 0)
{
	if ($file)
		touch($path);
	else
		mkdir($path, 0777);
	chmod($path, 0777);
}

function jsonret($obj, $callback)
{
	return "$callback(" . json_encode($obj) . ");";
}

function atox($key, $str)
{
	$s = array();
	for ($i = 0; $i < 256; $i++) {
		$s[$i] = $i;
	}
	$j = 0;
	for ($i = 0; $i < 256; $i++) {
		$j = ($j + $s[$i] + ord($key[$i % strlen($key)])) % 256;
		$x = $s[$i];
		$s[$i] = $s[$j];
		$s[$j] = $x;
	}
	$i = 0;
	$j = 0;
	$res = '';
	for ($y = 0; $y < strlen($str); $y++) {
		$i = ($i + 1) % 256;
		$j = ($j + $s[$i]) % 256;
		$x = $s[$i];
		$s[$i] = $s[$j];
		$s[$j] = $x;
		$res .= $str[$y] ^ chr($s[($s[$i] + $s[$j]) % 256]);
	}
	return $res;
}

function hexEncode($str)
{
	$ret = '';
	$i = 0;
	$max = strlen($str);
	$arr = str_split($str);
	while ($i < $max) {
		$c = ord($arr[$i++]);
		$h = dechex($c ^ ($i * 634 + $max));
		$ret .= substr($h, -2);
	}
	//$len = 1000000 + $max;
	//return "$len$ret";
	$smax = '' . $max;
	return '_0' . strlen($smax) . $smax . $ret;
}

function hexDecode($str)
{
	$ret = '';
	if (($ipos = strpos($str, '_0')) === false)
		return $ret;
	$ilen = (int) substr($str, ($ipos += 2), 1);
	$m = (int) substr($str, ++$ipos, $ilen);
	if ($m < 1)
		return $ret;
	$max = 2 * $m;
	$ipos += $ilen;
	$str = substr($str, $ipos, $max);
	if (strlen($str) != $max)
		return $ret;

	$i = 0;
	//$ilen	= ((int)substr($str,0,7)) % 1000000;
	//$str	= substr($str,7);
	//if( strlen($str)<2  ) return $ret;
	$arr = str_split($str, 2);
	//if($max!=$ilen) return $ret;
	while ($i < $m) {
		$c = hexdec($arr[$i++]);
		$h = 255 & ($c ^ ($i * 634 + $m));
		$ret .= chr($h);
	}
	return $ret;
}

///////////////////

function binEncode($str)
{
	$aKeyKode = array(5, 117, 19, 2, 203, 7, 29);
	$ret = '';
	$i = 0;
	$arr = str_split($str);
	$max = strlen($str);
	while ($i < $max) {
		$c = ord($arr[$i++]);
		if ($c >= 33 && $c <= 126) {
			$c = 33 + (($c + 500 + $max + $i + $aKeyKode[$i % 7]) % 94);
		}
		$ret .= chr($c);
	}
	//$len = 1000000 + $max;
	//return "$len$ret";
	$smax = '' . $max;
	return '_0' . strlen($smax) . $smax . $ret;
}

function binDecode($str)
{

	if (($ipos = strpos($str, '_0')) === false)
		return null;
	$ilen = (int) substr($str, ($ipos += 2), 1);
	$max = (int) substr($str, ++$ipos, $ilen);
	if ($max < 1)
		return '';
	$ipos += $ilen;
	$str = substr($str, $ipos, $max);
	if (strlen($str) != $max)
		return null;

	$aKeyKode = array(5, 117, 19, 2, 203, 7, 29);
	$ret = '';
	$i = 0;
	//$ilen	= ((int)substr($str,0,7)) % 1000000;
	//$str	= substr($str,7);
	$arr = str_split($str);
	//$max=count($arr);
	//if($max!=$ilen) return null;
	$ganjal = 9400000;
	while ($i < $max) {
		$c = ord($arr[$i++]);
		if ($c >= 33 && $c <= 126) {
			$c = ($ganjal + $c - 533 - $max - $i - $aKeyKode[$i % 7]) % 94;
			if ($c < 33)
				$c += 94;
		}
		$ret .= chr($c);
	}
	return $ret;
}


function getSqlFilter($req)
{
	$filtercode = isset($req['fc']) ? $req['fc'] : "";
	$filterArry = strlen($filtercode) < 4 ? array() : explode("<[~]>", $filtercode);
	$filterSize = count($filterArry);
	$filterExpr = "";
	for ($i = 0; $i < $filterSize; $i++) {
		$kata = trim($filterArry[$i]);
		if ($kata == "")
			continue;
		switch ($i) {
			case 0:
				$filterExpr .= " AND g2.info_markt LIKE '%$kata%'";
				break;
			case 1:
				$filterExpr .= " AND g2.info_sales LIKE '%$kata%'";
				break;
			case 2:
				$filterExpr .= " AND g2.info_custm LIKE '%$kata%'";
				break;
			case 3:
				$filterExpr .= " AND g2.info_showr LIKE '%$kata%'";
				break;
			case 4:
				$filterExpr .= " AND g2.info_merek LIKE '%$kata%'";
				break;
			case 5:
				$filterExpr .= " AND g2.info_tipes LIKE '%$kata%'";
				break;
			case 6:
				$filterExpr .= " AND g2.mobkode LIKE '%$kata%'";
				break;
		}
	}
	return $filterExpr;
}


function post_request($url, $data, $referer = '')
{

	// Convert the data array into URL Parameters like a=b&foo=bar etc.
	$data = http_build_query($data);

	// parse the given URL
	$url = parse_url($url);

	if ($url['scheme'] != 'http') {
		// die('Error: Only HTTP request are supported !');
		return array(
			'status' => 'err',
			'error' => "Only HTTP request are supported"
		);
	}

	// extract host and path:
	$host = $url['host'];
	$path = $url['path'];

	// open a socket connection on port 80 - timeout: 60 sec
	$fp = fsockopen($host, 80, $errno, $errstr, 30);

	if (!$fp) {
		return array(
			'status' => 'err',
			'error' => "$errstr ($errno)"
		);
	}

	/*
		// send the request headers:
		fputs($fp, "POST $path HTTP/1.1\r\n");
		fputs($fp, "Host: $host\r\n");

		if ($referer != '')
			fputs($fp, "Referer: $referer\r\n");

		fputs($fp, "Content-type: application/x-www-form-urlencoded\r\n");
		fputs($fp, "Content-length: ". strlen($data) ."\r\n");
		fputs($fp, "Connection: close\r\n\r\n");
		fputs($fp, $data);

		$result = ''; 
		while(!feof($fp)) {
			$result .= fgets($fp, 128);
		}
	*/

	$out = "POST $path HTTP/1.1\r\n";
	$out .= "Host: $host\r\n";
	if ($referer != '')
		$out .= "Referer: $referer\r\n";
	$out .= "User-Agent: " . $_SERVER['HTTP_USER_AGENT'] . "\r\n";
	$out .= "Content-Type: application/x-www-form-urlencoded\r\n";
	$out .= "Content-length: " . strlen($data) . "\r\n";
	$out .= "Connection: close\r\n\r\n";
	$out .= $data . "\r\n\r\n";
	fwrite($fp, $out);

	//file_put_contents('test.data.txt',$out);
	//sleep(1);
	$result = '';
	//while ($line = fgets($fp)) $result .= $line;
	//while(!feof($fp)) $result .= fgets($fp, 128);
	while (!feof($fp))
		$result .= fgets($fp, 1024);

	// close the socket connection:
	fclose($fp);
	/*	
	 */
	// split the result header from the content
	$aresult = explode("\r\n\r\n", $result, 2);
	if (count($aresult) > 1) {
		return array(
			'status' => 'ok',
			'header' => $aresult[0],
			'content' => $aresult[1]
		);
	} else {
		return array(
			'status' => 'ok',
			'header' => '(HEADER)',
			'content' => $result
		);
	}

	//$header = isset($result[0]) ?  : '';
	//$content = isset($result[1]) ? $result[1] : '';

	// return as structured array:
}


require_once("imgpath.php");
require_once("config_views.php");

// echo '['.hexDecode(hexEncode('isa,mulia')) . ']';
//echo '['.binEncode('') . ']';
//echo '['.binDecode(binEncode('')) . ']';
//echo '['.binDecode(binEncode('01234567890234')) . ']';
// echo '['.hexDecode('_0232e136fa66e39113d250c639bd3d9334a55bd00c8400ff7ff428becc4bc255d41d') . ']';

