'use strict';

// Configuring the Articles module
angular.module('areas').run(['Menus',
    function (Menus) {
        // Set top bar menu items
        Menus.addMenuItem('topbar', '区域', 'areas', 'dropdown', '/areas(/create)?',false, ['unavaliable'], 7);
        Menus.addSubMenuItem('topbar', 'areas', '添加区域', 'areas/create');
    }
]);
