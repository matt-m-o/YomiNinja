import { JmdictImportService } from "./Jmdict_import.service";
import fs from 'fs';


describe("JmdictImportService tests", () => {

    const dictionaryTxtPath = './data/JmdictFurigana.txt';    

    it('should parse the dictionary lines', () => {

        const lines = fs.readFileSync( dictionaryTxtPath, 'utf8' ).split('\n');

        const output = JmdictImportService.parseFuriganaDictionaryLines( lines );

        expect( output.length ).toStrictEqual(215968);
    });

});