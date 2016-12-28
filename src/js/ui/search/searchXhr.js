"use strict";
const http_1 = require("../../http");
function games(userId, filter = 'all', page = 1, feedback = false) {
    return http_1.fetchJSON(`/@/${userId}/${filter}`, {
        query: {
            page
        }
    }, feedback);
}
exports.games = games;
