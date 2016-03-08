'use strict';

// Configuring the Articles module
angular.module('user-feedbacks').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', '用户反馈', 'user-feedbacks', 'dropdown', '/user-feedbacks(/create)?', false, ['unavaliable'], 12);
		Menus.addSubMenuItem('topbar', 'user-feedbacks', '用户反馈列表', 'user-feedbacks');
	}
]);
