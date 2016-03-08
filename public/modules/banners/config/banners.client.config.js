'use strict';

// Configuring the Articles module
angular.module('banners').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Banners', 'banners', 'dropdown', '/banners(/create)?', false, ['admin'], 1);
		Menus.addSubMenuItem('topbar', 'banners', 'Banners列表', 'banners');
		Menus.addSubMenuItem('topbar', 'banners', '创建Banner', 'banners/create');
	}
]);
