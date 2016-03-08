'use strict';
angular.module('activity').run(['Menus',
    function(Menus) {
        // Set top bar menu items
        Menus.addMenuItem('topbar', '我的活动', 'activities', 'dropdown', '/banners(/create)?', false, ['tenant'], 13);
        Menus.addSubMenuItem('topbar', 'activities', '我的活动列表', 'my-activity-list');
    }
]);
