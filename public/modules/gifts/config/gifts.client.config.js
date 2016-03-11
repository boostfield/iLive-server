'use strict';

// Configuring the Articles module
angular.module('gifts').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', '礼物管理', 'gifts', 'dropdown', '/gifts(/create)?', false, ['admin'], 1);
		Menus.addSubMenuItem('topbar', 'gifts', '礼物列表', 'gifts');
		Menus.addSubMenuItem('topbar', 'gifts', '创建礼物', 'gifts/create');
	}
]);
