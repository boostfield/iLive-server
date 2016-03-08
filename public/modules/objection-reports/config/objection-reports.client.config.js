'use strict';

// Configuring the Articles module
angular.module('objection-reports').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', '用户举报', 'objection-reports', 'dropdown', '/objection-reports(/create)?', false, ['unavaliable'], 11);
		Menus.addSubMenuItem('topbar', 'objection-reports', '举报列表', 'objection-reports');
	}
]);
