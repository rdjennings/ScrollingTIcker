<?php
$symbols = str_replace(" ","+", $_GET["symbols"]);
$file_handle = fopen("http://finance.yahoo.com/d/quotes.csv?s=".$symbols."&f=snl1c1m7b4baa2pxo", "r");
$line_of_text = '[';
$line_of_json = '';
$num_of_lines = 0;
while (!feof($file_handle) ) {
	$num_of_lines++;
	$csv_record = fgetcsv($file_handle, 1024);
	$line_of_json = '{"symbol":"'.$csv_record[0].'","name":"'.$csv_record[1].'","price":"'.$csv_record[2].'","change":"'.$csv_record[3].'", "chg":"'.$csv_record[4].'" , "BkV":"'.$csv_record[5].'", "bid":"'.$csv_record[6].'", "ask":"'.$csv_record[7].'", "adv":"'.$csv_record[8].'", "prvClose":"'.$csv_record[9].'", "exchange":"'.$csv_record[10].'", "open":"'.$csv_record[11].'" },';
	$line_of_text .= $line_of_json;
}

$line_len = strlen($line_of_text);
$line_of_text = substr($line_of_text,0,$line_len-1);
$line_of_text = '{"count":'.$num_of_lines.',"source":"YAHOO","records":'.$line_of_text.']}';

echo $line_of_text;

fclose($file_handle);

?>