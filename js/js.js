jQuery.uuidGen = function(){ return (((1+Math.random())*0x10000)|0).toString(16).substring(1); }
jQuery.UUID    = function(){ return (jQuery.uuidGen()+jQuery.uuidGen()+'-'+jQuery.uuidGen()+'-'+jQuery.uuidGen()+'-'+jQuery.uuidGen()+'-'+jQuery.uuidGen()+jQuery.uuidGen()+jQuery.uuidGen()); }

function json2jit(data)
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
	return x;
}

function parseXml(str)
{
	// Let's try jQuery's parseXML method.  It will try and catch the result
	// If it catches an exception, then it's invalid, else we assume... sweet!
	try
	{
		return $.parseXML($('#xml').val());
	}
	catch(me){ return false; }
}

function viewTree(json)
{
	$('#treeTab').show().css('visibility', 'hidden');
	if ($('#treeTab').data('inited') !== true)
	{
		var st = new $jit.ST(
		{
			constrained  : false,
			orientation  : 'top',
			injectInto   : 'treeVis',
			duration     : 100,
			levelsToShow : 999,
			// offsetY      : 185,

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
						tip.innerHTML += "Attributes:<hr />";
						tip.innerHTML += "<table cellspacing='0' cellpadding='0' border='0'>";

						for (var item in node.data)
						{
							if (item[0] !== '$' && item !== 'text')
								tip.innerHTML += "<tr><td align='left'>"+item+": </td><td align='left'>"+node.data[item]+"</td></tr>"
						}

						tip += "</table>";
						if (hasText)
							tip.innerHTML += "<hr />";
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
						},

						onComplete : function()
						{
							var attrs   = [];
							var str     = '';
							var data    = $('#nodeData');
							var hasText = ('text' in node.data);

							// Grab all of "our" attributes
							for (var item in node.data)
								if (item[0] !== '$' && item !== 'text')
									attrs.push([item, node.data[item]]);

							// Any attributes?
							if (attrs.length)
							{
								str += "Attributes:<hr />";
								str += "<table cellspacing='0' cellpadding='0' border='0'>";

								for (var item in node.data)
								{
									if (item[0] !== '$' && item !== 'text')
										str += "<tr><td align='left'>"+item+": </td><td align='left'>"+node.data[item]+"</td></tr>"
								}

								str += "</table>";
								if (hasText)
									str += "<hr />";
							}

							// How about some text value?
							if (hasText)
								str += "<strong>Text Value</strong><br />"+node.data.text;

							// Hide if no content
							if (str == '')
								str = '<em>Empty (Select another node)</em>';

							$('#nodeData').html(str);
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

		$('#treeTab').data('inited', true).data('tree', st);
	}
	else
		st = $('#treeTab').data('tree');

	var jit = json2jit(json);
	console.log(jit);

	st.graph.empty();
	st.loadJSON(jit);
	st.compute();
	st.onClick(st.root,
	{
		Move:
		{
			enable  : true,
			offsetY : 185
		}
	});

	for (var i=0; i<2; i++)
		st.canvas.scale(1.2, 1.2);

	$('#treeTab').css('visibility', 'visible').hide();
}

$(document).ready(function()
{
	var tabs = $('li', '#tabs');
	var tabCont = $('.tabCont', '#tabContainer');

	// Initially hide all tabs and their content
	// Setup handler for tabs
	tabCont.hide();
	tabs.bind('click', function()
	{
		if (this == tabs.filter('.active').get(0) || $(this).hasClass('disabled'))
			return false;

		tabCont.hide();
		tabs.removeClass('active');
		$(this).addClass('active');
		$($('a', this).attr('href')).fadeIn('fast');

		return false;
	});

	// Show the active tab
	tabs.filter((!tabs.filter('.active').length) ? ':first' : '.active').click();

	// Buttons
	$('#convert').bind('click', function()
	{
		var xml = parseXml($('#xml').val());
		if (xml === false)
		{
			alert('Invalid XML!');
			return false;
		}

		var str = xml2json(xml, "  ");
		var json;

		eval('json = '+str);

		$('#json').data('loaded', true).data('json', json).html(str);
		viewTree($('#json').data('json'));
		tabs.find('a[href*="evalTab"]').parent().removeClass('disabled').click();
	}).trigger('click');

	$('#xpath').bind('keydown', function(e)
	{
		e.stopPropagation();
		if (e.which == 13)
			$('#xparse').removeClass('error').unbind('keydown.xpath focus.xpath').click();
	});

	$('#xparse').bind('click', function()
	{
		if ($('#json').data('loaded') !== true)
		{
			alert('Please load some XML first.');
			return false;
		}

		$('#steps').empty().html('<ol></ol>');
		var x = new xParser($('#json').data('json'));
		var r = x.parse($('#xpath').val());
		var i = 0;

		function loopSteps(obj)
		{
			if (obj.hasParent())
				loopSteps(obj.parent());

			$('ol', '#steps').append($('<li></li>').html('<pre>'+js_beautify($.toJSON(obj.jsonObj), {indent_size: 1, indent_char: '  '})+'</pre>'));
		}

		if (r === false)
		{
			$('#result').html('Error parsing XPath expression');
			$('#xpath').addClass('error').bind('keydown.xpath focus.xpath', function()
			{
				if ($(this).hasClass('error'))
					$(this).removeClass('error').unbind('keydown.xpath focus.xpath');
			});
		}
		else
		{
			$('#result').html(js_beautify($.toJSON(r.jsonObj), {indent_size: 1, indent_char: '  '}));
			loopSteps(r);
			console.log(r);
		}
	});
});