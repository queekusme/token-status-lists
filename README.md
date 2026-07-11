# Token Status Lists

An implementation of [Token Status Lists](https://datatracker.ietf.org/doc/draft-ietf-oauth-status-list/21/) ietf draft

```js
const list1Bit = new TokenStatusList(1); // a 1 bit token list array
const list2Bit = new TokenStatusList(2); // a 2 bit token list array
const list4Bit = new TokenStatusList(4); // a 4 bit token list array
const list8Bit = new TokenStatusList(8); // a 8 bit token list array

// Set singular values
list1bit.setValue(0, 0b1);          // initialise index 0 with 1
list2Bit.setValue(0, 0b10);         // initialise index 0 with 2
list4Bit.setValue(0, 0b1000);       // initialise index 0 with 8
list8Bit.setValue(0, 0b10000000);   // initialise index 0 with 128

const statuses = [
    {id: 1, status: 0b00},
    {id: 2, status: 0b10},
    {id: 4, status: 0b11},
    {id: 8, status: 0b01},
    {id: 16, status: 0b11},
];

// Bulk import statuses, e.g. from a database, "status" is the key of the value which contains the status
list2Bit.setValues("status", statuses);

// Get compressed value for output
list1bit.getTokenList();
/*
{
    "bits": 1,
    "lst": "eNpjBAAAAgAC"
}
*/

// Read compressed output in as a new list
const reconstitutedList = TokenStatusList.fromJSON({
    "bits": 1,
    "lst": "eNpjBAAAAgAC"
});

// Get values from imported list
reconstitutedList.getValue(0); // 1
reconstitutedList.getValue(1); // 0, not present so returns the default value
```