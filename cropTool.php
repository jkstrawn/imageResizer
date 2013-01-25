<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN"
"http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
	<head>
		<meta http-equiv="Content-type" content="text/html;charset=UTF-8" /> 
		<title>Blessing the Children Cropping Tool</title>
		<script src="js/jquery.min.js" type="text/javascript"></script>
		<script src="js/jquery.Jcrop.js" type="text/javascript"></script>
		<script src="js/jquery.color.js" type="text/javascript"></script>
		<link rel="stylesheet" href="css/jquery.Jcrop.css" type="text/css" />

		<script type="text/javascript">

			var jcrop_api;
			var old_image;
			var child_name;

			jQuery(function($) {

				var $_GET = {};

				document.location.search.replace(/\??(?:([^=]+)=([^&]*)&?)/g, function () {
					function decode(s) {
						return decodeURIComponent(s.split("+").join(" "));
					}

					$_GET[decode(arguments[1])] = decode(arguments[2]);
				});

				child_name = ($_GET["child_name"]);
				document.getElementById('childNameDiv').innerHTML ="<p>Child's Name: " + child_name + "</p>";

				document.getElementById('fileinput').addEventListener('change', cropLoadedImage, false);
			});

			function setCropToImage() {
				$('#target2').Jcrop({
					bgFade:     true,
					bgOpacity: .3,
					setSelect: [ 0, 0, 90, 120 ],
					aspectRatio: 7/6,
					onSelect: setCoords,
					onChange: setCoords
				});				
			}

			function drawCroppedImage(img, crop_x, crop_y, crop_width, crop_height) {
				//create the temporary canvas to crop the image
				var canvas = document.createElement('canvas');
				var ctx = canvas.getContext('2d');

				canvas.width = crop_width;
				canvas.height = crop_height;

				// draw the image with offset
				ctx.drawImage(img, crop_x,crop_y,crop_width,crop_height, 0,0,crop_width,crop_height);

				// output the base64 of the cropped image
				//document.getElementById('output').innerHTML = "<img id='target2' src=" + canvas.toDataURL('image/jpeg') + ">";



var canvasData = canvas.toDataURL("image/png");




	var postData = "canvasData="+canvasData;
	var debugConsole= document.getElementById("debugConsole");
	debugConsole.value=canvasData;

	//alert("canvasData ="+canvasData );
	var ajax = new XMLHttpRequest();
	ajax.open("POST",'testSave.php',true);
	ajax.setRequestHeader('Content-Type', 'canvas/upload');
	//ajax.setRequestHeader('Content-TypeLength', postData.length);


	ajax.onreadystatechange=function()
  	{
		if (ajax.readyState == 4)
		{
			//alert(ajax.responseText);
			// Write out the filename.
    			document.getElementById("debugFilenameConsole").innerHTML="Saved as<br><a target='_blank' href='"+ajax.responseText+"'>"+
    			ajax.responseText+"</a><br>Reload this page to generate new image or click the filename to open the image file.";
		}
  	}

	ajax.send(postData);




document.getElementById('output').innerHTML = "<img id='target2' src=" + canvasData + ">";

				//window.location.href = "upload.php?urll=" + url;
			}

			function revertToOldImage() {
				document.getElementById('output').innerHTML = "<img id='target2' src=" + old_image.src + ">";
				setCropToImage();
			}
					
			function useImage() {
				var c = jcrop_api;
				var img = document.getElementById('target2');
				console.log(img.src);

				drawCroppedImage(img, c.x, c.y, c.w, c.h);
			}

			function setCoords(c) {
				jcrop_api = c;
			}

			function drawImage(img) {
				// output the image
				old_image = img;
				document.getElementById('output').innerHTML = "<img id='target2' src=" + img.src + ">";
				setCropToImage();
			}

			function cropLoadedImage(evt) {
				//Retrieve the first (and only!) File from the FileList object
				var f = evt.target.files[0]; 

				if (f) {
					var reader = new FileReader();
					reader.readAsDataURL(f);
					reader.onload = function(e) { 
						var img = new Image;
						img.onload = function() {
							drawImage(img);
						}
						img.src = event.target.result;
					}
				} else { 
					alert("Failed to load file");
				}
			}






		</script>

	</head>

	<body>
		<div class="main">
			<div class="article">

				<h1>Blessing the Children</h1>
				<h2>Image Cropping Tool</h2>
				<div id="childNameDiv" ></div>
				<div id="output" ></div>

			</div>


			<p>
			Please specify a file:<br>
			<input type="file" id="fileinput" /><br/>
			</p>

			<input type="button" id="button1" value="Crop Image" onclick="useImage();">
			<input type="button" id="button2" value="Revert to Original" onclick="revertToOldImage();">
			<input type="button" id="button3" value="Upload Image" onclick="uploadImage();">
		</div>

<textarea id="debugConsole" rows="10" cols="60">Data</textarea>
<div id="debugFilenameConsole">Saved as<br><a target="_blank" href="http://www.permadi.com/canvasImages/canvas717.png">
	http://www.permadi.com/canvasImages/canvas717.png</a><br>Reload this page to generate new image or click the filename to open the image file.</div>


<form action="cropTool.php" method="POST" enctype="multipart/form-data">
<table align="center">




<tr>
<td align="right">
Select your file:
</td>
<td>
<input name="userfile" type="file" size="50">
</td>
</tr>
</table>
<table align="center">
<tr>
<td align="center">
<input type="submit" name="submit" value="Upload image" />
</td>
</tr>

</table>
</form>


	</body>
</html>

<?
$childname = $_GET["child_name"];
print $childname;

if(isset($_POST["submit"])) {

	set_time_limit(300);//for uploading big files
		
	$paths='children';

	$ftp_server='ftp.blessingthechildren.org';

	$ftp_user_name='KStrawn';

	$ftp_user_pass='Free22@@';

$fp = fopen('http://blessingthechildren.org/children/dolphins.jpg', 'r');


	$filep=$_FILES['userfile']['tmp_name'];


	// set up a connection to ftp server
	$conn_id = ftp_connect($ftp_server);

	// login with username and password
	$login_result = ftp_login($conn_id, $ftp_user_name, $ftp_user_pass);

	// check connection and login result
	if ((!$conn_id) || (!$login_result)) {
	       echo "FTP connection has encountered an error!";
	       echo "Attempted to connect to $ftp_server for user $ftp_user_name....";
	       exit;
	   } else {
	       echo "Connected to $ftp_server, for user $ftp_user_name".".....";
	   }

	// upload the file to the path specified
	//$upload = ftp_put($conn_id, $paths.'/'.$childname.'.jpg', $filep, FTP_BINARY);

if (ftp_fput($conn_id, $paths.'/werx.jpg', $fp, FTP_BINARY)) {
    echo "Successfully uploaded $file\n";
} else {
    echo "There was a problem while uploading $file\n";
}

	// check the upload status
	if (!$upload) {
	       echo "FTP upload has encountered an error!";
	   } else {
	       echo "Uploaded file with name $childname.jpg to $ftp_server ";
	   }

	// close the FTP connection
	ftp_close($conn_id);	
}