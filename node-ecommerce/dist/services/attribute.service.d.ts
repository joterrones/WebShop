export declare function listAttributes(query: unknown): Promise<{
    id: string;
    code: string;
    name: string;
    dataType: import(".prisma/client").$Enums.AttributeDataType;
    isRequired: boolean;
    sortOrder: number;
    category: {
        id: string;
        name: string;
        slug: string;
    } | null;
    options: {
        id: string;
        value: string;
        sortOrder: number;
    }[];
}[]>;
export declare function createAttribute(data: unknown): Promise<{
    id: string;
    code: string;
    name: string;
    dataType: import(".prisma/client").$Enums.AttributeDataType;
    isRequired: boolean;
    sortOrder: number;
    category: {
        id: string;
        name: string;
        slug: string;
    } | null;
    options: {
        value: string;
        id: string;
        sortOrder: number;
        attributeDefinitionId: string;
    }[];
}>;
//# sourceMappingURL=attribute.service.d.ts.map