<html>
<head>
<script>
// Changes XML to JSON
function xmlToJson(xml) {
	
	// Create the return object
	var obj = {};

	if (xml.nodeType == 1) { // element
		// do attributes
		if (xml.attributes.length > 0) {
		obj["@attributes"] = {};
			for (var j = 0; j < xml.attributes.length; j++) {
				obj["@attributes"][xml.attributes.item(j).nodeName] = xml.attributes.item(j).nodeValue;
			}
		}
	} else if (xml.nodeType == 3) { // text
		obj = xml.nodeValue;
	}

	// do children
	if (xml.hasChildNodes()) {
		for(var i = 0; i < xml.childNodes.length; i++) {
			if (typeof(obj[xml.childNodes.item(i).nodeName]) == "undefined") {
				obj[xml.childNodes.item(i).nodeName] = $xmlToJson(xml.childNodes.item(i));
			} else {
				if (typeof(obj[xml.childNodes.item(i).nodeName].length) == "undefined") {
					var old = obj[xml.childNodes.item(i).nodeName];
					obj[xml.childNodes.item(i).nodeName] = [];
					obj[xml.childNodes.item(i).nodeName].push(old);
				}
				obj[xml.childNodes.item(i).nodeName].push($xmlToJson(xml.childNodes.item(i)));
			}
		}
	}
	return obj;
};
alert(xmlToJson('<ALEXA VER="0.9" URL="davidwalsh.name/" HOME="0" AID="=">
	<SD TITLE="A" FLAGS="" HOST="davidwalsh.name">
		<TITLE TEXT="David Walsh Blog :: PHP, MySQL, CSS, Javascript, MooTools, and Everything Else"/>
		<LINKSIN NUM="1102"/>
		<SPEED TEXT="1421" PCT="51"/>
	</SD>
	<SD>
		<POPULARITY URL="davidwalsh.name/" TEXT="7131"/>
		<REACH RANK="5952"/>
		<RANK DELTA="-1648"/>
	</SD>
</ALEXA>');
</script>
</head>
<body>
<h1>TEST</h1>
</body>
</html>