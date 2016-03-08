'use strict';

// Configuring the Articles module
angular.module('cities').run(['Menus',
    function (Menus) {
        // Set top bar menu items
        Menus.addMenuItem('topbar', '城市', 'cities', 'dropdown', '/cities(/create)?',false, ['editor','admin'], 6);
        Menus.addSubMenuItem('topbar', 'cities', '查看所有城市', 'cities');
        Menus.addSubMenuItem('topbar', 'cities', '查看热门城市', 'cities/hot');
        Menus.addSubMenuItem('topbar', 'cities', '添加城市', 'cities/create');
    }
]);
