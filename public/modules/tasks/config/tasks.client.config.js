'use strict';

// Configuring the Articles module
angular.module('tasks').run(['Menus',
    function (Menus) {
        // Set top bar menu items
        Menus.addMenuItem('topbar', '任务', 'tasks', 'dropdown', '/tasks(/create)?', false, ['admin'], 2);
        Menus.addSubMenuItem('topbar', 'tasks', '创建新任务', 'tasks/create', null, false, ['admin']);
        Menus.addSubMenuItem('topbar', 'tasks', '所有任务', 'tasks', null, false, ['admin']);
    }
]);
