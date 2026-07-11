import assert from "node:assert";
import TokenStatusList, { IIndexedStatus } from "../TokenStatusList";

const dynamicTestShort = (bits: number, indexes: number[], values?: number[]) => () =>
    {
        const status: number[] = [];

        for(const i of indexes) status[i] = (values ?? [])[i] ?? 0b1;

        let list: TokenStatusList;
        before(() =>
        {
            list = new TokenStatusList(bits);
            for(let i = 0; i < status.length; i++) list.setValue(i, status[i]);
        });

        it("Reverted List Should Match", () =>
        {
            const newList = TokenStatusList.fromJSON(list.getTokenList());
            const newTest: number[] = [];

            for(const i of indexes) newTest[i] = newList.getValue(i)!;

            assert.deepEqual(newTest, status);
        });
    };

const dynamicTestFull = (
    bits: number,
    indexes: number[],
    values: number[],
    byteArray: number[],
    lstValue: string
) => () =>
    {
        const status: number[] = [];

        for(const i of indexes) status[i] = (values)[i] ?? 0b1;

        let list: TokenStatusList;
        before(() =>
        {
            list = new TokenStatusList(bits);
            for(let i = 0; i < status.length; i++) list.setValue(i, status[i]);
        });

        it("Byte Array Should Match", () =>
        {
            assert.deepEqual(list.getCompressedByteArray(), byteArray);
        });

        it("Deflated Value Should Match", () =>
        {
            assert.equal(list.getTokenList().lst, lstValue);
        });

        it("Reverted List Should Match", () =>
        {
            const newList = TokenStatusList.fromJSON(list.getTokenList());
            const newTest: number[] = [];

            for(const i of indexes) newTest[i] = newList.getValue(i)!;

            assert.deepEqual(newTest, status);
        });
    };

describe("TokenStatusList", () =>
{
    it("Should reject values when value is greater than bits allow", () =>
    {
        const list = new TokenStatusList(1);
        assert.throws(() => list.setValue(0, 2));
    }),

    it("Should reject default value greater than bits allow", () =>
    {
        assert.throws(() => new TokenStatusList(1, 2));
    }),

    it("Should return default value when value not set", () =>
    {
        const defaultValue = 0;
        const list = new TokenStatusList(1, defaultValue);
        assert.equal(list.getValue(0), defaultValue);
    }),

    it("Should accept statuses in, in-bulk", () =>
    {
        const list = new TokenStatusList(1);

        const statuses: IIndexedStatus[] = [
            {id: 0, status: 0b1},
            {id: 1, status: 0b0},
            {id: 2, status: 0b1},
        ];

        list.setValues("status", ...statuses);

        assert.equal(list.getValue(0), statuses[0]["status"]);
        assert.equal(list.getValue(1), statuses[1]["status"]);
        assert.equal(list.getValue(2), statuses[2]["status"]);
    }),

    describe("RFC Examples", () =>
    {
        describe("Example 1", dynamicTestFull(1,
            [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
            [0b1, 0b0, 0b0, 0b1, 0b1, 0b1, 0b0, 0b1, 0b1, 0b1, 0b0, 0b0, 0b0, 0b1, 0b0, 0b1],
            [0xb9, 0xa3], "eNrbuRgAAhcBXQ"
        ));
        describe("Example 2", dynamicTestFull(2,
            [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
            [0b01, 0b10, 0b00, 0b11, 0b00, 0b01, 0b00, 0b01, 0b01, 0b10, 0b11, 0b11],
            [0xc9, 0x44, 0xf9], "eNo76fITAAPfAgc"
        ));
        describe("Example 3", dynamicTestShort(1,
            [0, 1993, 25460, 159495, 495669, 554353, 645645, 723232, 854545, 934534, 1000345],
            [0b01, 0b10, 0b01, 0b11, 0b01, 0b01, 0b10, 0b01, 0b01, 0b10, 0b11]));
        describe("Example 4", dynamicTestShort(4,
            [0, 1993, 35460, 459495, 595669, 754353, 845645, 923232,
             924445, 934534, 1004534, 1000345, 1030203, 1030204, 1030205],
            [0b0001, 0b0010, 0b0011, 0b0100, 0b0101, 0b0110, 0b0111, 0b1000,
             0b1001, 0b1010, 0b1011, 0b1100, 0b1101, 0b1110, 0b1111]));
    });
});
