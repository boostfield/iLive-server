'use strict';

// Configuring the Articles module
angular.module('scenic-spots').run(['Menus',
    function (Menus) {
        // Set top bar menu items
        Menus.addMenuItem('topbar', '执行地', 'scenic-spots', 'dropdown', '/scenic-spots(/create)?', false, ['editor', 'admin'], 8);
        Menus.addSubMenuItem('topbar', 'scenic-spots', '创建执行地', 'scenic-spots/create');
        Menus.addSubMenuItem('topbar', 'scenic-spots', '查看所有执行地', 'scenic-spots');

    }
]);
