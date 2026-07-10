"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_assert_1 = __importDefault(require("node:assert"));
describe("Array", () => {
    describe("#indexOf()", () => {
        it("should return -1 when the value is not present", () => {
            node_assert_1.default.equal([1, 2, 3].indexOf(4), -1);
        });
    });
});
//# sourceMappingURL=TokenstatusList.test.js.map