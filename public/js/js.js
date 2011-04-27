jQuery.uuidGen       = function(){ return (((1+Math.random())*0x10000)|0).toString(16).substring(1); }
jQuery.UUID          = function(){ return (jQuery.uuidGen()+jQuery.uuidGen()+'-'+jQuery.uuidGen()+'-'+jQuery.uuidGen()+'-'+jQuery.uuidGen()+'-'+jQuery.uuidGen()+jQuery.uuidGen()+jQuery.uuidGen()); }
jQuery.fn.setMessage = function(msg, klass, init)
{
	var self = this;

	self.html(msg).attr('class', '').addClass(klass || '');
	if (!init)
	{
		self.css('margin-left', $(window).width()/2-self.width()/2);
		if (self.is(':hidden'))
			self.slideDown('fast');

		if (self.data('timer'))
			clearTimeout(self.data('timer'));

		self.data('timer', setTimeout(function()
		{
			self.hide();
			$(window).unbind('resize.xpath');
		}, 5000));

		$(window).unbind('resize.xpath').bind('resize.xpath', function(){ self.setMessage(msg, klass, !init); });
	}
	else
	{
		var l = $(window).width()/2-self.width()/2;
		self.stop().animate({marginLeft: (l < 0) ? 0 : l}, 150, 'linear');
	}

	return this;
}

function json2jit(data, root)
{
	function loop(obj, nm)
	{
		var arr = [];
		for (var x in obj)
		{
			// We're an attribute OR! #text node
			// Skip it because the parent should have grabbed it already
			if (x.substr(0, 1) == '@' || x == '#text')
				continue;

			// Let's see if this node has any attributes
			var data = {}
			if (typeof(obj[x]) == 'object' || obj[x] instanceof Array)
			{
				for (var y in obj[x])
					if (y.substr(0, 1) == '@')
						data[(y.substr(1).toLowerCase() == 'text') ? 'text ' : y.substr(1)] = obj[x][y];
					else if (y == '#text')
						data.text = obj[x][y];
			}
			else if (typeof(obj[x]) == 'string')
				data.text = obj[x];

			// Push the node onto the array stack
			arr.push(
			{
				id       : jQuery.UUID(),
				name     : nm || x,
				data     : data,
				children : (typeof(obj[x]) == 'object' || obj[x] instanceof Array) ? loop(obj[x], (obj[x] instanceof Array) ? x : false) : []
			});
		}

		return arr;
	}

	x = loop(data).shift();
	if (root)
		x.name = root;

	return x;
}

function parseXml(str)
{
	// Let's try jQuery's parseXML method.  It will try and catch the result
	// If it catches an exception, then it's invalid, else we assume... sweet!
	try
	{
		return $.parseXML($('#xmlData').val());
	}
	catch(me){ return false; }
}

$(document).ready(function()
{
	// Local variables
	var xmlLoaded = false;
	var xmlJson   = false;
	var jsonStr   = false;
	var xpath     = $('#xpath');
	var graphWrap = $('#graphWrap');
	var results   = $('.results', '#resultsWrap');
	var steps     = $('.steps', '#resultsWrap');

	// Buttons
	$('#loadXml').unbind('click.xpath').bind('click.xpath', function(e)
	{
		$('#xmlDialog').modal();
		return false;
	});

	// Load XML Data
	$('.load', '#xmlDialog').unbind('click.xpath').bind('click.xpath', function()
	{
		var xml = parseXml($('#xmlData').val());
		if (xml === false)
		{
			alert('Invalid XML!');
			return false;
		}

		// Hide the dialog
		$.modal.close();

		$('#globalMessage').setMessage('Loaded XML content');

		var jsonStr = xml2json(xml, "  ");
		eval('xmlJson = '+jsonStr);

		xmlLoaded = true;
		viewTree(xmlJson);
	});

	// Evaluate
	$('#evaluate').unbind('click.xpath').bind('click.xpath', function()
	{
		if (xmlLoaded !== true)
		{
			alert('Please load some XML first.');
			return false;
		}

		// Clear out results and steps data
		results.empty();
		steps.html('<ol></ol>');

		// Load xParser and parse it!
		var x = new xParser(xmlJson);
		var r = x.parse(xpath.val());

		// Inline step-loop method
		function loopSteps(obj)
		{
			if (obj.hasParent())
				loopSteps(obj.parent());

			$('ol', steps).append($('<li></li>').html('<pre>'+js_beautify($.toJSON(obj.jsonObj), {indent_size: 1, indent_char: '  '})+'</pre>'));
		}

		// Error?
		if (r === false)
		{
			results.html('Error parsing XPath expression');
			xpath.addClass('error').bind('keydown.xpath focus.xpath', function()
			{
				if ($(this).hasClass('error'))
					$(this).removeClass('error').unbind('keydown.xpath focus.xpath');
			});
		}
		else
		{
			function getPname(x)
			{
				console.log('pname', x);
				if (x.pName)
					return x.pName;
				else if (x.hasParent())
					return getPname(x.parent());
				else
					return false;
			}

			if ($('#resultsWrap').is(':hidden'))
				$('#resultsWrap').fadeIn('fast');

			var res  = r.getJson();
			var root = null;

			if ($.isArray(res))
			{
				tmp  = {}
				root = (res.length == 1) ? 'result' : 'results';

				tmp[getPname(r) || 'result'] = res;
				res = tmp;
			}
			else if ($.isPlainObject(res))
			{
				var cnt = 0;
				for (var x in res)
					cnt++;

				if (cnt > 1)
				{
					tmp = {}
					tmp[getPname(r) || 'result'] = res;
					res = tmp;
				}
			}

			console.log(res);

			viewTree(res, root);
			results.html(js_beautify($.toJSON(r.jsonObj), {indent_size: 1, indent_char: '  '}));
			loopSteps(r);
			console.log(r);
		}
	});

	// Autoload!
	if ($('#xmlData').val())
		$('.load', '#xmlDialog').click();

	// Inline functions
	function viewTree(json, root)
	{
		var isHidden = graphWrap.is(':hidden');
		var inited   = (graphWrap.data('inited') === true);

		// Are we hidden?
		if (isHidden) 
			graphWrap.show().css('visibility', 'hidden');

		// Has the spacetree been initiated already?
		if (!inited)
		{
			var st = new $jit.ST(
			{
				constrained  : false,
				orientation  : 'top',
				injectInto   : 'treeGraph',
				duration     : 100,
				levelsToShow : 999,

				Navigation:
				{
					enable  : true,
					panning : 'avoid nodes',
					zooming : 15
				},

				Node:
				{
					autoHeight  : true,
					autoWidth   : true,
					// height      : 20,
					// width       : 75,
					type        : 'rectangle',
					color       : '#aaa',
					overridable : true
				},

				Edge:
				{
					type        : 'bezier',
					overridable : true
				},

				Tips:
				{
					enable  : true,
					offsetX : 16,
					offsetY : 16,
					onShow  : function(tip, node)
					{
						var attrs   = [];
						var hasText = ('text' in node.data);

						// Grab all of "our" attributes
						for (var item in node.data)
							if (item[0] !== '$' && item !== 'text')
								attrs.push([item, node.data[item]]);

						// Reset tip HTML & make visible
						tip.innerHTML        = '';
						tip.style.visibility = 'visible';

						// Any attributes?
						if (attrs.length)
						{
							tip.innerHTML += "<strong>Attributes:</strong>";
							for (var item in node.data)
							{
								if (item[0] !== '$' && item !== 'text')
									tip.innerHTML += "<div><u>"+item+"</u>: "+node.data[item]+"</div>"
							}

							if (hasText)
								tip.innerHTML += "<hr size='1' />";
						}

						// How about some text value?
						if (hasText)
							tip.innerHTML += "<strong>Text Value</strong><br />"+node.data.text;

						// Hide if no content
						if (tip.innerHTML == '')
							tip.style.visibility = 'hidden';
					}
				},

				Events:
				{
					enable  : true,
					onClick : function(node, evt, e)
					{
						if (node)
							st.select(node.id);
					}
				},

				onCreateLabel: function(label, node)
				{
					label.id        = node.id;
					label.innerHTML = node.name;
					label.onclick   = function()
					{
						st.onClick(node.id,
						{
							Move:
							{
								enable  : true,
								offsetY : 15
							}
						});
					}
				},

				onBeforePlotNode: function(node)
				{
					if (node.selected)
						node.data.$color = "#ff7";
					else
					{
						delete node.data.$color;
						if (!node.anySubnode("exist"))
						{
							var count = 0;
							node.eachSubnode(function(n) { count++; });
							node.data.$color = ['#aaa', '#baa', '#caa', '#daa', '#eaa', '#faa'][count];
						}
					}
				},

				onBeforePlotLine: function(adj)
				{
					if (adj.nodeFrom.selected && adj.nodeTo.selected)
					{
						adj.data.$color = "#eed";
						adj.data.$lineWidth = 3;
					}
					else
					{
						delete adj.data.$color;
						delete adj.data.$lineWidth;
					}
				}
			});

			graphWrap.data('inited', true).data('tree', st);
		}
		else
			st = graphWrap.data('tree');

		// Load the JSON baby
		st.graph.empty();
		st.loadJSON(json2jit(json, root));
		st.compute();
		st.onClick(st.root, {Move: {enable: true, offsetY: 185}});

		if (!inited)
			st.canvas.scale(1.2, 1.2);

		if (isHidden)
			graphWrap.css('visibility', 'visible').hide().fadeIn('fast');
	}
});