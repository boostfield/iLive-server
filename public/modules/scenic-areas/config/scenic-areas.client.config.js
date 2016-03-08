'use strict';

// Configuring the Articles module
angular.module('scenic-areas').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', '景区', 'scenic-areas', 'dropdown', '/scenic-areas(/create)?', false, ['unavaliable'], 7);
		Menus.addSubMenuItem('topbar', 'scenic-areas', '查看景区列表', 'scenic-areas');
		Menus.addSubMenuItem('topbar', 'scenic-areas', '创建景区', 'scenic-areas/create');
	}
]);
