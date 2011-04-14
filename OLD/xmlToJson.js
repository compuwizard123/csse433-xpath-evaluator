function xmlToJson(xml) {
var attr,
	child,
	attrs = xml.attributes,
	children = xml.childNodes,
	key = xml.nodeType,
	obj = {},
	i = -1;

if (key == 1 && attrs.length) {
  obj[key = 'data'] = {};
  while (attr = attrs.item(++i)) {
	obj[key][attr.nodeName] = attr.nodeValue;
  }
  i = -1;
} else if (key == 3) {
  obj = xml.nodeValue;
}
while (child = children.item(++i)) {
  key = child.nodeName;
  if (obj.hasOwnProperty(key)) {
	if (obj.toString.call(obj[key]) != '[object Array]') {
	  obj[key] = [obj[key]];
	}
	obj[key].push(xmlToJson(child));
  }
  else {
	obj[key] = xmlToJson(child);
  }
}
return obj;
}