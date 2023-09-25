

function snakeCaseToCamelCase( word: string ): string {
    return word.split("_")
        .map( word => word.charAt(0).toUpperCase() + word.slice(1) )
        .join('');
}

export function generateIndexName( tableName: string, columnName: string ): string {

    tableName = snakeCaseToCamelCase( tableName );
    columnName = snakeCaseToCamelCase( columnName );
    
    return `${tableName}_${columnName}_IDX`;
};