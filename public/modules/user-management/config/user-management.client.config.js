'use strict';

// Configuring the Articles module
angular.module('user-management').run(['Menus',
    function (Menus) {
        // Set top bar menu items
        Menus.addMenuItem('topbar', '用户管理', 'user-management', 'dropdown', '/users(/create)?', false, ['admin'], 11);
        //Menus.addSubMenuItem('topbar', 'user-management', '查看所有用户', 'users');
        Menus.addSubMenuItem('topbar', 'user-management', '创建用户', 'users/create');
        Menus.addSubMenuItem('topbar', 'user-management', '查看用户列表', 'users');
        Menus.addSubMenuItem('topbar', 'user-management', '举报列表', 'objection-reports');
        Menus.addSubMenuItem('topbar', 'user-management', '用户反馈列表', 'user-feedbacks');
    }
]);
