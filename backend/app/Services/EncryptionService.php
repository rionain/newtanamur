<?php

namespace App\Services;

class EncryptionService
{
    private array $binKey = [5, 117, 19, 2, 203, 7, 29];

    /**
     * Legacy Hex Encryption (from global.php)
     * Used for stateless payload obfuscation.
     */
    public function hexEncode(string $str): string
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
        $smax = (string)$max;
        return '_0' . strlen($smax) . $smax . $ret;
    }

    public function hexDecode(string $str): string
    {
        $ret = '';
        if (($ipos = strpos($str, '_0')) === false) return $ret;
        $ilen = (int)substr($str, ($ipos += 2), 1);
        $m = (int)substr($str, ++$ipos, $ilen);
        if ($m < 1) return $ret;
        $max = 2 * $m;
        $ipos += $ilen;
        $str = substr($str, $ipos, $max);
        if (strlen($str) != $max) return $ret;

        $i = 0;
        $arr = str_split($str, 2);
        while ($i < $m) {
            $c = hexdec($arr[$i++]);
            $h = 255 & ($c ^ ($i * 634 + $m));
            $ret .= chr($h);
        }
        return $ret;
    }

    /**
     * Legacy Binary Encoding (from global.php)
     * Achieves "Hemat Bandwidth" by compressing data pulses.
     */
    public function binEncode(string $str): string
    {
        $ret = '';
        $i = 0;
        $arr = str_split($str);
        $max = strlen($str);
        while ($i < $max) {
            $c = ord($arr[$i++]);
            if ($c >= 33 && $c <= 126) {
                $c = 33 + (($c + 500 + $max + $i + $this->binKey[$i % 7]) % 94);
            }
            $ret .= chr($c);
        }
        $smax = (string)$max;
        return '_0' . strlen($smax) . $smax . $ret;
    }

    public function binDecode(string $str): ?string
    {
        if (($ipos = strpos($str, '_0')) === false) return null;
        $ilen = (int)substr($str, ($ipos += 2), 1);
        $max = (int)substr($str, ++$ipos, $ilen);
        if ($max < 1) return '';
        $ipos += $ilen;
        $str = substr($str, $ipos, $max);
        if (strlen($str) != $max) return null;

        $ret = '';
        $i = 0;
        $arr = str_split($str);
        $ganjal = 9400000;
        while ($i < $max) {
            $c = ord($arr[$i++]);
            if ($c >= 33 && $c <= 126) {
                $c = ($ganjal + $c - 533 - $max - $i - $this->binKey[$i % 7]) % 94;
                if ($c < 33) $c += 94;
            }
            $ret .= chr($c);
        }
        return $ret;
    }
}
