'use strict';

// Configuring the Articles module
angular.module('task-lists').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', '玩鲜线路', 'task-lists', 'dropdown', '/task-lists(/create)?', false, ['admin'], 3);
		Menus.addSubMenuItem('topbar', 'task-lists', '创建玩鲜线路', 'task-lists/create', null, false, ['admin']);
		Menus.addSubMenuItem('topbar', 'task-lists', '玩鲜线路列表', 'task-lists', null, false, ['admin']);
	}
]);
