import { deflate, inflate } from 'pako';


export interface ITokenStatusList
{
    bits: number;
    lst: string;
    aggregation_uri?: string;
}

export default class TokenStatusList
{
    private static divisor = 8;

    protected bitArray: number[] = [];
    /**
     * @param bits The Status Issuer MUST define a number of bits (bits) of either
       1,2,4 or 8, that represents the number of bits used to describe
       the status of each Referenced Token within this Status List.
     * @param defaultValue The default value for missing entries in the list
     */
    constructor(
        protected bits: number,
        protected defaultValue: number = 0,
        protected deflateValue: number = 9
    )
    {
        if(defaultValue >= 2**bits)
            throw new Error(
                `defaultValue ${defaultValue} is larger than allowed for bits 2**${this.bits} (${2**this.bits})`);
    }

    /**
     * Get the value at a specific point in the Token status List
     *
     * @param index offset to get the value for
     * @returns value at offset or undefined
     */
    public getValue (index: number): number
    {
        return this.bitArray[index] ?? this.defaultValue;
    }

    /**
     * Set the value at a specific point in the Token status List
     *
     * @param index offset to set the value for
     * @param value value to set at this index
     */
    public setValue (index: number, value: number): this
    {
        if(value >= 2**this.bits)
            throw new Error(`value ${value} is larger than allowed for bits 2**${this.bits} (${2**this.bits})`);

        this.bitArray[index] = value;

        return this;
    }

    public getCompressedByteArray(): number[]
    {
        let arr: number[] = [];
        let acc: number = 0;
        for(let i = 0; i < this.bitArray.length; i++)
        {
            const shift = (i % (TokenStatusList.divisor/this.bits)) * this.bits;

            if(i > 0 && shift === 0)
            {
                arr.push(acc)
                acc = 0;
            }

            acc = acc | (this.getValue(i) ?? this.defaultValue) << shift;
        }
        arr.push(acc)

        return arr;
    }

    /**
     * Get the compressed token list
     */
    public getTokenList(): ITokenStatusList
    {
        const lst = Buffer.from(deflate(new Uint8Array(this.getCompressedByteArray()), { level: this.deflateValue }))
            .toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

        return {
            bits: this.bits,
            lst: lst.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
        }
    }

    /**
     * Load an encoded token status List JSON object in to get a queryable list back
     * 
     * @param input json representation of a Token status List
     * @returns Queryable token status list
     */
    public static fromJSON(input: ITokenStatusList): TokenStatusList
    {
        const list = new TokenStatusList(input.bits);

        const base64Encoded = input.lst.replace(/-/g, '+').replace(/_/g, '/');
        const padding = input.lst.length % 4 === 0 ? '' : '='.repeat(4 - (input.lst.length % 4));
        const base64WithPadding = base64Encoded + padding;

        const inflated = inflate(Buffer.from(base64WithPadding, "base64"));
        const compressed = [...inflated];

        const foo = TokenStatusList.divisor/input.bits;

        for(let i=0; i < compressed.length; i++)
        {
            for(let j=0; j < foo; j++)
            {
                const tokenData = (compressed[i] >> (j * input.bits)) & (2**input.bits)-1;

                list.setValue((i * foo) + j, tokenData);
            }
        }

        return list;
    }
}
