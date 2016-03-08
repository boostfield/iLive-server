'use strict';

// Configuring the Articles module
angular.module('quota-recorders').run(['Menus',
    function (Menus) {
        // Set top bar menu items
        Menus.addMenuItem('topbar', '配额请求', 'quota-recorders', 'dropdown', '/quota-recorders(/check)?', false, ['admin'], 15);
        Menus.addSubMenuItem('topbar', 'quota-recorders', '查看所有请求', 'quota-recorders');
        Menus.addSubMenuItem('topbar', 'quota-recorders', '审核请求', 'unchecked-quota-recorders');
    }
]);
