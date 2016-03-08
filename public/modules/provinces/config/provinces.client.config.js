'use strict';

// Configuring the Articles module
angular.module('provinces').run(['Menus',
    function (Menus) {
        // Set top bar menu items
        Menus.addMenuItem('topbar', '省份', 'provinces', 'dropdown', '/provinces(/create)?', false, ['unavaliable'], 5);
        Menus.addSubMenuItem('topbar', 'provinces', '查看所有省份', 'provinces');
        Menus.addSubMenuItem('topbar', 'provinces', '添加省份', 'provinces/create');
    }
]);
