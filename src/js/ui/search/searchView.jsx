"use strict";
const common_1 = require("../shared/common");
const layout_1 = require("../layout");
function view() {
    const ctrl = this;
    const user = ctrl.user();
    if (!user)
        return layout_1.default.empty();
    function header() {
        return common_1.header(common_1.backButton('Search'));
    }
    return layout_1.default.free(header, renderSearchForm);
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = view;
function renderSearchForm() {
    return (<section className="profile">
    </section>);
}
