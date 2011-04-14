var json = {
	id: "1",
	name: "bookstore",
	data: {
		attributes: { "specialty": "novel"},
		text: ""
	},
	children: [{
		id: "2",
		name: "book",
		data: {
			attributes: { "style":"autobiography"},
			text: ""
		},
		children: [{
			id: "3",
			name: "author",
			data: {
				attributes: {},
				text: ""
			},
			children: [{
				id: "4",
				name: "first-name",
				data: {
					attributes: {},
					text: "Joe"
				},
				children: []
			},{
				id: "5",
				name: "last-name",
				data: {
					attributes: {},
					text: "Bob"
				},
				children: []
			}, {
				id: "6",
				name: "award",
				data: {
					attributes: {},
					text: "Trenton Literary Review Honorable Mention"
				},
				children: []
			}]
		},{
			id: "7",
			name: "price",
			data: {
				attributes: {},
				text: "12"
			},
			children: []
		}]
	},{
		id: "8",
		name: "book",
		data: {
			attributes: { "style":"textbook"},
			text: ""
		},
		children: [{
			id: "9",
			name: "author",
			data: {
				attributes: {},
				text: ""
			},
			children: [{
				id: "10",
				name: "first-name",
				data: {
					attributes: {},
					text: "Mary"
				},
				children: []
			},{
				id: "11",
				name: "last-name",
				data: {
					attributes: {},
					text: "Bob"
				},
				children: []
			}, {
				id: "12",
				name: "publication",
				data: {
					attributes: {},
					text: "Selected Short Stories of"
				},
				children: [{
					id: "13",
					name: "first-name",
					data: {
						attributes: {},
						text: "Mary"
					},
					children: []
				},{
					id: "14",
					name: "last-name",
					data: {
						attributes: {},
						text: "Bob"
					},
					children: []
				}]
			}]
		},{
			id: "15",
			name: "editor",
			data: {
				attributes: {},
				text: ""
			},
			children: [{
				id: "16",
				name: "first-name",
				data: {
					attributes: {},
					text: "Britney"
				},
				children: []
			},{
				id: "17",
				name: "last-name",
				data: {
					attributes: {},
					text: "Bob"
				},
				children: []
			}]
		},{
			id: "18",
			name: "price",
			data: {
				attributes: {},
				text: "55"
			},
			children: []
		}]
	},{
		id: "19",
		name: "magazine",
		data: {
			attributes: {"style":"glossy", "frequency":"monthly"},
			text: ""
		},
		children: [{
			id: "20",
			name: "price",
			data: {
				attributes: {},
				text: "2.50"
			},
			children: []
		},{
			id: "21",
			name: "subscription",
			data: {
				attributes: {"price":"24", "per":"year"},
				text: ""
			},
			children: []
		}]
	},{
		id: "22",
		name: "book",
		data: {
			attributes: {"style":"novel", "id":"myfave"},
			text: ""
		},
		children: [{
			id: "23",
			name: "author",
			data: {
				attributes: {},
				text: ""
			},
			children: [{
				id: "24",
				name: "first-name",
				data: {
					attributes: {},
					text: "Toni"
				},
				children: []
			},{
				id: "25",
				name: "last-name",
				data: {
					attributes: {},
					text: "Bob"
				},
				children: []
			},{
				id: "26",
				name: "degree",
				data: {
					attributes: {"from":"Trenton U"},
					text: "B.A."
				},
				children: []
			},{
				id: "27",
				name: "degree",
				data: {
					attributes: {"from":"Harvard"},
					text: "Ph.D."
				},
				children: []
			},{
				id: "28",
				name: "award",
				data: {
					attributes: {},
					text: "Pulitzer"
				},
				children: []
			},{
				id: "29",
				name: "publication",
				data: {
					attributes: {},
					text: "Still in Trenton"
				},
				children: []
			},{
				id: "30",
				name: "publication",
				data: {
					attributes: {},
					text: "Trenton Forever"
				},
				children: []
			}]
		},{
			id: "31",
			name: "price",
			data: {
				attributes: {intl:"Canada", "exchange":"0.7"},
				text: "6.50"
			},
			children: []
		},{
			id: "32",
			name: "excerpt",
			data: {
				attributes: {},
				text: ""
			},
			children: [{
				id: "33",
				name: "p",
				data: {
					attributes: {},
					text: "It was a dark and stormy night."
				},
				children: []
			},{
				id: "34",
				name: "p",
				data: {
					attributes: {},
					text: "But then all nights in Trenton seem dark and stormy to someone who has gone through what I have."
				},
				children: []
			},{
				id: "35",
				name: "definition-list",
				data: {
					attributes: {},
					text: ""
				},
				children: [{
					id: "36",
					name: "term",
					data: {
						attributes: {},
						text: "Trenton"
					},
					children: []
				},{
					id: "36",
					name: "definition",
					data: {
						attributes: {},
						text: "misery"
					},
					children: []
				}]
			}]
		}]
	}]
}