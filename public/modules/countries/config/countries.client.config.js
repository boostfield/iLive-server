'use strict';

// Configuring the Articles module
angular.module('countries').run(['Menus',
    function (Menus) {
        // Set top bar menu items
        Menus.addMenuItem('topbar', '国家', 'countries', 'dropdown', '/countries(/create)?', false, ['unavaliable'], 4);
        Menus.addSubMenuItem('topbar', 'countries', '查看国家列表', 'countries');
        Menus.addSubMenuItem('topbar', 'countries', '添加国家', 'countries/create');
    }
]);
